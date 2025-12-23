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
        Schema::create('invite_codes', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignId('admin_user_id')->constrained('users');
            $table->string('code')->unique();
            $table->string('email')->nullable();
            $table->timestamp('expires_at')->nullable();
            $table->foreignId('used_by_user_id')->nullable()->constrained('users');
            $table->timestamp('used_at')->nullable();
            $table->boolean('is_active')->default(true);
            $table->integer('max_uses')->default(1);
            $table->integer('current_uses')->default(0);
            $table->json('metadata')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('invite_codes');
    }
};
