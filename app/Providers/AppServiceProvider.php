<?php

namespace App\Providers;

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
    }
}
