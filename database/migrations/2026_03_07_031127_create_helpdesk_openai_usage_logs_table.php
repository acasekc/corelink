<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('helpdesk_openai_usage_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('openai_config_id')->constrained('helpdesk_openai_configs')->cascadeOnDelete();
            $table->foreignId('openai_api_key_id')->nullable()->constrained('helpdesk_openai_api_keys')->nullOnDelete();
            $table->date('usage_date');
            $table->string('model')->nullable();
            $table->unsignedBigInteger('input_tokens')->default(0);
            $table->unsignedBigInteger('output_tokens')->default(0);
            $table->unsignedInteger('requests')->default(0);
            $table->decimal('cost_usd', 10, 6)->default(0);
            $table->unsignedInteger('cost_cents')->default(0);
            $table->json('raw_response')->nullable();
            $table->timestamps();

            $table->unique(['openai_config_id', 'openai_api_key_id', 'usage_date', 'model'], 'openai_usage_unique');
            $table->index('openai_config_id');
            $table->index('openai_api_key_id');
            $table->index('usage_date');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('helpdesk_openai_usage_logs');
    }
};
