<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use App\Helpers\ActivityLogger;
use Illuminate\Support\Facades\Http;

class ProductRequestController extends Controller
{
    private $autocountUrl;

    public function __construct()
    {
        $this->autocountUrl = rtrim(env('AUTOCOUNT_API_URL', 'http://localhost:5000'), '/');
    }

    private function notifyAdmins($message)
    {
        try {
            // Get all admin and office staff users
            $admins = DB::table('users')
                ->where('role', 'ADMIN')
                ->orWhere('role', 'OFFICE_STAFF')
                ->get();

            foreach ($admins as $admin) {
                DB::table('notifications')->insert([
                    'staff_id' => $admin->staff_id,
                    'message' => $message,
                    'notif_status' => 'unread',
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }
        } catch (\Exception $e) {
            Log::error('Failed to send admin notifications: ' . $e->getMessage());
        }
    }
    public function index(Request $request)
    {
        try {
            $query = DB::table('product_requests')
                ->join('users', 'product_requests.staff_id', '=', 'users.staff_id')
                ->select('product_requests.*', 'users.username', 'product_requests.ItemCode');

            // Check if the user is an admin, office staff
            $user = $request->user();
            $isAdmin = $user->role === 'ADMIN' || $user->role === 'OFFICE_STAFF';

            // If not an admin, filter by the current user's staff_id
            if (!$isAdmin) {
                $query->where('product_requests.staff_id', $user->staff_id);
            }

            // Apply filters
            if ($request->has('status')) {
                $query->where('product_requests.request_status', $request->status);
            }

            if ($request->has('search')) {
                $search = $request->input('search');
                $query->where(function ($q) use ($search) {
                    $q->where('product_requests.ItemCode', 'like', "%{$search}%")
                        ->orWhere('users.username', 'like', "%{$search}%");
                });
            }

            // Get total count before pagination
            $total = $query->count();

            // Apply sorting
            $sortField = $request->input('sort_by', 'created_at');
            $sortDirection = $request->input('sort_direction', 'desc');
            $query->orderBy($sortField, $sortDirection);

            // Apply pagination
            $perPage = max(1, intval($request->input('per_page', 10)));
            $page = max(1, intval($request->input('page', 1)));

            // Get paginated results
            $requests = $query
                ->skip(($page - 1) * $perPage)
                ->take($perPage)
                ->get();

            // Fetch all items from AutoCount once
            $response = Http::get("{$this->autocountUrl}/api/stock/GetAllItemData");
            if ($response->successful()) {
                $items = collect($response->json());

                // Add item descriptions to each request
                $requests = $requests->map(function ($request) use ($items) {
                    $item = $items->firstWhere('ItemCode', $request->ItemCode);
                    $request->ItemDescription = $item ? $item['Description'] : null;
                    return $request;
                });
            }

            return response()->json([
                'data' => $requests,
                'total' => $total,
                'current_page' => $page,
                'per_page' => $perPage,
                'last_page' => ceil($total / $perPage)
            ]);

        } catch (\Exception $e) {
            Log::error('Error fetching product requests: ' . $e->getMessage());
            return response()->json([
                'message' => 'Failed to fetch product requests',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function show($id)
{
    try {
        $request = DB::table('product_requests')
            ->join('users', 'product_requests.staff_id', '=', 'users.staff_id')
            ->select('product_requests.*', 'users.username')
            ->where('product_requests.id', $id)
            ->first();

        if (!$request) {
            return response()->json(['message' => 'Product request not found'], 404);
        }

        // Fetch item details from AutoCount
        $response = Http::get("{$this->autocountUrl}/api/stock/GetAllItemData");
        if ($response->successful()) {
            $items = collect($response->json());
            $item = $items->firstWhere('ItemCode', $request->ItemCode);
            $request->ItemDescription = $item ? $item['Description'] : null;
        }

        return response()->json($request);
    } catch (\Exception $e) {
        Log::error('Error fetching product request: ' . $e->getMessage());
        return response()->json([
            'message' => 'Failed to fetch product request',
            'error' => $e->getMessage()
        ], 500);
    }
}

    public function store(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'ItemCode' => 'required|string',
                'quantity' => 'required|integer|min:1',
                'description' => 'required|string',
                'staff_id' => 'required|exists:users,staff_id',
            ]);

            if ($validator->fails()) {
                return response()->json(['errors' => $validator->errors()], 422);
            }

            DB::beginTransaction();

            try {
                // Fetch item details from the AutoCount API
                $response = Http::get("{$this->autocountUrl}/api/stock/GetAllItemData");

                if (!$response->successful()) {
                    return response()->json([
                        'message' => 'Failed to fetch item data from AutoCount',
                        'error' => $response->body()
                    ], 500);
                }

                // Assuming the response is an array of items
                $autoCountData = $response->json();

                // Find the item based on ItemCode
                $item = collect($autoCountData)->firstWhere('ItemCode', $request->ItemCode);

                if (!$item) {
                    return response()->json(['message' => 'Item not found in AutoCount'], 404);
                }

                $requestData = [
                    'staff_id' => $request->staff_id,
                    'ItemCode' => $item['ItemCode'],
                    'quantity' => $request->quantity,
                    'description' => $request->description,
                    'request_date' => now(),
                    'request_status' => 'PENDING',
                    'created_at' => now(),
                    'updated_at' => now(),
                ];

                $id = DB::table('product_requests')->insertGetId($requestData);

                $user = DB::table('users')->where('staff_id', $request->staff_id)->first();

                ActivityLogger::log(
                    'product_requests',
                    'CREATE',
                    "Request #{$id}: [{$item['ItemCode']}] {$item['Description']} - Quantity: {$request->quantity} was requested by {$user->username}",
                    null,
                    $requestData
                );

                $notificationMessage = "New product request (ID: {$id}) from {$user->username} for {$item['ItemCode']} - {$item['Description']} (Qty: {$request->quantity})";

                $this->notifyAdmins($notificationMessage);

                DB::commit();

                return response()->json([
                    'message' => 'Product request created successfully',
                    'id' => $id
                ], 201);
            } catch (\Exception $e) {
                DB::rollBack();
                Log::error('Error creating product request: ' . $e->getMessage());
                return response()->json(['message' => 'Failed to create product request'], 500);
            }
        } catch (\Exception $e) {
            Log::error('Error creating product request: ' . $e->getMessage());
            return response()->json(['message' => 'Failed to create product request'], 500);
        }
    }

    public function update(Request $request, $id)
    {
        try {
            DB::beginTransaction();

            // Get the current request with related data
            $currentRequest = DB::table('product_requests')
                ->join('users', 'product_requests.staff_id', '=', 'users.staff_id')
                ->select(
                    'product_requests.*',
                    'users.username'
                )
                ->where('product_requests.id', $id)
                ->first();

            if (!$currentRequest) {
                return response()->json(['message' => 'Product request not found'], 404);
            }

            $validator = Validator::make($request->all(), [
                'request_status' => 'sometimes|required|in:PENDING,APPROVED,REJECTED',
                'comment' => 'sometimes|nullable|string',
            ]);

            if ($validator->fails()) {
                return response()->json(['errors' => $validator->errors()], 422);
            }

            $updateData = array_filter($request->only(['request_status', 'comment']));
            $updateData['updated_at'] = now();

            try {
                if (isset($updateData['request_status'])) {
                    $newStatus = $updateData['request_status'];

                    if ($newStatus === 'APPROVED') {
                        // Fetch item details from the AutoCount API
                        $response = Http::timeout(5)->get("{$this->autocountUrl}/api/stock/GetAllItemData");

                        if (!$response->successful()) {
                            DB::rollBack();
                            return response()->json(['message' => 'Failed to fetch item details from Autocount'], 404);
                        }

                        $items = $response->json();
                        $item = collect($items)->firstWhere('ItemCode', $currentRequest->ItemCode);

                        if (!$item) {
                            DB::rollBack();
                            return response()->json(['message' => 'Item not found in Autocount'], 404);
                        }

                        $requestedQuantity = (float) $currentRequest->quantity;
                        $currentBalQty = (float) $item['BalQty'];

                        // Verify sufficient stock
                        if ($currentBalQty < $requestedQuantity) {
                            DB::rollBack();
                            return response()->json([
                                'message' => 'Insufficient inventory',
                                'available' => $currentBalQty,
                                'requested' => $requestedQuantity
                            ], 400);
                        }

                        // Prepare the stock item data
                        $stockItemData = [
                            'ItemCode' => $item['ItemCode'],
                            'Description' => $item['Description'],
                            'ItemGroup' => $item['ItemGroup'],
                            'ItemType' => $item['ItemType'],
                            'StockControl' => $item['StockControl'],
                            'HasSerialNo' => $item['HasSerialNo'],
                            'HasBatchNo' => $item['HasBatchNo'],
                            'DutyRate' => $item['DutyRate'],
                            'CostingMethod' => $item['CostingMethod'],
                            'BaseUOM' => $item['BaseUOM'],
                            'IsActive' => $item['IsActive'],
                            'Price' => $item['Price'],
                            'BalQty' => $currentBalQty // Include current BalQty
                        ];

                        // Build the URL with itemCode and qty as query parameters
                        $baseUrl = "{$this->autocountUrl}/api/stock/EditStockItem";
                        $url = $baseUrl . "?itemCode=" . urlencode($item['ItemCode']) . "&qty=" . (-$requestedQuantity);

                        // Log the request details
                        Log::info('AutoCount update request:', [
                            'url' => $url,
                            'stockItemData' => $stockItemData
                        ]);

                        // Make PUT request
                        $updateResponse = Http::put($url, $stockItemData);

                        // Log the response
                        Log::info('AutoCount API Response:', [
                            'status' => $updateResponse->status(),
                            'body' => $updateResponse->body()
                        ]);

                        if (!$updateResponse->successful()) {
                            DB::rollBack();
                            Log::error('Failed to update AutoCount stock:', [
                                'response' => $updateResponse->body(),
                                'status' => $updateResponse->status()
                            ]);
                            return response()->json([
                                'message' => 'Failed to update stock in Autocount',
                                'error' => $updateResponse->body()
                            ], 500);
                        }

                        // Send notification to user about approval
                        $approvalMessage = "Request #{$id} - Your request for {$item['Description']} (Quantity: {$currentRequest->quantity}) has been APPROVED.";
                        if ($request->comment) {
                            $approvalMessage .= " Comment: {$request->comment}";
                        }

                        DB::table('notifications')->insert([
                            'staff_id' => $currentRequest->staff_id,
                            'message' => $approvalMessage,
                            'notif_status' => 'unread',
                            'created_at' => now(),
                            'updated_at' => now(),
                        ]);

                        $logMessage = "Request #{$id}: [{$currentRequest->ItemCode}] {$item['Description']} - Quantity: {$currentRequest->quantity} was APPROVED for {$currentRequest->username}";

                    } elseif ($newStatus === 'REJECTED') {
                        // Fetch item details for the message
                        $response = Http::get("{$this->autocountUrl}/api/stock/GetAllItemData");
                        $items = $response->successful() ? $response->json() : [];
                        $item = collect($items)->firstWhere('ItemCode', $currentRequest->ItemCode);
                        $itemDescription = $item ? $item['Description'] : $currentRequest->ItemCode;

                        // Send notification to user about rejection
                        $rejectionMessage = "Request #{$id} - Your request for {$itemDescription} (Quantity: {$currentRequest->quantity}) has been REJECTED.";
                        if ($request->comment) {
                            $rejectionMessage .= " Comment: {$request->comment}";
                        }

                        DB::table('notifications')->insert([
                            'staff_id' => $currentRequest->staff_id,
                            'message' => $rejectionMessage,
                            'notif_status' => 'unread',
                            'created_at' => now(),
                            'updated_at' => now(),
                        ]);

                        $logMessage = "Request #{$id}: [{$currentRequest->ItemCode}] {$itemDescription} - Quantity: {$currentRequest->quantity} was REJECTED for {$currentRequest->username}";
                    } else {
                        $logMessage = "Request #{$id}: [{$currentRequest->ItemCode}] status was updated";
                    }

                    // Update request status
                    DB::table('product_requests')
                        ->where('id', $id)
                        ->update($updateData);

                    ActivityLogger::log(
                        'product_requests',
                        'UPDATE',
                        $logMessage,
                        (array) $currentRequest,
                        $updateData
                    );

                    DB::commit();

                    return response()->json([
                        'message' => 'Product request updated successfully',
                        'status' => $newStatus
                    ]);
                }
            } catch (\Exception $e) {
                DB::rollBack();
                throw $e;
            }
        } catch (\Exception $e) {
            Log::error('Error updating product request: ' . $e->getMessage());
            return response()->json(['message' => 'Failed to update product request'], 500);
        }
    }
}
