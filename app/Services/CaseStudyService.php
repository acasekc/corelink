<?php

namespace App\Services;

use App\Models\CaseStudy;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class CaseStudyService
{
    public function list(array $filters = [], ?string $orderBy = 'order'): Collection
    {
        $query = CaseStudy::query();

        $this->applyFilters($query, $filters);

        if ($orderBy) {
            $query->orderBy($orderBy);
        }

        return $query->get();
    }

    public function paginate(int $perPage = 15, array $filters = []): LengthAwarePaginator
    {
        $query = CaseStudy::query();

        $this->applyFilters($query, $filters);

        $query->orderBy('order');

        return $query->paginate($perPage);
    }

    public function getById(int $id): CaseStudy
    {
        return CaseStudy::findOrFail($id);
    }

    public function getBySlug(string $slug): CaseStudy
    {
        return CaseStudy::where('slug', $slug)->firstOrFail();
    }

    public function create(array $data): CaseStudy
    {
        // Auto-generate slug if not provided
        if (empty($data['slug'])) {
            $data['slug'] = Str::slug($data['title']);
        }

        // Handle hero image upload
        if (isset($data['hero_image']) && $data['hero_image'] instanceof UploadedFile) {
            $data['hero_image'] = $this->uploadHeroImage($data['hero_image']);
        } elseif (isset($data['hero_image_url'])) {
            $data['hero_image'] = $data['hero_image_url'];
        }
        unset($data['hero_image_url']);

        // Parse JSON strings for technologies and metrics
        if (isset($data['technologies']) && is_string($data['technologies'])) {
            $data['technologies'] = json_decode($data['technologies'], true);
        }
        if (isset($data['metrics']) && is_string($data['metrics'])) {
            $data['metrics'] = json_decode($data['metrics'], true);
        }

        return CaseStudy::create($data);
    }

    public function update(CaseStudy $caseStudy, array $data): CaseStudy
    {
        // Auto-generate slug if provided in update
        if (isset($data['title']) && empty($data['slug'])) {
            $data['slug'] = Str::slug($data['title']);
        }

        // Handle hero image upload
        if (isset($data['hero_image']) && $data['hero_image'] instanceof UploadedFile) {
            // Delete old image if exists
            if ($caseStudy->hero_image) {
                $this->deleteHeroImage($caseStudy->hero_image);
            }
            $data['hero_image'] = $this->uploadHeroImage($data['hero_image']);
        } elseif (isset($data['hero_image_url'])) {
            $data['hero_image'] = $data['hero_image_url'];
        } elseif (array_key_exists('hero_image', $data) && $data['hero_image'] === null) {
            // Explicitly clear image
            if ($caseStudy->hero_image) {
                $this->deleteHeroImage($caseStudy->hero_image);
            }
        } else {
            unset($data['hero_image']);
        }
        unset($data['hero_image_url']);

        // Parse JSON strings for technologies and metrics
        if (isset($data['technologies']) && is_string($data['technologies'])) {
            $data['technologies'] = json_decode($data['technologies'], true);
        }
        if (isset($data['metrics']) && is_string($data['metrics'])) {
            $data['metrics'] = json_decode($data['metrics'], true);
        }

        $caseStudy->update($data);

        return $caseStudy->fresh();
    }

    public function delete(CaseStudy $caseStudy): bool
    {
        // Delete associated image
        if ($caseStudy->hero_image) {
            $this->deleteHeroImage($caseStudy->hero_image);
        }

        return $caseStudy->delete();
    }

    public function publish(CaseStudy $caseStudy): CaseStudy
    {
        $caseStudy->update(['is_published' => true]);

        return $caseStudy->fresh();
    }

    public function unpublish(CaseStudy $caseStudy): CaseStudy
    {
        $caseStudy->update(['is_published' => false]);

        return $caseStudy->fresh();
    }

    public function togglePublish(CaseStudy $caseStudy): CaseStudy
    {
        $caseStudy->update(['is_published' => ! $caseStudy->is_published]);

        return $caseStudy->fresh();
    }

    public function reorder(array $updates): void
    {
        foreach ($updates as $update) {
            CaseStudy::where('id', $update['id'])->update(['order' => $update['order']]);
        }
    }

    protected function uploadHeroImage(UploadedFile $file): string
    {
        $path = $file->store('case-studies', 'public');

        return '/storage/'.$path;
    }

    protected function deleteHeroImage(string $imagePath): void
    {
        if (str_starts_with($imagePath, '/storage/')) {
            $relativePath = str_replace('/storage/', '', $imagePath);
            Storage::disk('public')->delete($relativePath);
        }
    }

    protected function applyFilters($query, array $filters): void
    {
        if (isset($filters['published']) && $filters['published']) {
            $query->where('is_published', true);
        }

        if (isset($filters['industry']) && $filters['industry']) {
            $query->where('industry', $filters['industry']);
        }

        if (isset($filters['search']) && $filters['search']) {
            $search = $filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%")
                    ->orWhere('client_name', 'like', "%{$search}%");
            });
        }
    }
}
