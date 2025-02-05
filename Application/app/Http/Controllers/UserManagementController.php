<?php

namespace App\Http\Controllers;

use App\Enums\UserRole;
use App\Enums\REG_status;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Hash;
use App\Helpers\ActivityLogger;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Validator;
use App\Events\UserStatusChanged;

class UserManagementController extends Controller
{
    public function getUsersByRole(Request $request, ?string $role = null)
    {
        try {
            $query = DB::table('users')
                ->select('staff_id', 'username', 'email', 'reg_status', 'role', 'created_at', 'updated_at'); // Added timestamp fields

            if ($role === 'PENDING') {
                $query->where('reg_status', 'PENDING');
            }

            if ($search = $request->input('search')) {
                $query->where(function($q) use ($search) {
                    $q->where('staff_id', 'LIKE', "%{$search}%")
                      ->orWhere('username', 'LIKE', "%{$search}%")
                      ->orWhere('email', 'LIKE', "%{$search}%");
                });
            }

            $users = $query->take(100)->get();

            // Format dates for each user
            $users = $users->map(function($user) {
                $user->created_at = $user->created_at ? date('Y-m-d H:i:s', strtotime($user->created_at)) : null;
                $user->updated_at = $user->updated_at ? date('Y-m-d H:i:s', strtotime($user->updated_at)) : null;
                return $user;
            });

            return response()->json($users);
        } catch (\Exception $e) {
            Log::error('Error fetching users', ['error' => $e->getMessage()]);
            return response()->json(['message' => 'Failed to fetch users'], 500);
        }
    }

    public function getAllUsers(Request $request)
    {
        try {
            $currentUser = $request->user();

            $query = DB::table('users')
                ->select(
                    'staff_id',
                    'username',
                    'email',
                    'role',
                    'reg_status',
                    'created_at',
                    'updated_at'
                )
                ->where('role', '!=', 'ADMIN')
                ->where('staff_id', '!=', $currentUser->staff_id);

            // Apply reg_status filter if provided
            if ($request->has('reg_status')) {
                $query->where('reg_status', $request->reg_status);
            }

            // Apply search if provided
            if ($search = $request->input('search')) {
                $query->where(function($q) use ($search) {
                    $q->where('staff_id', 'LIKE', "%{$search}%")
                      ->orWhere('username', 'LIKE', "%{$search}%")
                      ->orWhere('email', 'LIKE', "%{$search}%");
                });
            }

            // Apply role filter if provided
            if ($request->has('role')) {
                $query->where('role', $request->role);
            }

            // Apply sorting if provided
            if ($request->has('sort_field') && $request->has('sort_order')) {
                $sortField = $request->input('sort_field');
                $sortOrder = $request->input('sort_order');

                // Convert frontend sort order to database sort order
                $dbSortOrder = $sortOrder === 'ascend' ? 'asc' :
                              ($sortOrder === 'descend' ? 'desc' : 'desc');

                $query->orderBy($sortField, $dbSortOrder);
            } else {
                $query->orderBy('created_at', 'desc'); // Default sorting
            }

            // Get total count before pagination
            $total = $query->count();

            // Apply pagination
            $perPage = $request->input('per_page', 10);
            $page = $request->input('page', 1);
            $skip = ($page - 1) * $perPage;

            $users = $query->skip($skip)
                          ->take($perPage)
                          ->get();

            // Format dates for each user
            $users = $users->map(function($user) {
                $user->created_at = $user->created_at ? date('Y-m-d H:i:s', strtotime($user->created_at)) : null;
                $user->updated_at = $user->updated_at ? date('Y-m-d H:i:s', strtotime($user->updated_at)) : null;
                return $user;
            });

            return response()->json([
                'data' => $users,
                'total' => $total,
                'current_page' => (int)$page,
                'per_page' => (int)$perPage,
                'last_page' => ceil($total / $perPage)
            ]);

        } catch (\Exception $e) {
            Log::error('Error fetching users', ['error' => $e->getMessage()]);
            return response()->json(['message' => 'Failed to fetch users'], 500);
        }
    }

