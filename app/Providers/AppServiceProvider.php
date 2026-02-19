<?php

namespace App\Providers;

use App\Listeners\CheckEmailSuppression;
use App\Listeners\LogSentEmail;
use App\Models\Helpdesk\ApiKey;
use App\Models\Helpdesk\Attachment;
use App\Models\Helpdesk\Comment;
use App\Models\Helpdesk\Project;
use App\Models\Helpdesk\Ticket;
use Illuminate\Mail\Events\MessageSending;
use Illuminate\Mail\Events\MessageSent;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\ServiceProvider;
use Illuminate\Validation\Rules\Password;

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
        Password::defaults(fn () => Password::min(8)->letters()->numbers());

        // Email event listeners
        Event::listen(MessageSending::class, CheckEmailSuppression::class);
        Event::listen(MessageSent::class, LogSentEmail::class);

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

        // Register Admin route model bindings
        Route::bind('adminProject', fn (string $value) => \App\Models\Project::findOrFail($value));
    }
}
