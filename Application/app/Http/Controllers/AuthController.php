<?php

namespace App\Http\Controllers;

use App\Models\Users;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
use App\Helpers\ActivityLogger;
use App\Helpers\NotificationHelper;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        // Start transaction
        DB::beginTransaction();

        try {
            // Validate the request
            $validated = $request->validate([
                'staff_id' => 'required|unique:users,staff_id',
                'username' => 'required|string|max:255',
                'email' => 'required|string|email|max:255|unique:users',
                'password' => 'required|string|min:8|confirmed',
                'role' => 'required|in:SALESPERSON,OFFICE_STAFF',
            ]);

            // Create the user
            $user = new Users();
            $user->staff_id = $validated['staff_id'];
            $user->username = $validated['username'];
            $user->email = $validated['email'];
            $user->password = Hash::make($validated['password']);
            $user->role = $validated['role'];
            $user->reg_status = 'PENDING';
            $user->save();

            // Create notification message
            $notificationMessage = sprintf(
                "New user registration requires approval:\nStaff ID: %s\nUsername: %s\nRole: %s",
                $user->staff_id,
                $user->username,
                $user->role
            );

            // Send notification to admins
            $notificationSent = NotificationHelper::notifyAdmins($notificationMessage);

            if (!$notificationSent) {
                Log::warning('Failed to send registration notification to admins', [
                    'user_id' => $user->staff_id
                ]);
            }

            // Log the activity
            ActivityLogger::log(
                'users',
                'CREATE',
                "New user registration: {$user->username}",
                null,
                [
                    'staff_id' => $user->staff_id,
                    'username' => $user->username,
                    'role' => $user->role,
                    'reg_status' => $user->reg_status
                ]
            );

            // Commit transaction
            DB::commit();

            return response()->json([
                'message' => 'User registered successfully',
                'user' => $user
            ], 201);

        } catch (\Exception $e) {
            // Rollback transaction
            DB::rollBack();

            Log::error('Registration failed: ' . $e->getMessage(), [
                'exception' => $e,
                'request' => $request->all()
            ]);

            return response()->json([
                'message' => 'Registration failed',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function login(Request $request)
    {
        $request->validate([
            'staff_id' => 'required',
            'password' => 'required',
        ]);

        $user = Users::where('staff_id', $request->staff_id)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'staff_id' => ['The provided credentials are incorrect.'],
            ]);
        }

        if ($user) {
            $token = $user->createToken('auth_token')->plainTextToken;
            ActivityLogger::logLogin($user->username);
            return response()->json([
                'user' => $user,
                'token' => $token
            ]);
        }
    }

    public function logout(Request $request)
    {
        ActivityLogger::logLogout($request->user()->username);
        $request->user()->currentAccessToken()->delete();
        return response()->json(['message' => 'Successfully logged out']);
    }

    public function checkStaffId(Request $request)
    {
        try {
            $exists = Users::where('staff_id', $request->staff_id)->exists();
            return response()->json(['exists' => $exists]);
        } catch (\Exception $e) {
            Log::error('Staff ID check failed: ' . $e->getMessage());
            return response()->json(['message' => 'Error checking Staff ID'], 500);
        }
    }

    public function checkEmail(Request $request)
    {
        try {
            $exists = Users::where('email', $request->email)->exists();
            return response()->json(['exists' => $exists]);
        } catch (\Exception $e) {
            Log::error('Email check failed: ' . $e->getMessage());
            return response()->json(['message' => 'Error checking email'], 500);
        }
    }

    public function checkUsername(Request $request)
    {
        try {
            $exists = Users::where('username', $request->username)->exists();
            return response()->json(['exists' => $exists]);
        } catch (\Exception $e) {
            Log::error('Username check failed: ' . $e->getMessage());
            return response()->json(['message' => 'Error checking username'], 500);
        }
    }
}
