<?php

namespace Tests\Feature;

use App\Listeners\CheckEmailSuppression;
use App\Models\EmailSuppression;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Mail\Events\MessageSending;
use Symfony\Component\Mime\Address;
use Symfony\Component\Mime\Email;
use Tests\TestCase;

class EmailSuppressionTest extends TestCase
{
    use RefreshDatabase;

    public function test_is_suppressed_returns_true_for_suppressed_email(): void
    {
        EmailSuppression::factory()->bounce()->create([
            'email' => 'bounced@example.com',
        ]);

        $this->assertTrue(EmailSuppression::isSuppressed('bounced@example.com'));
    }

    public function test_is_suppressed_returns_false_for_clean_email(): void
    {
        $this->assertFalse(EmailSuppression::isSuppressed('clean@example.com'));
    }

    public function test_is_suppressed_is_case_insensitive(): void
    {
        EmailSuppression::factory()->bounce()->create([
            'email' => 'bounced@example.com',
        ]);

        $this->assertTrue(EmailSuppression::isSuppressed('BOUNCED@EXAMPLE.COM'));
    }

    public function test_find_by_email_returns_suppression(): void
    {
        EmailSuppression::factory()->spamComplaint()->create([
            'email' => 'complainer@example.com',
        ]);

        $suppression = EmailSuppression::findByEmail('complainer@example.com');

        $this->assertNotNull($suppression);
        $this->assertEquals('complainer@example.com', $suppression->email);
    }

    public function test_find_by_email_returns_null_for_clean_email(): void
    {
        $this->assertNull(EmailSuppression::findByEmail('clean@example.com'));
    }

    public function test_suppressed_email_blocks_sending(): void
    {
        EmailSuppression::factory()->bounce()->create([
            'email' => 'bounced@example.com',
        ]);

        $email = (new Email)
            ->to(new Address('bounced@example.com'))
            ->subject('Test');

        $event = new MessageSending($email, []);
        $listener = new CheckEmailSuppression;
        $result = $listener->handle($event);

        $this->assertFalse($result);
    }

    public function test_clean_email_is_not_blocked(): void
    {
        $email = (new Email)
            ->to(new Address('clean@example.com'))
            ->subject('Test');

        $event = new MessageSending($email, []);
        $listener = new CheckEmailSuppression;
        $result = $listener->handle($event);

        $this->assertNull($result);
    }
}
