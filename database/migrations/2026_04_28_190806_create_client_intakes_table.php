<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('client_intakes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('invite_id')->unique()->constrained('client_intake_invites')->cascadeOnDelete();
            $table->string('email')->index();
            $table->string('business_name')->index();
            $table->string('budget_range')->nullable();
            $table->json('data');
            $table->string('logo_path')->nullable();
            $table->string('logo_disk', 32)->nullable();
            $table->string('brand_guidelines_path')->nullable();
            $table->string('brand_guidelines_disk', 32)->nullable();
            $table->string('pdf_path')->nullable();
            $table->string('pdf_disk', 32)->nullable();
            $table->unsignedBigInteger('helpdesk_ticket_id')->nullable();
            $table->string('helpdesk_ticket_number')->nullable();
            $table->foreignId('converted_project_id')->nullable()->constrained('helpdesk_projects')->nullOnDelete();
            $table->timestamp('submitted_at');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('client_intakes');
    }
};
