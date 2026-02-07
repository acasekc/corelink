<?php

use App\Http\Controllers\Admin\ArticleCategoryController;
use App\Http\Controllers\Admin\ArticleController as AdminArticleController;
use App\Http\Controllers\Admin\ArticleSettingsController;
use App\Http\Controllers\Admin\AuthController as AdminAuthController;
use App\Http\Controllers\Admin\CaseStudyController as AdminCaseStudyController;
use App\Http\Controllers\Admin\DiscoveryController as AdminDiscoveryController;
use App\Http\Controllers\Admin\ProfileController as AdminProfileController;
use App\Http\Controllers\Admin\ProjectController as AdminProjectController;
use App\Http\Controllers\Api\UploadController;
use App\Http\Controllers\ArticleController;
use App\Http\Controllers\BlogController;
use App\Http\Controllers\CaseStudyController;
use App\Http\Controllers\ContactController;
use App\Http\Controllers\DiscoveryController;
use App\Http\Controllers\Helpdesk\AuthController as HelpdeskAuthController;
use App\Http\Controllers\Helpdesk\Public\InvoiceController as PublicInvoiceController;
use App\Http\Controllers\Helpdesk\StripeWebhookController;
use App\Http\Controllers\PageController;
use App\Http\Controllers\PostmarkWebhookController;
use App\Http\Controllers\ProjectController;
use Illuminate\Support\Facades\Route;

Route::get('/', [PageController::class, 'home']);
Route::get('/projects', [PageController::class, 'projects']);
Route::get('/process', [PageController::class, 'process']);
Route::get('/about', [PageController::class, 'about']);
Route::get('/contact', [PageController::class, 'contact']);
Route::get('/terms', [PageController::class, 'terms']);
Route::get('/privacy', [PageController::class, 'privacy']);
Route::post('/contact', [ContactController::class, 'submit'])->name('contact.submit');

// Case Studies
Route::get('/api/case-studies', [CaseStudyController::class, 'index']);
Route::get('/api/case-studies/{slug}', [CaseStudyController::class, 'show']);
Route::get('/case-studies', [PageController::class, 'caseStudies']);
Route::get('/case-studies/{slug}', [PageController::class, 'caseStudies']);

// Projects API
Route::get('/api/projects', [ProjectController::class, 'index']);

// Articles API (requires authentication)
Route::middleware(['auth', 'force-password-change'])->prefix('api')->group(function () {
    Route::apiResource('articles', ArticleController::class);
    Route::post('/articles/{article}/publish', [ArticleController::class, 'publish'])->name('articles.publish');
    Route::post('/articles/{article}/schedule', [ArticleController::class, 'schedule'])->name('articles.schedule');
});

// Admin Profile API (exempt from force-password-change)
Route::middleware(['auth'])->prefix('api/admin')->group(function () {
    Route::get('/profile', [AdminProfileController::class, 'show']);
    Route::post('/change-password', [AdminProfileController::class, 'changePassword']);
});

// Admin Case Studies API (requires authentication)
Route::middleware(['auth', 'admin', 'force-password-change'])->prefix('api/admin')->group(function () {
    // Image Upload for Editor
    Route::post('/upload/image', [UploadController::class, 'image']);

    Route::get('/case-studies', [AdminCaseStudyController::class, 'index']);
    Route::get('/case-studies/{id}', [AdminCaseStudyController::class, 'show']);
    Route::post('/case-studies', [AdminCaseStudyController::class, 'store']);
    Route::put('/case-studies/{id}', [AdminCaseStudyController::class, 'update']);
    Route::delete('/case-studies/{id}', [AdminCaseStudyController::class, 'destroy']);
    Route::post('/case-studies/{id}/toggle-publish', [AdminCaseStudyController::class, 'togglePublish']);

    // Projects API
    Route::get('/projects', [AdminProjectController::class, 'index']);
    Route::get('/projects/{adminProject}', [AdminProjectController::class, 'show']);
    Route::post('/projects', [AdminProjectController::class, 'store']);
    Route::put('/projects/{adminProject}', [AdminProjectController::class, 'update']);
    Route::delete('/projects/{adminProject}', [AdminProjectController::class, 'destroy']);

    // Discovery API
    Route::prefix('discovery')->group(function () {
        Route::get('/invites', [AdminDiscoveryController::class, 'invites']);
    });
});

