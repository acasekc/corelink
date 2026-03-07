<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('helpdesk_openai_configs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('project_id')->unique()->constrained('helpdesk_projects')->cascadeOnDelete();
            $table->string('openai_project_id')->nullable();
            $table->string('openai_project_name')->nullable();
            $table->decimal('markup_percentage', 5, 2)->default(0);
            $table->unsignedTinyInteger('billing_cycle_start_day')->default(1);
            $table->unsignedInteger('cycle_usage_cents')->default(0);
            $table->json('notification_emails')->nullable();
            $table->timestamp('last_synced_at')->nullable();
            $table->string('last_sync_error')->nullable();
            $table->timestamp('connected_at')->nullable();
            $table->timestamps();

            $table->index('openai_project_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('helpdesk_openai_configs');
    }
};
