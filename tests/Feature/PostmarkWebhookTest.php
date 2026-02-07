<?php

namespace Tests\Feature;

use App\Enums\SuppressionType;
use App\Models\EmailLog;
use App\Models\EmailSuppression;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PostmarkWebhookTest extends TestCase
{
    use RefreshDatabase;

    public function test_hard_bounce_creates_suppression(): void
    {
        $response = $this->postJson('/webhooks/postmark', [
            'RecordType' => 'Bounce',
            'Type' => 'HardBounce',
            'Email' => 'bounced@example.com',
            'Description' => 'The email account does not exist',
            'MessageID' => 'test-message-id-123',
        ]);

        $response->assertOk();
        $response->assertJson(['message' => 'Bounce processed']);

        $this->assertDatabaseHas('email_suppressions', [
            'email' => 'bounced@example.com',
            'type' => SuppressionType::Bounce->value,
        ]);
    }

    public function test_soft_bounce_does_not_create_suppression(): void
    {
        $response = $this->postJson('/webhooks/postmark', [
            'RecordType' => 'Bounce',
            'Type' => 'Transient',
            'Email' => 'transient@example.com',
            'Description' => 'Temporary delivery failure',
        ]);

        $response->assertOk();
        $response->assertJson(['message' => 'Soft bounce ignored']);

        $this->assertDatabaseMissing('email_suppressions', [
            'email' => 'transient@example.com',
        ]);
    }

    public function test_spam_complaint_creates_suppression(): void
    {
        $response = $this->postJson('/webhooks/postmark', [
            'RecordType' => 'SpamComplaint',
            'Email' => 'complainer@example.com',
        ]);

        $response->assertOk();
        $response->assertJson(['message' => 'Spam complaint processed']);

        $this->assertDatabaseHas('email_suppressions', [
            'email' => 'complainer@example.com',
            'type' => SuppressionType::SpamComplaint->value,
        ]);
    }

    public function test_bounce_missing_email_returns_422(): void
    {
        $response = $this->postJson('/webhooks/postmark', [
            'RecordType' => 'Bounce',
            'Type' => 'HardBounce',
        ]);

        $response->assertStatus(422);
    }

    public function test_unknown_record_type_returns_ok(): void
    {
        $response = $this->postJson('/webhooks/postmark', [
            'RecordType' => 'Delivery',
            'Email' => 'delivered@example.com',
        ]);

        $response->assertOk();
        $response->assertJson(['message' => 'Webhook received']);
    }

    public function test_invalid_token_returns_401(): void
    {
        config(['services.postmark.webhook_token' => 'secret-token']);

        $response = $this->postJson('/webhooks/postmark', [
            'RecordType' => 'Bounce',
            'Type' => 'HardBounce',
            'Email' => 'bounced@example.com',
        ], ['X-Postmark-Token' => 'wrong-token']);

        $response->assertStatus(401);
    }

    public function test_valid_token_is_accepted(): void
    {
        config(['services.postmark.webhook_token' => 'secret-token']);

        $response = $this->postJson('/webhooks/postmark', [
            'RecordType' => 'Bounce',
            'Type' => 'HardBounce',
            'Email' => 'bounced@example.com',
            'Description' => 'Hard bounce',
        ], ['X-Postmark-Token' => 'secret-token']);

        $response->assertOk();
    }

    public function test_bounce_updates_email_log_status(): void
    {
        EmailLog::factory()->create([
            'postmark_message_id' => 'msg-123',
            'status' => 'sent',
        ]);

        $this->postJson('/webhooks/postmark', [
            'RecordType' => 'Bounce',
            'Type' => 'HardBounce',
            'Email' => 'bounced@example.com',
            'MessageID' => 'msg-123',
            'Description' => 'Hard bounce',
        ]);

        $this->assertDatabaseHas('email_logs', [
            'postmark_message_id' => 'msg-123',
            'status' => 'bounced',
        ]);
    }

    public function test_spam_complaint_updates_email_log_status(): void
    {
        EmailLog::factory()->create([
            'postmark_message_id' => 'msg-456',
            'status' => 'sent',
        ]);

        $this->postJson('/webhooks/postmark', [
            'RecordType' => 'SpamComplaint',
            'Email' => 'complainer@example.com',
            'MessageID' => 'msg-456',
        ]);

        $this->assertDatabaseHas('email_logs', [
            'postmark_message_id' => 'msg-456',
            'status' => 'complained',
        ]);
    }

    public function test_duplicate_bounce_updates_existing_suppression(): void
    {
        EmailSuppression::factory()->bounce()->create([
            'email' => 'bounced@example.com',
            'reason' => 'Original reason',
        ]);

        $this->postJson('/webhooks/postmark', [
            'RecordType' => 'Bounce',
            'Type' => 'HardBounce',
            'Email' => 'bounced@example.com',
            'Description' => 'Updated reason',
        ]);

        $this->assertDatabaseCount('email_suppressions', 1);
        $this->assertDatabaseHas('email_suppressions', [
            'email' => 'bounced@example.com',
            'reason' => 'Updated reason',
        ]);
    }
}
