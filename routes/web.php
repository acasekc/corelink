<?php

use App\Http\Controllers\Admin\AuthController as AdminAuthController;
use App\Http\Controllers\Admin\CaseStudyController as AdminCaseStudyController;
use App\Http\Controllers\Admin\DiscoveryController as AdminDiscoveryController;
use App\Http\Controllers\Admin\ProjectController as AdminProjectController;
use App\Http\Controllers\CaseStudyController;
use App\Http\Controllers\ContactController;
use App\Http\Controllers\DiscoveryController;
use App\Http\Controllers\Helpdesk\AuthController as HelpdeskAuthController;
use App\Http\Controllers\PageController;
use App\Http\Controllers\ProjectController;
use Illuminate\Support\Facades\Route;

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

// Projects API
Route::get('/api/projects', [ProjectController::class, 'index']);

// Admin Case Studies API (requires authentication)
Route::middleware(['auth'])->prefix('api/admin')->group(function () {
    Route::get('/case-studies', [AdminCaseStudyController::class, 'index']);
    Route::get('/case-studies/{id}', [AdminCaseStudyController::class, 'show']);
    Route::post('/case-studies', [AdminCaseStudyController::class, 'store']);
    Route::put('/case-studies/{id}', [AdminCaseStudyController::class, 'update']);
    Route::delete('/case-studies/{id}', [AdminCaseStudyController::class, 'destroy']);
    Route::post('/case-studies/{id}/toggle-publish', [AdminCaseStudyController::class, 'togglePublish']);

    // Projects API
    Route::get('/projects', [AdminProjectController::class, 'index']);
    Route::get('/projects/{project}', [AdminProjectController::class, 'show']);
    Route::post('/projects', [AdminProjectController::class, 'store']);
    Route::put('/projects/{project}', [AdminProjectController::class, 'update']);
    Route::delete('/projects/{project}', [AdminProjectController::class, 'destroy']);

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

    // Projects Management
    Route::prefix('projects')->name('projects.')->group(function () {
        Route::get('/', [PageController::class, 'projects'])->name('index');
        Route::get('/create', [PageController::class, 'projects'])->name('create');
        Route::get('/{id}/edit', [PageController::class, 'projects'])->name('edit');
    });

    // Admin Helpdesk (SPA - React handles routing)
    Route::get('/helpdesk/{any?}', [PageController::class, 'helpdesk'])
        ->where('any', '.*')
        ->name('helpdesk');
});

/*
|--------------------------------------------------------------------------
| User Helpdesk Portal
|--------------------------------------------------------------------------
*/

// Helpdesk Auth Routes (guest only)
Route::middleware(['guest'])->prefix('helpdesk')->group(function () {
    Route::get('/login', [HelpdeskAuthController::class, 'showLogin'])->name('helpdesk.login');
    Route::post('/login', [HelpdeskAuthController::class, 'login']);
});

// Helpdesk Logout (authenticated)
Route::post('/helpdesk/logout', [HelpdeskAuthController::class, 'logout'])
    ->middleware('auth')
    ->name('helpdesk.logout');

// User Helpdesk Portal (authenticated users)
Route::middleware(['auth'])->prefix('helpdesk')->group(function () {
    Route::get('/{any?}', [PageController::class, 'helpdesk'])
        ->where('any', '^(?!login).*')
        ->name('user.helpdesk');
});
