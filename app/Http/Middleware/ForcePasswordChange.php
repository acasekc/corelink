<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class ForcePasswordChange
{
    /**
     * Routes that should be accessible even when password change is required
     */
    protected array $except = [
        'helpdesk/change-password',
        'helpdesk/logout',
        'admin/change-password',
        'admin/logout',
        'api/helpdesk/user/change-password',
        'api/helpdesk/user/profile',
        'api/admin/change-password',
    ];

    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if ($user && $user->force_password_change) {
            // Allow logout and password change routes
            foreach ($this->except as $route) {
                if ($request->is($route)) {
                    return $next($request);
                }
            }

            // Determine the correct redirect based on context
            $redirectUrl = $this->getRedirectUrl($request);

            // For API requests, return JSON
            if ($request->expectsJson() || $request->is('api/*')) {
                return response()->json([
                    'error' => 'Password change required',
                    'message' => 'You must change your password before continuing.',
                    'redirect' => $redirectUrl,
                ], 403);
            }

            // For web requests, redirect to password change page
            return redirect($redirectUrl);
        }

        return $next($request);
    }

    protected function getRedirectUrl(Request $request): string
    {
        // If on admin routes, redirect to admin change password
        if ($request->is('admin*') || $request->is('api/admin*') || $request->is('api/helpdesk/admin*')) {
            return '/admin/change-password';
        }

        // Default to helpdesk change password
        return '/helpdesk/change-password';
    }
}
