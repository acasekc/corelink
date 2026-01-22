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
        Schema::create('helpdesk_invoice_line_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('invoice_id')->constrained('helpdesk_invoices')->cascadeOnDelete();
            $table->string('type', 20)->default('time'); // time, billable_item, custom
            $table->foreignId('category_id')->nullable()->constrained('helpdesk_hourly_rate_categories')->nullOnDelete();
            $table->foreignId('billable_item_id')->nullable()->constrained('helpdesk_billable_items')->nullOnDelete();
            $table->string('description');
            $table->decimal('quantity', 10, 2);
            $table->string('unit', 20)->default('hours'); // hours, each, monthly, yearly, flat
            $table->decimal('rate', 10, 2);
            $table->decimal('amount', 12, 2);
            $table->smallInteger('sort_order')->default(0);
            $table->timestamps();

            $table->index('invoice_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('helpdesk_invoice_line_items');
    }
};
