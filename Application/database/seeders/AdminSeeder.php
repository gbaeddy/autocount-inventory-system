<?php

namespace Database\Seeders;

use App\Enums\REG_status;
use App\Enums\UserRole;
use Illuminate\Database\Seeder;
use App\Models\Users;
use Illuminate\Support\Facades\Hash;

class AdminSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Check if an admin user already exists
        if (!Users::where('email', 'admin@example.com')->exists()) {
            // Create the admin user
            Users::create([
                'staff_id' => '1001',
                'username' => 'admin',
                'email' => 'admin@example.com',
                'password' => Hash::make('password123'), 
                'role' => UserRole::ADMIN->value,
                'reg_status' => REG_status::APPROVED->value,
            ]);
        }
    }
}