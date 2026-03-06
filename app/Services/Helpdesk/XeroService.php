<?php

namespace App\Services\Helpdesk;

use App\Jobs\Helpdesk\HandleXeroInvoiceWebhookJob;
use App\Models\Helpdesk\Invoice;
use App\Models\Helpdesk\InvoicePayment;
use App\Models\Helpdesk\Project;
use App\Models\Helpdesk\TimeEntry;
use App\Models\Helpdesk\XeroConnection;
use Carbon\Carbon;
use GuzzleHttp\Client as GuzzleClient;
use Illuminate\Support\Facades\Log;
use League\OAuth2\Client\Provider\GenericProvider;
use League\OAuth2\Client\Token\AccessTokenInterface;
use RuntimeException;
use Throwable;
use XeroAPI\XeroPHP\Api\IdentityApi;
use XeroAPI\XeroPHP\Configuration;
use XeroAPI\XeroPHP\Models\Accounting\Account;
use XeroAPI\XeroPHP\Models\Accounting\Contact as XeroContact;
use XeroAPI\XeroPHP\Models\Accounting\Contacts;
use XeroAPI\XeroPHP\Models\Accounting\Invoice as XeroInvoice;
use XeroAPI\XeroPHP\Models\Accounting\Invoices;
use XeroAPI\XeroPHP\Models\Accounting\LineItem as XeroLineItem;
use XeroAPI\XeroPHP\Models\Accounting\Payment as XeroPayment;
use XeroAPI\XeroPHP\Models\Accounting\Payments;

class XeroService
{
    protected ?GenericProvider $provider = null;

    protected ?GuzzleClient $httpClient = null;

    public function isConfigured(): bool
    {
        return filled(config('services.xero.client_id'))
            && filled(config('services.xero.client_secret'));
    }

    public function hasActiveConnection(): bool
    {
        return $this->isConfigured() && XeroConnection::current() !== null;
    }

    public function getConnection(): ?XeroConnection
    {
        return XeroConnection::current();
    }

    public function getAuthorizationUrl(): array
    {
        $url = $this->getProvider()->getAuthorizationUrl([
            'scope' => $this->getScopes(),
        ]);

        return [
            'url' => $url,
            'state' => $this->getProvider()->getState(),
        ];
    }

    public function exchangeCodeForToken(string $code): AccessTokenInterface
    {
        return $this->getProvider()->getAccessToken('authorization_code', [
            'code' => $code,
        ]);
    }

    public function storeConnection(AccessTokenInterface $token, int $userId): XeroConnection
    {
        $identityApi = $this->getIdentityApiForAccessToken($token->getToken());
        $connections = collect($identityApi->getConnections());
        $selectedConnection = $connections->first(fn ($connection) => filled($connection->getTenantId()));

        if (! $selectedConnection) {
            throw new RuntimeException('No Xero organisation was returned after authorization.');
        }

        $existingConnection = XeroConnection::current();

        $connection = XeroConnection::query()->updateOrCreate(
            ['tenant_id' => $selectedConnection->getTenantId()],
            [
                'connection_id' => $selectedConnection->getId(),
                'tenant_name' => $selectedConnection->getTenantName(),
                'access_token' => $token->getToken(),
                'refresh_token' => $token->getRefreshToken(),
                'token_expires_at' => Carbon::createFromTimestamp($token->getExpires()),
                'connected_at' => now(),
                'connected_by' => $userId,
                'sales_account_code' => $existingConnection?->sales_account_code,
                'payment_account_code' => $existingConnection?->payment_account_code,
            ]
        );

        XeroConnection::query()
            ->where('id', '!=', $connection->id)
            ->delete();

        return $connection;
    }

    public function disconnectCurrentConnection(): void
    {
        $connection = XeroConnection::current();

        if (! $connection) {
            return;
        }

        try {
            if ($connection->connection_id) {
                $this->getIdentityApi($connection)->deleteConnection($connection->connection_id);
            }
        } catch (Throwable $exception) {
            Log::warning('Failed to delete Xero connection remotely', [
                'connection_id' => $connection->connection_id,
                'tenant_id' => $connection->tenant_id,
                'error' => $exception->getMessage(),
            ]);
        }

        $connection->delete();
    }

