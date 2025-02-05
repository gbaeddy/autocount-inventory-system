<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use App\Helpers\ActivityLogger;
use Illuminate\Support\Facades\DB;

class InventoryExportController extends Controller
{
    private $autocountUrl;

    public function __construct()
    {
        $this->autocountUrl = rtrim(env('AUTOCOUNT_API_URL', 'http://localhost:5000'), '/');
    }
    public function exportLowStock(Request $request)
    {
        try {
            $threshold = $request->input('threshold', 10);
            // Fetch threshold settings from the stock-settings API
            $thresholds = DB::table('stocksettings')->first();

            if (!$thresholds) {
                Log::error('Failed to fetch stock settings from database');
                throw new \Exception('Failed to fetch stock settings');
            }

            $thresholds = json_decode(json_encode($thresholds), true);

            $criticalThreshold = $thresholds['critical_threshold'];
            $lowThreshold = $thresholds['low_threshold'];
            $healthyThreshold = $thresholds['healthy_threshold'];

            // Get all items from AutoCount API
            $response = Http::get("{$this->autocountUrl}/api/stock/GetAllItemData");

            if (!$response->successful()) {
                Log::error('Failed to fetch items from AutoCount', [
                    'status' => $response->status(),
                    'response' => $response->body()
                ]);
                throw new \Exception('Failed to fetch items from AutoCount');
            }

            // Filter items based on dynamic thresholds
            $items = collect($response->json())
                ->filter(function ($item) use ($threshold) {
                    return $item['BalQty'] <= $threshold;
                })
                ->sortBy('BalQty')
                ->values();

            if ($items->isEmpty()) {
                return response()->json([
                    'message' => 'No low stock items found for the given threshold'
                ], 404);
            }

            // Prepare data for export
            $data = [
                ['Item Code', 'Description', 'Item Group', 'Item Type', 'Current Stock', 'Unit Price', 'UOM', 'Status']
            ];

            foreach ($items as $item) {
                $balQty = (float)$item['BalQty'];

                // Determine status based on dynamic thresholds
                $status = $balQty <= $criticalThreshold ? 'Critical' :
                         ($balQty <= $lowThreshold ? 'Low' :
                         ($balQty <= $healthyThreshold ? 'Low' : 'Healthy'));

                $data[] = [
                    $item['ItemCode'],
                    $item['Description'],
                    $item['ItemGroup'] ?? 'N/A',
                    $item['ItemType'] ?? 'N/A',
                    number_format($balQty, 2),
                    number_format((float)$item['Price'], 2),
                    $item['BaseUOM'] ?? 'N/A',
                    $status
                ];

                Log::debug('Processing item for export', [
                    'ItemCode' => $item['ItemCode'],
                    'BalQty' => $balQty,
                    'Status' => $status
                ]);
            }

            // Convert data to CSV
            $output = fopen('php://temp', 'r+');
            foreach ($data as $row) {
                fputcsv($output, $row);
            }
            rewind($output);
            $csv = stream_get_contents($output);
            fclose($output);

            // Log export activity
            ActivityLogger::log(
                'items',
                'EXPORT',
                sprintf("Low stock items report exported (%d items, threshold: %s)", $items->count(), $lowThreshold),
                null,
                [
                    'critical_threshold' => $criticalThreshold,
                    'low_threshold' => $lowThreshold,
                    'healthy_threshold' => $healthyThreshold,
                    'total_items' => $items->count(),
                ]
            );

            // Headers for file download
            $filename = 'low_stock_report_' . date('Y-m-d_His') . '.csv';
            $headers = [
                'Content-Type' => 'text/csv; charset=UTF-8',
                'Content-Disposition' => 'attachment; filename="' . $filename . '"',
                'Pragma' => 'no-cache',
                'Cache-Control' => 'must-revalidate, post-check=0, pre-check=0',
                'Expires' => '0',
                'X-Content-Type-Options' => 'nosniff',
                'Content-Security-Policy' => "default-src 'none'",
                'X-Frame-Options' => 'DENY'
            ];

            return response($csv, 200, $headers);

        } catch (\Exception $e) {
            Log::error('Error exporting low stock items', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json([
                'message' => 'Failed to export low stock items',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error'
            ], 500);
        }
    }

    // Helper method to format numbers
    private function formatNumber($value, $decimals = 2)
    {
        return number_format((float)$value, $decimals, '.', '');
    }
}
