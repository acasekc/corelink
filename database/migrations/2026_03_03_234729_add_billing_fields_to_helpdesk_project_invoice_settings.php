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
        Schema::table('helpdesk_project_invoice_settings', function (Blueprint $table) {
            $table->decimal('default_hourly_rate', 10, 2)->nullable()->after('stripe_enabled');
            $table->unsignedInteger('billing_increment_minutes')->default(15)->after('default_hourly_rate');
            $table->unsignedInteger('minimum_billing_minutes')->default(0)->after('billing_increment_minutes');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('helpdesk_project_invoice_settings', function (Blueprint $table) {
            $table->dropColumn(['default_hourly_rate', 'billing_increment_minutes', 'minimum_billing_minutes']);
        });
    }
};