    public function refreshConnection(XeroConnection $connection): XeroConnection
    {
        if (! $connection->refresh_token) {
            throw new RuntimeException('Xero refresh token is missing. Please reconnect Xero.');
        }

        $token = $this->getProvider()->getAccessToken('refresh_token', [
            'refresh_token' => $connection->refresh_token,
        ]);

        $connection->forceFill([
            'access_token' => $token->getToken(),
            'refresh_token' => $token->getRefreshToken() ?: $connection->refresh_token,
            'token_expires_at' => Carbon::createFromTimestamp($token->getExpires()),
        ])->save();

        return $connection->fresh();
    }

    public function verifyWebhookSignature(string $payload, ?string $signature): bool
    {
        $webhookKey = (string) config('services.xero.webhook_key');

        if (! filled($signature) || ! filled($webhookKey)) {
            return false;
        }

        $expectedSignature = base64_encode(hash_hmac('sha256', $payload, $webhookKey, true));

        return hash_equals($expectedSignature, $signature);
    }

    public function syncInvoice(Invoice $invoice): void
    {
        $connection = $this->getRequiredConnection();
        $invoice->loadMissing(['project', 'lineItems']);

        try {
            $contact = $this->resolveContact($connection, $invoice->project, $invoice);
            $xeroInvoice = $this->buildXeroInvoice($invoice, $contact, $connection);
            $container = new Invoices;
            $container->setInvoices([$xeroInvoice]);
            $accountingApi = $this->getAccountingApi($connection);

            if ($invoice->xero_invoice_id) {
                $response = $accountingApi->updateInvoice(
                    $connection->tenant_id,
                    $invoice->xero_invoice_id,
                    $container,
                    null,
                    $invoice->uuid
                );
            } else {
                $response = $accountingApi->createInvoices(
                    $connection->tenant_id,
                    $container,
                    false,
                    null,
                    $invoice->uuid
                );
            }

            $syncedInvoice = $response->getInvoices()[0] ?? null;

            if (! $syncedInvoice) {
                throw new RuntimeException('Xero did not return a synced invoice.');
            }

            $invoice->forceFill([
                'xero_invoice_id' => $syncedInvoice->getInvoiceId(),
                'xero_synced_at' => now(),
                'xero_last_sync_error' => null,
            ])->saveQuietly();
        } catch (Throwable $exception) {
            $invoice->forceFill([
                'xero_last_sync_error' => $exception->getMessage(),
            ])->saveQuietly();

            throw $exception;
        }
    }

    public function voidInvoice(Invoice $invoice): void
    {
        if (! $invoice->xero_invoice_id) {
            return;
        }

        $connection = $this->getRequiredConnection();

        try {
            $xeroInvoice = new XeroInvoice;
            $xeroInvoice->setStatus('VOIDED');

            $container = new Invoices;
            $container->setInvoices([$xeroInvoice]);

            $this->getAccountingApi($connection)->updateInvoice(
                $connection->tenant_id,
                $invoice->xero_invoice_id,
                $container,
                null,
                $invoice->uuid.'-void'
            );

            $invoice->forceFill([
                'xero_synced_at' => now(),
                'xero_last_sync_error' => null,
            ])->saveQuietly();
        } catch (Throwable $exception) {
            $invoice->forceFill([
                'xero_last_sync_error' => $exception->getMessage(),
            ])->saveQuietly();

            throw $exception;
        }
    }

    public function syncPayment(InvoicePayment $payment): void
    {
        $payment->loadMissing('invoice.project');
        $invoice = $payment->invoice;

        if (! $invoice || ! $invoice->xero_invoice_id || $payment->xero_payment_id) {
            return;
        }

        $connection = $this->getRequiredConnection();

        if (! $connection->payment_account_code) {
            $payment->forceFill([
                'xero_last_sync_error' => 'Set a Xero payment account code before syncing payments.',
            ])->saveQuietly();

            return;
        }

        try {
            $xeroInvoice = new XeroInvoice;
            $xeroInvoice->setInvoiceId($invoice->xero_invoice_id);

            $account = new Account;
            $account->setCode($connection->payment_account_code);

            $xeroPayment = new XeroPayment;
            $xeroPayment->setInvoice($xeroInvoice);
            $xeroPayment->setAccount($account);
            $xeroPayment->setAmount((float) $payment->amount);
            $xeroPayment->setDateAsDate($payment->payment_date ?? now());
            $xeroPayment->setReference($this->formatPaymentReference($payment));

            $payments = new Payments;
            $payments->setPayments([$xeroPayment]);

            $response = $this->getAccountingApi($connection)->createPayments(
                $connection->tenant_id,
                $payments,
                false,
                $invoice->uuid.'-payment-'.$payment->id
            );

            $syncedPayment = $response->getPayments()[0] ?? null;

            if (! $syncedPayment) {
                throw new RuntimeException('Xero did not return a synced payment.');
            }

            $payment->forceFill([
                'xero_payment_id' => $syncedPayment->getPaymentId(),
                'xero_last_sync_error' => null,
            ])->saveQuietly();

            $invoice->forceFill([
                'xero_synced_at' => now(),
                'xero_last_sync_error' => null,
            ])->saveQuietly();
        } catch (Throwable $exception) {
            $payment->forceFill([
                'xero_last_sync_error' => $exception->getMessage(),
            ])->saveQuietly();

            throw $exception;
        }
    }

