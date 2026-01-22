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
        Schema::table('helpdesk_time_entries', function (Blueprint $table) {
            $table->foreignId('hourly_rate_category_id')
                ->nullable()
                ->after('date_worked')
                ->constrained('helpdesk_hourly_rate_categories')
                ->nullOnDelete();
            $table->boolean('is_billable')->default(true)->after('hourly_rate_category_id');
            $table->unsignedInteger('billable_minutes')->nullable()->after('is_billable');
            $table->foreignId('invoice_line_item_id')
                ->nullable()
                ->after('billable_minutes')
                ->constrained('helpdesk_invoice_line_items')
                ->nullOnDelete();

            $table->index('hourly_rate_category_id');
            $table->index('invoice_line_item_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('helpdesk_time_entries', function (Blueprint $table) {
            $table->dropForeign(['hourly_rate_category_id']);
            $table->dropForeign(['invoice_line_item_id']);
            $table->dropColumn([
                'hourly_rate_category_id',
                'is_billable',
                'billable_minutes',
                'invoice_line_item_id',
            ]);
        });
    }
};
