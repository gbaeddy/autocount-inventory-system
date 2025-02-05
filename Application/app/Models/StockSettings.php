<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class StockSettings extends Model
{
    protected $table = 'stocksettings';
    protected $fillable = [
        'critical_threshold',
        'low_threshold',
        'healthy_threshold',
        'updated_by'
    ];

    protected $casts = [
        'critical_threshold' => 'decimal:2',
        'low_threshold' => 'decimal:2',
        'healthy_threshold' => 'decimal:2',
    ];
}