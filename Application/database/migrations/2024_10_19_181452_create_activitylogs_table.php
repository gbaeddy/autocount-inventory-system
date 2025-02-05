<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('activitylogs', function (Blueprint $table) {
            $table->id('log_id');
            $table->string('table_name');
            $table->string('staff_id')->nullable();
            $table->string('username')->nullable();
            $table->string('role')->nullable();
            $table->string('action');
            $table->string('actionDesc');
            $table->json('old_value')->nullable();
            $table->json('new_value')->nullable();
            $table->timestamps();

            // $table->foreign('staff_id')->references('staff_id')->on('users')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('activitylogs');
    }
};
