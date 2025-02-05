<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\ActivityLog;
use Illuminate\Support\Str;
use App\Traits\LogsActivity;

class Items extends Model
{
    use HasFactory;

    protected $table = 'items';
    protected $primaryKey = 'ItemCode';
    public $incrementing = false;
    protected $keyType = 'string';

    public $timestamps = true;

    protected $fillable = [
        'ItemCode', 'Description', 'ItemGroup', 'ItemType', 'StockControl', 'HasSerialNo',
        'HasBatchNo', 'DutyRate', 'CostingMethod', 'SalesUOM', 'PurchaseUOM', 'BaseUOM',
        'IsActive', 'Price', 'BalQty', 'TotalBalQty', 'CreatedTimeStamp', 'LastModified', 'Guid'
    ];

    protected $casts = [
        'DutyRate' => 'decimal:6',
        'Price' => 'decimal:6',
        'BalQty' => 'decimal:6',
        'TotalBalQty' => 'decimal:6',
        'CreatedTimeStamp' => 'datetime',
        'LastModified' => 'datetime',
    ];

    public static function boot()
    {
        parent::boot();

        static::created(function ($item) {
            // The logging will be handled in the controller
        });

        static::updated(function ($item) {
            // The logging will be handled in the controller
        });

        static::deleted(function ($item) {
            // The logging will be handled in the controller
        });
    }

    public static function logActivity($item, $user, $action, $actionDesc, $oldValue, $newValue)
    {
        ActivityLog::create([
            'table_name' => $item->getTable(),
            'staff_id' => $user['staff_id'] ?? 'SYSTEM',
            'username' => $user['username'] ?? 'SYSTEM',
            'role' => $user['role'] ?? 'SYSTEM',
            'action' => $action,
            'actionDesc' => $actionDesc,
            'old_value' => $oldValue,
            'new_value' => $newValue,
            'dateTime' => now(),
        ]);
    }

    public function setGuidAttribute($value)
{
    $this->attributes['Guid'] = $value ?: (string) Str::uuid();
}
}
