<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\UserManagementController;
use App\Http\Controllers\ItemController;
use App\Http\Controllers\ProductRequestController;
use App\Http\Controllers\ActivityLogController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\InventoryExportController;
use App\Http\Controllers\StockSettingsController;

// Public routes
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::post('/check-staff-id', [AuthController::class, 'checkStaffId']);
Route::post('/check-email', [AuthController::class, 'checkEmail']);
Route::post('/check-username', [AuthController::class, 'checkUsername']);

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);

    // Add the new statistics endpoint
    Route::get('/users/statistics', [UserManagementController::class, 'getStatistics']);
    // User management routes
    Route::get('/users', [UserManagementController::class, 'getAllUsers']);
    Route::post('/users', [UserManagementController::class, 'createUser']);
    Route::put('/users/{staff_id}', [UserManagementController::class, 'updateUser']);
    Route::delete('/users/{staff_id}', [UserManagementController::class, 'deleteUser']);
    Route::get('/users/role/{role?}', [UserManagementController::class, 'getUsersByRole']);
    Route::put('/users/{staff_id}/status', [UserManagementController::class, 'updateUserStatus']);

    // Item routes
    Route::apiResource('items', ItemController::class);
    Route::get('items-by-group', [ItemController::class, 'getItemsSortedByItemGroup']);
    Route::get('items-by-type', [ItemController::class, 'getItemsSortedByItemType']);

    // Inventory Export routes
    Route::get('/inventory/export-low-stock', [InventoryExportController::class, 'exportLowStock']);

    // Product request routes
    Route::apiResource('product-requests', ProductRequestController::class);

    // Activity log routes
    Route::get('/activity-logs', [ActivityLogController::class, 'index']);
    Route::get('/activity-logs/action-types', [ActivityLogController::class, 'getActionTypes']);
    Route::get('/activity-logs/statistics', [ActivityLogController::class, 'getStatistics']);

    // Notification log routes
    Route::get('/notifications', [NotificationController::class, 'index']);
    Route::put('/notifications/{id}', [NotificationController::class, 'markAsRead']);
    Route::post('/notifications/mark-all-read', [NotificationController::class, 'markAllAsRead']);

    // Stock settings routes
    Route::get('/stock-settings', [StockSettingsController::class, 'index']);
    Route::put('/stock-settings', [StockSettingsController::class, 'update']);
});
