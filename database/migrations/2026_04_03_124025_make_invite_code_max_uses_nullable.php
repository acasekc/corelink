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
        Schema::table('invite_codes', function (Blueprint $table) {
            $table->integer('max_uses')->nullable()->default(null)->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::table('invite_codes')
            ->whereNull('max_uses')
            ->update(['max_uses' => 1]);

        Schema::table('invite_codes', function (Blueprint $table) {
            $table->integer('max_uses')->default(1)->nullable(false)->change();
        });
    }
};
