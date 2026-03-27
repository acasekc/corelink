<?php

namespace App\Console\Commands;

use App\Models\Article;
use App\Models\CaseStudy;
use App\Models\Helpdesk\Attachment;
use App\Models\Project;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Storage;

class MigrateFilesToCloudflare extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:migrate-files-to-cloudflare
                            {--target-disk=s3 : Destination disk (Cloudflare R2 via s3 driver)}
                            {--old-url-root=https://corelink-dev.s3.us-east-2.amazonaws.com/ : Old URL root to replace in DB records}
                            {--new-url-root= : New URL root override (defaults to AWS_URL / target disk url)}
                            {--dry-run : Show what would be copied without writing files}
                            {--overwrite : Overwrite files that already exist on target}
                            {--skip-attachments-db-update : Do not update helpdesk_attachments.disk after copy}
                            {--skip-db-url-rewrite : Do not rewrite old URL roots in DB content/fields}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Migrate existing files from local/public disks to Cloudflare-compatible disk while preserving paths';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $targetDisk = (string) $this->option('target-disk');
        $dryRun = (bool) $this->option('dry-run');
        $overwrite = (bool) $this->option('overwrite');
        $skipAttachmentDbUpdate = (bool) $this->option('skip-attachments-db-update');
        $skipDbUrlRewrite = (bool) $this->option('skip-db-url-rewrite');
        $oldUrlRoot = $this->normalizeUrlRoot((string) $this->option('old-url-root'));
        $newUrlRoot = $this->resolveNewUrlRoot($targetDisk);

        if (! $skipDbUrlRewrite && ($oldUrlRoot === '' || $newUrlRoot === '')) {
            $this->error('DB URL rewrite requires both old and new URL roots. Set AWS_URL or --new-url-root.');

            return self::FAILURE;
        }

        if (! array_key_exists($targetDisk, config('filesystems.disks', []))) {
            $this->error("Target disk [{$targetDisk}] is not configured.");

            return self::FAILURE;
        }

        $sourceDisks = ['public', 'local'];

        $this->info('Starting file migration...');
        $this->line('Target disk: '.$targetDisk);
        $this->line('Dry run: '.($dryRun ? 'yes' : 'no'));
        $this->line('Overwrite existing: '.($overwrite ? 'yes' : 'no'));
        if (! $skipDbUrlRewrite) {
            $this->line('DB URL rewrite: enabled');
            $this->line('Old URL root: '.$oldUrlRoot);
            $this->line('New URL root: '.$newUrlRoot);
        } else {
            $this->line('DB URL rewrite: skipped');
        }
        $this->newLine();

        $summary = [
            'copied' => 0,
            'skipped' => 0,
            'failed' => 0,
        ];

        foreach ($sourceDisks as $sourceDisk) {
            if (! array_key_exists($sourceDisk, config('filesystems.disks', []))) {
                $this->warn("Skipping [{$sourceDisk}] - disk not configured.");

                continue;
            }

            if ($sourceDisk === $targetDisk) {
                $this->warn("Skipping [{$sourceDisk}] - source and target are the same disk.");

                continue;
            }

            $stats = $this->copyAllFilesFromDisk($sourceDisk, $targetDisk, $dryRun, $overwrite);
            $summary['copied'] += $stats['copied'];
            $summary['skipped'] += $stats['skipped'];
            $summary['failed'] += $stats['failed'];
        }

        if (! $skipAttachmentDbUpdate) {
            $updated = $this->updateAttachmentDiskRecords($targetDisk, $dryRun);
            $this->line("Attachment DB records updated: {$updated}");
        }

        if (! $skipDbUrlRewrite) {
            $urlRewriteCount = $this->rewriteStoredImageUrls($oldUrlRoot, $newUrlRoot, $dryRun);
            $this->line("DB URL values rewritten: {$urlRewriteCount}");
        }

        $this->newLine();
        $this->info('Migration complete.');
        $this->line('Copied: '.$summary['copied']);
        $this->line('Skipped: '.$summary['skipped']);
        $this->line('Failed: '.$summary['failed']);

        return $summary['failed'] > 0 ? self::FAILURE : self::SUCCESS;
    }

    /**
     * @return array{copied: int, skipped: int, failed: int}
     */
    private function copyAllFilesFromDisk(string $sourceDisk, string $targetDisk, bool $dryRun, bool $overwrite): array
    {
        $this->info("Scanning disk [{$sourceDisk}]...");

        $files = Storage::disk($sourceDisk)->allFiles();
        $total = count($files);

        $this->line("Found {$total} file(s) on [{$sourceDisk}].");

        $stats = [
            'copied' => 0,
            'skipped' => 0,
            'failed' => 0,
        ];

        $bar = $this->output->createProgressBar($total);
        $bar->start();

        foreach ($files as $path) {
            try {
                if (! $overwrite && Storage::disk($targetDisk)->exists($path)) {
                    $stats['skipped']++;
                    $bar->advance();

                    continue;
                }

                if ($dryRun) {
                    $stats['copied']++;
                    $bar->advance();

                    continue;
                }

                $readStream = Storage::disk($sourceDisk)->readStream($path);

                if (! is_resource($readStream)) {
                    $stats['failed']++;
                    $bar->advance();

                    continue;
                }

                $written = Storage::disk($targetDisk)->writeStream($path, $readStream);

                if (is_resource($readStream)) {
                    fclose($readStream);
                }

                if ($written) {
                    $stats['copied']++;
                } else {
                    $stats['failed']++;
                }
            } catch (\Throwable $e) {
                $stats['failed']++;
                $this->newLine();
                $this->error("Failed copying [{$sourceDisk}:{$path}] => [{$targetDisk}:{$path}] - {$e->getMessage()}");
            }

            $bar->advance();
        }

        $bar->finish();
        $this->newLine(2);

        return $stats;
    }

    private function updateAttachmentDiskRecords(string $targetDisk, bool $dryRun): int
    {
        $query = Attachment::query()
            ->whereIn('disk', ['local', 'public'])
            ->where('disk', '!=', $targetDisk);

        if ($dryRun) {
            return $query->count();
        }

        return $query->update(['disk' => $targetDisk]);
    }

    private function resolveNewUrlRoot(string $targetDisk): string
    {
        $override = (string) $this->option('new-url-root');

        if ($override !== '') {
            return $this->normalizeUrlRoot($override);
        }

        $diskUrl = config("filesystems.disks.{$targetDisk}.url");

        return is_string($diskUrl) ? $this->normalizeUrlRoot($diskUrl) : '';
    }

    private function normalizeUrlRoot(string $urlRoot): string
    {
        return rtrim(trim($urlRoot), '/').'/';
    }

    private function replaceUrlRoot(string $value, string $oldUrlRoot, string $newUrlRoot): string
    {
        return str_replace($oldUrlRoot, $newUrlRoot, $value);
    }

    private function rewriteStoredImageUrls(string $oldUrlRoot, string $newUrlRoot, bool $dryRun): int
    {
        $updated = 0;

        $updated += $this->rewriteArticleImageUrls($oldUrlRoot, $newUrlRoot, $dryRun);
        $updated += $this->rewriteCaseStudyImageUrls($oldUrlRoot, $newUrlRoot, $dryRun);
        $updated += $this->rewriteProjectScreenshotUrls($oldUrlRoot, $newUrlRoot, $dryRun);

        return $updated;
    }

    private function rewriteArticleImageUrls(string $oldUrlRoot, string $newUrlRoot, bool $dryRun): int
    {
        $updated = 0;

        Article::query()
            ->withTrashed()
            ->where(function ($query) use ($oldUrlRoot) {
                $query->where('featured_image', 'like', $oldUrlRoot.'%')
                    ->orWhere('content', 'like', '%'.$oldUrlRoot.'%');
            })
            ->chunkById(200, function ($articles) use ($oldUrlRoot, $newUrlRoot, $dryRun, &$updated) {
                foreach ($articles as $article) {
                    $nextFeaturedImage = is_string($article->featured_image)
                        ? $this->replaceUrlRoot($article->featured_image, $oldUrlRoot, $newUrlRoot)
                        : $article->featured_image;

                    $nextContent = is_string($article->content)
                        ? $this->replaceUrlRoot($article->content, $oldUrlRoot, $newUrlRoot)
                        : $article->content;

                    if ($nextFeaturedImage === $article->featured_image && $nextContent === $article->content) {
                        continue;
                    }

                    $updated++;

                    if (! $dryRun) {
                        $article->forceFill([
                            'featured_image' => $nextFeaturedImage,
                            'content' => $nextContent,
                        ])->save();
                    }
                }
            });

        return $updated;
    }

    private function rewriteCaseStudyImageUrls(string $oldUrlRoot, string $newUrlRoot, bool $dryRun): int
    {
        $updated = 0;

        CaseStudy::query()
            ->withTrashed()
            ->where('hero_image', 'like', $oldUrlRoot.'%')
            ->chunkById(200, function ($caseStudies) use ($oldUrlRoot, $newUrlRoot, $dryRun, &$updated) {
                foreach ($caseStudies as $caseStudy) {
                    $nextHeroImage = is_string($caseStudy->hero_image)
                        ? $this->replaceUrlRoot($caseStudy->hero_image, $oldUrlRoot, $newUrlRoot)
                        : $caseStudy->hero_image;

                    if ($nextHeroImage === $caseStudy->hero_image) {
                        continue;
                    }

                    $updated++;

                    if (! $dryRun) {
                        $caseStudy->forceFill(['hero_image' => $nextHeroImage])->save();
                    }
                }
            });

        return $updated;
    }

    private function rewriteProjectScreenshotUrls(string $oldUrlRoot, string $newUrlRoot, bool $dryRun): int
    {
        $updated = 0;

        Project::query()
            ->whereNotNull('screenshots')
            ->chunkById(200, function ($projects) use ($oldUrlRoot, $newUrlRoot, $dryRun, &$updated) {
                foreach ($projects as $project) {
                    $screenshots = is_array($project->screenshots) ? $project->screenshots : [];

                    if ($screenshots === []) {
                        continue;
                    }

                    $nextScreenshots = [];
                    $changed = false;

                    foreach ($screenshots as $screenshot) {
                        if (! is_string($screenshot)) {
                            $nextScreenshots[] = $screenshot;

                            continue;
                        }

                        $nextScreenshot = $this->replaceUrlRoot($screenshot, $oldUrlRoot, $newUrlRoot);

                        if ($nextScreenshot !== $screenshot) {
                            $changed = true;
                        }

                        $nextScreenshots[] = $nextScreenshot;
                    }

                    if (! $changed) {
                        continue;
                    }

                    $updated++;

                    if (! $dryRun) {
                        $project->forceFill(['screenshots' => $nextScreenshots])->save();
                    }
                }
            });

        return $updated;
    }
}
