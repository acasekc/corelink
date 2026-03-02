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
        Schema::create('helpdesk_anthropic_api_configs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('project_id')->unique()->constrained('helpdesk_projects')->cascadeOnDelete();
            $table->string('api_key_name')->nullable();
            $table->text('api_key_encrypted')->nullable();
            $table->string('plan_tier', 32)->default('starter');
            $table->decimal('included_allowance', 10, 2)->default(0);
            $table->decimal('grace_threshold', 10, 2)->default(0);
            $table->decimal('markup_percentage', 5, 2)->default(0);
            $table->string('overage_mode', 32)->default('silent');
            $table->json('notification_emails')->nullable();
            $table->string('key_status', 32)->default('active');
            $table->unsignedTinyInteger('cycle_start_day')->default(1);
            $table->unsignedInteger('cycle_usage_cents')->default(0);
            $table->timestamp('last_synced_at')->nullable();
            $table->string('disabled_reason')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('helpdesk_anthropic_api_configs');
    }
};
