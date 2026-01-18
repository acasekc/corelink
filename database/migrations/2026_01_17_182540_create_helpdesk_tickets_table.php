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
        Schema::create('helpdesk_tickets', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('number');
            $table->string('title');
            $table->longText('content');
            $table->foreignId('project_id')->constrained('helpdesk_projects')->cascadeOnDelete();
            $table->foreignId('status_id')->constrained('helpdesk_ticket_statuses');
            $table->foreignId('priority_id')->constrained('helpdesk_ticket_priorities');
            $table->foreignId('type_id')->constrained('helpdesk_ticket_types');
            $table->foreignId('assignee_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('submitter_name');
            $table->string('submitter_email');
            $table->string('submitter_user_id')->nullable();
            $table->json('metadata')->nullable();
            $table->string('github_issue_url')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->unique(['project_id', 'number']);
            $table->index('submitter_email');
            $table->index('submitter_user_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('helpdesk_tickets');
    }
};
