<?php

use App\Http\Controllers\Helpdesk\Admin\ApiKeyController;
use App\Http\Controllers\Helpdesk\Admin\BillableItemController;
use App\Http\Controllers\Helpdesk\Admin\CommentController;
use App\Http\Controllers\Helpdesk\Admin\DashboardController;
use App\Http\Controllers\Helpdesk\Admin\HourlyRateCategoryController;
use App\Http\Controllers\Helpdesk\Admin\InvoiceController;
use App\Http\Controllers\Helpdesk\Admin\InvoicePaymentController;
use App\Http\Controllers\Helpdesk\Admin\ProjectController;
use App\Http\Controllers\Helpdesk\Admin\ProjectHourlyRateController;
use App\Http\Controllers\Helpdesk\Admin\ProjectInvoiceSettingsController;
use App\Http\Controllers\Helpdesk\Admin\ProjectUserController;
use App\Http\Controllers\Helpdesk\Admin\ReferenceDataController;
use App\Http\Controllers\Helpdesk\Admin\TicketController;
use App\Http\Controllers\Helpdesk\Admin\TimeEntryController;
use App\Http\Controllers\Helpdesk\Admin\UserController;
use App\Http\Controllers\Helpdesk\Api\CommentApiController;
use App\Http\Controllers\Helpdesk\Api\ReferenceDataApiController;
use App\Http\Controllers\Helpdesk\Api\TicketApiController;
use App\Http\Controllers\Helpdesk\AttachmentController;
use App\Http\Controllers\Helpdesk\User\CommentController as UserCommentController;
use App\Http\Controllers\Helpdesk\User\DashboardController as UserDashboardController;
use App\Http\Controllers\Helpdesk\User\ProfileController as UserProfileController;
use App\Http\Controllers\Helpdesk\User\ProjectController as UserProjectController;
use App\Http\Controllers\Helpdesk\User\TicketController as UserTicketController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Route Model Bindings for Helpdesk
| Note: Bindings are registered in AppServiceProvider to work with route caching
|--------------------------------------------------------------------------
*/

/*
|--------------------------------------------------------------------------
| External API (API Key Authentication)
| Used by PantryLink, ChampLink, EcomLink, etc.
|--------------------------------------------------------------------------
*/

Route::prefix('api/helpdesk/v1')->middleware('helpdesk.api-key')->group(function () {
    // Tickets
    Route::get('tickets', [TicketApiController::class, 'index']);
    Route::post('tickets', [TicketApiController::class, 'store']);
    Route::get('tickets/{ticket}', [TicketApiController::class, 'show']);
    Route::patch('tickets/{ticket}', [TicketApiController::class, 'update']);

    // Comments
    Route::get('tickets/{ticket}/comments', [CommentApiController::class, 'index']);
    Route::post('tickets/{ticket}/comments', [CommentApiController::class, 'store']);

    // Reference data
    Route::get('statuses', [ReferenceDataApiController::class, 'statuses']);
    Route::get('priorities', [ReferenceDataApiController::class, 'priorities']);
    Route::get('types', [ReferenceDataApiController::class, 'types']);
});

/*
|--------------------------------------------------------------------------
| User Helpdesk API (Session Authentication)
| Used by /helpdesk React UI - users can only see their projects/tickets
|--------------------------------------------------------------------------
*/

Route::prefix('api/helpdesk/user')->middleware(['web', 'auth'])->group(function () {
    // Profile & Password Change (exempt from force-password-change)
    Route::get('profile', [UserProfileController::class, 'show']);
    Route::patch('profile', [UserProfileController::class, 'update']);
    Route::post('change-password', [UserProfileController::class, 'changePassword']);
});

