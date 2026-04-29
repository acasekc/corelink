<?php

namespace App\Models;

use App\Models\Helpdesk\Project as HelpdeskProject;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ClientIntake extends Model
{
    use HasFactory;

    protected $fillable = [
        'invite_id',
        'email',
        'business_name',
        'budget_range',
        'data',
        'logo_path',
        'logo_disk',
        'brand_guidelines_path',
        'brand_guidelines_disk',
        'pdf_path',
        'pdf_disk',
        'helpdesk_ticket_id',
        'helpdesk_ticket_number',
        'converted_project_id',
        'submitted_at',
    ];

    protected function casts(): array
    {
        return [
            'data' => 'array',
            'submitted_at' => 'datetime',
        ];
    }

    public function invite(): BelongsTo
    {
        return $this->belongsTo(ClientIntakeInvite::class, 'invite_id');
    }

    public function convertedProject(): BelongsTo
    {
        return $this->belongsTo(HelpdeskProject::class, 'converted_project_id');
    }

    public function isConverted(): bool
    {
        return $this->converted_project_id !== null;
    }
}
