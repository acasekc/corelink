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
        Schema::table('bot_sessions', function (Blueprint $table) {
            $table->string('session_token', 64)->nullable()->after('invite_code_id');
            $table->integer('turn_count')->default(0)->after('status');
            $table->json('extracted_requirements')->nullable()->after('conversation_state');
            $table->boolean('voice_enabled')->default(false)->after('metadata');
            $table->string('voice_mode')->nullable()->after('voice_enabled');
            $table->json('voice_settings')->nullable()->after('voice_mode');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('bot_sessions', function (Blueprint $table) {
            $table->dropColumn([
                'session_token',
                'turn_count',
                'extracted_requirements',
                'voice_enabled',
                'voice_mode',
                'voice_settings',
            ]);
        });
    }
};
