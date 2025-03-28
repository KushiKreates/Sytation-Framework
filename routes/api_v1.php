<?php

use Illuminate\Http\Request;
use App\Http\Controllers\api\v1\ExampleController;
use App\Http\Controllers\Auth\GoogleController;
use App\Http\Controllers\DataStoreController;
use App\Http\Controllers\Account\AccountController;

/*
|--------------------------------------------------------------------------
| API ROUTES
|--------------------------------------------------------------------------
|
| This file contains all of the v1 API routes.
| This file is loaded and the routes are pre-pended automatically 
| by App\Providers\RouteServiceProvider->boot()
|
*/

/**
 * Authenticated API Routes (sanctum)
 * These routes require authentication
 */
Route::group([
    'middleware' => ['api_authenticated']
], function() { 
    // Example controller
    Route::get('/example-authenticated', [ExampleController::class, 'authenticated']);

    /**
     * Dynamic Data Routes
     * These endpoints allow client-side updates to server-side data
     */
    Route::get('data-change', [DataStoreController::class, 'store']);
    Route::get('data-clear', [DataStoreController::class, 'clear']);

    /**
     * Authentication Routes
     */
    Route::post('/auth/google/verify', [GoogleController::class, 'handleGoogleToken']);
    Route::get('auth/google', [GoogleController::class, 'redirectToGoogle'])
        ->name('auth.google');
    
    // API route for client-side Google auth
    Route::post('/auth/google/token', [GoogleController::class, 'handleGoogleToken'])
        ->middleware('web'); // Use web middleware to ensure session support

    /**
     * Account Management Routes
     */
    Route::middleware('auth:sanctum')->group(function () {
        Route::get('/account', [AccountController::class, 'index']);
        Route::post('/account/update', [AccountController::class, 'update']);
        Route::post('/account/update-password', [AccountController::class, 'updatePassword']);
        Route::post('/account/remove-avatar', [AccountController::class, 'removeAvatar']);
        Route::post('/account/remove-banner', [AccountController::class, 'removeBanner']);
        Route::post('/account/delete', [AccountController::class, 'destroy']);
    });
});

/**
 * Public API Routes
 * These routes don't require authentication
 */
Route::group([
    'middleware' => ['api_public'],
], function () {
    Route::get('/example', [ExampleController::class, 'index']);
});