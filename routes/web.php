<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\PageController;
use App\Http\Controllers\ContactController;
use App\Http\Controllers\DiscoveryController;
use App\Http\Controllers\CaseStudyController;
use App\Http\Controllers\Admin\AuthController as AdminAuthController;
use App\Http\Controllers\Admin\DiscoveryController as AdminDiscoveryController;
use App\Http\Controllers\Admin\CaseStudyController as AdminCaseStudyController;

Route::get('/', [PageController::class, 'home']);
Route::get('/projects', [PageController::class, 'projects']);
Route::get('/process', [PageController::class, 'process']);
Route::get('/about', [PageController::class, 'about']);
Route::get('/contact', [PageController::class, 'contact']);
Route::post('/contact', [ContactController::class, 'submit'])->name('contact.submit');

// Case Studies
Route::get('/api/case-studies', [CaseStudyController::class, 'index']);
Route::get('/api/case-studies/{slug}', [CaseStudyController::class, 'show']);
Route::get('/case-studies', [PageController::class, 'caseStudies']);
Route::get('/case-studies/{slug}', [PageController::class, 'caseStudies']);

// Admin Case Studies API (requires authentication)
Route::middleware(['auth'])->prefix('api/admin')->group(function () {
    Route::get('/case-studies', [AdminCaseStudyController::class, 'index']);
    Route::get('/case-studies/{id}', [AdminCaseStudyController::class, 'show']);
    Route::post('/case-studies', [AdminCaseStudyController::class, 'store']);
    Route::put('/case-studies/{id}', [AdminCaseStudyController::class, 'update']);
    Route::delete('/case-studies/{id}', [AdminCaseStudyController::class, 'destroy']);
    Route::post('/case-studies/{id}/toggle-publish', [AdminCaseStudyController::class, 'togglePublish']);
    
    // Discovery API
    Route::prefix('discovery')->group(function () {
        Route::get('/invites', [AdminDiscoveryController::class, 'invites']);
    });
});

// Discovery Bot Routes
Route::get('/discovery', [DiscoveryController::class, 'chat'])->name('discovery.chat');
Route::get('/discovery/{sessionId}/summary', [DiscoveryController::class, 'summary'])->name('discovery.summary');
Route::get('/api/discovery/{sessionId}/summary', [DiscoveryController::class, 'getSummaryData']);

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
    // Admin Dashboard
    Route::get('/', [PageController::class, 'home'])->name('dashboard');
    
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

    // Case Studies Management
    Route::prefix('case-studies')->name('case-studies.')->group(function () {
        Route::get('/', [PageController::class, 'caseStudies'])->name('index');
        Route::get('/create', [PageController::class, 'caseStudies'])->name('create');
        Route::post('/', [AdminCaseStudyController::class, 'store'])->name('store');
        Route::get('/{id}/edit', [PageController::class, 'caseStudies'])->name('edit');
        Route::get('/{id}', [AdminCaseStudyController::class, 'show'])->name('show');
        Route::put('/{id}', [AdminCaseStudyController::class, 'update'])->name('update');
        Route::delete('/{id}', [AdminCaseStudyController::class, 'destroy'])->name('destroy');
    });
});
