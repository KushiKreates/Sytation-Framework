<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\DataStoreController;
use App\Http\Controllers\Auth\GoogleController;
use Illuminate\Support\Facades\Auth;

/**
 * Authentication Routes
 */
// Google Authentication
Route::get('/auth/google', [GoogleController::class, 'redirectToGoogle'])
    ->name('auth.google');
Route::get('/auth/google/callback', [GoogleController::class, 'handleGoogleCallback']);

// Logout
Route::get('/auth/logout', function () {
    Auth::logout();
    session()->invalidate();
    session()->regenerateToken();
    return redirect('/')->with('success', 'You have been logged out.');
})->name('auth.logout');

// Login page (redirects to dashboard if already authenticated)
Route::get('/auth/login', function () {
    if (Auth::check()) {
        return redirect('/dashboard');
    }
    
    // Get dynamic data from DataStoreController
    $dataStoreController = app(DataStoreController::class);
    $dynamicData = $dataStoreController->getData();
    
    return view('app', ['dynamicData' => $dynamicData]);
})->name('login');

// Post logout (for form submissions)
Route::post('/logout', function () {
    Auth::logout();
    session()->invalidate();
    session()->regenerateToken();
    return redirect('/');
})->name('logout');

/**
 * Dynamic Data API Routes
 * These endpoints allow client-side updates to server-side data
 */
Route::get('/api/data-change', [DataStoreController::class, 'store']);
Route::get('/api/data-clear', [DataStoreController::class, 'clear']);

/**
 * Main Application Route
 * Handles all non-API routes and passes dynamic data to the view
 */
Route::get('/{any?}', function () {
    // Get dynamic data from DataStoreController
    $dataStoreController = app(DataStoreController::class);
    $dynamicData = $dataStoreController->getData();
    
    return view('app', ['dynamicData' => $dynamicData]);
})->where('any', '.*');