<?php

namespace App\Http\Controllers\Account;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;

class AccountController extends Controller
{
    /**
     * Create a new controller instance.
     */
    public function __construct()
    {
        $this->middleware('auth');
    }

    /**
     * Display the current user's account information.
     */
    public function index()
    {
        return response()->json([
            'success' => true,
            'data' => Auth::user()->toVueObject(),
        ]);
    }

    /**
     * Update the user's profile information.
     */
    public function update(Request $request)
    {
        $user = Auth::user();
        
        // Validate the request data
        $validator = Validator::make($request->all(), [
            'name' => ['sometimes', 'string', 'max:255'],
            'email' => [
                'sometimes', 
                'string', 
                'email', 
                'max:255',
                Rule::unique('users')->ignore($user->id),
            ],
            'description' => ['sometimes', 'nullable', 'string', 'max:500'],
            'avatar' => ['sometimes', 'image', 'mimes:jpeg,png,jpg,gif', 'max:2048'],
            'banner' => ['sometimes', 'image', 'mimes:jpeg,png,jpg,gif', 'max:4096'],
        ]);
        
        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
            ], 422);
        }
        
        // Update user name if provided
        if ($request->has('name')) {
            $user->name = $request->name;
        }
        
        // Update user email if provided
        if ($request->has('email') && $request->email !== $user->email) {
            $user->email = $request->email;
            $user->email_verified_at = null; // Require re-verification
        }
        
        // Update description if provided
        if ($request->has('description')) {
            $user->description = $request->description;
        }
        
        // Handle avatar upload if provided
        if ($request->hasFile('avatar')) {
            // Delete the old avatar if it exists
            if ($user->avatar && !str_starts_with($user->avatar, 'http')) {
                Storage::disk('public')->delete($user->avatar);
            }
            
            // Store the new avatar
            $avatarPath = $request->file('avatar')->store('avatars', 'public');
            $user->avatar = $avatarPath;
        }
        
        // Handle banner upload if provided
        if ($request->hasFile('banner')) {
            // Delete the old banner if it exists
            if ($user->banner && !str_starts_with($user->banner, 'http')) {
                Storage::disk('public')->delete($user->banner);
            }
            
            // Store the new banner
            $bannerPath = $request->file('banner')->store('banners', 'public');
            $user->banner = $bannerPath;
        }
        
        $user->save();
        
        return response()->json([
            'success' => true,
            'message' => 'Profile updated successfully',
            'data' => $user->toVueObject(),
        ]);
    }

    /**
     * Remove the user's banner.
     */
    public function removeBanner()
    {
        $user = Auth::user();
        
        if ($user->banner && !str_starts_with($user->banner, 'http')) {
            Storage::disk('public')->delete($user->banner);
        }
        
        $user->banner = null;
        $user->save();
        
        return response()->json([
            'success' => true,
            'message' => 'Banner removed successfully',
            'data' => $user->toVueObject(),
        ]);
    }

    /**
     * Update the user's password.
     */
    public function updatePassword(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'current_password' => ['required', 'string', 'current_password'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
        ]);
        
        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
            ], 422);
        }
        
        $user = Auth::user();
        $user->password = bcrypt($request->password);
        $user->save();
        
        return response()->json([
            'success' => true,
            'message' => 'Password updated successfully',
        ]);
    }

    /**
     * Remove the user's avatar.
     */
    public function removeAvatar()
    {
        $user = Auth::user();
        
        if ($user->avatar && !str_starts_with($user->avatar, 'http')) {
            Storage::disk('public')->delete($user->avatar);
        }
        
        $user->avatar = null;
        $user->save();
        
        return response()->json([
            'success' => true,
            'message' => 'Avatar removed successfully',
            'data' => $user->toVueObject(),
        ]);
    }

    /**
     * Delete the user's account.
     */
    public function destroy(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'password' => ['required', 'string', 'current_password'],
        ]);
        
        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
            ], 422);
        }
        
        $user = Auth::user();
        
        // Delete user avatar if it exists
        if ($user->avatar && !str_starts_with($user->avatar, 'http')) {
            Storage::disk('public')->delete($user->avatar);
        }
        
        // Delete user banner if it exists
        if ($user->banner && !str_starts_with($user->banner, 'http')) {
            Storage::disk('public')->delete($user->banner);
        }
        
        // Delete the user
        $user->delete();
        
        return response()->json([
            'success' => true,
            'message' => 'Account deleted successfully',
        ]);
    }
}