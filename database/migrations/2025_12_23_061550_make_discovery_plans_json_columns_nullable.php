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
        Schema::table('discovery_plans', function (Blueprint $table) {
            $table->json('structured_requirements')->nullable()->change();
            $table->json('high_level_plan')->nullable()->change();
            $table->json('technical_plan')->nullable()->change();
            $table->json('cost_estimate')->nullable()->change();
            $table->json('timeline_estimate')->nullable()->change();
            $table->json('tech_recommendations')->nullable()->change();
            $table->timestamp('generated_at')->nullable()->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Cannot easily reverse nullable changes
    }
};
