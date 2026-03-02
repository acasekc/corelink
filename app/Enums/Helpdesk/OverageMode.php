<?php

namespace App\Enums\Helpdesk;

enum OverageMode: string
{
    case Silent = 'silent';
    case Proactive = 'proactive';

    public function label(): string
    {
        return match ($this) {
            self::Silent => 'Silent',
            self::Proactive => 'Proactive',
        };
    }

    public function description(): string
    {
        return match ($this) {
            self::Silent => 'Overages are absorbed and billed at cycle end without client notification',
            self::Proactive => 'Client is notified when approaching limits and offered upgrades',
        };
    }

    public static function forSelect(): array
    {
        return array_map(
            fn (self $mode) => ['value' => $mode->value, 'label' => $mode->label()],
            self::cases()
        );
    }
}