    public function queueWebhookEvents(array $events): void
    {
        foreach ($events as $event) {
            $eventCategory = strtoupper((string) data_get($event, 'eventCategory'));
            $resourceId = (string) data_get($event, 'resourceId');
            $tenantId = (string) data_get($event, 'tenantId');

            if ($eventCategory !== 'INVOICE' || ! filled($resourceId) || ! filled($tenantId)) {
                continue;
            }

            HandleXeroInvoiceWebhookJob::dispatch($tenantId, $resourceId);
        }
    }

    public function applyRemoteInvoiceUpdate(string $tenantId, string $resourceId): void
    {
        $connection = XeroConnection::query()
            ->where('tenant_id', $tenantId)
            ->first();

        if (! $connection) {
            return;
        }

        $remoteInvoice = $this->getRemoteInvoice($connection, $resourceId);
        $localInvoice = Invoice::query()
            ->where('xero_invoice_id', $resourceId)
            ->first();

        if (! $localInvoice && $remoteInvoice->getInvoiceNumber()) {
            $localInvoice = Invoice::query()
                ->where('invoice_number', $remoteInvoice->getInvoiceNumber())
                ->first();
        }

        if (! $localInvoice) {
            return;
        }

        $localInvoice->loadMissing(['lineItems', 'payments']);

        $newStatus = $this->mapXeroStatusToLocalStatus(
            (string) $remoteInvoice->getStatus(),
            (float) $remoteInvoice->getAmountPaid(),
            $remoteInvoice->getDueDateAsDate()
        );

        if (in_array($newStatus, [Invoice::STATUS_VOID], true) && $localInvoice->status !== Invoice::STATUS_VOID) {
            $lineItemIds = $localInvoice->lineItems()->pluck('id');

            if ($lineItemIds->isNotEmpty()) {
                TimeEntry::query()
                    ->whereIn('invoice_line_item_id', $lineItemIds)
                    ->update(['invoice_line_item_id' => null]);
            }
        }

        $localInvoice->forceFill([
            'xero_invoice_id' => $resourceId,
            'status' => $newStatus,
            'xero_synced_at' => now(),
            'xero_last_sync_error' => null,
            'sent_at' => $newStatus !== Invoice::STATUS_DRAFT ? ($localInvoice->sent_at ?? now()) : $localInvoice->sent_at,
            'paid_at' => $newStatus === Invoice::STATUS_PAID ? ($localInvoice->paid_at ?? now()) : $localInvoice->paid_at,
            'voided_at' => $newStatus === Invoice::STATUS_VOID ? ($localInvoice->voided_at ?? now()) : $localInvoice->voided_at,
        ])->saveQuietly();

        $localAmountPaid = (float) $localInvoice->payments()->sum('amount');
        $remoteAmountPaid = round((float) $remoteInvoice->getAmountPaid(), 2);
        $delta = round($remoteAmountPaid - $localAmountPaid, 2);

        if ($delta > 0) {
            InvoicePayment::withoutEvents(function () use ($localInvoice, $delta): void {
                $localInvoice->payments()->create([
                    'amount' => $delta,
                    'payment_method' => InvoicePayment::METHOD_OTHER,
                    'payment_date' => now()->toDateString(),
                    'reference_number' => 'xero-webhook-sync',
                    'notes' => 'Imported from Xero webhook',
                ]);
            });

            $localInvoice->updatePaymentStatus();
            $localInvoice->forceFill([
                'xero_synced_at' => now(),
                'xero_last_sync_error' => null,
            ])->saveQuietly();
        } elseif ($delta < 0) {
            $localInvoice->forceFill([
                'xero_last_sync_error' => 'Xero reports less paid than CoreLink. Review the invoice manually.',
            ])->saveQuietly();
        }
    }

