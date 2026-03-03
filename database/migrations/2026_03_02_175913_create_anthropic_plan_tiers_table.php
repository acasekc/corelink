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
        Schema::create('helpdesk_anthropic_plan_tiers', function (Blueprint $table) {
            $table->id();
            $table->string('name', 32);
            $table->string('slug', 32)->unique();
            $table->text('description')->nullable();
            $table->decimal('included_allowance', 10, 2)->default(0);
            $table->decimal('grace_threshold', 10, 2)->default(0);
            $table->decimal('markup_percentage', 5, 2)->default(0);
            $table->string('overage_mode', 32)->default('silent');
            $table->unsignedTinyInteger('sort_order')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        // Add plan_tier_id foreign key to anthropic configs
        Schema::table('helpdesk_anthropic_api_configs', function (Blueprint $table) {
            $table->foreignId('plan_tier_id')
                ->nullable()
                ->after('plan_tier')
                ->constrained('helpdesk_anthropic_plan_tiers')
                ->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('helpdesk_anthropic_api_configs', function (Blueprint $table) {
            $table->dropForeign(['plan_tier_id']);
            $table->dropColumn('plan_tier_id');
        });

        Schema::dropIfExists('helpdesk_anthropic_plan_tiers');
    }
};
