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
        Schema::table('helpdesk_invoices', function (Blueprint $table) {
            $table->string('stripe_checkout_session_id', 100)->nullable()->after('stripe_hosted_invoice_url');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('helpdesk_invoices', function (Blueprint $table) {
            $table->dropColumn('stripe_checkout_session_id');
        });
    }
};