    public function getRemoteInvoice(XeroConnection $connection, string $resourceId): XeroInvoice
    {
        $response = $this->getAccountingApi($connection)->getInvoice($connection->tenant_id, $resourceId);
        $invoice = $response->getInvoices()[0] ?? null;

        if (! $invoice) {
            throw new RuntimeException('Xero invoice not found.');
        }

        return $invoice;
    }

    protected function getRequiredConnection(): XeroConnection
    {
        if (! $this->isConfigured()) {
            throw new RuntimeException('Xero is not configured. Add XERO_CLIENT_ID and XERO_CLIENT_SECRET first.');
        }

        $connection = XeroConnection::current();

        if (! $connection) {
            throw new RuntimeException('No active Xero connection found.');
        }

        return $connection;
    }

    protected function getProvider(): GenericProvider
    {
        if (! $this->provider) {
            $this->provider = new GenericProvider([
                'clientId' => (string) config('services.xero.client_id'),
                'clientSecret' => (string) config('services.xero.client_secret'),
                'redirectUri' => $this->getRedirectUri(),
                'urlAuthorize' => 'https://login.xero.com/identity/connect/authorize',
                'urlAccessToken' => 'https://identity.xero.com/connect/token',
                'urlResourceOwnerDetails' => 'https://api.xero.com/api.xro/2.0/Organisation',
            ]);
        }

        return $this->provider;
    }

    protected function getScopes(): array
    {
        return [
            'offline_access',
            'accounting.transactions',
            'accounting.contacts',
        ];
    }

    protected function getRedirectUri(): string
    {
        return (string) (config('services.xero.redirect_uri') ?: route('admin.xero.callback'));
    }

    protected function getHttpClient(): GuzzleClient
    {
        if (! $this->httpClient) {
            $this->httpClient = new GuzzleClient;
        }

        return $this->httpClient;
    }

    protected function getIdentityApi(XeroConnection $connection): IdentityApi
    {
        return new IdentityApi(
            $this->getHttpClient(),
            $this->getConfiguration($connection)
        );
    }

    protected function getIdentityApiForAccessToken(string $accessToken): IdentityApi
    {
        return new IdentityApi(
            $this->getHttpClient(),
            Configuration::getDefaultConfiguration()->setAccessToken($accessToken)
        );
    }

    protected function getAccountingApi(XeroConnection $connection): object
    {
        $accountingApiClass = 'XeroAPI\\XeroPHP\\Api\\AccountingApi';

        return new $accountingApiClass(
            $this->getHttpClient(),
            $this->getConfiguration($connection)
        );
    }

    protected function getConfiguration(XeroConnection $connection): Configuration
    {
        $connection = $connection->needsRefresh()
            ? $this->refreshConnection($connection)
            : $connection;

        return Configuration::getDefaultConfiguration()
            ->setAccessToken((string) $connection->access_token);
    }

    protected function resolveContact(XeroConnection $connection, Project $project, Invoice $invoice): XeroContact
    {
        if ($project->xero_contact_id) {
            $contact = new XeroContact;
            $contact->setContactId($project->xero_contact_id);

            return $contact;
        }

        $contact = new XeroContact;
        $contact->setName($invoice->billing_name ?: $project->client_name ?: $project->name);

        if ($invoice->billing_email ?: $project->client_email) {
            $contact->setEmailAddress($invoice->billing_email ?: $project->client_email);
        }

        $contacts = new Contacts;
        $contacts->setContacts([$contact]);

        $response = $this->getAccountingApi($connection)->createContacts(
            $connection->tenant_id,
            $contacts,
            false
        );

        $createdContact = $response->getContacts()[0] ?? null;

        if (! $createdContact || ! $createdContact->getContactId()) {
            throw new RuntimeException('Xero did not return a contact ID.');
        }

        $project->forceFill([
            'xero_contact_id' => $createdContact->getContactId(),
        ])->saveQuietly();

        return $createdContact;
    }

