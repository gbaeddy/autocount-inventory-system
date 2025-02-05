<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
});

// Example API route with CORS headers
Route::middleware('api')->group(function () {
    Route::get('api/*', function () {
        return response()->json(['message' => 'CORS headers set successfully!'])
            ->header('Access-Control-Allow-Origin', 'http://localhost:3000') // Your React app's URL
            ->header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
            ->header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    });
});
