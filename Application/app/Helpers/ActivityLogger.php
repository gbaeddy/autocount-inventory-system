<?php

namespace App\Helpers;

use App\Models\ActivityLog;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class ActivityLogger
{
    /**
     * Log an activity
     *
     * @param string $tableName The name of the table being affected
     * @param string $action The type of action (CREATE, UPDATE, DELETE, etc.)
     * @param string $actionDesc A description of what happened
     * @param mixed $oldValue The old value (for updates)
     * @param mixed $newValue The new value (for updates)
     * @return void
     */
    public static function log($tableName, $action, $actionDesc, $oldValue = null, $newValue = null)
    {
        try {
            $user = Auth::user();

            // If no authenticated user, use system values
            $userData = [
                'staff_id' => $user ? $user->staff_id : 'SYSTEM',
                'username' => $user ? $user->username : 'SYSTEM',
                'role' => $user ? $user->role : 'SYSTEM'
            ];

            // Create log entry
            ActivityLog::create([
                'table_name' => $tableName,
                'staff_id' => $userData['staff_id'],
                'username' => $userData['username'],
                'role' => $userData['role'],
                'action' => $action,
                'actionDesc' => $actionDesc,
                'old_value' => $oldValue ? json_encode($oldValue) : null,
                'new_value' => $newValue ? json_encode($newValue) : null,
            ]);

        } catch (\Exception $e) {
            Log::error('Error creating activity log: ' . $e->getMessage());
            // Don't throw the exception - logging should not break the main application flow
        }
    }

    /**
     * Log a create action
     *
     * @param string $tableName
     * @param string $modelName
     * @param array $newData
     * @return void
     */
    public static function logCreate($tableName, $modelName, $newData)
    {
        self::log(
            $tableName,
            'CREATE',
            "{$modelName} was created",
            null,
            $newData
        );
    }

    /**
     * Log an update action
     *
     * @param string $tableName
     * @param string $modelName
     * @param array $oldData
     * @param array $newData
     * @return void
     */
    public static function logUpdate($tableName, $modelName, $oldData, $newData)
    {
        self::log(
            $tableName,
            'UPDATE',
            "{$modelName} was updated",
            $oldData,
            $newData
        );
    }

    /**
     * Log a delete action
     *
     * @param string $tableName
     * @param string $modelName
     * @param array $deletedData
     * @return void
     */
    public static function logDelete($tableName, $modelName, $deletedData)
    {
        self::log(
            $tableName,
            'DELETE',
            "{$modelName} was deleted",
            $deletedData,
            null
        );
    }

    /**
     * Log a status change
     *
     * @param string $tableName
     * @param string $modelName
     * @param string $oldStatus
     * @param string $newStatus
     * @return void
     */
    public static function logStatusChange($tableName, $modelName, $oldStatus, $newStatus)
    {
        self::log(
            $tableName,
            'STATUS_CHANGE',
            "{$modelName} status changed from {$oldStatus} to {$newStatus}",
            ['status' => $oldStatus],
            ['status' => $newStatus]
        );
    }

    /**
     * Log a login action
     *
     * @param string $username
     * @return void
     */
    public static function logLogin($username)
    {
        self::log(
            'users',
            'LOGIN',
            "User {$username} logged in",
            null,
            null
        );
    }

    /**
     * Log a logout action
     *
     * @param string $username
     * @return void
     */
    public static function logLogout($username)
    {
        self::log(
            'users',
            'LOGOUT',
            "User {$username} logged out",
            null,
            null
        );
    }
}
