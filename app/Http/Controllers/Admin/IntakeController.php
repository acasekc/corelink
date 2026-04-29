<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Mail\IntakeInviteMail;
use App\Models\ClientIntake;
use App\Models\ClientIntakeInvite;
use App\Services\Intake\IntakeFormSchema;
use App\Services\Intake\IntakeProjectConverter;
use App\Services\Intake\IntakeSubmissionService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\Response;

class IntakeController extends Controller
{
    public function __construct(
        private IntakeProjectConverter $converter,
        private IntakeSubmissionService $submissionService,
    ) {}

    public function dashboard(): JsonResponse
    {
        $stats = [
            'invites_total' => ClientIntakeInvite::count(),
            'invites_pending' => ClientIntakeInvite::where('status', ClientIntakeInvite::STATUS_PENDING)->count(),
            'invites_opened' => ClientIntakeInvite::where('status', ClientIntakeInvite::STATUS_OPENED)->count(),
            'invites_submitted' => ClientIntakeInvite::where('status', ClientIntakeInvite::STATUS_SUBMITTED)->count(),
            'invites_expired' => ClientIntakeInvite::where('status', ClientIntakeInvite::STATUS_EXPIRED)->count(),
            'invites_revoked' => ClientIntakeInvite::where('status', ClientIntakeInvite::STATUS_REVOKED)->count(),
            'submissions_total' => ClientIntake::count(),
            'submissions_converted' => ClientIntake::whereNotNull('converted_project_id')->count(),
        ];

        $opened = $stats['invites_opened'] + $stats['invites_submitted'];
        $stats['open_rate'] = $stats['invites_total'] > 0
            ? round($opened / $stats['invites_total'] * 100, 1)
            : 0;
        $stats['completion_rate'] = $opened > 0
            ? round($stats['invites_submitted'] / $opened * 100, 1)
            : 0;

        return response()->json(['data' => $stats]);
    }

