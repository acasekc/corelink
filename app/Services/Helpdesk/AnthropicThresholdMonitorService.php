<?php

namespace App\Services\Helpdesk;

use App\Enums\Helpdesk\ApiKeyStatus;
use App\Enums\Helpdesk\OverageMode;
use App\Mail\Helpdesk\AnthropicUsageAdminAlert;
use App\Mail\Helpdesk\AnthropicUsageLimitReached;
use App\Mail\Helpdesk\AnthropicUsageWarning;
use App\Models\Helpdesk\AnthropicApiConfig;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class AnthropicThresholdMonitorService
{
    /**
     * Evaluate usage thresholds and update status / send notifications.
     */
    public function evaluate(AnthropicApiConfig $config): void
    {
        $previousStatus = $config->key_status;

        if ($config->isOverGraceThreshold()) {
            $this->handleGraceExceeded($config, $previousStatus);
        } elseif ($config->isOverAllowance()) {
            $this->handleOverAllowance($config, $previousStatus);
        } else {
            $this->handleWithinAllowance($config, $previousStatus);
        }
    }

    /**
     * Usage is at or above the grace threshold — disable the key.
     */
    private function handleGraceExceeded(AnthropicApiConfig $config, ApiKeyStatus $previousStatus): void
    {
        if ($config->key_status === ApiKeyStatus::Disabled) {
            return;
        }

        $config->update([
            'key_status' => ApiKeyStatus::Disabled,
            'disabled_reason' => 'Usage exceeded grace threshold ($'.number_format($config->grace_threshold, 2).')',
        ]);

        Log::warning('Anthropic API key disabled: grace threshold exceeded', [
            'config_id' => $config->id,
            'project_id' => $config->project_id,
            'usage_cents' => $config->cycle_usage_cents,
            'grace_threshold' => $config->grace_threshold,
        ]);

        // Both modes: notify admin
        $this->notifyAdmin($config, 'limit_reached');

        // Proactive mode: also notify client
        if ($config->overage_mode === OverageMode::Proactive) {
            $this->notifyClient($config, 'limit_reached');
        }
    }

    /**
     * Usage is between allowance and grace — enter grace period.
     */
    private function handleOverAllowance(AnthropicApiConfig $config, ApiKeyStatus $previousStatus): void
    {
        $alreadyInGrace = $previousStatus === ApiKeyStatus::Grace;

        if (! $alreadyInGrace) {
            $config->update([
                'key_status' => ApiKeyStatus::Grace,
            ]);

            Log::info('Anthropic API key entered grace period', [
                'config_id' => $config->id,
                'project_id' => $config->project_id,
                'usage_cents' => $config->cycle_usage_cents,
                'allowance' => $config->included_allowance,
            ]);

            if ($config->overage_mode === OverageMode::Proactive) {
                $this->notifyClient($config, 'warning');
                $this->notifyAdmin($config, 'warning');
            } else {
                // Silent mode: log only, notify admin internally
                $this->notifyAdmin($config, 'warning');
            }
        }
    }

    /**
     * Usage is below allowance — keep/restore active status.
     */
    private function handleWithinAllowance(AnthropicApiConfig $config, ApiKeyStatus $previousStatus): void
    {
        // Only restore to Active if currently in Grace (not if manually Disabled/Suspended)
        if ($previousStatus === ApiKeyStatus::Grace) {
            $config->update([
                'key_status' => ApiKeyStatus::Active,
                'disabled_reason' => null,
            ]);
        }
    }

    /**
     * Send notification emails to the admin.
     */
    private function notifyAdmin(AnthropicApiConfig $config, string $alertType): void
    {
        $adminEmail = config('mail.admin_address', config('mail.from.address'));

        if (! $adminEmail) {
            Log::warning('No admin email configured for Anthropic usage alerts');

            return;
        }

        try {
            Mail::to($adminEmail)->send(new AnthropicUsageAdminAlert($config, $alertType));
        } catch (\Throwable $e) {
            Log::error('Failed to send Anthropic admin alert email', [
                'config_id' => $config->id,
                'error' => $e->getMessage(),
            ]);
        }
    }

    /**
     * Send notification emails to the client's configured notification addresses.
     */
    private function notifyClient(AnthropicApiConfig $config, string $alertType): void
    {
        $emails = $config->notification_emails ?? [];

        if (empty($emails)) {
            Log::info('No client notification emails configured for Anthropic alerts', [
                'config_id' => $config->id,
            ]);

            return;
        }

        try {
            $mailable = match ($alertType) {
                'warning' => new AnthropicUsageWarning($config),
                'limit_reached' => new AnthropicUsageLimitReached($config),
            };

            Mail::to($emails)->send($mailable);
        } catch (\Throwable $e) {
            Log::error('Failed to send Anthropic client alert email', [
                'config_id' => $config->id,
                'error' => $e->getMessage(),
            ]);
        }
    }
}
