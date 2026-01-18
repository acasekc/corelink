<?php

use Illuminate\Database\Migrations\Migration;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * Note: This migration is now a no-op because the base migration uses string columns
     * instead of ENUMs. This is kept for migration history compatibility.
     */
    public function up(): void
    {
        // Originally modified ENUM values, now no-op since we use strings
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // No-op
    }
};
