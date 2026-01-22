<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('helpdesk_invoices', function (Blueprint $table) {
            $table->uuid('uuid')->nullable()->unique()->after('id');
        });

        // Generate UUIDs for existing invoices
        DB::table('helpdesk_invoices')->whereNull('uuid')->get()->each(function ($invoice) {
            DB::table('helpdesk_invoices')
                ->where('id', $invoice->id)
                ->update(['uuid' => Str::uuid()->toString()]);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('helpdesk_invoices', function (Blueprint $table) {
            $table->dropColumn('uuid');
        });
    }
};
