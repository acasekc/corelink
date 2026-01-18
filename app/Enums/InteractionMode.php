<?php

namespace App\Enums;

enum InteractionMode: string
{
    case Text = 'text';
    case Voice = 'voice';
    case Both = 'both';

    public function label(): string
    {
        return match ($this) {
            self::Text => 'Text',
            self::Voice => 'Voice',
            self::Both => 'Both',
        };
    }
}