    public function updateUserStatus(Request $request, string $staff_id)
    {
        try {
            // Validation
            $validator = Validator::make($request->all(), [
                'reg_status' => ['required', 'in:PENDING,APPROVED,REJECTED']
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'message' => 'Invalid status provided',
                    'errors' => $validator->errors()
                ], 422);
            }

            $newStatus = $request->reg_status;

            DB::beginTransaction();

            $user = DB::table('users')
                ->select(['staff_id', 'username', 'email', 'reg_status'])
                ->where('staff_id', $staff_id)
                ->lockForUpdate()
                ->first();

            if (!$user) {
                DB::rollBack();
                return response()->json(['message' => 'User not found'], 404);
            }

            if ($user->reg_status === $newStatus) {
                DB::rollBack();
                return response()->json([
                    'message' => 'Status is already ' . $newStatus
                ], 422);
            }

            $oldStatus = $user->reg_status;

            // Update status
            $updated = DB::table('users')
                ->where('staff_id', $staff_id)
                ->update([
                    'reg_status' => $newStatus,
                    'updated_at' => now()
                ]);

            if (!$updated) {
                DB::rollBack();
                return response()->json(['message' => 'No changes were made'], 422);
            }

            // Log the status change
            ActivityLogger::log(
                'users',
                'STATUS_CHANGE',
                "User status changed from {$oldStatus} to {$newStatus}",
                ['staff_id' => $staff_id],
                ['new_status' => $newStatus]
            );

            // Dispatch the event (now queued)
            UserStatusChanged::dispatch([
                'username' => $user->username,
                'email' => $user->email,
                'newStatus' => $newStatus
            ]);

            DB::commit();

            return response()->json([
                'message' => 'User status updated successfully',
                'old_status' => $oldStatus,
                'new_status' => $newStatus
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Status update failed', [
                'error' => $e->getMessage(),
                'staff_id' => $staff_id
            ]);

            return response()->json([
                'message' => 'Failed to update user status',
                'error' => config('app.debug') ? $e->getMessage() : null
            ], 500);
        }
    }

    public function createUser(Request $request)
    {
        try {
            $validatedData = $request->validate([
                'staff_id' => 'required|unique:users,staff_id',
                'username' => 'required|unique:users,username',
                'email' => 'required|email|unique:users,email',
                'password' => 'required|min:8',
                'role' => 'required|in:' . implode(',', array_column(UserRole::cases(), 'value')),
                'reg_status' => 'required|in:' . implode(',', array_column(REG_status::cases(), 'value')),
            ]);

            DB::beginTransaction();

            $validatedData['password'] = Hash::make($validatedData['password']);
            $validatedData['created_at'] = now();
            $validatedData['updated_at'] = now();

            $userId = DB::table('users')->insertGetId($validatedData);

            // Log user creation with detailed information
            ActivityLogger::log(
                'users',
                'CREATE',
                "User [{$validatedData['staff_id']}] {$validatedData['username']} created with role {$validatedData['role']} and status {$validatedData['reg_status']}",
                null,
                array_diff_key($validatedData, ['password' => '']) // Exclude password from log
            );

            DB::commit();

            $user = DB::table('users')->where('id', $userId)->first();

            return response()->json([
                'message' => 'User created successfully',
                'user' => $user
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error creating user', ['error' => $e->getMessage()]);
            return response()->json([
                'message' => 'Failed to create user',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function updateUser(Request $request, string $staff_id)
    {
        try {
            DB::beginTransaction();

            $user = DB::table('users')->where('staff_id', $staff_id)->first();

            if (!$user) {
                return response()->json(['message' => 'User not found'], 404);
            }

            // Validate the request with unique checks that exclude the current user
            $validatedData = $request->validate([
                'username' => [
                    'required',
                    Rule::unique('users')->ignore($user->id)
                ],
                'email' => [
                    'required',
                    'email',
                    Rule::unique('users')->ignore($user->id)
                ],
                'role' => 'required|in:' . implode(',', array_column(UserRole::cases(), 'value')),
                'reg_status' => 'required|in:' . implode(',', array_column(REG_status::cases(), 'value')),
            ]);

            $oldData = (array)$user;
            $validatedData['updated_at'] = now();

            DB::table('users')
                ->where('staff_id', $staff_id)
                ->update($validatedData);

            // Log user update with detailed changes
            $changes = [];
            if ($oldData['username'] !== $validatedData['username']) {
                $changes[] = "username from {$oldData['username']} to {$validatedData['username']}";
            }
            if ($oldData['email'] !== $validatedData['email']) {
                $changes[] = "email from {$oldData['email']} to {$validatedData['email']}";
            }
            if ($oldData['role'] !== $validatedData['role']) {
                $changes[] = "role from {$oldData['role']} to {$validatedData['role']}";
            }
            if ($oldData['reg_status'] !== $validatedData['reg_status']) {
                $changes[] = "status from {$oldData['reg_status']} to {$validatedData['reg_status']}";
            }

            ActivityLogger::log(
                'users',
                'UPDATE',
                "User [{$staff_id}] updated - Changed " . implode(' and ', $changes),
                $oldData,
                array_merge(['staff_id' => $staff_id], $validatedData)
            );

            DB::commit();

            $updatedUser = DB::table('users')
                ->select('staff_id', 'username', 'email', 'role', 'reg_status')
                ->where('staff_id', $staff_id)
                ->first();

            return response()->json([
                'message' => 'User updated successfully',
                'user' => $updatedUser
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error updating user', ['error' => $e->getMessage()]);
            return response()->json([
                'message' => 'Failed to update user',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function deleteUser(string $staff_id)
    {
        try {
            DB::beginTransaction();

            $user = DB::table('users')->where('staff_id', $staff_id)->first();

            if (!$user) {
                return response()->json(['message' => 'User not found'], 404);
            }

            DB::table('users')->where('staff_id', $staff_id)->delete();

            // Log user deletion with full user details
            ActivityLogger::log(
                'users',
                'DELETE',
                "User [{$staff_id}] {$user->username} with role {$user->role} was deleted",
                (array)$user,
                null
            );

            DB::commit();

            return response()->json(['message' => 'User deleted successfully']);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error deleting user', ['error' => $e->getMessage()]);
            return response()->json([
                'message' => 'Failed to delete user',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
