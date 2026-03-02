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
        Schema::create('helpdesk_anthropic_usage_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('anthropic_config_id')->constrained('helpdesk_anthropic_api_configs')->cascadeOnDelete();
            $table->timestamp('synced_at');
            $table->date('period_start');
            $table->date('period_end');
            $table->unsignedBigInteger('tokens_input')->default(0);
            $table->unsignedBigInteger('tokens_output')->default(0);
            $table->unsignedInteger('cost_cents')->default(0);
            $table->json('model_breakdown')->nullable();
            $table->json('raw_response')->nullable();
            $table->timestamps();

            $table->index('anthropic_config_id');
            $table->index('synced_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('helpdesk_anthropic_usage_logs');
    }
};
