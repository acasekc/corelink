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
        Schema::table('helpdesk_anthropic_plan_tiers', function (Blueprint $table) {
            $table->decimal('monthly_price', 10, 2)->default(0)->after('description');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('helpdesk_anthropic_plan_tiers', function (Blueprint $table) {
            $table->dropColumn('monthly_price');
        });
    }
};
