<?php

namespace App\Http\Controllers\Helpdesk;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

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
     * Handle helpdesk login attempt
     */
    public function login(Request $request): JsonResponse
    {
        $credentials = $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

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
}
