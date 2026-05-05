<?php

namespace Tests\Feature;

use App\Mail\IntakeConfirmationMail;
use App\Mail\IntakeInviteMail;
use App\Models\ClientIntake;
use App\Models\ClientIntakeInvite;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class ClientIntakeFlowTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        config([
            'services.helpdesk.intake_api_key' => 'test-prospect-key',
            'services.helpdesk.base_url' => 'https://corelink.dev/api/helpdesk/v1',
            'filesystems.default' => 'local',
        ]);

        Storage::fake('local');
    }

    public function test_unknown_code_404s(): void
    {
        $this->get('/intake/does-not-exist')->assertNotFound();
    }

    public function test_revoked_code_404s(): void
    {
        $invite = ClientIntakeInvite::create([
            'status' => ClientIntakeInvite::STATUS_REVOKED,
            'expires_at' => now()->addDays(10),
        ]);

        $this->get('/intake/'.$invite->code)->assertNotFound();
    }

    public function test_expired_code_404s_and_marks_expired(): void
    {
        $invite = ClientIntakeInvite::create([
            'status' => ClientIntakeInvite::STATUS_PENDING,
            'expires_at' => now()->subMinute(),
        ]);

        $this->get('/intake/'.$invite->code)->assertNotFound();

        $this->assertSame(ClientIntakeInvite::STATUS_EXPIRED, $invite->fresh()->status);
    }

    public function test_first_open_stamps_opened_at_and_status(): void
    {
        $invite = ClientIntakeInvite::create([
            'status' => ClientIntakeInvite::STATUS_PENDING,
            'expires_at' => now()->addDays(30),
        ]);

        $this->get('/intake/'.$invite->code)->assertOk();

        $invite->refresh();
        $this->assertSame(ClientIntakeInvite::STATUS_OPENED, $invite->status);
        $this->assertNotNull($invite->opened_at);
        $this->assertNotNull($invite->last_seen_at);
    }

    public function test_draft_save_persists_data_and_last_step(): void
    {
        $invite = ClientIntakeInvite::create([
            'status' => ClientIntakeInvite::STATUS_OPENED,
            'expires_at' => now()->addDays(30),
        ]);

        $this->postJson('/intake/'.$invite->code.'/draft', [
            'data' => ['business_name' => 'Acme Co.', 'goals' => ['lead_generation']],
            'last_step' => 2,
        ])->assertOk()->assertJsonStructure(['saved_at']);

        $invite->refresh();
        $this->assertSame('Acme Co.', $invite->draft_data['business_name']);
        $this->assertSame(2, $invite->metadata['last_step']);
    }

    public function test_full_submission_creates_intake_posts_ticket_and_sends_confirmation(): void
    {
        Mail::fake();

        Http::fake([
            'corelink.dev/api/helpdesk/v1/tickets' => Http::response([
                'data' => ['id' => 555, 'number' => 'PROSP-555'],
            ], 201),
        ]);

        $invite = ClientIntakeInvite::create([
            'status' => ClientIntakeInvite::STATUS_OPENED,
            'expires_at' => now()->addDays(30),
            'business_name' => 'Acme Co.',
        ]);

        $payload = $this->validSubmissionPayload();
        $payload['logo'] = UploadedFile::fake()->image('logo.png', 200, 200);

        $response = $this->post('/intake/'.$invite->code, $payload);

        $response->assertRedirect('/intake/'.$invite->code.'/submitted');

        $intake = ClientIntake::firstOrFail();
        $this->assertSame('Acme Co.', $intake->business_name);
        $this->assertSame('555', (string) $intake->helpdesk_ticket_id);
        $this->assertSame('PROSP-555', $intake->helpdesk_ticket_number);
        $this->assertNotNull($intake->logo_path);
        $this->assertNotNull($intake->pdf_path);
        Storage::disk('local')->assertExists($intake->logo_path);
        Storage::disk('local')->assertExists($intake->pdf_path);

        $invite->refresh();
        $this->assertSame(ClientIntakeInvite::STATUS_SUBMITTED, $invite->status);
        $this->assertNotNull($invite->submitted_at);

        Http::assertSent(function ($request) {
            // Metadata must travel as bracket-notation parts (not JSON-encoded
            // strings) — the helpdesk API validates `metadata` as an array.
            $body = (string) $request->body();

            return str_contains($request->url(), '/api/helpdesk/v1/tickets')
                && $request->header('X-API-Key')[0] === 'test-prospect-key'
                && str_contains($body, 'name="metadata[source]"')
                && str_contains($body, 'name="metadata[intake_id]"');
        });

        Mail::assertQueued(IntakeConfirmationMail::class);
    }

    public function test_json_submission_succeeds_without_additional_notes(): void
    {
        Mail::fake();

        Http::fake([
            'corelink.dev/api/helpdesk/v1/tickets' => Http::response([
                'data' => ['id' => 777, 'number' => 'PROSP-777'],
            ], 201),
        ]);

        $invite = ClientIntakeInvite::create([
            'status' => ClientIntakeInvite::STATUS_OPENED,
            'expires_at' => now()->addDays(30),
            'business_name' => 'Acme Co.',
        ]);

        $payload = $this->validSubmissionPayload();

        $response = $this->withHeaders([
            'Accept' => 'application/json',
            'X-Requested-With' => 'XMLHttpRequest',
        ])->post('/intake/'.$invite->code, $payload);

        $response->assertCreated()
            ->assertJsonPath('message', 'Your intake was submitted successfully.')
            ->assertJsonPath('redirect', route('intake.submitted', ['code' => $invite->code]));

        $this->assertDatabaseHas('client_intakes', [
            'invite_id' => $invite->id,
            'business_name' => 'Acme Co.',
        ]);
    }

    public function test_json_submission_validation_returns_step_and_field_details(): void
    {
        $invite = ClientIntakeInvite::create([
            'status' => ClientIntakeInvite::STATUS_OPENED,
            'expires_at' => now()->addDays(30),
        ]);

        $payload = $this->validSubmissionPayload();
        unset($payload['budget_range']);

        $response = $this->withHeaders([
            'Accept' => 'application/json',
            'X-Requested-With' => 'XMLHttpRequest',
        ])->post('/intake/'.$invite->code, $payload);

        $response->assertStatus(422)
            ->assertJsonPath('errors.budget_range', 'The Budget range field is required.')
            ->assertJsonPath('first_error.field', 'budget_range')
            ->assertJsonPath('first_error.label', 'Budget range')
            ->assertJsonPath('first_error.step_index', 6)
            ->assertJsonPath('first_error.step_title', 'Timeline & Budget');
    }

    public function test_already_submitted_code_404s(): void
    {
        $invite = ClientIntakeInvite::create([
            'status' => ClientIntakeInvite::STATUS_SUBMITTED,
            'expires_at' => now()->addDays(30),
        ]);

        $this->get('/intake/'.$invite->code)->assertNotFound();
    }

    public function test_honeypot_blocks_bots(): void
    {
        $invite = ClientIntakeInvite::create([
            'status' => ClientIntakeInvite::STATUS_OPENED,
            'expires_at' => now()->addDays(30),
        ]);

        $payload = $this->validSubmissionPayload();
        $payload['website'] = 'https://spammer.example';

        $this->post('/intake/'.$invite->code, $payload)
            ->assertSessionHasErrors('website');

        $this->assertDatabaseCount('client_intakes', 0);
    }

    public function test_admin_can_create_invite_and_send_email(): void
    {
        Mail::fake();

        $admin = User::factory()->create(['is_admin' => true]);

        $this->actingAs($admin)
            ->postJson('/api/admin/intake/invites', [
                'prospect_name' => 'Jane Doe',
                'prospect_email' => 'jane@example.com',
                'business_name' => 'Acme Co.',
                'expires_days' => 14,
                'send_email' => true,
            ])
            ->assertCreated()
            ->assertJsonPath('data.business_name', 'Acme Co.')
            ->assertJsonStructure(['url']);

        Mail::assertQueued(IntakeInviteMail::class);
    }

    public function test_admin_can_revoke_invite(): void
    {
        $admin = User::factory()->create(['is_admin' => true]);
        $invite = ClientIntakeInvite::create([
            'status' => ClientIntakeInvite::STATUS_OPENED,
        ]);

        $this->actingAs($admin)
            ->postJson('/api/admin/intake/invites/'.$invite->id.'/revoke')
            ->assertOk();

        $this->assertSame(ClientIntakeInvite::STATUS_REVOKED, $invite->fresh()->status);

        // Public route should now 404.
        $this->get('/intake/'.$invite->code)->assertNotFound();
    }

    public function test_convert_intake_creates_helpdesk_project(): void
    {
        $admin = User::factory()->create(['is_admin' => true]);

        $invite = ClientIntakeInvite::create([
            'status' => ClientIntakeInvite::STATUS_SUBMITTED,
            'submitted_at' => now(),
        ]);

        $intake = ClientIntake::create([
            'invite_id' => $invite->id,
            'email' => 'jane@acme.test',
            'business_name' => 'Acme Co.',
            'budget_range' => '10k_25k',
            'data' => [
                'business_name' => 'Acme Co.',
                'contact_name' => 'Jane Doe',
                'business_description' => 'A widget company.',
                'email' => 'jane@acme.test',
            ],
            'submitted_at' => now(),
        ]);

        $response = $this->actingAs($admin)
            ->postJson('/api/admin/intake/submissions/'.$intake->id.'/convert');

        $response->assertOk()
            ->assertJsonPath('data.name', 'Acme Co.');

        $intake->refresh();
        $this->assertNotNull($intake->converted_project_id);

        $this->assertDatabaseHas('helpdesk_projects', [
            'id' => $intake->converted_project_id,
            'name' => 'Acme Co.',
            'client_email' => 'jane@acme.test',
        ]);
    }

    /**
     * @return array<string, mixed>
     */
    private function validSubmissionPayload(): array
    {
        return [
            'business_name' => 'Acme Co.',
            'industry' => 'Manufacturing',
            'contact_name' => 'Jane Doe',
            'email' => 'jane@acme.test',
            'goals' => ['lead_generation', 'credibility'],
            'business_description' => 'We make widgets that solve real problems.',
            'target_audience' => 'Small business owners in the US.',
            'estimated_pages' => '6-10',
            'features' => ['contact_form', 'blog'],
            'needs_cms' => 'yes',
            'has_brand_guidelines' => 'no',
            'content_responsibility' => 'mix',
            'media_responsibility' => 'self',
            'domain_name' => 'acmeco.test',
            'budget_range' => '10k_25k',
            'primary_contact' => 'Jane Doe',
        ];
    }
}
