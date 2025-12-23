<?php

namespace App\Services;

use App\Models\InviteCode;
use Illuminate\Support\Str;
use Carbon\Carbon;

class InviteCodeService
{
    /**
     * Generate a new invite code
     *
     * @param int $adminUserId
     * @param string|null $email
     * @param int|null $expiresInDays
     * @param int $maxUses
     * @return InviteCode
     */
    public function createInviteCode(int $adminUserId, ?string $email = null, ?int $expiresInDays = null, int $maxUses = 1): InviteCode
    {
        return InviteCode::create([
            'admin_user_id' => $adminUserId,
            'code' => $this->generateUniqueCode(),
            'email' => $email,
            'expires_at' => $expiresInDays ? Carbon::now()->addDays($expiresInDays) : null,
            'is_active' => true,
            'max_uses' => $maxUses,
            'current_uses' => 0,
        ]);
    }

    /**
     * Validate an invite code
     *
     * @param string $code
     * @return array
     */
    public function validateCode(string $code): array
    {
        $inviteCode = InviteCode::where('code', $code)
            ->where('is_active', true)
            ->first();

        if (!$inviteCode) {
            return [
                'valid' => false,
                'message' => 'Invalid or inactive invite code.',
            ];
        }

        if ($inviteCode->expires_at && $inviteCode->expires_at->isPast()) {
            return [
                'valid' => false,
                'message' => 'This invite code has expired.',
            ];
        }

        if ($inviteCode->current_uses >= $inviteCode->max_uses) {
            return [
                'valid' => false,
                'message' => 'This invite code has reached its usage limit.',
            ];
        }

        return [
            'valid' => true,
            'invite_code_id' => $inviteCode->id,
            'email' => $inviteCode->email,
        ];
    }

    /**
     * Mark an invite code as used
     *
     * @param string $codeId
     * @param int|null $userId
     * @return InviteCode
     */
    public function markAsUsed(string $codeId, ?int $userId = null): InviteCode
    {
        $inviteCode = InviteCode::findOrFail($codeId);
        $inviteCode->increment('current_uses');
        
        if ($userId) {
            $inviteCode->update([
                'used_by_user_id' => $userId,
                'used_at' => Carbon::now(),
            ]);
        }

        if ($inviteCode->current_uses >= $inviteCode->max_uses) {
            $inviteCode->update(['is_active' => false]);
        }

        return $inviteCode;
    }

    /**
     * Revoke an invite code
     *
     * @param string $codeId
     * @return InviteCode
     */
    public function revokeCode(string $codeId): InviteCode
    {
        $inviteCode = InviteCode::findOrFail($codeId);
        $inviteCode->update(['is_active' => false]);
        return $inviteCode;
    }

    /**
     * Generate a unique random code
     *
     * @return string
     */
    private function generateUniqueCode(): string
    {
        do {
            $code = Str::random(12);
        } while (InviteCode::where('code', $code)->exists());

        return $code;
    }
}
