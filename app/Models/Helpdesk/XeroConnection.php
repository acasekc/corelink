<?php

namespace App\Models\Helpdesk;

use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class XeroConnection extends Model
{
    protected $table = 'helpdesk_xero_connections';

    protected $fillable = [
        'connection_id',
        'tenant_id',
        'tenant_name',
        'access_token',
        'refresh_token',
        'token_expires_at',
        'connected_at',
        'connected_by',
        'sales_account_code',
        'payment_account_code',
    ];

    protected function casts(): array
    {
        return [
            'access_token' => 'encrypted',
            'refresh_token' => 'encrypted',
            'token_expires_at' => 'datetime',
            'connected_at' => 'datetime',
        ];
    }

    public function connectedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'connected_by');
    }

    public static function current(): ?self
    {
        return static::query()
            ->whereNotNull('refresh_token')
            ->latest('connected_at')
            ->first();
    }

    public function needsRefresh(): bool
    {
        if (! $this->token_expires_at) {
            return true;
        }

        return $this->token_expires_at->lte(now()->addMinutes(5));
    }
}
