<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('article_generation_settings', function (Blueprint $table) {
            $table->id();
            $table->boolean('is_enabled')->default(true);
            $table->boolean('dalle_enabled')->default(false);
            $table->boolean('auto_publish_enabled')->default(true);
            $table->unsignedInteger('auto_publish_hours')->default(24);
            $table->unsignedInteger('max_articles_per_day')->default(1);
            $table->unsignedInteger('max_articles_per_week')->default(3);
            $table->string('admin_notification_email')->nullable();
            $table->string('openai_model')->default('gpt-4o');
            $table->string('dalle_model')->default('dall-e-3');
            $table->string('dalle_size')->default('1792x1024');
            $table->string('dalle_quality')->default('standard');
            $table->text('system_prompt')->nullable();
            $table->timestamps();
        });

        // Insert default settings
        DB::table('article_generation_settings')->insert([
            'is_enabled' => true,
            'dalle_enabled' => false,
            'auto_publish_enabled' => true,
            'auto_publish_hours' => 24,
            'max_articles_per_day' => 1,
            'max_articles_per_week' => 3,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('article_generation_settings');
    }
};
