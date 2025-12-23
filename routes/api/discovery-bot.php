<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\API\InviteCodeController;
use App\Http\Controllers\API\BotSessionController;

/*
|--------------------------------------------------------------------------
| Discovery Bot API Routes
|--------------------------------------------------------------------------
|
| All routes related to the Discovery Bot system
| 
| Public routes are protected by invite code validation, not user auth.
| Admin routes require authentication.
|
*/

Route::prefix('bot')->group(function () {
    // Public routes (protected by invite code, not user auth)
    Route::post('/auth/invite-validate', [InviteCodeController::class, 'validateCode']);
    
    // Session routes (public - protected by invite code validation)
    Route::post('/sessions/create', [BotSessionController::class, 'create']);
    Route::get('/sessions/{id}', [BotSessionController::class, 'show']);
    Route::get('/sessions/{id}/history', [BotSessionController::class, 'history']);
    
    // Conversation flow (public - session token validation)
    Route::post('/sessions/{id}/start', [BotSessionController::class, 'start']);
    Route::post('/sessions/{id}/message', [BotSessionController::class, 'message']);
    
    // Plan generation (public)
    Route::post('/sessions/{id}/generate-plan', [BotSessionController::class, 'generatePlan']);
    Route::get('/sessions/{id}/plan', [BotSessionController::class, 'getPlan']);

    // Admin routes (require auth - to be implemented later)
    // Route::middleware(['auth:sanctum', 'admin'])->prefix('admin')->group(function () {
    //     Route::post('/invite-codes', [InviteCodeController::class, 'store']);
    //     Route::get('/invite-codes', [InviteCodeController::class, 'index']);
    //     Route::delete('/invite-codes/{id}', [InviteCodeController::class, 'revoke']);
    //     Route::get('/sessions', [BotSessionController::class, 'adminIndex']);
    //     Route::get('/sessions/{id}/full-plan', [BotSessionController::class, 'adminGetFullPlan']);
    // });
});