Route::prefix('api/helpdesk/user')->middleware(['web', 'auth', 'force-password-change'])->group(function () {
    // Dashboard
    Route::get('dashboard', UserDashboardController::class);

    // Projects
    Route::get('projects', [UserProjectController::class, 'index']);
    Route::get('projects/{project}', [UserProjectController::class, 'show']);
    Route::get('projects/{project}/reference-data', [UserProjectController::class, 'referenceData']);

    // Tickets
    Route::get('tickets', [UserTicketController::class, 'index']);
    Route::post('tickets', [UserTicketController::class, 'store']);
    Route::get('tickets/{ticket}', [UserTicketController::class, 'show']);
    Route::patch('tickets/{ticket}', [UserTicketController::class, 'update']);

    // Comments
    Route::post('tickets/{ticket}/comments', [UserCommentController::class, 'store']);
    Route::patch('tickets/{ticket}/comments/{comment}', [UserCommentController::class, 'update']);
    Route::delete('tickets/{ticket}/comments/{comment}', [UserCommentController::class, 'destroy']);

    // Attachments
    Route::get('tickets/{ticket}/attachments', [AttachmentController::class, 'listForTicket']);
    Route::post('tickets/{ticket}/attachments', [AttachmentController::class, 'uploadToTicket']);
    Route::post('comments/{comment}/attachments', [AttachmentController::class, 'uploadToComment']);
    Route::get('attachments/{attachment}/download', [AttachmentController::class, 'download'])->name('helpdesk.attachments.download');
    Route::delete('attachments/{attachment}', [AttachmentController::class, 'destroy']);
});

/*
|--------------------------------------------------------------------------
| Admin API (Session Authentication)
| Used by Corelink helpdesk admin React UI
|--------------------------------------------------------------------------
*/

