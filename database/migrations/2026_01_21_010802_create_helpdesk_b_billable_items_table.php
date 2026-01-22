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
        Schema::create('helpdesk_billable_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('project_id')->constrained('helpdesk_projects')->cascadeOnDelete();
            $table->string('name', 100);
            $table->text('description')->nullable();
            $table->decimal('default_rate', 10, 2);
            $table->string('unit', 20)->default('each'); // each, monthly, yearly, flat
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->unique(['project_id', 'name']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('helpdesk_billable_items');
    }
};
