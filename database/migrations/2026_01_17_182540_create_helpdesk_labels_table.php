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
        Schema::create('helpdesk_labels', function (Blueprint $table) {
            $table->id();
            $table->foreignId('project_id')->constrained('helpdesk_projects')->cascadeOnDelete();
            $table->string('name');
            $table->string('color', 7)->default('#6b7280');
            $table->timestamps();

            $table->unique(['project_id', 'name']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('helpdesk_labels');
    }
};
