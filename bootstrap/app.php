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
        },
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->alias([
            'admin' => \App\Http\Middleware\AdminMiddleware::class,
            'helpdesk.api-key' => \App\Http\Middleware\HelpdeskApiKeyAuth::class,
            'force-password-change' => \App\Http\Middleware\ForcePasswordChange::class,
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
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        //
    })->create();
