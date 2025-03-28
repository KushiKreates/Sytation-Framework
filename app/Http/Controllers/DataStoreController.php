<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Session;

class DataStoreController extends Controller
{
    // Session key for storing data
    protected $sessionKey = 'dynamic_data';
    
    /**
     * Store data from a request
     */
    public function store(Request $request)
    {
        // Get existing data
        $currentData = Session::get($this->sessionKey, []);
        
        // Add new data if provided
        if ($request->has('add')) {
            $newData = $request->input('add');
            
            // Add new data to the current data array
            if (is_array($currentData)) {
                // If it's an array, add a new item
                $currentData['item_' . (count($currentData) + 1)] = $newData;
            } else {
                // If it's not an array yet, create one
                $currentData = ['item_1' => $newData];
            }
            
            // Store the updated data
            Session::put($this->sessionKey, $currentData);
            
            // Set a flash message
            Session::flash('success', 'Data has been added successfully');
            
            return response()->json([
                'success' => true,
                'message' => 'Data has been stored and will be available on page load',
                'data' => $currentData
            ]);
        }
        
        // If no data to add, just return current data
        return response()->json([
            'success' => false,
            'message' => 'No data provided to add',
            'data' => $currentData
        ]);
    }
    
    /**
     * Clear stored data
     */
    public function clear()
    {
        // Clear the dynamic data from the session
        Session::forget($this->sessionKey);
        
        // Set a flash message
        Session::flash('info', 'Dynamic data has been cleared');
        
        return response()->json([
            'success' => true,
            'message' => 'Dynamic data has been cleared'
        ]);
    }
    
    /**
     * Get all stored data (for use in the main route)
     */
    public function getData()
    {
        return Session::get($this->sessionKey, []);
    }
}