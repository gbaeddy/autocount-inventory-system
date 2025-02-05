<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use App\Helpers\ActivityLogger;
use Illuminate\Support\Facades\Http;

class ItemController extends Controller
{
    private $autocountUrl;
    private $maxRetries = 3;
    private $timeout = 15; // seconds
    private $retryDelay = 1000; // milliseconds

    public function __construct()
    {
        // Get base URL from env with fallback
        $baseUrl = env('REACT_APP_AUTOCOUNT_API_URL', env('AUTOCOUNT_API_URL', 'http://localhost:5000'));
        $this->autocountUrl = rtrim($baseUrl, '/');
    }

    private function getApiEndpoint($path) 
    {
        return "/api/stock/{$path}";
    }

    public function index(Request $request)
    {
        try {
            // Fetch data from Autocount API with timeout and error handling
            $response = Http::timeout($this->timeout)
                ->get($this->autocountUrl . $this->getApiEndpoint('GetAllItemData'));

            if (!$response->successful()) {
                Log::error('Autocount API error response:', [
                    'status' => $response->status(),
                    'body' => $response->body()
                ]);
                return response()->json([
                    'message' => 'Failed to fetch items from Autocount',
                    'error' => $response->body()
                ], 500);
            }

            $autocountData = $response->json();

            // If Rows is not present or is not an array, check for different data structure
            if (!isset($autocountData['Rows']) || !is_array($autocountData['Rows'])) {

                // If the response is directly an array of items
                if (is_array($autocountData)) {
                    $items = collect($autocountData);
                } else {
                    Log::error('Unable to process Autocount data structure');
                    return response()->json([
                        'message' => 'Invalid data structure from Autocount',
                        'structure_received' => $autocountData
                    ], 500);
                }
            } else {
                $items = collect($autocountData['Rows']);
            }

            // Transform the data
            $transformedItems = $items->map(function ($row) {

                // Transform and validate each field
                $transformed = [
                    'ItemCode' => $this->getStringValue($row, 'ItemCode'),
                    'Description' => $this->getStringValue($row, 'Description'),
                    'ItemGroup' => $this->getStringValue($row, 'ItemGroup'),
                    'ItemType' => $this->getStringValue($row, 'ItemType'),
                    'StockControl' => $this->getStringValue($row, 'StockControl', 'F'),
                    'HasSerialNo' => $this->getStringValue($row, 'HasSerialNo', 'F'),
                    'HasBatchNo' => $this->getStringValue($row, 'HasBatchNo', 'F'),
                    'DutyRate' => $this->getFloatValue($row, 'DutyRate'),
                    'CostingMethod' => $this->getIntValue($row, 'CostingMethod'),
                    'SalesUOM' => $this->getStringValue($row, 'SalesUOM'),
                    'PurchaseUOM' => $this->getStringValue($row, 'PurchaseUOM'),
                    'BaseUOM' => $this->getStringValue($row, 'BaseUOM'),
                    'IsActive' => $this->getStringValue($row, 'IsActive', 'T'),
                    'Price' => $this->getFloatValue($row, 'Price'),
                    'BalQty' => $this->getFloatValue($row, 'BalQty'),
                    'TotalBalQty' => $this->getFloatValue($row, 'TotalBalQty'),
                ];

                return $transformed;
            });

            // Apply search filter if provided
            if ($request->has('search') && !empty($request->search)) {
                $searchTerm = trim(strtolower($request->search));
                $transformedItems = $transformedItems->filter(function ($item) use ($searchTerm) {
                    return str_contains(strtolower($item['ItemCode']), $searchTerm) ||
                        str_contains(strtolower($item['Description']), $searchTerm) ||
                        str_contains(strtolower($item['ItemGroup']), $searchTerm);
                });
            }

            // Sorting logic
            if ($request->has('sort_field') && $request->has('sort_direction')) {
                $sortField = $request->input('sort_field');
                $sortDirection = strtolower($request->input('sort_direction')) === 'desc' ? 'desc' : 'asc';

                if ($sortDirection === 'desc') {
                    $transformedItems = $transformedItems->sortByDesc($sortField);
                } else {
                    $transformedItems = $transformedItems->sortBy($sortField);
                }
            }

            // Filter by item group or item type if provided
            if ($request->has('item_group')) {
                $itemGroup = $request->input('item_group');
                $transformedItems = $transformedItems->filter(function ($item) use ($itemGroup) {
                    return $item['ItemGroup'] === $itemGroup;
                });
            }

            if ($request->has('item_type')) {
                $itemType = $request->input('item_type');
                $transformedItems = $transformedItems->filter(function ($item) use ($itemType) {
                    return $item['ItemType'] === $itemType;
                });
            }

            // Get total count
            $total = $transformedItems->count();

            // Apply pagination
            $perPage = max(1, intval($request->input('per_page', 10)));
            $page = max(1, intval($request->input('page', 1)));
            $skip = ($page - 1) * $perPage;

            $paginatedItems = $transformedItems->slice($skip, $perPage)->values();

            // Log final response
            Log::info('Sending response to client:', [
                'total_items' => $total,
                'items_in_page' => $paginatedItems->count(),
                'page' => $page,
                'per_page' => $perPage
            ]);

            return response()->json([
                'data' => $paginatedItems,
                'total' => $total,
                'current_page' => $page,
                'per_page' => $perPage,
                'last_page' => ceil($total / $perPage)
            ]);

        } catch (\Exception $e) {
            Log::error('Exception in ItemController@index:', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'line' => $e->getLine(),
                'file' => $e->getFile()
            ]);

            return response()->json([
                'message' => 'Failed to fetch and process items',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    // Helper methods for data transformation
    private function getStringValue($array, $key, $default = '')
    {
        return isset($array[$key]) && $array[$key] !== null ? (string) $array[$key] : $default;
    }

    private function getFloatValue($array, $key, $default = 0.0)
    {
        return isset($array[$key]) && $array[$key] !== null ? (float) $array[$key] : $default;
    }

    private function getIntValue($array, $key, $default = 0)
    {
        return isset($array[$key]) && $array[$key] !== null ? (int) $array[$key] : $default;
    }

    /**
     * Make request to AutoCount API with retry logic
     */
    private function makeAutocountRequest($method, $path, $data = null, $queryParams = [])
    {
        $attempt = 1;
        $lastException = null;
        $endpoint = $this->getApiEndpoint($path);
        $url = $this->autocountUrl . $endpoint;

        if (!empty($queryParams)) {
            $url .= '?' . http_build_query($queryParams);
        }

        while ($attempt <= $this->maxRetries) {
            try {
                $response = Http::withHeaders([
                    'Content-Type' => 'application/json',
                    'Accept' => 'application/json',
                    'Connection' => 'close' // Prevent keep-alive connections
                ])
                ->timeout($this->timeout)
                ->withOptions([
                    'verify' => false, // Skip SSL verification if needed
                    'connect_timeout' => 5 // Connection timeout
                ]);

                // Make the request based on method
                switch (strtoupper($method)) {
                    case 'GET':
                        $response = $response->get($url);
                        break;
                    case 'POST':
                        $response = $response->post($url, $data);
                        break;
                    case 'PUT':
                        $response = $response->put($url, $data);
                        break;
                    case 'DELETE':
                        $response = $response->delete($url);
                        break;
                    default:
                        throw new \Exception("Unsupported HTTP method: {$method}");
                }

                if ($response->successful()) {
                    return $response;
                }

                Log::warning("AutoCount API request failed (Attempt {$attempt}/{$this->maxRetries})", [
                    'url' => $url,
                    'method' => $method,
                    'status' => $response->status(),
                    'response' => $response->body()
                ]);

                $lastException = new \Exception($response->body());

            } catch (\Illuminate\Http\Client\ConnectionException $e) {
                Log::error("AutoCount API connection error (Attempt {$attempt}/{$this->maxRetries})", [
                    'url' => $url,
                    'error' => $e->getMessage()
                ]);
                $lastException = $e;
            } catch (\Exception $e) {
                Log::error("AutoCount API error (Attempt {$attempt}/{$this->maxRetries})", [
                    'url' => $url,
                    'error' => $e->getMessage()
                ]);
                $lastException = $e;
            }

            if ($attempt < $this->maxRetries) {
                $delay = $this->retryDelay * pow(2, $attempt - 1); // Exponential backoff
                usleep($delay * 1000); // Convert to microseconds
            }

            $attempt++;
        }

        throw $lastException ?? new \Exception('Failed to complete request after ' . $this->maxRetries . ' attempts');
    }

    public function store(Request $request)
    {
        try {
            Log::info('Received create item request:', [
                'request_data' => $request->all()
            ]);

            // Validation remains the same...
            $validator = Validator::make($request->all(), [
                'ItemCode' => 'required|string|max:30',
                'Description' => 'required|string|max:100',
                'ItemGroup' => 'required|string|max:8',
                'ItemType' => 'nullable|string|max:12',
                'StockControl' => 'required|in:T,F',
                'HasSerialNo' => 'required|in:T,F',
                'HasBatchNo' => 'required|in:T,F',
                'DutyRate' => 'required|numeric',
                'CostingMethod' => 'required|integer',
                'BaseUOM' => 'required|string|max:8',
                'IsActive' => 'required|in:T,F',
                'Price' => 'required|numeric',
                'BalQty' => 'required|numeric'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            // Check for duplicates...
            try {
                $existingItemsResponse = $this->makeAutocountRequest('GET', 'GetAllItemData');
                $existingItems = $existingItemsResponse->json();

                $isDuplicate = collect($existingItems)->contains(function ($item) use ($request) {
                    return strtolower($item['ItemCode']) === strtolower($request->ItemCode);
                });

                if ($isDuplicate) {
                    return response()->json([
                        'message' => 'Item Code already exists in AutoCount',
                        'error' => 'Duplicate ItemCode'
                    ], 422);
                }
            } catch (\Exception $e) {
                Log::error('Error checking for duplicate ItemCode:', [
                    'error' => $e->getMessage()
                ]);
                throw new \Exception('Failed to verify item uniqueness: ' . $e->getMessage());
            }

            // Prepare item data
            $itemData = [
                'ItemCode' => $request->ItemCode,
                'Description' => $request->Description,
                'ItemGroup' => $request->ItemGroup,
                'ItemType' => $request->ItemType,
                'StockControl' => $request->StockControl,
                'HasSerialNo' => $request->HasSerialNo,
                'HasBatchNo' => $request->HasBatchNo,
                'DutyRate' => (float) $request->DutyRate,
                'CostingMethod' => (int) $request->CostingMethod,
                'BaseUOM' => $request->BaseUOM,
                'IsActive' => $request->IsActive,
                'Price' => (float) $request->Price
            ];

            // Create item in AutoCount with quantity
            $quantity = (float) $request->BalQty;
            $response = $this->makeAutocountRequest(
                'POST',
                'CreateNewStockItem',
                $itemData,
                ['qty' => $quantity]
            );

            // Check response and get created item data
            if (!$response->successful()) {
                throw new \Exception('Failed to create item in AutoCount: ' . $response->body());
            }

            $createdItem = $response->json();

            // Verify the response contains the expected data
            if (!isset($createdItem['ItemCode'])) {
                Log::warning('Unexpected response format from AutoCount:', [
                    'response' => $createdItem
                ]);
                // Fall back to request data if response format is unexpected
                $createdItem = array_merge($itemData, ['BalQty' => $quantity]);
            }

            // Log the successful creation
            ActivityLogger::log(
                'items',
                'CREATE',
                "[{$request->ItemCode}] {$request->Description} item was created with quantity {$quantity}",
                null,
                $createdItem
            );

            return response()->json([
                'message' => 'Item created successfully',
                'item' => $createdItem
            ], 201);

        } catch (\Exception $e) {
            Log::error('Error creating item:', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'request_data' => $request->all()
            ]);

            $errorMessage = $this->getFormattedErrorMessage($e);
            return response()->json([
                'message' => 'Failed to create item',
                'error' => $errorMessage
            ], 500);
        }
    }

    private function getFormattedErrorMessage(\Exception $e)
    {
        if ($e instanceof \Illuminate\Http\Client\ConnectionException) {
            return 'Unable to connect to AutoCount service. Please try again later.';
        }

        if ($e instanceof \Illuminate\Http\Client\RequestException) {
            return 'Error communicating with AutoCount: ' . $e->getMessage();
        }

        return $e->getMessage();
    }

    public function update(Request $request, $itemCode)
    {
        try {
            Log::info('Received update item request:', [
                'itemCode' => $itemCode,
                'request_data' => $request->all()
            ]);

            // Validation remains the same...
            $validator = Validator::make($request->all(), [
                'Description' => 'required|string|max:100',
                'ItemGroup' => 'required|string|max:8',
                'ItemType' => 'nullable|string|max:12',
                'StockControl' => 'required|in:T,F',
                'HasSerialNo' => 'required|in:T,F',
                'HasBatchNo' => 'required|in:T,F',
                'DutyRate' => 'required|numeric',
                'CostingMethod' => 'required|integer',
                'BaseUOM' => 'required|string|max:8',
                'IsActive' => 'required|in:T,F',
                'Price' => 'required|numeric',
                'BalQty' => 'required|numeric'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            // Verify existing item and get current data
            $existingItemResponse = $this->makeAutocountRequest(
                'GET',
                'GetItemData',
                null,
                ['itemCode' => $itemCode]
            );

            if (!$existingItemResponse->successful()) {
                return response()->json([
                    'message' => 'Item not found in AutoCount',
                    'error' => 'Item does not exist'
                ], 404);
            }

            $existingItem = $existingItemResponse->json();

            // Calculate quantity difference
            $currentQty = (float) ($existingItem['BalQty'] ?? 0);
            $newQty = (float) $request->input('BalQty');
            $quantityDifference = $newQty - $currentQty;

            // Prepare update data
            $updateData = [
                'itemCode' => $itemCode,
                'description' => $request->input('Description'),
                'itemGroup' => $request->input('ItemGroup'),
                'itemType' => $request->input('ItemType'),
                'stockControl' => $request->input('StockControl'),
                'hasSerialNo' => $request->input('HasSerialNo'),
                'hasBatchNo' => $request->input('HasBatchNo'),
                'dutyRate' => (float) $request->input('DutyRate'),
                'costingMethod' => (int) $request->input('CostingMethod'),
                'baseUOM' => $request->input('BaseUOM'),
                'isActive' => $request->input('IsActive'),
                'price' => (float) $request->input('Price')
            ];

            // Update item in AutoCount
            $response = $this->makeAutocountRequest(
                'PUT',
                'EditStockItem',
                $updateData,
                [
                    'itemCode' => $itemCode,
                    'qty' => $quantityDifference
                ]
            );

            if (!$response->successful()) {
                throw new \Exception('Failed to update item in AutoCount: ' . $response->body());
            }

            // Get the updated item data
            $updatedItemResponse = $this->makeAutocountRequest(
                'GET',
                'GetItemData',
                null,
                ['itemCode' => $itemCode]
            );

            $updatedItem = $updatedItemResponse->successful()
                ? $updatedItemResponse->json()
                : array_merge($updateData, [
                    'ItemCode' => $itemCode,
                    'BalQty' => $newQty
                  ]);

            // Log the successful update
            ActivityLogger::log(
                'items',
                'UPDATE',
                "[{$itemCode}] {$request->input('Description')} item was updated",
                $existingItem,
                $updatedItem
            );

            return response()->json([
                'message' => 'Item updated successfully',
                'item' => $updatedItem
            ]);

        } catch (\Exception $e) {
            Log::error('Error updating item:', [
                'itemCode' => $itemCode,
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            $errorMessage = $this->getFormattedErrorMessage($e);
            return response()->json([
                'message' => 'Failed to update item',
                'error' => $errorMessage
            ], 500);
        }
    }

    public function destroy($itemCode)
    {
        DB::beginTransaction();
        try {
            // First verify item exists and get its details
            try {
                $existingItemResponse = $this->makeAutocountRequest(
                    'GET',
                    'GetItemData',
                    null,
                    ['itemCode' => $itemCode]
                );

                if (!$existingItemResponse->successful()) {
                    return response()->json([
                        'message' => 'Item not found',
                        'error' => 'Item does not exist in AutoCount'
                    ], 404);
                }

                $item = $existingItemResponse->json();
            } catch (\Exception $e) {
                Log::error('Error verifying item before deletion:', [
                    'itemCode' => $itemCode,
                    'error' => $e->getMessage()
                ]);
                throw new \Exception('Failed to verify item before deletion: ' . $e->getMessage());
            }

            // Check for associated product requests
            $matchingRequests = DB::table('product_requests')
                ->where('ItemCode', $itemCode)
                ->get();

            // Delete the item from AutoCount
            try {
                $deleteResponse = $this->makeAutocountRequest(
                    'DELETE',
                    'DeleteStockItem',
                    null,
                    ['itemCode' => $itemCode]
                );

                if (!$deleteResponse->successful()) {
                    throw new \Exception('Failed to delete item from AutoCount: ' .
                        ($deleteResponse->json()['Message'] ?? 'Unknown error'));
                }
            } catch (\Exception $e) {
                DB::rollBack();
                throw new \Exception('Failed to delete item from AutoCount: ' . $e->getMessage());
            }

            // Delete associated product requests if they exist
            if ($matchingRequests->isNotEmpty()) {
                $deletedRequestCount = $matchingRequests->count();

                DB::table('product_requests')
                    ->where('ItemCode', $itemCode)
                    ->delete();

                Log::info('Deleted associated product requests', [
                    'ItemCode' => $itemCode,
                    'deletedRequestCount' => $deletedRequestCount
                ]);
            }

            // Log the activity after successful deletion
            ActivityLogger::log(
                'items',
                'DELETE',
                "[{$itemCode}] " . ($item['Description'] ?? 'Unknown item') . " was deleted",
                $item,
                null
            );

            DB::commit();

            return response()->json([
                'message' => 'Item deleted successfully',
                'itemCode' => $itemCode,
                'deletedRequestsCount' => $matchingRequests->count()
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error deleting item:', [
                'itemCode' => $itemCode,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            $errorMessage = $this->getFormattedErrorMessage($e);

            if ($e instanceof \Illuminate\Http\Client\ConnectionException) {
                return response()->json([
                    'message' => 'Cannot connect to AutoCount service',
                    'error' => $errorMessage
                ], 503);
            }

            return response()->json([
                'message' => 'Failed to delete item',
                'error' => $errorMessage
            ], 500);
        }
    }
}
