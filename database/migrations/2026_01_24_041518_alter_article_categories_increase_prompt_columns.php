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
        Schema::table('article_categories', function (Blueprint $table) {
            $table->text('prompt_guidance')->nullable()->change();
            $table->text('image_prompt')->nullable()->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('article_categories', function (Blueprint $table) {
            $table->string('prompt_guidance')->nullable()->change();
            $table->string('image_prompt')->nullable()->change();
        });
    }
};
