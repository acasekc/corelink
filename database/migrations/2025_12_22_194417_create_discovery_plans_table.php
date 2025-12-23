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
        Schema::create('discovery_plans', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('session_id')->constrained('bot_sessions');
            $table->foreignId('admin_user_id')->constrained('users');
            $table->json('raw_conversation');
            $table->json('structured_requirements');
            $table->json('high_level_plan');
            $table->json('technical_plan');
            $table->json('cost_estimate');
            $table->json('timeline_estimate');
            $table->json('tech_recommendations');
            $table->timestamp('generated_at');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('discovery_plans');
    }
};
