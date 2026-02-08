<?php

namespace App\Console\Commands;

use App\Models\Helpdesk\Ticket;
use Illuminate\Console\Command;

class CleanupClosedTicketAttachments extends Command
{
    protected $signature = 'helpdesk:cleanup-attachments
                            {--days=30 : Days after closure before attachments are purged}
                            {--dry-run : Show what would be deleted without actually deleting}';

    protected $description = 'Delete attachments from tickets that have been closed for more than the specified number of days';

    public function handle(): int
    {
        $days = (int) $this->option('days');
        $dryRun = (bool) $this->option('dry-run');
        $cutoff = now()->subDays($days);

        $tickets = Ticket::query()
            ->whereNotNull('closed_at')
            ->where('closed_at', '<=', $cutoff)
            ->whereHas('attachments')
            ->orWhere(function ($query) use ($cutoff) {
                $query->whereNotNull('closed_at')
                    ->where('closed_at', '<=', $cutoff)
                    ->whereHas('comments', fn ($q) => $q->whereHas('attachments'));
            })
            ->with(['attachments', 'comments.attachments'])
            ->get();

        if ($tickets->isEmpty()) {
            $this->info('No tickets with attachments found past the cleanup threshold.');

            return self::SUCCESS;
        }

        $totalFiles = 0;
        $totalSize = 0;

        foreach ($tickets as $ticket) {
            $ticketAttachments = $ticket->attachments;
            $commentAttachments = $ticket->comments->flatMap->attachments;
            $allAttachments = $ticketAttachments->merge($commentAttachments);

            if ($allAttachments->isEmpty()) {
                continue;
            }

            $fileCount = $allAttachments->count();
            $fileSize = $allAttachments->sum('size');
            $totalFiles += $fileCount;
            $totalSize += $fileSize;

            $closedDaysAgo = (int) $ticket->closed_at->diffInDays(now());

            $this->line(sprintf(
                '  Ticket #%s — %d file(s), %s — closed %d days ago',
                $ticket->ticket_number,
                $fileCount,
                $this->formatBytes($fileSize),
                $closedDaysAgo,
            ));

            if (! $dryRun) {
                $ticket->purgeAttachments();
            }
        }

        $action = $dryRun ? 'Would delete' : 'Deleted';
        $this->info(sprintf('%s %d file(s) totalling %s from %d ticket(s).', $action, $totalFiles, $this->formatBytes($totalSize), $tickets->count()));

        return self::SUCCESS;
    }

    private function formatBytes(int $bytes): string
    {
        if ($bytes < 1024) {
            return $bytes.' B';
        }
        if ($bytes < 1024 * 1024) {
            return round($bytes / 1024, 1).' KB';
        }

        return round($bytes / (1024 * 1024), 1).' MB';
    }
}
