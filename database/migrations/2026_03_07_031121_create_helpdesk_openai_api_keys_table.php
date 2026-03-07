<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('helpdesk_openai_api_keys', function (Blueprint $table) {
            $table->id();
            $table->foreignId('openai_config_id')->constrained('helpdesk_openai_configs')->cascadeOnDelete();
            $table->string('name');
            $table->string('openai_service_account_id')->nullable();
            $table->string('openai_api_key_id')->nullable();
            $table->text('api_key_encrypted')->nullable();
            $table->string('status', 32)->default('active');
            $table->decimal('max_spend_usd', 10, 2)->nullable();
            $table->decimal('grace_amount_usd', 10, 2)->default(0);
            $table->decimal('spend_usd', 10, 4)->default(0);
            $table->timestamp('grace_notified_at')->nullable();
            $table->timestamp('last_used_at')->nullable();
            $table->timestamp('suspended_at')->nullable();
            $table->timestamp('revoked_at')->nullable();
            $table->string('revoked_reason')->nullable();
            $table->timestamps();

            $table->index('openai_config_id');
            $table->index('openai_service_account_id');
            $table->index('status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('helpdesk_openai_api_keys');
    }
};
