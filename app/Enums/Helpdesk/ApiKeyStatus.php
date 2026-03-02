<?php

namespace App\Enums\Helpdesk;

enum ApiKeyStatus: string
{
    case Active = 'active';
    case Grace = 'grace';
    case Disabled = 'disabled';
    case Suspended = 'suspended';

    public function label(): string
    {
        return match ($this) {
            self::Active => 'Active',
            self::Grace => 'Grace',
            self::Disabled => 'Disabled',
            self::Suspended => 'Suspended',
        };
    }

    public function description(): string
    {
        return match ($this) {
            self::Active => 'Key is active and within included allowance',
            self::Grace => 'Usage has exceeded included allowance but is within grace threshold',
            self::Disabled => 'Key has been disabled due to exceeding grace threshold',
            self::Suspended => 'Key has been suspended due to overdue payment',
        };
    }

    public function color(): string
    {
        return match ($this) {
            self::Active => 'green',
            self::Grace => 'yellow',
            self::Disabled => 'red',
            self::Suspended => 'orange',
        };
    }

    public static function forSelect(): array
    {
        return array_map(
            fn (self $status) => ['value' => $status->value, 'label' => $status->label()],
            self::cases()
        );
    }
}
