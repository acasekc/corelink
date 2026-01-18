<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;

class ProfileController extends Controller
{
    /**
     * Get the current user's profile
     */
    public function show(Request $request): JsonResponse
    {
        $user = $request->user();

        return response()->json([
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'is_admin' => $user->is_admin,
            'force_password_change' => $user->force_password_change,
            'created_at' => $user->created_at,
        ]);
    }

    /**
     * Change the current user's password
     */
    public function changePassword(Request $request): JsonResponse
    {
        $user = $request->user();

        // If force_password_change is true, don't require current password
        $rules = [
            'new_password' => ['required', 'confirmed', Password::defaults()],
        ];

        if (! $user->force_password_change) {
            $rules['current_password'] = ['required', 'current_password'];
        }

        $validated = $request->validate($rules);

        $user->update([
            'password' => Hash::make($validated['new_password']),
            'force_password_change' => false,
        ]);

        return response()->json([
            'message' => 'Password changed successfully',
        ]);
    }
}
