<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Laravel\Socialite\Facades\Socialite;
use Illuminate\Support\Str;

class GoogleController extends Controller
{
    /**
     * Redirect the user to Google authentication page
     */
    public function redirectToGoogle()
    {
        return Socialite::driver('google')->redirect();
    }

    /**
     * Handle the callback from Google
     */
    public function handleGoogleCallback()
    {
        try {
            $googleUser = Socialite::driver('google')->user();
            
            // Find or create user
            $user = User::where('email', $googleUser->getEmail())->first();
            
            if (!$user) {
                $user = User::create([
                    'name' => $googleUser->getName(),
                    'email' => $googleUser->getEmail(),
                    'google_id' => $googleUser->getId(),
                    'avatar' => $googleUser->getAvatar(),
                    'password' => Hash::make(Str::random(24)),
                    'email_verified_at' => now(),
                ]);
            } elseif (empty($user->google_id)) {
                $user->google_id = $googleUser->getId();
                $user->avatar = $googleUser->getAvatar();
                $user->save();
            }
            
            // Log the user in
            Auth::login($user);
            
            // Create a session for the user
            session()->regenerate();
            
            // Redirect to dashboard or home page
            return redirect('/dashboard')->with('success', 'Successfully logged in with Google!');
            
        } catch (Exception $e) {
            logger()->error('Google login error: ' . $e->getMessage());
            return redirect('/auth/login')->with('error', 'Failed to login with Google. Please try again.');
        }
    }
}