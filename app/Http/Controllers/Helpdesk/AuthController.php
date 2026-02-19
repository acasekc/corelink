<?php

namespace App\Http\Controllers\Helpdesk;

use App\Http\Controllers\Controller;
use App\Mail\Helpdesk\PasswordReset;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;

class AuthController extends Controller
{
    /**
     * Show the helpdesk login form
     */
    public function showLogin()
    {
        return view('app');
    }

    /**
     * Show the forgot password form
     */
    public function showForgotPassword()
    {
        return view('app');
    }

    /**
     * Show the reset password form
     */
    public function showResetPassword()
    {
        return view('app');
    }

    /**
     * Handle helpdesk login attempt
     */
    public function login(Request $request): JsonResponse
    {
        $credentials = $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        $credentials['password'] = trim($credentials['password']);

        if (Auth::attempt($credentials, $request->boolean('remember'))) {
            $request->session()->regenerate();

            $user = Auth::user();

            // If admin user, redirect to admin portal
            if ($user->is_admin) {
                return response()->json([
                    'message' => 'Login successful',
                    'redirect' => '/admin/helpdesk',
                    'is_admin' => true,
                ]);
            }

            // Regular user - check if they have any helpdesk project access
            if ($user->helpdeskProjects()->count() === 0) {
                Auth::logout();

                return response()->json([
                    'message' => 'You do not have access to any helpdesk projects.',
                    'errors' => ['credentials' => 'You do not have access to any helpdesk projects. Please contact your administrator.'],
                ], 403);
            }

            return response()->json([
                'message' => 'Login successful',
                'redirect' => '/helpdesk',
                'is_admin' => false,
            ]);
        }

        return response()->json([
            'message' => 'The provided credentials do not match our records.',
            'errors' => ['credentials' => 'The provided credentials do not match our records.'],
        ], 401);
    }

    /**
     * Handle helpdesk logout
     */
    public function logout(Request $request)
    {
        Auth::logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect('/helpdesk/login');
    }

    /**
     * Send a password reset link to the user's email
     */
    public function sendResetLink(Request $request): JsonResponse
    {
        $request->validate([
            'email' => 'required|email',
        ]);

        $user = User::where('email', $request->email)->first();

        // Always return success to prevent email enumeration
        if (! $user) {
            return response()->json([
                'message' => 'If an account exists with that email, a password reset link has been sent.',
            ]);
        }

        // Check throttle — one reset email per 60 seconds
        $recentToken = DB::table('password_reset_tokens')
            ->where('email', $user->email)
            ->where('created_at', '>', now()->subMinutes(1))
            ->first();

        if ($recentToken) {
            return response()->json([
                'message' => 'If an account exists with that email, a password reset link has been sent.',
            ]);
        }

        // Generate token and store it
        $token = Str::random(64);

        DB::table('password_reset_tokens')->updateOrInsert(
            ['email' => $user->email],
            [
                'token' => Hash::make($token),
                'created_at' => now(),
            ]
        );

        $resetUrl = url("/helpdesk/reset-password?token={$token}&email=".urlencode($user->email));

        Mail::to($user->email)->send(new PasswordReset($user, $resetUrl));

        return response()->json([
            'message' => 'If an account exists with that email, a password reset link has been sent.',
        ]);
    }

    /**
     * Reset the user's password using the token
     */
    public function resetPassword(Request $request): JsonResponse
    {
        $request->validate([
            'token' => 'required|string',
            'email' => 'required|email',
            'password' => 'required|string|min:8|confirmed',
        ]);

        $record = DB::table('password_reset_tokens')
            ->where('email', $request->email)
            ->first();

        if (! $record) {
            return response()->json([
                'message' => 'This password reset link is invalid.',
                'errors' => ['email' => 'This password reset link is invalid.'],
            ], 422);
        }

        // Check if token has expired (60 minutes)
        if (Carbon::parse($record->created_at)->addMinutes(60)->isPast()) {
            DB::table('password_reset_tokens')->where('email', $request->email)->delete();

            return response()->json([
                'message' => 'This password reset link has expired.',
                'errors' => ['email' => 'This password reset link has expired. Please request a new one.'],
            ], 422);
        }

        // Verify token
        if (! Hash::check($request->token, $record->token)) {
            return response()->json([
                'message' => 'This password reset link is invalid.',
                'errors' => ['email' => 'This password reset link is invalid.'],
            ], 422);
        }

        $user = User::where('email', $request->email)->first();

        if (! $user) {
            return response()->json([
                'message' => 'This password reset link is invalid.',
                'errors' => ['email' => 'This password reset link is invalid.'],
            ], 422);
        }

        $user->update([
            'password' => $request->password,
            'force_password_change' => false,
        ]);

        // Clean up the token
        DB::table('password_reset_tokens')->where('email', $request->email)->delete();

        return response()->json([
            'message' => 'Your password has been reset successfully. You can now sign in.',
        ]);
    }
}
