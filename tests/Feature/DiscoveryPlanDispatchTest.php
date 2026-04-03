<?php

namespace Tests\Feature;

use App\Enums\SessionStatus;
use App\Jobs\GeneratePlanJob;
use App\Models\BotSession;
use App\Models\InviteCode;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Queue;
use Tests\TestCase;

class DiscoveryPlanDispatchTest extends TestCase
{
    use RefreshDatabase;

    public function test_generate_plan_dispatches_background_job_when_session_is_ready(): void
    {
        Queue::fake();

        $admin = User::factory()->create(['is_admin' => true]);
        $invite = InviteCode::create([
            'admin_user_id' => $admin->id,
            'code' => 'PLANREADY',
            'is_active' => true,
            'max_uses' => null,
            'current_uses' => 0,
        ]);

        $session = BotSession::create([
            'invite_code_id' => $invite->id,
            'status' => SessionStatus::Active,
            'turn_count' => 4,
            'extracted_requirements' => [
                'problem' => 'Replace a manual booking process with a better workflow.',
                'users' => ['customers', 'staff', 'admin roles'],
                'features' => ['dashboard', 'reporting', 'notifications'],
                'integrations' => ['Stripe API'],
                'data' => ['documents', 'records', 'uploads'],
                'delivery' => ['launch next month', 'budget approved'],
            ],
        ]);

        $response = $this->postJson("/api/bot/sessions/{$session->id}/generate-plan");

        $response
            ->assertAccepted()
            ->assertJson([
                'success' => true,
            ]);

        Queue::assertPushed(GeneratePlanJob::class, function (GeneratePlanJob $job): bool {
            return $job->connection === 'background';
        });
    }
}
