<?php

namespace App\Enums;

enum PlanOutputType: string
{
    case UserSummary = 'user_summary';
    case AdminFull = 'admin_full';
    case EmailSent = 'email_sent';

    public function label(): string
    {
        return match ($this) {
            self::UserSummary => 'User Summary',
            self::AdminFull => 'Admin Full',
            self::EmailSent => 'Email Sent',
        };
    }
}
