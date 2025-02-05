<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Enums\REG_status;
use Illuminate\Support\Facades\Auth;
use App\Models\Users;

class ProductRequest extends Model
{
    use HasFactory;

    protected $table = 'product_requests';
    protected $primaryKey = 'id';

    protected $fillable = [
        'staff_id',
        'ItemCode',
        'quantity',
        'description',
        'request_date',
        'request_status',
        'comment',
    ];

    protected $casts = [
        'request_date' => 'date',
        'quantity' => 'integer',
    ];

    public function users()
    {
        return $this->belongsTo(Users::class, 'staff_id', 'staff_id');
    }

    public function items()
    {
        return $this->belongsTo(Items::class, 'ItemCode', 'ItemCode');
    }

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($productRequest) {
            self::logActivity($productRequest, 'CREATE', 'New product request created');
        });

        static::updating(function ($productRequest) {
            $changes = $productRequest->getDirty();
            $original = $productRequest->getOriginal();
            self::logActivity($productRequest, 'UPDATE', 'Product request updated', $original, $changes);
        });

        static::deleting(function ($productRequest) {
            self::logActivity($productRequest, 'DELETE', 'Product request deleted', $productRequest->toArray());
        });
    }

    private static function logActivity($productRequest, $action, $description, $oldValue = null, $newValue = null)
    {
        $user = Auth::user() ?? $productRequest->users;

        ActivityLog::create([
            'table_name' => 'product_requests',
            'staff_id' => $productRequest->staff_id,
            'username' => $user ? $user->username : 'System',
            'role' => $user ? $user->role : 'System',
            'action' => $action,
            'actionDesc' => $description,
            'old_value' => $oldValue ? json_encode($oldValue) : null,
            'new_value' => $newValue ? json_encode($newValue) : null,
        ]);
    }

    public function scopePending($query)
    {
        return $query->where('request_status', REG_status::PENDING);
    }

    public function scopeApproved($query)
    {
        return $query->where('request_status', REG_status::APPROVED);
    }

    public function scopeRejected($query)
    {
        return $query->where('request_status', REG_status::REJECTED);
    }

    public function isPending()
    {
        return $this->request_status === REG_status::PENDING;
    }

    public function isApproved()
    {
        return $this->request_status === REG_status::APPROVED;
    }

    public function isRejected()
    {
        return $this->request_status === REG_status::REJECTED;
    }
    public function getRequestStatusAttribute($value)
    {
        if ($value instanceof REG_status) {
            return $value->value;
        }
        return $value;
    }

    public function setRequestStatusAttribute($value)
    {
        if ($value instanceof REG_status) {
            $this->attributes['request_status'] = $value->value;
        } else {
            $enum = REG_status::fromString($value);
            $this->attributes['request_status'] = $enum ? $enum->value : $value;
        }
    }
}
