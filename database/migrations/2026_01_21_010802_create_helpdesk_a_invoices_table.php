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
        Schema::create('helpdesk_invoices', function (Blueprint $table) {
            $table->id();
            $table->foreignId('project_id')->constrained('helpdesk_projects')->cascadeOnDelete();
            $table->string('invoice_number', 50)->unique();
            $table->string('status', 20)->default('draft'); // draft, sent, paid, partial, overdue, void
            $table->date('period_start')->nullable();
            $table->date('period_end')->nullable();
            $table->date('issue_date')->nullable();
            $table->date('due_date')->nullable();
            $table->decimal('subtotal', 12, 2)->default(0);
            $table->decimal('discount_amount', 12, 2)->default(0);
            $table->string('discount_description')->nullable();
            $table->decimal('tax_rate', 5, 2)->nullable();
            $table->decimal('tax_amount', 12, 2)->default(0);
            $table->decimal('total', 12, 2)->default(0);
            $table->decimal('amount_paid', 12, 2)->default(0);
            $table->string('currency', 3)->default('USD');
            $table->text('notes')->nullable();
            $table->text('internal_notes')->nullable();
            $table->string('bill_to_name')->nullable();
            $table->string('bill_to_email')->nullable();
            $table->text('bill_to_address')->nullable();
            $table->string('stripe_invoice_id', 100)->nullable();
            $table->string('stripe_payment_intent_id', 100)->nullable();
            $table->string('stripe_hosted_invoice_url', 500)->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('sent_at')->nullable();
            $table->timestamp('paid_at')->nullable();
            $table->timestamp('voided_at')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['project_id', 'status']);
            $table->index('stripe_invoice_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('helpdesk_invoices');
    }
};
