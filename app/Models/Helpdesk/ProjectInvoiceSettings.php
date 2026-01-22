<?php

namespace App\Models\Helpdesk;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProjectInvoiceSettings extends Model
{
    protected $table = 'helpdesk_project_invoice_settings';

    protected $fillable = [
        'project_id',
        'invoice_prefix',
        'next_invoice_number',
        'default_payment_terms',
        'default_tax_rate',
        'bill_to_name',
        'bill_to_email',
        'bill_to_address',
        'invoice_footer',
        'stripe_enabled',
    ];

    protected function casts(): array
    {
        return [
            'next_invoice_number' => 'integer',
            'default_payment_terms' => 'integer',
            'default_tax_rate' => 'decimal:2',
            'stripe_enabled' => 'boolean',
        ];
    }

    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }

    /**
     * Generate the next invoice number for this project.
     */
    public function generateInvoiceNumber(): string
    {
        $year = now()->year;
        $prefix = $this->invoice_prefix ?? 'INV';
        $sequence = str_pad($this->next_invoice_number, 4, '0', STR_PAD_LEFT);

        $this->increment('next_invoice_number');

        return "INV-{$prefix}-{$year}-{$sequence}";
    }

    /**
     * Get or create settings for a project.
     */
    public static function getOrCreateForProject(int $projectId): self
    {
        return static::firstOrCreate(
            ['project_id' => $projectId],
            [
                'default_payment_terms' => 30,
                'next_invoice_number' => 1,
            ]
        );
    }
}
