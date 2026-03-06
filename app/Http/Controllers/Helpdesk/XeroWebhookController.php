<?php

namespace App\Http\Controllers\Helpdesk;

use App\Http\Controllers\Controller;
use App\Services\Helpdesk\XeroService;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class XeroWebhookController extends Controller
{
    public function __construct(
        protected XeroService $xeroService
    ) {}

    public function handle(Request $request): Response
    {
        $payload = $request->getContent();
        $signature = $request->header('x-xero-signature');

        if (! $this->xeroService->verifyWebhookSignature($payload, $signature)) {
            return response('Invalid signature', 401);
        }

        $decodedPayload = json_decode($payload, true);

        if (! is_array($decodedPayload)) {
            return response('Invalid payload', 400);
        }

        $events = $decodedPayload['events'] ?? [];

        if (! is_array($events) || $events === []) {
            return response('', 200);
        }

        $this->xeroService->queueWebhookEvents($events);

        return response('', 200);
    }
}
