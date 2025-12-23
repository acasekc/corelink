<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Convert ENUM to VARCHAR
        DB::statement("ALTER TABLE bot_sessions MODIFY COLUMN status VARCHAR(32) NOT NULL DEFAULT 'active'");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Convert back to ENUM (with all values)
        DB::statement("ALTER TABLE bot_sessions MODIFY COLUMN status ENUM('active', 'paused', 'completed', 'abandoned', 'generating', 'failed') NOT NULL DEFAULT 'active'");
    }
};
