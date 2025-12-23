<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Mail\InviteCodeMail;
use App\Models\BotSession;
use App\Models\DiscoveryPlan;
use App\Models\InviteCode;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use Inertia\Inertia;

class DiscoveryController extends Controller
{
    /**
     * Dashboard overview
     */
    public function index()
    {
        $stats = [
            'total_invites' => InviteCode::where('admin_user_id', auth()->id())->count(),
            'active_invites' => InviteCode::where('admin_user_id', auth()->id())
                ->where('is_active', true)
                ->where(function ($q) {
                    $q->whereNull('expires_at')->orWhere('expires_at', '>', now());
                })
                ->where(function ($q) {
                    $q->whereNull('max_uses')->orWhereColumn('current_uses', '<', 'max_uses');
                })
                ->count(),
            'total_sessions' => BotSession::whereHas('inviteCode', function ($q) {
                $q->where('admin_user_id', auth()->id());
            })->count(),
            'completed_sessions' => BotSession::whereHas('inviteCode', function ($q) {
                $q->where('admin_user_id', auth()->id());
            })->where('status', 'completed')->count(),
            'total_plans' => DiscoveryPlan::where('admin_user_id', auth()->id())->count(),
        ];

        $recentSessions = BotSession::with(['inviteCode', 'discoveryPlan'])
            ->whereHas('inviteCode', function ($q) {
                $q->where('admin_user_id', auth()->id());
            })
            ->latest()
            ->take(5)
            ->get();

        return Inertia::render('Admin/Discovery/Index', [
            'stats' => $stats,
            'recentSessions' => $recentSessions,
        ]);
    }

    /**
     * List all invite codes
     */
    public function invites(Request $request)
    {
        $invites = InviteCode::where('admin_user_id', auth()->id())
            ->withCount('sessions')
            ->latest()
            ->paginate(20);

        return Inertia::render('Admin/Discovery/Invites', [
            'invites' => $invites,
        ]);
    }

    /**
     * Show create invite form
     */
    public function createInvite()
    {
        return Inertia::render('Admin/Discovery/CreateInvite');
    }

    /**
     * Store a new invite and optionally send email
     */
    public function storeInvite(Request $request)
    {
        $validated = $request->validate([
            'code' => 'nullable|string|max:50|unique:invite_codes,code',
            'email' => 'nullable|email',
            'max_uses' => 'nullable|integer|min:1',
            'expires_days' => 'nullable|integer|min:1|max:365',
            'send_email' => 'boolean',
        ]);

        $code = $validated['code'] ?? strtoupper(Str::random(8));
        
        $invite = InviteCode::create([
            'admin_user_id' => auth()->id(),
            'code' => $code,
            'max_uses' => $validated['max_uses'] ?? null,
            'expires_at' => isset($validated['expires_days']) 
                ? now()->addDays($validated['expires_days']) 
                : null,
            'is_active' => true,
        ]);

        // Send email if requested and email provided
        if ($request->boolean('send_email') && !empty($validated['email'])) {
            Mail::to($validated['email'])->send(new InviteCodeMail($invite));
        }

        return redirect()->route('admin.discovery.invites')
            ->with('success', 'Invite code created successfully.');
    }

    /**
     * Toggle invite active status
     */
    public function toggleInvite(InviteCode $invite)
    {
        $this->authorize('update', $invite);

        $invite->update(['is_active' => !$invite->is_active]);

        return back()->with('success', 'Invite status updated.');
    }

    /**
     * Delete an invite
     */
    public function deleteInvite(InviteCode $invite)
    {
        $this->authorize('delete', $invite);

        $invite->delete();

        return back()->with('success', 'Invite deleted.');
    }

    /**
     * List all sessions
     */
    public function sessions(Request $request)
    {
        $sessions = BotSession::with(['inviteCode', 'discoveryPlan'])
            ->whereHas('inviteCode', function ($q) {
                $q->where('admin_user_id', auth()->id());
            })
            ->latest()
            ->paginate(20);

        return Inertia::render('Admin/Discovery/Sessions', [
            'sessions' => $sessions,
        ]);
    }

    /**
     * View a single session with full conversation
     */
    public function showSession(BotSession $session)
    {
        // Ensure the session belongs to this admin
        if ($session->inviteCode->admin_user_id !== auth()->id()) {
            abort(403);
        }

        $session->load(['inviteCode', 'conversations', 'discoveryPlan']);

        // Format conversations as messages array for the frontend
        $messages = $session->conversations->flatMap(function ($conv) {
            $msgs = [];
            if ($conv->user_message) {
                $msgs[] = [
                    'id' => $conv->id . '_user',
                    'role' => 'user',
                    'content' => $conv->user_message,
                    'created_at' => $conv->created_at,
                ];
            }
            if ($conv->assistant_message) {
                $msgs[] = [
                    'id' => $conv->id . '_assistant',
                    'role' => 'assistant',
                    'content' => $conv->assistant_message,
                    'created_at' => $conv->created_at,
                ];
            }
            return $msgs;
        })->values();

        return Inertia::render('Admin/Discovery/SessionDetail', [
            'session' => array_merge($session->toArray(), ['messages' => $messages]),
        ]);
    }

    /**
     * List all plans/proposals
     */
    public function plans(Request $request)
    {
        $plans = DiscoveryPlan::with(['session.inviteCode'])
            ->where('admin_user_id', auth()->id())
            ->latest()
            ->paginate(20);

        return Inertia::render('Admin/Discovery/Plans', [
            'plans' => $plans,
        ]);
    }

    /**
     * View a single plan with full details
     */
    public function showPlan(DiscoveryPlan $plan)
    {
        if ($plan->admin_user_id !== auth()->id()) {
            abort(403);
        }

        $plan->load(['session.inviteCode']);

        return Inertia::render('Admin/Discovery/PlanDetail', [
            'plan' => $plan,
        ]);
    }

    /**
     * Resend invite email
     */
    public function resendInvite(Request $request, InviteCode $invite)
    {
        $this->authorize('update', $invite);

        $validated = $request->validate([
            'email' => 'required|email',
        ]);

        Mail::to($validated['email'])->send(new InviteCodeMail($invite));

        return back()->with('success', 'Invite email sent.');
    }
}