// Discovery Bot Routes
Route::get('/discovery', [DiscoveryController::class, 'chat'])->name('discovery.chat');
Route::get('/discovery/{sessionId}/summary', [DiscoveryController::class, 'summary'])->name('discovery.summary');

/*
|--------------------------------------------------------------------------
| Blog Routes (Public)
|--------------------------------------------------------------------------
*/

Route::prefix('blog')->name('blog.')->group(function () {
    Route::get('/', [BlogController::class, 'index'])->name('index');
    Route::get('/category/{slug}', [BlogController::class, 'category'])->name('category');
    Route::get('/{slug}', [BlogController::class, 'show'])->name('show');
});

// Sitemap
Route::get('/sitemap.xml', [BlogController::class, 'sitemap'])->name('sitemap');

// Blog API Routes (for SPA)
Route::prefix('api/blog')->group(function () {
    Route::get('/', [BlogController::class, 'apiIndex']);
    Route::get('/categories', [BlogController::class, 'apiCategories']);
    Route::get('/category/{slug}', [BlogController::class, 'apiCategory']);
    Route::get('/article/{slug}', [BlogController::class, 'apiShow']);
});

// Admin Auth Routes (guest only)
Route::middleware(['guest', 'no-cache'])->prefix('admin')->group(function () {
    Route::get('/login', [AdminAuthController::class, 'showLogin'])->name('admin.login');
    Route::post('/login', [AdminAuthController::class, 'login']);
});

// Admin Logout (authenticated)
Route::post('/admin/logout', [AdminAuthController::class, 'logout'])
    ->middleware(['auth', 'no-cache'])
    ->name('admin.logout');

// Admin Change Password (authenticated, exempt from force-password-change)
Route::middleware(['auth', 'no-cache'])->prefix('admin')->group(function () {
    Route::get('/change-password', [PageController::class, 'adminSpa'])->name('admin.change-password');
});

// Admin Routes (requires authentication)
Route::middleware(['auth', 'force-password-change', 'no-cache'])->prefix('admin')->name('admin.')->group(function () {
    // Admin Dashboard
    Route::get('/', [PageController::class, 'adminSpa'])->name('dashboard');

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
        Route::get('/', [PageController::class, 'adminSpa'])->name('index');
        Route::get('/create', [PageController::class, 'adminSpa'])->name('create');
        Route::post('/', [AdminCaseStudyController::class, 'store'])->name('store');
        Route::get('/{id}/edit', [PageController::class, 'adminSpa'])->name('edit');
        Route::get('/{id}', [AdminCaseStudyController::class, 'show'])->name('show');
        Route::put('/{id}', [AdminCaseStudyController::class, 'update'])->name('update');
        Route::delete('/{id}', [AdminCaseStudyController::class, 'destroy'])->name('destroy');
    });

    // Projects Management
    Route::prefix('projects')->name('projects.')->group(function () {
        Route::get('/', [PageController::class, 'adminSpa'])->name('index');
        Route::get('/create', [PageController::class, 'adminSpa'])->name('create');
        Route::get('/{id}/edit', [PageController::class, 'adminSpa'])->name('edit');
    });

    // Blog Articles Management
    Route::prefix('articles')->name('articles.')->group(function () {
        // Article CRUD (SPA views)
        Route::get('/', [AdminArticleController::class, 'index'])->name('index');
        Route::get('/create', [AdminArticleController::class, 'create'])->name('create');
        Route::post('/', [AdminArticleController::class, 'store'])->name('store');

        // API endpoints for SPA data fetching (must be before {article} routes)
        Route::get('/api/list', [AdminArticleController::class, 'apiIndex'])->name('api.index');
        Route::get('/api/create-data', [AdminArticleController::class, 'apiCreate'])->name('api.create');

        // AI Generation
        Route::post('/generate', [AdminArticleController::class, 'generate'])->name('generate');

        // Settings (must be before {article} routes)
        Route::get('/settings', [ArticleSettingsController::class, 'index'])->name('settings');
        Route::put('/settings', [ArticleSettingsController::class, 'update'])->name('settings.update');
        Route::post('/settings/test-connection', [ArticleSettingsController::class, 'testConnection'])->name('settings.test');

        // Categories (must be before {article} routes)
        Route::prefix('categories')->name('categories.')->group(function () {
            Route::get('/', [ArticleCategoryController::class, 'index'])->name('index');
            Route::get('/create', [ArticleCategoryController::class, 'create'])->name('create');
            Route::post('/', [ArticleCategoryController::class, 'store'])->name('store');
            Route::get('/api/list', [ArticleCategoryController::class, 'apiIndex'])->name('api.index');
            Route::post('/reorder', [ArticleCategoryController::class, 'reorder'])->name('reorder');
            Route::get('/{category}', [ArticleCategoryController::class, 'show'])->name('show');
            Route::get('/{category}/edit', [ArticleCategoryController::class, 'edit'])->name('edit');
            Route::put('/{category}', [ArticleCategoryController::class, 'update'])->name('update');
            Route::delete('/{category}', [ArticleCategoryController::class, 'destroy'])->name('destroy');
        });

        // API endpoints for single article (must be before {article} routes)
        Route::get('/api/{article}/data', [AdminArticleController::class, 'apiShow'])->name('api.show');
        Route::get('/api/{article}/edit-data', [AdminArticleController::class, 'apiEdit'])->name('api.edit');

        // Article single routes (must be last - catches all)
        Route::get('/{article}', [AdminArticleController::class, 'show'])->name('show');
        Route::get('/{article}/edit', [AdminArticleController::class, 'edit'])->name('edit');
        Route::put('/{article}', [AdminArticleController::class, 'update'])->name('update');
        Route::delete('/{article}', [AdminArticleController::class, 'destroy'])->name('destroy');

        // Article Actions
        Route::post('/{article}/publish', [AdminArticleController::class, 'publish'])->name('publish');
        Route::post('/{article}/schedule', [AdminArticleController::class, 'schedule'])->name('schedule');
        Route::post('/{article}/submit-for-review', [AdminArticleController::class, 'submitForReview'])->name('submit-for-review');
        Route::post('/{article}/approve', [AdminArticleController::class, 'approve'])->name('approve');
        Route::post('/{article}/reject', [AdminArticleController::class, 'reject'])->name('reject');
        Route::post('/{article}/generate-image', [AdminArticleController::class, 'generateImage'])->name('generate-image');
    });

    // Admin Helpdesk (SPA - React handles routing)
    Route::get('/helpdesk/{any?}', [PageController::class, 'helpdesk'])
        ->where('any', '.*')
        ->name('helpdesk');
});

