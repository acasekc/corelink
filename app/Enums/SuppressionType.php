<?php

namespace App\Enums;

enum SuppressionType: string
{
    case Bounce = 'bounce';
    case SpamComplaint = 'spam_complaint';

    public function label(): string
    {
        return match ($this) {
            self::Bounce => 'Bounce',
            self::SpamComplaint => 'Spam Complaint',
        };
    }
}
