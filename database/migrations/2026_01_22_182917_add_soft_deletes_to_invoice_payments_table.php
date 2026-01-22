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
        Schema::table('helpdesk_invoice_payments', function (Blueprint $table) {
            $table->softDeletes();
            $table->text('deleted_reason')->nullable()->after('notes');
            $table->foreignId('deleted_by')->nullable()->after('deleted_reason')->constrained('users');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('helpdesk_invoice_payments', function (Blueprint $table) {
            $table->dropForeign(['deleted_by']);
            $table->dropColumn(['deleted_at', 'deleted_reason', 'deleted_by']);
        });
    }
};
