<?php

namespace App\Services\Intake;

use App\Models\ClientIntake;
use App\Models\ClientIntakeInvite;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Client\PendingRequest;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

/**
 * Orchestrates a successful intake submission:
 *  - persists files
 *  - writes the ClientIntake row
 *  - renders + stores the submission PDF
 *  - posts a ticket (with attachments) to the Prospects helpdesk board
 *  - marks the invite as submitted
 */
class IntakeSubmissionService
{
    /**
     * @param  array<string, mixed>  $data  Validated form data (no files)
     * @param  array<string, UploadedFile|null>  $files  Uploaded files keyed by field
     */
    public function submit(ClientIntakeInvite $invite, array $data, array $files): ClientIntake
    {
        $disk = $this->disk();

        $logoPath = $this->storeFile($files['logo'] ?? null, $invite, 'logo', $disk);
        $brandPath = $this->storeFile($files['brand_guidelines'] ?? null, $invite, 'brand-guidelines', $disk);

        $intake = ClientIntake::create([
            'invite_id' => $invite->id,
            'email' => $data['email'],
            'business_name' => $data['business_name'],
            'budget_range' => $data['budget_range'] ?? null,
            'data' => $data,
            'logo_path' => $logoPath,
            'logo_disk' => $logoPath ? $disk : null,
            'brand_guidelines_path' => $brandPath,
            'brand_guidelines_disk' => $brandPath ? $disk : null,
            'submitted_at' => now(),
        ]);

        $pdfPath = $this->renderAndStorePdf($intake, $disk);
        $intake->update(['pdf_path' => $pdfPath, 'pdf_disk' => $disk]);

        $this->postHelpdeskTicket($intake);

        $invite->markSubmitted();

        return $intake;
    }

    /**
     * Render submission PDF and return the storage path.
     */
    public function renderAndStorePdf(ClientIntake $intake, ?string $disk = null): string
    {
        $disk ??= $this->disk();

        $pdf = Pdf::loadView('pdf.intake', [
            'intake' => $intake,
            'invite' => $intake->invite,
            'sections' => IntakeFormSchema::sections(),
        ])->setPaper('letter');

        $filename = 'submission-'.now()->format('Ymd-His').'-'.Str::random(6).'.pdf';
        $path = 'intake/'.$intake->invite_id.'/'.$filename;

        Storage::disk($disk)->put($path, $pdf->output());

        return $path;
    }

    private function storeFile(?UploadedFile $file, ClientIntakeInvite $invite, string $kind, string $disk): ?string
    {
        if (! $file || ! $file->isValid()) {
            return null;
        }

        $extension = $file->getClientOriginalExtension() ?: 'bin';
        $filename = $kind.'-'.now()->format('Ymd-His').'-'.Str::random(6).'.'.$extension;
        $path = 'intake/'.$invite->id.'/'.$filename;

        $stream = fopen($file->getPathname(), 'r');
        if (! $stream) {
            return null;
        }

        Storage::disk($disk)->put($path, $stream);

        if (is_resource($stream)) {
            fclose($stream);
        }

        return $path;
    }

    /**
     * Post a ticket to the Prospects helpdesk board with the rendered submission
     * PDF + any prospect-uploaded files attached. Failure is logged, not thrown —
     * the intake is still persisted so the data isn't lost.
     */
    public function postHelpdeskTicket(ClientIntake $intake): void
    {
        $apiKey = config('services.helpdesk.intake_api_key') ?: config('services.helpdesk.api_key');

        if (! $apiKey) {
            Log::info('Skipping intake helpdesk ticket — no API key configured.', [
                'intake_id' => $intake->id,
            ]);

            return;
        }

        $url = rtrim((string) config('services.helpdesk.base_url'), '/').'/tickets';
        $data = $intake->data;

        $payload = [
            'title' => 'New website intake — '.$intake->business_name,
            'content' => IntakeFormSchema::renderMarkdown($data),
            'submitter_name' => $data['contact_name'] ?? $intake->business_name,
            'submitter_email' => $intake->email,
            'submitter_user_id' => 'intake-'.$intake->id,
            'priority' => 'medium',
            'type' => 'task',
        ];

        $metadata = [
            'source' => 'client_intake',
            'intake_id' => $intake->id,
            'invite_code' => $intake->invite?->code,
            'admin_url' => url('/admin/intake/submissions/'.$intake->id),
            'submitted_at' => $intake->submitted_at?->toIso8601String(),
            'data' => $data,
        ];

        try {
            $request = Http::withHeaders([
                'X-API-Key' => $apiKey,
                'Accept' => 'application/json',
            ])->timeout(30)->asMultipart();

            $request = $this->attachIntakeFiles($request, $intake);

            $response = $request->post($url, [
                ...$payload,
                'metadata' => json_encode($metadata),
            ]);

            if ($response->successful()) {
                $ticket = $response->json('data');

                $intake->update([
                    'helpdesk_ticket_id' => $ticket['id'] ?? null,
                    'helpdesk_ticket_number' => $ticket['number'] ?? null,
                ]);

                return;
            }

            Log::warning('Intake helpdesk ticket creation failed.', [
                'intake_id' => $intake->id,
                'status' => $response->status(),
                'body' => $response->json(),
            ]);
        } catch (\Throwable $e) {
            Log::error('Intake helpdesk ticket exception.', [
                'intake_id' => $intake->id,
                'message' => $e->getMessage(),
            ]);
        }
    }

    /**
     * Attach the submission PDF + uploaded logo + uploaded brand guidelines as
     * `attachments[]` parts on the multipart request.
     */
    private function attachIntakeFiles(PendingRequest $request, ClientIntake $intake): PendingRequest
    {
        $files = [
            ['path' => $intake->pdf_path, 'disk' => $intake->pdf_disk, 'name' => 'intake-summary.pdf', 'mime' => 'application/pdf'],
            ['path' => $intake->logo_path, 'disk' => $intake->logo_disk, 'name' => 'logo'.$this->extension($intake->logo_path), 'mime' => null],
            ['path' => $intake->brand_guidelines_path, 'disk' => $intake->brand_guidelines_disk, 'name' => 'brand-guidelines'.$this->extension($intake->brand_guidelines_path), 'mime' => null],
        ];

        foreach ($files as $file) {
            if (! $file['path'] || ! $file['disk']) {
                continue;
            }

            if (! Storage::disk($file['disk'])->exists($file['path'])) {
                continue;
            }

            $contents = Storage::disk($file['disk'])->get($file['path']);
            $mime = $file['mime'] ?? Storage::disk($file['disk'])->mimeType($file['path']);

            $request = $request->attach('attachments[]', $contents, $file['name'], array_filter([
                'Content-Type' => $mime,
            ]));
        }

        return $request;
    }

    private function extension(?string $path): string
    {
        if (! $path) {
            return '';
        }

        $ext = pathinfo($path, PATHINFO_EXTENSION);

        return $ext ? '.'.$ext : '';
    }

    private function disk(): string
    {
        return config('filesystems.default') === 's3' ? 's3' : 'local';
    }
}