/*
|--------------------------------------------------------------------------
| Public Invoice Access (by UUID, no signature required)
|--------------------------------------------------------------------------
*/

Route::prefix('invoice')->name('invoice.public.')->group(function () {
    Route::get('/{invoice:uuid}', [PublicInvoiceController::class, 'showByUuid'])->name('show');
    Route::get('/{invoice:uuid}/pdf', [PublicInvoiceController::class, 'pdfByUuid'])->name('pdf');
    Route::post('/{invoice:uuid}/pay', [PublicInvoiceController::class, 'createCheckoutSessionByUuid'])->name('pay');
    Route::get('/{invoice:uuid}/payment-success', [PublicInvoiceController::class, 'paymentSuccessByUuid'])->name('payment-success');
});

/*
|--------------------------------------------------------------------------
| Stripe Webhooks (no CSRF verification)
|--------------------------------------------------------------------------
*/

Route::post('/webhooks/stripe', [StripeWebhookController::class, 'handle'])
    ->withoutMiddleware([\Illuminate\Foundation\Http\Middleware\VerifyCsrfToken::class])
    ->name('stripe.webhook');

/*
|--------------------------------------------------------------------------
| Postmark Webhooks (no CSRF verification)
|--------------------------------------------------------------------------
*/

Route::post('/webhooks/postmark', [PostmarkWebhookController::class, 'handle'])
    ->withoutMiddleware([\Illuminate\Foundation\Http\Middleware\VerifyCsrfToken::class])
    ->name('postmark.webhook');

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

// Helpdesk Change Password (authenticated, exempt from force-password-change)
Route::middleware(['auth'])->prefix('helpdesk')->group(function () {
    Route::get('/change-password', [PageController::class, 'helpdesk'])->name('helpdesk.change-password');
});

// User Helpdesk Portal (authenticated users)
Route::middleware(['auth', 'force-password-change'])->prefix('helpdesk')->group(function () {
    Route::get('/{any?}', [PageController::class, 'helpdesk'])
        ->where('any', '^(?!login|change-password).*')
        ->name('user.helpdesk');
});
