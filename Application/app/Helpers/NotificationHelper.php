<?php

namespace App\Helpers;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class NotificationHelper
{
    public static function notifyAdmins($message, $data = null, $type = 'SYSTEM')
    {
        DB::beginTransaction();
        try {
            // Get users based on notification type
            $query = DB::table('users')
                ->where('reg_status', 'APPROVED');

            // For registration notifications, only notify ADMIN users
            if (stripos($message, 'registration') !== false) {
                $query->where('role', 'ADMIN');
            } else {
                // For other notifications, notify both ADMIN and OFFICE_STAFF
                $query->whereIn('role', ['ADMIN', 'OFFICE_STAFF']);
            }

            $adminUsers = $query->get();

            if ($adminUsers->isEmpty()) {
                Log::warning('No admin users found to notify');
                return false;
            }

            $notifications = [];
            $now = now();

            foreach ($adminUsers as $admin) {
                $notifications[] = [
                    'staff_id' => $admin->staff_id,
                    'message' => $message,
                    'notif_status' => 'unread',
                    'created_at' => $now,
                    'updated_at' => $now
                ];
            }

            // Insert all notifications
            DB::table('notifications')->insert($notifications);

            DB::commit();

            Log::info('Admin notifications sent successfully', [
                'recipient_count' => count($adminUsers),
                'message' => $message,
                'notification_type' => $type
            ]);

            return true;

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Failed to send admin notifications: ' . $e->getMessage(), [
                'exception' => $e,
                'message' => $message,
                'type' => $type
            ]);
            return false;
        }
    }

    public static function notifyUser($staffId, $message, $data = null, $type = 'USER')
    {
        DB::beginTransaction();
        try {
            // Verify user exists
            $userExists = DB::table('users')
                ->where('staff_id', $staffId)
                ->exists();

            if (!$userExists) {
                Log::warning('Attempted to notify non-existent user', ['staff_id' => $staffId]);
                DB::commit();
                return false;
            }

            $notificationData = [
                'staff_id' => $staffId,
                'message' => $message,
                'notif_status' => 'unread',
                'data' => is_array($data) ? json_encode($data) : $data,
                'notification_type' => $type,
                'created_at' => now(),
                'updated_at' => now()
            ];

            // Log before insertion
            Log::info('Attempting to insert user notification', [
                'notification_data' => $notificationData
            ]);

            // Insert notification
            $inserted = DB::table('notifications')->insert($notificationData);

            if (!$inserted) {
                throw new \Exception('Failed to insert user notification');
            }

            DB::commit();

            // Log success
            Log::info('Successfully sent user notification', [
                'staff_id' => $staffId,
                'message' => $message,
                'type' => $type
            ]);

            return true;

        } catch (\Exception $e) {
            DB::rollBack();

            Log::error('Failed to send user notification', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'staff_id' => $staffId,
                'message' => $message,
                'data' => $data
            ]);

            return false;
        }
    }
}
