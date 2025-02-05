<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use App\Models\Activitylog;
use Carbon\Carbon;
use Laravel\Sanctum\HasApiTokens;


class Users extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $primaryKey = 'staff_id';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'staff_id',
        'username',
        'email',
        'password',
        'role',
        'reg_status',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
    ];

    protected static function boot()
    {
        parent::boot();

        static::created(function ($user) {
            ActivityLog::create([
                'table_name' => $user->getTable(),
                'staff_id' => $user->staff_id, // Assuming staff_id is the user ID
                'username' => $user->username,
                'role' => $user->role,
                'action' => 'INSERT',
                'actionDesc' => 'User is created',
                'new_value' => $user->toJson(),
            ]);
        });

        static::updated(function ($user) {
            $changes = $user->getChanges();
            $original = $user->getOriginal();

            $actionDesc = 'User is updated';

            if (isset($changes['reg_status'])) {
                if ($changes['reg_status'] === 'APPROVED') {
                    $actionDesc = 'User status is approved';
                } elseif ($changes['reg_status'] === 'REJECTED') {
                    $actionDesc = 'User status is rejected';
                } else {
                    $actionDesc = 'User status is pending';
                }
            }

            if(isset($changes['role'])){
                $actionDesc = 'User role is updated to ' . $changes['role'];
            }

             // Update the updated_at field
             $user->timestamps = false;
             $user->updated_at = Carbon::now();
             $user->save();

            ActivityLog::create([
                'table_name' => $user->getTable(),
                'staff_id' => $user->staff_id, // Assuming staff_id is the user ID
                'username' => $user->username,
                'role' => $user->role,
                'action' => 'UPDATE',
                'actionDesc' => $actionDesc,
                'old_value' => json_encode($original),
                'new_value' => json_encode($changes),
            ]);
        });

        static::deleted(function ($user) {
            ActivityLog::create([
                'table_name' => $user->getTable(),
                'staff_id' => $user->staff_id, // Assuming staff_id is the user ID
                'username' => $user->username,
                'role' => $user->role,
                'action' => 'DELETE',
                'actionDesc' => 'User is deleted',
                'old_value' => $user->toJson(),
            ]);
        });
    }
}
