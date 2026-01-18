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
        Schema::create('bot_conversations', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('session_id')->constrained('bot_sessions');
            $table->integer('turn_number');
            $table->text('user_message')->nullable();
            $table->string('user_audio_url')->nullable();
            $table->boolean('user_audio_transcribed')->default(false);
            $table->text('assistant_message')->nullable();
            $table->string('assistant_audio_url')->nullable();
            $table->string('interaction_mode', 32)->default('text');
            $table->json('tokens_used')->nullable();
            $table->json('turn_context')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('bot_conversations');
    }
};
