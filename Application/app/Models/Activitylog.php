<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Builder;
use Carbon\Carbon;

class Activitylog extends Model
{
    use HasFactory;

    protected $table = 'activitylogs';
    protected $primaryKey = 'log_id';

    protected $fillable = [
        'table_name',
        'staff_id',
        'username',
        'role',
        'action',
        'actionDesc',
        'old_value',
        'new_value'
    ];

    protected $casts = [
        'old_value' => 'array',
        'new_value' => 'array',
        'created_at' => 'datetime',
        'updated_at' => 'datetime'
    ];

    // Relationships
    public function user()
    {
        return $this->belongsTo(Users::class, 'staff_id', 'staff_id');
    }

    // Scopes for filtering
    public function scopeOfAction(Builder $query, string $action): Builder
    {
        return $query->where('action', $action);
    }

    public function scopeByUsername(Builder $query, string $username): Builder
    {
        return $query->where('username', 'like', "%{$username}%");
    }

    public function scopeInDateRange(Builder $query, ?string $startDate, ?string $endDate): Builder
    {
        if ($startDate) {
            $query->whereDate('created_at', '>=', $startDate);
        }
        if ($endDate) {
            $query->whereDate('created_at', '<=', $endDate);
        }
        return $query;
    }

    public function scopeToday(Builder $query): Builder
    {
        return $query->whereDate('created_at', Carbon::today());
    }

    public function scopeThisWeek(Builder $query): Builder
    {
        return $query->whereBetween('created_at', [
            Carbon::now()->startOfWeek(),
            Carbon::now()->endOfWeek()
        ]);
    }

    // Accessor for formatted timestamps
    public function getFormattedCreatedAtAttribute(): string
    {
        return $this->created_at->format('Y-m-d H:i:s');
    }

    // Helper method to format change description
    public function getChangeDescription(): string
    {
        if ($this->action === 'UPDATE' && is_array($this->new_value) && is_array($this->old_value)) {
            $changes = array_diff_assoc($this->new_value, $this->old_value);

            return collect($changes)->map(function ($newValue, $field) {
                $oldValue = $this->old_value[$field] ?? 'N/A';
                $newValue = is_string($newValue) ? $newValue : json_encode($newValue);
                $oldValue = is_string($oldValue) ? $oldValue : json_encode($oldValue);

                return "{$field} changed from '{$oldValue}' to '{$newValue}'";
            })->implode(', ');
        }

        return $this->actionDesc;
    }

    // Static method for creating log entries
    public static function logActivity(string $tableName, array $userData, string $action, string $actionDesc, ?array $oldValue = null, ?array $newValue = null): self
    {
        return self::create([
            'table_name' => $tableName,
            'staff_id' => $userData['staff_id'] ?? null,
            'username' => $userData['username'] ?? null,
            'role' => $userData['role'] ?? null,
            'action' => $action,
            'actionDesc' => $actionDesc,
            'old_value' => $oldValue,
            'new_value' => $newValue
        ]);
    }
}
