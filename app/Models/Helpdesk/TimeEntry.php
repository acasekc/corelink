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
    ];

    protected function casts(): array
    {
        return [
            'date_worked' => 'date',
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
