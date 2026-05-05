<?php

namespace App\Http\Controllers;

use App\Http\Requests\SubmitIntakeRequest;
use App\Mail\IntakeConfirmationMail;
use App\Models\ClientIntakeInvite;
use App\Services\Intake\IntakeFormSchema;
use App\Services\Intake\IntakeSubmissionService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Inertia\Inertia;
use Inertia\Response as InertiaResponse;
use Symfony\Component\HttpFoundation\Response;

class IntakeController extends Controller
{
    public function __construct(private IntakeSubmissionService $submissionService) {}

    /**
     * Public form view. 404s for any unusable code.
     */
    public function show(Request $request, string $code): InertiaResponse
    {
        $invite = $this->resolveInvite($code);

        $invite->markOpened($request->ip(), $request->userAgent());

        return Inertia::render('Intake/Form', [
            'meta' => [
                'title' => 'Project Intake',
                'description' => null,
                'canonical' => url()->current(),
            ],
            'invite' => [
                'code' => $invite->code,
                'expires_at' => $invite->expires_at?->toIso8601String(),
            ],
            'prefill' => [
                'business_name' => $invite->business_name,
                'contact_name' => $invite->prospect_name,
                'email' => $invite->prospect_email,
            ],
            'draft' => $invite->draft_data,
            'options' => $this->options(),
        ]);
    }

    /**
     * Save a draft of the form (autosave). Returns the saved-at timestamp so
     * the client can show "Saved at HH:MM".
     */
    public function saveDraft(Request $request, string $code): JsonResponse
    {
        $invite = $this->resolveInvite($code);

        $validated = $request->validate([
            'data' => 'required|array',
            'last_step' => 'nullable|integer|min:0|max:20',
        ]);

        $invite->fill([
            'draft_data' => $validated['data'],
            'last_seen_at' => now(),
            'metadata' => array_merge($invite->metadata ?? [], [
                'last_step' => $validated['last_step'] ?? null,
                'last_draft_at' => now()->toIso8601String(),
            ]),
        ])->save();

        return response()->json([
            'saved_at' => now()->toIso8601String(),
        ]);
    }

    /**
     * Final submission.
     */
    public function submit(SubmitIntakeRequest $request, string $code): JsonResponse|RedirectResponse
    {
        $invite = $this->resolveInvite($code);

        $validated = $request->validated();

        // Conditional: brand-guidelines upload only allowed when "Yes" selected.
        if ($validated['has_brand_guidelines'] !== 'yes') {
            $request->files->remove('brand_guidelines');
        }

        $files = [
            'logo' => $request->file('logo'),
            'brand_guidelines' => $request->file('brand_guidelines'),
        ];

        // Strip files + honeypot out of stored data.
        $data = collect($validated)
            ->except(['logo', 'brand_guidelines', 'website'])
            ->all();

        $intake = $this->submissionService->submit($invite, $data, $files);

        Mail::to($intake->email)->queue(new IntakeConfirmationMail($intake));

        if ($request->expectsJson()) {
            return response()->json([
                'message' => 'Your intake was submitted successfully.',
                'redirect' => route('intake.submitted', ['code' => $invite->code]),
            ], 201);
        }

        return redirect()->route('intake.submitted', ['code' => $invite->code]);
    }

    /**
     * Thank-you page after submit. Accessible to anyone with the code.
     */
    public function submitted(string $code): InertiaResponse|Response
    {
        $invite = ClientIntakeInvite::where('code', $code)->first();

        if (! $invite || $invite->status !== ClientIntakeInvite::STATUS_SUBMITTED) {
            abort(404);
        }

        return Inertia::render('Intake/Submitted', [
            'meta' => [
                'title' => 'Submission received',
                'description' => null,
                'canonical' => url()->current(),
            ],
        ]);
    }

    /**
     * Resolve a usable invite or 404. Centralizing this means every code-gated
     * endpoint behaves the same way.
     */
    private function resolveInvite(string $code): ClientIntakeInvite
    {
        $invite = ClientIntakeInvite::where('code', $code)->first();

        if (! $invite) {
            abort(404);
        }

        if ($invite->isExpired() && $invite->status !== ClientIntakeInvite::STATUS_EXPIRED) {
            $invite->update(['status' => ClientIntakeInvite::STATUS_EXPIRED]);
        }

        if (! $invite->isUsable()) {
            abort(404);
        }

        return $invite;
    }

    /**
     * Option lists handed to the React form so labels stay consistent.
     *
     * @return array<string, array<string, string>>
     */
    private function options(): array
    {
        return [
            'goals' => IntakeFormSchema::GOAL_OPTIONS,
            'features' => IntakeFormSchema::FEATURE_OPTIONS,
            'pages' => IntakeFormSchema::PAGE_COUNT_OPTIONS,
            'cms' => IntakeFormSchema::CMS_OPTIONS,
            'has_brand' => IntakeFormSchema::HAS_BRAND_GUIDELINES_OPTIONS,
            'content_responsibility' => IntakeFormSchema::CONTENT_RESPONSIBILITY_OPTIONS,
            'media_responsibility' => IntakeFormSchema::MEDIA_RESPONSIBILITY_OPTIONS,
            'platform' => IntakeFormSchema::PLATFORM_OPTIONS,
            'seo' => IntakeFormSchema::SEO_PRIORITY_OPTIONS,
            'budget' => IntakeFormSchema::BUDGET_OPTIONS,
            'maintenance' => IntakeFormSchema::MAINTENANCE_OPTIONS,
            'training' => IntakeFormSchema::TRAINING_OPTIONS,
        ];
    }
}
