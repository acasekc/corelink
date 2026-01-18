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
        Schema::create('helpdesk_ticket_types', function (Blueprint $table) {
            $table->id();
            $table->foreignId('project_id')->nullable()->constrained('helpdesk_projects')->cascadeOnDelete();
            $table->string('title');
            $table->string('slug');
            $table->string('text_color', 7)->default('#ffffff');
            $table->string('bg_color', 7)->default('#6b7280');
            $table->string('icon')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->unique(['project_id', 'slug']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('helpdesk_ticket_types');
    }
};
