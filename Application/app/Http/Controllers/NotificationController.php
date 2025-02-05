<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class NotificationController extends Controller
{
    public function index(Request $request)
    {
        $user = Auth::user();
        $query = DB::table('notifications')->where('staff_id', $user->staff_id);

        if ($request->has('status')) {
            if ($request->status === 'unread') {
                $query->where('notif_status', 'unread');
            } elseif ($request->status === 'read') {
                $query->where('notif_status', 'read');
            }
        }

        if ($request->has('start_date') && $request->has('end_date')) {
            $query->whereBetween('created_at', [$request->start_date, $request->end_date]);
        }

        $notifications = $query->orderBy('created_at', 'desc')->get();

        return response()->json($notifications);
    }

    public function markAsRead($id)
    {
        $user = Auth::user();
        $updated = DB::table('notifications')
            ->where('notif_id', $id)
            ->where('staff_id', $user->staff_id)
            ->update(['notif_status' => 'read', 'updated_at' => now()]);

        if ($updated) {
            return response()->json(['message' => 'Notification marked as read']);
        } else {
            return response()->json(['message' => 'Notification not found'], 404);
        }
    }
    public function markAllAsRead()
{
    $user = Auth::user();
    Log::info("Attempting to mark all notifications as read for user: {$user->staff_id}");

    try {
        DB::beginTransaction();

        $updatedCount = DB::table('notifications')
            ->where('staff_id', $user->staff_id)
            ->where('notif_status', 'unread')
            ->update([
                'notif_status' => 'read',
                'updated_at' => now()
            ]);

        DB::commit();

        Log::info("Successfully marked {$updatedCount} notifications as read for user {$user->staff_id}");

        return response()->json([
            'message' => 'All notifications marked as read',
            'updated_count' => $updatedCount
        ]);
    } catch (\Exception $e) {
        DB::rollBack();
        Log::error("Error marking notifications as read for user {$user->staff_id}: " . $e->getMessage());
        Log::error($e->getTraceAsString());
        return response()->json(['message' => 'Failed to mark notifications as read: ' . $e->getMessage()], 500);
    }
}
}
