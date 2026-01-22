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
            $table->decimal('credit_amount', 12, 2)->default(0)->after('discount_description');
            $table->string('credit_description')->nullable()->after('credit_amount');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('helpdesk_invoices', function (Blueprint $table) {
            $table->dropColumn(['credit_amount', 'credit_description']);
        });
    }
};