Route::prefix('api/helpdesk/admin')->middleware(['web', 'auth', 'admin', 'force-password-change'])->group(function () {
    // Dashboard
    Route::get('dashboard', [DashboardController::class, 'global']);
    Route::get('projects/{project}/dashboard', [DashboardController::class, 'project']);

    // Projects
    Route::apiResource('projects', ProjectController::class);

    // Project Users
    Route::get('projects/{project}/users', [ProjectUserController::class, 'index']);
    Route::post('projects/{project}/users', [ProjectUserController::class, 'store']);
    Route::patch('projects/{project}/users/{user}', [ProjectUserController::class, 'update']);
    Route::delete('projects/{project}/users/{user}', [ProjectUserController::class, 'destroy']);
    Route::get('projects/{project}/users/available', [ProjectUserController::class, 'available']);

    // API Keys (per project)
    Route::get('projects/{project}/api-keys', [ApiKeyController::class, 'index']);
    Route::post('projects/{project}/api-keys', [ApiKeyController::class, 'store']);
    Route::get('projects/{project}/api-keys/{apiKey}', [ApiKeyController::class, 'show']);
    Route::patch('projects/{project}/api-keys/{apiKey}', [ApiKeyController::class, 'update']);
    Route::delete('projects/{project}/api-keys/{apiKey}', [ApiKeyController::class, 'destroy']);
    Route::post('projects/{project}/api-keys/{apiKey}/regenerate', [ApiKeyController::class, 'regenerate']);

    // Tickets
    Route::get('tickets', [TicketController::class, 'index']);
    Route::post('tickets', [TicketController::class, 'store']);
    Route::get('tickets/{ticket}', [TicketController::class, 'show']);
    Route::patch('tickets/{ticket}', [TicketController::class, 'update']);
    Route::delete('tickets/{ticket}', [TicketController::class, 'destroy']);
    Route::post('tickets/bulk-delete', [TicketController::class, 'bulkDestroy']);
    Route::post('tickets/{ticket}/assign', [TicketController::class, 'assign']);
    Route::post('tickets/{ticket}/status', [TicketController::class, 'changeStatus']);
    Route::post('tickets/{ticket}/priority', [TicketController::class, 'changePriority']);
    Route::post('tickets/{ticket}/labels', [TicketController::class, 'addLabels']);

    // Time Entries
    Route::get('time-entries/categories', [TimeEntryController::class, 'categories']);
    Route::get('tickets/{ticket}/time-entries', [TimeEntryController::class, 'index']);
    Route::post('tickets/{ticket}/time-entries', [TimeEntryController::class, 'store']);
    Route::patch('tickets/{ticket}/time-entries/{timeEntry}', [TimeEntryController::class, 'update']);
    Route::delete('tickets/{ticket}/time-entries/{timeEntry}', [TimeEntryController::class, 'destroy']);

    // Hourly Rate Categories (global, admin managed)
    Route::get('hourly-rate-categories', [HourlyRateCategoryController::class, 'index']);
    Route::post('hourly-rate-categories', [HourlyRateCategoryController::class, 'store']);
    Route::get('hourly-rate-categories/{hourlyRateCategory}', [HourlyRateCategoryController::class, 'show']);
    Route::patch('hourly-rate-categories/{hourlyRateCategory}', [HourlyRateCategoryController::class, 'update']);
    Route::delete('hourly-rate-categories/{hourlyRateCategory}', [HourlyRateCategoryController::class, 'destroy']);
    Route::post('hourly-rate-categories/reorder', [HourlyRateCategoryController::class, 'reorder']);

    // Project Billable Items
    Route::get('projects/{project}/billable-items', [BillableItemController::class, 'index']);
    Route::post('projects/{project}/billable-items', [BillableItemController::class, 'store']);
    Route::get('projects/{project}/billable-items/{billableItem}', [BillableItemController::class, 'show']);
    Route::patch('projects/{project}/billable-items/{billableItem}', [BillableItemController::class, 'update']);
    Route::delete('projects/{project}/billable-items/{billableItem}', [BillableItemController::class, 'destroy']);

    // Project Hourly Rates
    Route::get('projects/{project}/hourly-rates', [ProjectHourlyRateController::class, 'index']);
    Route::post('projects/{project}/hourly-rates', [ProjectHourlyRateController::class, 'store']);
    Route::patch('projects/{project}/hourly-rates/{hourlyRate}', [ProjectHourlyRateController::class, 'update']);
    Route::delete('projects/{project}/hourly-rates/{hourlyRate}', [ProjectHourlyRateController::class, 'destroy']);
    Route::get('projects/{project}/hourly-rates/category/{category}', [ProjectHourlyRateController::class, 'getEffectiveRate']);

    // Project Invoice Settings
    Route::get('projects/{project}/invoice-settings', [ProjectInvoiceSettingsController::class, 'show']);
    Route::patch('projects/{project}/invoice-settings', [ProjectInvoiceSettingsController::class, 'update']);

    // Invoices
    Route::get('invoices', [InvoiceController::class, 'index']);
    Route::get('projects/{project}/uninvoiced-time', [InvoiceController::class, 'uninvoicedTimeEntries']);
    Route::post('projects/{project}/invoices', [InvoiceController::class, 'store']);
    Route::get('invoices/{invoice}', [InvoiceController::class, 'show']);
    Route::patch('invoices/{invoice}', [InvoiceController::class, 'update']);
    Route::delete('invoices/{invoice}', [InvoiceController::class, 'destroy']);
    Route::post('invoices/{invoice}/line-items', [InvoiceController::class, 'addLineItem']);
    Route::delete('invoices/{invoice}/line-items/{lineItem}', [InvoiceController::class, 'removeLineItem']);
    Route::post('invoices/{invoice}/send', [InvoiceController::class, 'send']);
    Route::post('invoices/{invoice}/resend', [InvoiceController::class, 'resend']);
    Route::post('invoices/{invoice}/void', [InvoiceController::class, 'void']);
    Route::get('invoices/{invoice}/pdf', [InvoiceController::class, 'viewPdf']);
    Route::get('invoices/{invoice}/pdf/download', [InvoiceController::class, 'downloadPdf']);

    // Invoice Payments (manual payments)
    Route::post('invoices/{invoice}/payments', [InvoicePaymentController::class, 'store']);
    Route::delete('invoices/{invoice}/payments/{payment}', [InvoicePaymentController::class, 'destroy']);

    // Comments
    Route::get('tickets/{ticket}/comments', [CommentController::class, 'index']);
    Route::post('tickets/{ticket}/comments', [CommentController::class, 'store']);
    Route::patch('comments/{comment}', [CommentController::class, 'update']);
    Route::delete('comments/{comment}', [CommentController::class, 'destroy']);
    Route::post('comments/{comment}/attachments', [AttachmentController::class, 'uploadToComment']);

    // Reference data
    Route::get('statuses', [ReferenceDataController::class, 'statuses']);
    Route::get('priorities', [ReferenceDataController::class, 'priorities']);
    Route::get('types', [ReferenceDataController::class, 'types']);
    Route::get('admins', [ReferenceDataController::class, 'admins']);

    // User Management
    Route::get('users', [UserController::class, 'index']);
    Route::post('users', [UserController::class, 'store']);
    Route::get('users/{user}', [UserController::class, 'show']);
    Route::patch('users/{user}', [UserController::class, 'update']);
    Route::delete('users/{user}', [UserController::class, 'destroy']);
    Route::post('users/{user}/restore', [UserController::class, 'restore']);
    Route::delete('users/{user}/force', [UserController::class, 'forceDelete']);
    Route::get('users-search', [UserController::class, 'search']);
    Route::get('roles', [UserController::class, 'roles']);
});
