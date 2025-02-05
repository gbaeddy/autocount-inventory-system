<?php

namespace App\Http\Controllers;

use App\Models\StockSettings;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use App\Helpers\ActivityLogger;

class StockSettingsController extends Controller
{
    public function index()
    {
        try {
            $settings = StockSettings::first();
            return response()->json($settings);
        } catch (\Exception $e) {
            Log::error('Error fetching stock settings: ' . $e->getMessage());
            return response()->json(['message' => 'Failed to fetch stock settings'], 500);
        }
    }

    public function update(Request $request)
    {
        try {
            $validated = $request->validate([
                'critical_threshold' => 'required|numeric|min:0',
                'low_threshold' => 'required|numeric|min:0',
                'healthy_threshold' => 'required|numeric|min:0',
            ]);

            if ($validated['critical_threshold'] > $validated['low_threshold']) {
                return response()->json([
                    'message' => 'Critical threshold must be less than low threshold'
                ], 422);
            }

            if ($validated['low_threshold'] > $validated['healthy_threshold']) {
                return response()->json([
                    'message' => 'Low threshold must be less than healthy threshold'
                ], 422);
            }

            $settings = StockSettings::first();
            $oldSettings = $settings->toArray();
            
            $settings->update([
                ...$validated,
                'updated_by' => $request->user()->staff_id
            ]);

            ActivityLogger::log(
                'stocksettings',
                'UPDATE',
                'Stock level thresholds updated',
                $oldSettings,
                $settings->toArray()
            );

            return response()->json([
                'message' => 'Stock settings updated successfully',
                'settings' => $settings
            ]);
        } catch (\Exception $e) {
            Log::error('Error updating stock settings: ' . $e->getMessage());
            return response()->json(['message' => 'Failed to update stock settings'], 500);
        }
    }
}