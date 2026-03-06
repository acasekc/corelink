<?php

namespace Tests\Feature\Helpdesk;

use App\Jobs\Helpdesk\HandleXeroInvoiceWebhookJob;
use App\Jobs\Helpdesk\SyncInvoiceToXeroJob;
use App\Jobs\Helpdesk\SyncPaymentToXeroJob;
use App\Mail\InvoiceSent;
use App\Models\Helpdesk\Invoice;
use App\Models\Helpdesk\InvoicePayment;
use App\Models\Helpdesk\Project;
use App\Models\Helpdesk\XeroConnection;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Bus;
use Illuminate\Support\Facades\Mail;
use Tests\TestCase;

class XeroIntegrationTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;

    private Project $project;

    protected function setUp(): void
    {
        parent::setUp();

        $this->admin = User::factory()->create([
            'is_admin' => true,
        ]);

        $this->project = Project::factory()->create([
            'name' => 'Xero Test Project',
            'slug' => 'xero-test-project',
            'ticket_prefix' => 'XERO',
            'client_name' => 'Client Example',
            'client_email' => 'client@example.com',
        ]);

        config()->set('services.xero.client_id', 'test-client-id');
        config()->set('services.xero.client_secret', 'test-client-secret');
        config()->set('services.xero.webhook_key', 'test-webhook-key');
    }

    public function test_admin_can_view_xero_status(): void
    {
        XeroConnection::create([
            'connection_id' => 'connection-123',
            'tenant_id' => 'tenant-123',
            'tenant_name' => 'Acme Org',
            'access_token' => 'access-token',
            'refresh_token' => 'refresh-token',
            'token_expires_at' => now()->addHour(),
            'connected_at' => now(),
            'connected_by' => $this->admin->id,
            'sales_account_code' => '200',
            'payment_account_code' => '090',
        ]);

        $response = $this->actingAs($this->admin)
            ->getJson('/api/helpdesk/admin/xero/status');

        $response->assertOk()
            ->assertJsonPath('data.configured', true)
            ->assertJsonPath('data.connected', true)
            ->assertJsonPath('data.tenant_name', 'Acme Org')
            ->assertJsonPath('data.sales_account_code', '200')
            ->assertJsonPath('data.payment_account_code', '090');
    }

    public function test_sending_an_invoice_dispatches_xero_sync_job_when_connected(): void
    {
        Bus::fake();
        Mail::fake();

        XeroConnection::create([
            'connection_id' => 'connection-123',
            'tenant_id' => 'tenant-123',
            'tenant_name' => 'Acme Org',
            'access_token' => 'access-token',
            'refresh_token' => 'refresh-token',
            'token_expires_at' => now()->addHour(),
            'connected_at' => now(),
            'connected_by' => $this->admin->id,
        ]);

        $invoice = Invoice::create([
            'project_id' => $this->project->id,
            'invoice_number' => 'INV-XERO-0001',
            'status' => Invoice::STATUS_DRAFT,
            'bill_to_name' => 'Client Example',
            'bill_to_email' => 'client@example.com',
            'issue_date' => now()->toDateString(),
            'due_date' => now()->addDays(30)->toDateString(),
            'subtotal' => 100,
            'discount_amount' => 0,
            'credit_amount' => 0,
            'tax_rate' => 0,
            'tax_amount' => 0,
            'total' => 100,
            'amount_paid' => 0,
            'currency' => 'USD',
        ]);

        $response = $this->actingAs($this->admin)
            ->postJson("/api/helpdesk/admin/invoices/{$invoice->id}/send");

        $response->assertOk()
            ->assertJsonPath('data.status', Invoice::STATUS_SENT);

        Mail::assertSent(InvoiceSent::class);
        Bus::assertDispatched(SyncInvoiceToXeroJob::class, fn (SyncInvoiceToXeroJob $job): bool => $job->invoiceId === $invoice->id);
    }

    public function test_recording_a_payment_dispatches_xero_payment_sync_job_for_synced_invoice(): void
    {
        Bus::fake();

        XeroConnection::create([
            'connection_id' => 'connection-123',
            'tenant_id' => 'tenant-123',
            'tenant_name' => 'Acme Org',
            'access_token' => 'access-token',
            'refresh_token' => 'refresh-token',
            'token_expires_at' => now()->addHour(),
            'connected_at' => now(),
            'connected_by' => $this->admin->id,
            'payment_account_code' => '090',
        ]);

        $invoice = Invoice::create([
            'project_id' => $this->project->id,
            'invoice_number' => 'INV-XERO-0002',
            'status' => Invoice::STATUS_SENT,
            'bill_to_name' => 'Client Example',
            'bill_to_email' => 'client@example.com',
            'issue_date' => now()->toDateString(),
            'due_date' => now()->addDays(30)->toDateString(),
            'subtotal' => 100,
            'discount_amount' => 0,
            'credit_amount' => 0,
            'tax_rate' => 0,
            'tax_amount' => 0,
            'total' => 100,
            'amount_paid' => 0,
            'currency' => 'USD',
            'xero_invoice_id' => 'xero-invoice-123',
        ]);

        $response = $this->actingAs($this->admin)
            ->postJson("/api/helpdesk/admin/invoices/{$invoice->id}/payments", [
                'amount' => 50,
                'payment_method' => InvoicePayment::METHOD_CASH,
                'reference_number' => 'CASH-123',
            ]);

        $response->assertCreated();

        Bus::assertDispatched(SyncPaymentToXeroJob::class);
    }

    public function test_xero_webhook_rejects_invalid_signatures(): void
    {
        $response = $this->postJson('/webhooks/xero', [
            'events' => [],
        ], [
            'x-xero-signature' => 'not-valid',
        ]);

        $response->assertStatus(401);
    }

    public function test_xero_webhook_dispatches_invoice_jobs_for_valid_events(): void
    {
        Bus::fake();

        $payload = json_encode([
            'events' => [
                [
                    'resourceId' => 'invoice-resource-123',
                    'tenantId' => 'tenant-123',
                    'eventCategory' => 'INVOICE',
                    'eventType' => 'UPDATE',
                ],
            ],
            'firstEventSequence' => 1,
            'lastEventSequence' => 1,
            'entropy' => 'abc123',
        ], JSON_THROW_ON_ERROR);

        $signature = base64_encode(hash_hmac('sha256', $payload, 'test-webhook-key', true));

        $response = $this->call(
            'POST',
            '/webhooks/xero',
            [],
            [],
            [],
            [
                'CONTENT_TYPE' => 'application/json',
                'HTTP_X_XERO_SIGNATURE' => $signature,
            ],
            $payload,
        );

        $response->assertOk();

        Bus::assertDispatched(HandleXeroInvoiceWebhookJob::class, function (HandleXeroInvoiceWebhookJob $job): bool {
            return $job->tenantId === 'tenant-123' && $job->resourceId === 'invoice-resource-123';
        });
    }
}
