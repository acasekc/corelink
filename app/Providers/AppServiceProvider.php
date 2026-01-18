<?php

namespace App\Providers;

use App\Models\Helpdesk\ApiKey;
use App\Models\Helpdesk\Attachment;
use App\Models\Helpdesk\Comment;
use App\Models\Helpdesk\Project;
use App\Models\Helpdesk\Ticket;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Configure authentication redirects
        if (class_exists(\Illuminate\Auth\Middleware\Authenticate::class)) {
            \Illuminate\Auth\Middleware\Authenticate::redirectUsing(function () {
                return route('admin.login');
            });
        }

        // Register Helpdesk route model bindings
        // These must be here (not in routes file) so they work with route caching
        Route::bind('project', fn (string $value) => Project::findOrFail($value));
        Route::bind('ticket', fn (string $value) => Ticket::findOrFail($value));
        Route::bind('apiKey', fn (string $value) => ApiKey::findOrFail($value));
        Route::bind('attachment', fn (string $value) => Attachment::findOrFail($value));
        Route::bind('comment', fn (string $value) => Comment::findOrFail($value));
    }
}
