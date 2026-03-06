<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('helpdesk_projects', function (Blueprint $table): void {
            $table->string('xero_contact_id')->nullable()->after('client_address');
        });

        Schema::table('helpdesk_invoices', function (Blueprint $table): void {
            $table->string('xero_invoice_id')->nullable()->after('stripe_checkout_session_id')->index();
            $table->timestamp('xero_synced_at')->nullable()->after('xero_invoice_id');
            $table->text('xero_last_sync_error')->nullable()->after('xero_synced_at');
        });

        Schema::table('helpdesk_invoice_payments', function (Blueprint $table): void {
            $table->string('xero_payment_id')->nullable()->after('stripe_charge_id')->index();
            $table->text('xero_last_sync_error')->nullable()->after('xero_payment_id');
        });
    }

    public function down(): void
    {
        Schema::table('helpdesk_invoice_payments', function (Blueprint $table): void {
            $table->dropIndex(['xero_payment_id']);
            $table->dropColumn(['xero_payment_id', 'xero_last_sync_error']);
        });

        Schema::table('helpdesk_invoices', function (Blueprint $table): void {
            $table->dropIndex(['xero_invoice_id']);
            $table->dropColumn(['xero_invoice_id', 'xero_synced_at', 'xero_last_sync_error']);
        });

        Schema::table('helpdesk_projects', function (Blueprint $table): void {
            $table->dropColumn('xero_contact_id');
        });
    }
};
