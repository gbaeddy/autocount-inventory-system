<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('stocksettings', function (Blueprint $table) {
            $table->id();
            $table->decimal('critical_threshold', 10, 2)->default(5);
            $table->decimal('low_threshold', 10, 2)->default(10);
            $table->decimal('healthy_threshold', 10, 2)->default(10);
            $table->string('updated_by')->nullable();
            $table->timestamps();
        });

        // Insert default values
        DB::table('stocksettings')->insert([
            'critical_threshold' => 5,
            'low_threshold' => 10,
            'healthy_threshold' => 10,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('stocksettings');
    }
};
