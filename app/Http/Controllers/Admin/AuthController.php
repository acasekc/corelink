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
            'intended' => 'nullable|string|max:1000',
        ]);

        $credentials['password'] = trim($credentials['password']);
        $intent = $credentials['intended'] ?? null;
        unset($credentials['intended']);

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
                'redirect' => $this->resolveRedirect($request, $intent),
                'is_admin' => true,
            ]);
        }

        return response()->json([
            'message' => 'The provided credentials do not match our records.',
            'errors' => ['credentials' => 'The provided credentials do not match our records.'],
        ], 401);
    }

    /**
     * Resolve the post-login redirect URL.
     *
     * Order of preference:
     *   1. `intended` field on the form (set by the SPA when a 401 forced re-login)
     *   2. `url.intended` saved in session by Laravel's auth middleware on 302
     *   3. Default `/admin`
     *
     * Any candidate URL must point to a same-origin admin path so we can't be
     * abused as an open redirect.
     */
    private function resolveRedirect(Request $request, ?string $intent): string
    {
        $sessionIntent = $request->session()->pull('url.intended');

        foreach ([$intent, $sessionIntent] as $candidate) {
            if ($this->isSafeAdminUrl($candidate)) {
                return $candidate;
            }
        }

        return '/admin';
    }

    private function isSafeAdminUrl(?string $url): bool
    {
        if (! is_string($url) || $url === '') {
            return false;
        }

        // Same-origin only; reject protocol-relative and absolute URLs.
        if (str_starts_with($url, '//') || preg_match('#^[a-z][a-z0-9+.-]*://#i', $url)) {
            return false;
        }

        return str_starts_with($url, '/admin/') || $url === '/admin';
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
