<?php

namespace App\Services\Intake;

use App\Models\ClientIntake;
use App\Models\Helpdesk\ApiKey;
use App\Models\Helpdesk\Project as HelpdeskProject;
use Illuminate\Support\Str;

/**
 * Convert a submitted intake into a fully-formed helpdesk project so the
 * prospect can be onboarded without re-entering data.
 */
class IntakeProjectConverter
{
    public function convert(ClientIntake $intake): HelpdeskProject
    {
        if ($intake->isConverted()) {
            return $intake->convertedProject;
        }

        $data = $intake->data;

        $name = $intake->business_name;
        $slug = $this->uniqueSlug($name);
        $prefix = $this->generatePrefix($name);

        $project = HelpdeskProject::create([
            'name' => $name,
            'slug' => $slug,
            'description' => $data['business_description'] ?? null,
            'client_name' => $data['contact_name'] ?? null,
            'client_email' => $intake->email,
            'ticket_prefix' => $prefix,
            'is_active' => true,
            'settings' => [
                'created_from_intake_id' => $intake->id,
            ],
        ]);

        $plainKey = ApiKey::generateKey();
        $project->apiKeys()->create([
            'key' => ApiKey::hashKey($plainKey),
            'name' => 'Default Key',
            'is_active' => true,
        ]);

        $intake->update(['converted_project_id' => $project->id]);

        return $project;
    }

    private function uniqueSlug(string $name): string
    {
        $base = Str::slug($name) ?: 'project-'.Str::random(6);
        $slug = $base;
        $counter = 1;

        while (HelpdeskProject::withTrashed()->where('slug', $slug)->exists()) {
            $slug = $base.'-'.$counter++;
        }

        return $slug;
    }

    private function generatePrefix(string $name): string
    {
        $words = preg_split('/\s+/', trim($name)) ?: [];
        $prefix = '';

        foreach ($words as $word) {
            $prefix .= strtoupper(substr($word, 0, 1));
            if (strlen($prefix) >= 4) {
                break;
            }
        }

        if (strlen($prefix) < 2) {
            $clean = preg_replace('/[^a-zA-Z]/', '', $name) ?? '';
            $prefix = strtoupper(substr($clean, 0, 4));
        }

        if ($prefix === '') {
            $prefix = strtoupper(Str::random(3));
        }

        return $prefix;
    }
}
