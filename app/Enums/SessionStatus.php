<?php

namespace App\Enums;

enum SessionStatus: string
{
    case Active = 'active';
    case Paused = 'paused';
    case Completed = 'completed';
    case Abandoned = 'abandoned';
    case Generating = 'generating';
    case Failed = 'failed';

    public function label(): string
    {
        return match($this) {
            self::Active => 'Active',
            self::Paused => 'Paused',
            self::Completed => 'Completed',
            self::Abandoned => 'Abandoned',
            self::Generating => 'Generating Plan',
            self::Failed => 'Failed',
        };
    }

    public function isTerminal(): bool
    {
        return in_array($this, [self::Completed, self::Abandoned, self::Failed]);
    }

    public function canGeneratePlan(): bool
    {
        return $this === self::Active || $this === self::Paused;
    }
}
