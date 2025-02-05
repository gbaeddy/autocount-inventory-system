<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;
use App\Http\Controllers\Controller;

class ActivityLogController extends Controller
{
    public function index(Request $request)
    {
        try {
            // Build base query
            $query = DB::table('activitylogs');

            // Apply filters
            if ($request->filled('action')) {
                $query->where('action', $request->input('action'));
            }

            if ($request->filled('username')) {
                $query->where('username', 'like', '%' . $request->input('username') . '%');
            }

            if ($request->filled('date_from')) {
                $query->whereDate('created_at', '>=', $request->input('date_from'));
            }

            if ($request->filled('date_to')) {
                $query->whereDate('created_at', '<=', $request->input('date_to'));
            }

            // Get total count before pagination
            $total = $query->count();

            // Apply sorting
            $sortField = $request->input('sort_by', 'created_at');
            $sortDirection = $request->input('sort_direction', 'desc');
            $query->orderBy($sortField, $sortDirection);

            // Apply pagination
            $page = max(1, intval($request->input('page', 1)));
            $perPage = max(1, intval($request->input('per_page', 15)));
            $skip = ($page - 1) * $perPage;

            $logs = $query->skip($skip)
                         ->take($perPage)
                         ->get();

            // Format the response
            return response()->json([
                'current_page' => $page,
                'data' => $logs,
                'total' => $total,
                'per_page' => $perPage,
                'last_page' => ceil($total / $perPage)
            ]);

        } catch (\Exception $e) {
            Log::error('Error in ActivityLogController@index: ' . $e->getMessage());
            return response()->json([
                'message' => 'Failed to fetch activity logs',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function getActionTypes()
    {
        try {
            $types = DB::table('activitylogs')
                ->select('action')
                ->distinct()
                ->whereNotNull('action')
                ->orderBy('action')
                ->pluck('action');

            return response()->json($types);

        } catch (\Exception $e) {
            Log::error('Error in ActivityLogController@getActionTypes: ' . $e->getMessage());
            return response()->json([
                'message' => 'Failed to fetch action types',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function getStatistics()
    {
        try {
            // Use proper SQL Server date functions for compatibility
            $today = now()->format('Y-m-d');
            $weekStart = now()->startOfWeek()->format('Y-m-d');
            $weekEnd = now()->endOfWeek()->format('Y-m-d');

            // Get total logs
            $totalLogs = DB::table('activitylogs')->count();

            // Get today's logs
            $logsToday = DB::table('activitylogs')
                ->whereRaw('CAST(created_at AS DATE) = ?', [$today])
                ->count();

            // Get this week's logs
            $logsThisWeek = DB::table('activitylogs')
                ->whereRaw('CAST(created_at AS DATE) BETWEEN ? AND ?', [$weekStart, $weekEnd])
                ->count();

            // Get most common action
            $mostCommonAction = DB::table('activitylogs')
                ->select('action', DB::raw('COUNT(*) as total'))
                ->groupBy('action')
                ->orderByRaw('COUNT(*) DESC')
                ->first();

            // Get daily activity for last 7 days
            $dailyActivity = DB::table('activitylogs')
                ->select(
                    DB::raw('CAST(created_at AS DATE) as date'),
                    DB::raw('COUNT(*) as total')
                )
                ->where('created_at', '>=', now()->subDays(7)->startOfDay())
                ->groupBy(DB::raw('CAST(created_at AS DATE)'))
                ->orderBy('date', 'desc')
                ->get();

            $stats = [
                'total_logs' => $totalLogs,
                'logs_today' => $logsToday,
                'logs_this_week' => $logsThisWeek,
                'most_common_action' => $mostCommonAction ? [
                    'action' => $mostCommonAction->action,
                    'count' => $mostCommonAction->total
                ] : null,
                'daily_activity' => $dailyActivity->mapWithKeys(function ($item) {
                    return [$item->date => $item->total];
                })
            ];

            return response()->json($stats);

        } catch (\Exception $e) {
            Log::error('Error in ActivityLogController@getStatistics: ' . $e->getMessage());
            return response()->json([
                'message' => 'Failed to fetch statistics',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
