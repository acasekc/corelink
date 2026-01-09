<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\PageController;
use App\Http\Controllers\ContactController;
use App\Http\Controllers\DiscoveryController;
use App\Http\Controllers\Admin\AuthController as AdminAuthController;
use App\Http\Controllers\Admin\DiscoveryController as AdminDiscoveryController;
use App\Http\Controllers\ProcessController;

Route::get('/', [PageController::class, 'home']);
Route::get('/projects', [PageController::class, 'projects']);
Route::get('/about', [PageController::class, 'about']);
Route::get('/contact', [PageController::class, 'contact']);
Route::post('/contact', [ContactController::class, 'submit'])->name('contact.submit');
Route::get('/process', [ProcessController::class, 'index'])->name('process');

// Case Studies
Route::get('/case-studies/dusties-delights', [PageController::class, 'caseStudyDustiesDelights'])->name('case-studies.dusties-delights');

// Discovery Bot Routes
Route::get('/discovery', [DiscoveryController::class, 'chat'])->name('discovery.chat');
Route::get('/discovery/{sessionId}/summary', [DiscoveryController::class, 'summary'])->name('discovery.summary');

// Admin Auth Routes (guest only)
Route::middleware(['guest'])->prefix('admin')->group(function () {
    Route::get('/login', [AdminAuthController::class, 'showLogin'])->name('admin.login');
    Route::post('/login', [AdminAuthController::class, 'login']);
});

// Admin Logout (authenticated)
Route::post('/admin/logout', [AdminAuthController::class, 'logout'])
    ->middleware('auth')
    ->name('admin.logout');

// Admin Routes (requires authentication)
Route::middleware(['auth'])->prefix('admin')->name('admin.')->group(function () {
    // Discovery Management
    Route::prefix('discovery')->name('discovery.')->group(function () {
        Route::get('/', [AdminDiscoveryController::class, 'index'])->name('index');
        
        // Invites
        Route::get('/invites', [AdminDiscoveryController::class, 'invites'])->name('invites');
        Route::get('/invites/create', [AdminDiscoveryController::class, 'createInvite'])->name('invites.create');
        Route::post('/invites', [AdminDiscoveryController::class, 'storeInvite'])->name('invites.store');
        Route::post('/invites/{invite}/toggle', [AdminDiscoveryController::class, 'toggleInvite'])->name('invites.toggle');
        Route::delete('/invites/{invite}', [AdminDiscoveryController::class, 'deleteInvite'])->name('invites.delete');
        Route::post('/invites/{invite}/resend', [AdminDiscoveryController::class, 'resendInvite'])->name('invites.resend');
        
        // Sessions
        Route::get('/sessions', [AdminDiscoveryController::class, 'sessions'])->name('sessions');
        Route::get('/sessions/{session}', [AdminDiscoveryController::class, 'showSession'])->name('sessions.show');
        
        // Plans
        Route::get('/plans', [AdminDiscoveryController::class, 'plans'])->name('plans');
        Route::get('/plans/{plan}', [AdminDiscoveryController::class, 'showPlan'])->name('plans.show');
    });
});
