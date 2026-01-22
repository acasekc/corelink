<?php

namespace App\Models\Helpdesk;

use App\Models\User;
use Database\Factories\Helpdesk\TimeEntryFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TimeEntry extends Model
{
    /** @use HasFactory<TimeEntryFactory> */
    use HasFactory;

    protected $table = 'helpdesk_time_entries';

    protected $fillable = [
        'ticket_id',
        'user_id',
        'minutes',
        'description',
        'date_worked',
        'hourly_rate_category_id',
        'is_billable',
        'billable_minutes',
        'invoice_line_item_id',
    ];

    protected function casts(): array
    {
        return [
            'date_worked' => 'date',
            'is_billable' => 'boolean',
            'billable_minutes' => 'integer',
        ];
    }

    public function ticket(): BelongsTo
    {
        return $this->belongsTo(Ticket::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function hourlyRateCategory(): BelongsTo
    {
        return $this->belongsTo(HourlyRateCategory::class, 'hourly_rate_category_id');
    }

    public function invoiceLineItem(): BelongsTo
    {
        return $this->belongsTo(InvoiceLineItem::class, 'invoice_line_item_id');
    }

    /**
     * Check if this time entry has been invoiced.
     */
    public function getIsInvoicedAttribute(): bool
    {
        return $this->invoice_line_item_id !== null;
    }

    /**
     * Check if this time entry is locked (on a sent/paid invoice).
     */
    public function getIsLockedAttribute(): bool
    {
        if (! $this->invoice_line_item_id) {
            return false;
        }

        $invoice = $this->invoiceLineItem?->invoice;

        return $invoice && $invoice->status !== Invoice::STATUS_DRAFT;
    }

    /**
     * Calculate billable minutes with 15-min rounding and 1-hour minimum.
     */
    public static function calculateBillableMinutes(int $minutes): int
    {
        if ($minutes <= 0) {
            return 0;
        }

        // Apply 1-hour minimum
        $minutes = max($minutes, 60);

        // Round up to nearest 15 minutes
        return (int) ceil($minutes / 15) * 15;
    }

    /**
     * Get billable minutes for this instance.
     */
    public function getBillableMinutesCalculated(): int
    {
        if (! $this->is_billable) {
            return 0;
        }

        return self::calculateBillableMinutes($this->minutes);
    }

    /**
     * Get the time formatted as a human-readable string (e.g., "2w 4d 6h 45m")
     */
    public function getFormattedTimeAttribute(): string
    {
        return self::formatMinutes($this->minutes);
    }

    /**
     * Parse a time string (e.g., "2w 4d 6h 45m") into total minutes
     */
    public static function parseTimeString(string $timeString): int
    {
        $minutes = 0;
        $timeString = strtolower(trim($timeString));

        // Match weeks
        if (preg_match('/(\d+)\s*w/', $timeString, $matches)) {
            $minutes += (int) $matches[1] * 5 * 8 * 60; // 5 working days per week, 8 hours per day
        }

        // Match days
        if (preg_match('/(\d+)\s*d/', $timeString, $matches)) {
            $minutes += (int) $matches[1] * 8 * 60; // 8 hours per day
        }

        // Match hours
        if (preg_match('/(\d+)\s*h/', $timeString, $matches)) {
            $minutes += (int) $matches[1] * 60;
        }

        // Match minutes
        if (preg_match('/(\d+)\s*m(?!o)/', $timeString, $matches)) {
            $minutes += (int) $matches[1];
        }

        // If no units found but there's a number, treat it as minutes
        if ($minutes === 0 && preg_match('/^\d+$/', $timeString)) {
            $minutes = (int) $timeString;
        }

        return $minutes;
    }

    /**
     * Format minutes into a human-readable string (e.g., "2w 4d 6h 45m")
     */
    public static function formatMinutes(int $minutes): string
    {
        if ($minutes <= 0) {
            return '0m';
        }

        $parts = [];

        // Calculate weeks (5 working days, 8 hours per day = 2400 minutes)
        $weeks = intdiv($minutes, 2400);
        if ($weeks > 0) {
            $parts[] = $weeks.'w';
            $minutes %= 2400;
        }

        // Calculate days (8 hours = 480 minutes)
        $days = intdiv($minutes, 480);
        if ($days > 0) {
            $parts[] = $days.'d';
            $minutes %= 480;
        }

        // Calculate hours
        $hours = intdiv($minutes, 60);
        if ($hours > 0) {
            $parts[] = $hours.'h';
            $minutes %= 60;
        }

        // Remaining minutes
        if ($minutes > 0) {
            $parts[] = $minutes.'m';
        }

        return implode(' ', $parts);
    }
}
