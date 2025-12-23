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
        // MySQL requires raw SQL to modify enum values
        DB::statement("ALTER TABLE bot_sessions MODIFY COLUMN status ENUM('active', 'paused', 'completed', 'abandoned', 'generating', 'failed') NOT NULL DEFAULT 'active'");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::statement("ALTER TABLE bot_sessions MODIFY COLUMN status ENUM('active', 'paused', 'completed', 'abandoned') NOT NULL DEFAULT 'active'");
    }
};
