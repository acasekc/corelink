<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Services\InviteCodeService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class InviteCodeController extends Controller
{
    protected InviteCodeService $inviteCodeService;

    public function __construct(InviteCodeService $inviteCodeService)
    {
        $this->inviteCodeService = $inviteCodeService;
    }

    /**
     * Validate an invite code
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function validateCode(Request $request): JsonResponse
    {
        $request->validate([
            'code' => 'required|string|max:20',
        ]);

        $result = $this->inviteCodeService->validateCode($request->input('code'));

        if (!$result['valid']) {
            return response()->json($result, 400);
        }

        return response()->json([
            'valid' => true,
            'invite_code_id' => $result['invite_code_id'],
        ], 200);
    }

    /**
     * Create a new invite code (admin only)
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function store(Request $request): JsonResponse
    {
        $this->authorize('create', \App\Models\InviteCode::class);

        $request->validate([
            'email' => 'nullable|email',
            'expires_in_days' => 'nullable|integer|min:1',
            'max_uses' => 'nullable|integer|min:1',
        ]);

        $inviteCode = $this->inviteCodeService->createInviteCode(
            auth()->id(),
            $request->input('email'),
            $request->input('expires_in_days'),
            $request->input('max_uses', 1)
        );

        return response()->json([
            'id' => $inviteCode->id,
            'code' => $inviteCode->code,
            'created_at' => $inviteCode->created_at,
            'expires_at' => $inviteCode->expires_at,
        ], 201);
    }

    /**
     * List invite codes (admin only)
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function index(Request $request): JsonResponse
    {
        $this->authorize('viewAny', \App\Models\InviteCode::class);

        $codes = \App\Models\InviteCode::where('admin_user_id', auth()->id())
            ->paginate($request->input('per_page', 15));

        return response()->json($codes, 200);
    }

    /**
     * Revoke an invite code (admin only)
     *
     * @param string $codeId
     * @return JsonResponse
     */
    public function revoke(string $codeId): JsonResponse
    {
        $inviteCode = \App\Models\InviteCode::findOrFail($codeId);

        $this->authorize('update', $inviteCode);

        $this->inviteCodeService->revokeCode($codeId);

        return response()->json(['deleted' => true], 204);
    }
}
