<?php

namespace App\Http\Controllers\Helpdesk\Admin;

use App\Http\Controllers\Controller;
use App\Services\Helpdesk\XeroService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class XeroController extends Controller
{
    public function __construct(
        protected XeroService $xeroService
    ) {}

    public function status(): JsonResponse
    {
        $connection = $this->xeroService->getConnection();

        return response()->json([
            'data' => [
                'configured' => $this->xeroService->isConfigured(),
                'connected' => $connection !== null,
                'tenant_name' => $connection?->tenant_name,
                'tenant_id' => $connection?->tenant_id,
                'connected_at' => $connection?->connected_at?->toIso8601String(),
                'token_expires_at' => $connection?->token_expires_at?->toIso8601String(),
                'sales_account_code' => $connection?->sales_account_code,
                'payment_account_code' => $connection?->payment_account_code,
            ],
        ]);
    }

    public function connect(Request $request): RedirectResponse
    {
        abort_unless($this->xeroService->isConfigured(), 500, 'Xero is not configured.');

        $authorization = $this->xeroService->getAuthorizationUrl();

        $request->session()->put('xero_oauth_state', $authorization['state']);
        $request->session()->put('xero_return_url', $request->query('return_url', '/admin/helpdesk'));

        return redirect()->away($authorization['url']);
    }

    public function callback(Request $request): RedirectResponse
    {
        $returnUrl = (string) $request->session()->pull('xero_return_url', '/admin/helpdesk');

        if ($request->filled('error')) {
            return redirect($this->appendQueryParam($returnUrl, 'xero', 'error'));
        }

        $expectedState = $request->session()->pull('xero_oauth_state');

        if (! $expectedState || ! hash_equals((string) $expectedState, (string) $request->query('state'))) {
            return redirect($this->appendQueryParam($returnUrl, 'xero', 'invalid-state'));
        }

        $request->validate([
            'code' => ['required', 'string'],
        ]);

        $this->xeroService->storeConnection(
            $this->xeroService->exchangeCodeForToken((string) $request->query('code')),
            (int) $request->user()->id
        );

        return redirect($this->appendQueryParam($returnUrl, 'xero', 'connected'));
    }

    public function updateSettings(Request $request): JsonResponse
    {
        $connection = $this->xeroService->getConnection();

        if (! $connection) {
            return response()->json([
                'message' => 'Connect Xero before saving Xero settings.',
            ], 422);
        }

        $validated = $request->validate([
            'sales_account_code' => ['nullable', 'string', 'max:20'],
            'payment_account_code' => ['nullable', 'string', 'max:20'],
        ]);

        $connection->update($validated);

        return response()->json([
            'data' => [
                'configured' => $this->xeroService->isConfigured(),
                'connected' => true,
                'tenant_name' => $connection->tenant_name,
                'tenant_id' => $connection->tenant_id,
                'connected_at' => $connection->connected_at?->toIso8601String(),
                'token_expires_at' => $connection->token_expires_at?->toIso8601String(),
                'sales_account_code' => $connection->fresh()->sales_account_code,
                'payment_account_code' => $connection->fresh()->payment_account_code,
            ],
            'message' => 'Xero settings saved successfully.',
        ]);
    }

    public function disconnect(): JsonResponse
    {
        $this->xeroService->disconnectCurrentConnection();

        return response()->json([
            'message' => 'Xero disconnected successfully.',
        ]);
    }

    protected function appendQueryParam(string $url, string $key, string $value): string
    {
        $separator = str_contains($url, '?') ? '&' : '?';

        return $url.$separator.urlencode($key).'='.urlencode($value);
    }
}
