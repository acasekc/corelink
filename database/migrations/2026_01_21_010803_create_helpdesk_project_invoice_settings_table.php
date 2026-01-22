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
        Schema::create('helpdesk_project_invoice_settings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('project_id')->unique()->constrained('helpdesk_projects')->cascadeOnDelete();
            $table->string('invoice_prefix', 10)->nullable();
            $table->unsignedInteger('next_invoice_number')->default(1);
            $table->smallInteger('default_payment_terms')->default(30);
            $table->decimal('default_tax_rate', 5, 2)->nullable();
            $table->string('bill_to_name')->nullable();
            $table->string('bill_to_email')->nullable();
            $table->text('bill_to_address')->nullable();
            $table->text('invoice_footer')->nullable();
            $table->boolean('stripe_enabled')->default(false);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('helpdesk_project_invoice_settings');
    }
};