    public function index(): JsonResponse
    {
        $invites = ClientIntakeInvite::with(['intake', 'creator:id,name'])
            ->latest()
            ->paginate(20)
            ->through(fn (ClientIntakeInvite $invite) => $this->transformInvite($invite));

        return response()->json($invites);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'prospect_name' => 'nullable|string|max:255',
            'prospect_email' => 'nullable|email|max:255',
            'business_name' => 'nullable|string|max:255',
            'expires_days' => 'nullable|integer|min:1|max:365',
            'send_email' => 'boolean',
        ]);

        $invite = ClientIntakeInvite::create([
            'prospect_name' => $validated['prospect_name'] ?? null,
            'prospect_email' => $validated['prospect_email'] ?? null,
            'business_name' => $validated['business_name'] ?? null,
            'created_by_user_id' => auth()->id(),
            'status' => ClientIntakeInvite::STATUS_PENDING,
            'expires_at' => now()->addDays($validated['expires_days'] ?? 30),
        ]);

        if ($request->boolean('send_email') && ! empty($validated['prospect_email'])) {
            Mail::to($validated['prospect_email'])->queue(new IntakeInviteMail($invite));
        }

        return response()->json([
            'data' => $this->transformInvite($invite),
            'url' => $invite->publicUrl(),
        ], 201);
    }

    public function resend(Request $request, ClientIntakeInvite $invite): JsonResponse
    {
        $validated = $request->validate([
            'email' => 'nullable|email',
        ]);

        $email = $validated['email'] ?? $invite->prospect_email;

        if (! $email) {
            return response()->json(['message' => 'No email address available for this invite.'], 422);
        }

        Mail::to($email)->queue(new IntakeInviteMail($invite));

        return response()->json(['message' => 'Invite email sent.']);
    }

    public function revoke(ClientIntakeInvite $invite): JsonResponse
    {
        if ($invite->status === ClientIntakeInvite::STATUS_SUBMITTED) {
            return response()->json([
                'message' => 'Cannot revoke — this invite has already been submitted.',
            ], 422);
        }

        $invite->update(['status' => ClientIntakeInvite::STATUS_REVOKED]);

        return response()->json(['message' => 'Invite revoked.']);
    }

    public function destroy(ClientIntakeInvite $invite): JsonResponse
    {
        $invite->delete();

        return response()->json(['message' => 'Invite deleted.']);
    }

    public function show(ClientIntake $intake): JsonResponse
    {
        $intake->load(['invite', 'convertedProject']);

        return response()->json([
            'data' => [
                'id' => $intake->id,
                'business_name' => $intake->business_name,
                'email' => $intake->email,
                'budget_range' => $intake->budget_range,
                'submitted_at' => $intake->submitted_at?->toIso8601String(),
                'helpdesk_ticket_id' => $intake->helpdesk_ticket_id,
                'helpdesk_ticket_number' => $intake->helpdesk_ticket_number,
                'has_logo' => (bool) $intake->logo_path,
                'has_brand_guidelines' => (bool) $intake->brand_guidelines_path,
                'has_pdf' => (bool) $intake->pdf_path,
                'converted_project' => $intake->convertedProject ? [
                    'id' => $intake->convertedProject->id,
                    'slug' => $intake->convertedProject->slug,
                    'name' => $intake->convertedProject->name,
                ] : null,
                'invite' => [
                    'code' => $intake->invite?->code,
                    'created_at' => $intake->invite?->created_at?->toIso8601String(),
                    'opened_at' => $intake->invite?->opened_at?->toIso8601String(),
                ],
                'data' => $intake->data,
                'sections' => $this->renderSections($intake->data),
            ],
        ]);
    }

    public function pdf(ClientIntake $intake): Response
    {
        if (! $intake->pdf_path || ! Storage::disk($intake->pdf_disk ?? 'local')->exists($intake->pdf_path)) {
            abort(404);
        }

        return Storage::disk($intake->pdf_disk ?? 'local')->download(
            $intake->pdf_path,
            'intake-'.$intake->id.'.pdf'
        );
    }

    public function downloadAttachment(ClientIntake $intake, string $kind): Response
    {
        $path = match ($kind) {
            'logo' => $intake->logo_path,
            'brand-guidelines' => $intake->brand_guidelines_path,
            default => null,
        };

        $disk = match ($kind) {
            'logo' => $intake->logo_disk,
            'brand-guidelines' => $intake->brand_guidelines_disk,
            default => null,
        };

        if (! $path || ! $disk || ! Storage::disk($disk)->exists($path)) {
            abort(404);
        }

        return Storage::disk($disk)->download($path);
    }

    public function convert(ClientIntake $intake): JsonResponse
    {
        $project = $this->converter->convert($intake);

        return response()->json([
            'data' => [
                'id' => $project->id,
                'slug' => $project->slug,
                'name' => $project->name,
            ],
            'message' => 'Helpdesk project created from intake.',
        ]);
    }

    /**
     * @return array<string, mixed>
     */
    private function transformInvite(ClientIntakeInvite $invite): array
    {
        return [
            'id' => $invite->id,
            'code' => $invite->code,
            'public_url' => $invite->publicUrl(),
            'prospect_name' => $invite->prospect_name,
            'prospect_email' => $invite->prospect_email,
            'business_name' => $invite->business_name,
            'status' => $invite->status,
            'expires_at' => $invite->expires_at?->toIso8601String(),
            'opened_at' => $invite->opened_at?->toIso8601String(),
            'last_seen_at' => $invite->last_seen_at?->toIso8601String(),
            'submitted_at' => $invite->submitted_at?->toIso8601String(),
            'last_step' => $invite->metadata['last_step'] ?? null,
            'created_by' => $invite->creator?->name,
            'created_at' => $invite->created_at?->toIso8601String(),
            'submission_id' => $invite->intake?->id,
        ];
    }

    /**
     * Build a renderable section list — labels resolved, blanks dropped.
     *
     * @param  array<string, mixed>  $data
     * @return array<int, array{title: string, fields: array<int, array{label: string, value: string}>}>
     */
    private function renderSections(array $data): array
    {
        $sections = [];

        foreach (IntakeFormSchema::sections() as $section) {
            $fields = [];

            foreach ($section['fields'] as $field) {
                $value = $data[$field['key']] ?? null;
                $rendered = IntakeFormSchema::resolveValue($field['key'], $value, $field['type'] ?? null);

                if ($rendered === '—') {
                    continue;
                }

                $fields[] = [
                    'label' => $field['label'],
                    'value' => $rendered,
                ];
            }

            if (! empty($fields)) {
                $sections[] = [
                    'title' => $section['title'],
                    'fields' => $fields,
                ];
            }
        }

        return $sections;
    }
}