    protected function buildXeroInvoice(Invoice $invoice, XeroContact $contact, XeroConnection $connection): XeroInvoice
    {
        $xeroInvoice = new XeroInvoice;
        $xeroInvoice->setType('ACCREC');
        $xeroInvoice->setContact($contact);
        $xeroInvoice->setInvoiceNumber($invoice->invoice_number);
        $xeroInvoice->setReference('CoreLink - '.$invoice->project->name);
        $xeroInvoice->setStatus($this->mapLocalStatusToXeroStatus($invoice->status));
        $xeroInvoice->setLineAmountTypes('Exclusive');
        $xeroInvoice->setLineItems($this->buildXeroLineItems($invoice, $connection->sales_account_code));

        if ($invoice->issue_date) {
            $xeroInvoice->setDateAsDate($invoice->issue_date);
        }

        if ($invoice->due_date) {
            $xeroInvoice->setDueDateAsDate($invoice->due_date);
        }

        return $xeroInvoice;
    }

    protected function buildXeroLineItems(Invoice $invoice, ?string $salesAccountCode): array
    {
        $lineItems = [];

        foreach ($invoice->lineItems as $item) {
            $lineItem = new XeroLineItem;
            $lineItem->setDescription($item->description);
            $lineItem->setQuantity((float) $item->quantity);
            $lineItem->setUnitAmount((float) $item->rate);
            $lineItem->setTaxType('NONE');

            if ($salesAccountCode) {
                $lineItem->setAccountCode($salesAccountCode);
            }

            $lineItems[] = $lineItem;
        }

        if ((float) $invoice->discount_amount > 0) {
            $lineItems[] = $this->buildAdjustmentLineItem('Discount'.($invoice->discount_description ? ' - '.$invoice->discount_description : ''), -1 * (float) $invoice->discount_amount, $salesAccountCode);
        }

        if ((float) $invoice->credit_amount > 0) {
            $lineItems[] = $this->buildAdjustmentLineItem('Credit'.($invoice->credit_description ? ' - '.$invoice->credit_description : ''), -1 * (float) $invoice->credit_amount, $salesAccountCode);
        }

        if ((float) $invoice->tax_amount > 0) {
            $lineItems[] = $this->buildAdjustmentLineItem('Tax'.($invoice->tax_rate ? ' ('.$invoice->tax_rate.'%)' : ''), (float) $invoice->tax_amount, $salesAccountCode);
        }

        return $lineItems;
    }

    protected function buildAdjustmentLineItem(string $description, float $amount, ?string $salesAccountCode): XeroLineItem
    {
        $lineItem = new XeroLineItem;
        $lineItem->setDescription($description);
        $lineItem->setQuantity(1);
        $lineItem->setUnitAmount($amount);
        $lineItem->setTaxType('NONE');

        if ($salesAccountCode) {
            $lineItem->setAccountCode($salesAccountCode);
        }

        return $lineItem;
    }

    protected function formatPaymentReference(InvoicePayment $payment): string
    {
        $parts = ['CoreLink'];

        if ($payment->reference_number) {
            $parts[] = $payment->reference_number;
        }

        $parts[] = 'Invoice '.$payment->invoice->invoice_number;

        return implode(' / ', $parts);
    }

    protected function mapLocalStatusToXeroStatus(string $status): string
    {
        return match ($status) {
            Invoice::STATUS_DRAFT => 'DRAFT',
            Invoice::STATUS_VOID => 'VOIDED',
            default => 'AUTHORISED',
        };
    }

    protected function mapXeroStatusToLocalStatus(string $status, float $amountPaid, mixed $dueDate): string
    {
        $normalizedStatus = strtoupper($status);

        if ($normalizedStatus === 'DRAFT') {
            return Invoice::STATUS_DRAFT;
        }

        if ($normalizedStatus === 'PAID') {
            return Invoice::STATUS_PAID;
        }

        if (in_array($normalizedStatus, ['VOIDED', 'DELETED'], true)) {
            return Invoice::STATUS_VOID;
        }

        if ($amountPaid > 0) {
            return Invoice::STATUS_PARTIAL;
        }

        if ($dueDate && Carbon::parse($dueDate)->isPast()) {
            return Invoice::STATUS_OVERDUE;
        }

        return Invoice::STATUS_SENT;
    }
}
