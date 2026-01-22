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
        Schema::create('helpdesk_project_hourly_rates', function (Blueprint $table) {
            $table->id();
            $table->foreignId('project_id')->constrained('helpdesk_projects')->cascadeOnDelete();
            $table->foreignId('category_id')->constrained('helpdesk_hourly_rate_categories')->cascadeOnDelete();
            $table->decimal('rate', 10, 2);
            $table->date('effective_from');
            $table->date('effective_to')->nullable();
            $table->timestamps();

            $table->unique(['project_id', 'category_id', 'effective_from'], 'hd_proj_rates_unique');
            $table->index(['project_id', 'category_id'], 'hd_proj_rates_proj_cat_idx');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('helpdesk_project_hourly_rates');
    }
};
