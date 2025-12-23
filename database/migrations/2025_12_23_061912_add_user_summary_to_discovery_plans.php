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
            $table->json('user_summary')->nullable()->after('structured_requirements');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('discovery_plans', function (Blueprint $table) {
            $table->dropColumn('user_summary');
        });
    }
};
