<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Convert bot_conversations.interaction_mode from ENUM to VARCHAR
        DB::statement("ALTER TABLE bot_conversations MODIFY COLUMN interaction_mode VARCHAR(32) NOT NULL DEFAULT 'text'");

        // Convert plan_outputs.output_type from ENUM to VARCHAR
        DB::statement('ALTER TABLE plan_outputs MODIFY COLUMN output_type VARCHAR(32) NOT NULL');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Convert back to ENUM
        DB::statement("ALTER TABLE bot_conversations MODIFY COLUMN interaction_mode ENUM('text', 'voice', 'both') NOT NULL");
        DB::statement("ALTER TABLE plan_outputs MODIFY COLUMN output_type ENUM('user_summary', 'admin_full', 'email_sent') NOT NULL");
    }
};
