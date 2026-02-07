<?php

namespace Tests\Feature;

use App\Models\EmailLog;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class EmailLogTest extends TestCase
{
    use RefreshDatabase;

    public function test_should_log_external_domain(): void
    {
        $this->assertTrue(EmailLog::shouldLog('user@example.com'));
        $this->assertTrue(EmailLog::shouldLog('user@gmail.com'));
        $this->assertTrue(EmailLog::shouldLog('client@company.org'));
    }

    public function test_should_not_log_corelink_domain(): void
    {
        $this->assertFalse(EmailLog::shouldLog('admin@corelink.dev'));
        $this->assertFalse(EmailLog::shouldLog('support@corelink.dev'));
    }

    public function test_should_not_log_pantrylink_domain(): void
    {
        $this->assertFalse(EmailLog::shouldLog('user@pantrylink.app'));
    }

    public function test_should_not_log_champlink_domain(): void
    {
        $this->assertFalse(EmailLog::shouldLog('user@champlink.app'));
    }

    public function test_should_log_is_case_insensitive(): void
    {
        $this->assertFalse(EmailLog::shouldLog('admin@CORELINK.DEV'));
        $this->assertFalse(EmailLog::shouldLog('user@Pantrylink.App'));
    }

    public function test_email_log_can_be_created(): void
    {
        $log = EmailLog::factory()->create([
            'to_email' => 'client@example.com',
            'subject' => 'Test Invoice',
            'status' => 'sent',
        ]);

        $this->assertDatabaseHas('email_logs', [
            'id' => $log->id,
            'to_email' => 'client@example.com',
            'subject' => 'Test Invoice',
            'status' => 'sent',
        ]);
    }
}
