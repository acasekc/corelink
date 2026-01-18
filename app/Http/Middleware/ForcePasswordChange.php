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
        'api/helpdesk/user/change-password',
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

            // For API requests, return JSON
            if ($request->expectsJson() || $request->is('api/*')) {
                return response()->json([
                    'error' => 'Password change required',
                    'message' => 'You must change your password before continuing.',
                    'redirect' => '/helpdesk/change-password',
                ], 403);
            }

            // For web requests, redirect to password change page
            return redirect('/helpdesk/change-password');
        }

        return $next($request);
    }
}
