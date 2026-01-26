<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php',
        channels: __DIR__.'/../routes/channels.php',
        health: '/up',
        then: function () {
            Route::middleware('api')
                ->group(base_path('routes/api/discovery-bot.php'));

            // Helpdesk routes (handles its own middleware per group)
            require base_path('routes/api/helpdesk.php');

            // MCP AI routes
            require base_path('routes/ai.php');
        },
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->alias([
            'admin' => \App\Http\Middleware\AdminMiddleware::class,
            'helpdesk.api-key' => \App\Http\Middleware\HelpdeskApiKeyAuth::class,
            'force-password-change' => \App\Http\Middleware\ForcePasswordChange::class,
            'no-cache' => \App\Http\Middleware\NoCacheHeaders::class,
        ]);

        // Configure redirect for unauthenticated users
        $middleware->redirectGuestsTo(function (Request $request) {
            // If requesting helpdesk routes, redirect to helpdesk login
            if ($request->is('helpdesk*') || $request->is('api/helpdesk/user*')) {
                return route('helpdesk.login');
            }

            // Otherwise redirect to admin login
            return route('admin.login');
        });

        // Configure redirect for authenticated users trying to access guest-only routes (like login pages)
        $middleware->redirectUsersTo(function (Request $request) {
            $user = $request->user();

            // If accessing helpdesk login and user is admin, redirect to admin helpdesk
            if ($request->is('helpdesk/login') && $user?->is_admin) {
                return '/admin/helpdesk';
            }

            // If accessing helpdesk login as regular user, redirect to helpdesk dashboard
            if ($request->is('helpdesk/login')) {
                return '/helpdesk';
            }

            // For admin login page, redirect to admin dashboard
            if ($request->is('admin/login')) {
                return '/admin';
            }

            // Default redirect
            return '/';
        });
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        //
    })->create();
