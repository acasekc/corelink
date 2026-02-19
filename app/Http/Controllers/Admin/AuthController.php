<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class AuthController extends Controller
{
    /**
     * Show the login form
     */
    public function showLogin()
    {
        return view('app');
    }

    /**
     * Handle login attempt
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

            // Check if user is admin
            if (! $user->is_admin) {
                // Not an admin - check if they have helpdesk access and redirect them there
                if ($user->helpdeskProjects()->count() > 0) {
                    return response()->json([
                        'message' => 'Redirecting to helpdesk portal',
                        'redirect' => '/helpdesk',
                        'is_admin' => false,
                    ]);
                }

                // No access at all
                Auth::logout();

                return response()->json([
                    'message' => 'You do not have admin access.',
                    'errors' => ['credentials' => 'You do not have admin access. If you are a helpdesk user, please use the helpdesk login.'],
                ], 403);
            }

            return response()->json([
                'message' => 'Login successful',
                'redirect' => '/admin',
                'is_admin' => true,
            ]);
        }

        return response()->json([
            'message' => 'The provided credentials do not match our records.',
            'errors' => ['credentials' => 'The provided credentials do not match our records.'],
        ], 401);
    }

    /**
     * Handle logout
     */
    public function logout(Request $request)
    {
        Auth::logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect('/admin/login');
    }
}
