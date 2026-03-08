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
        Schema::table('helpdesk_time_entries', function (Blueprint $table) {
            $table->timestamp('started_at')->nullable()->after('date_worked');
            $table->timestamp('ended_at')->nullable()->after('started_at');

            $table->index(['ticket_id', 'ended_at'], 'hd_time_entries_ticket_ended_idx');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('helpdesk_time_entries', function (Blueprint $table) {
            $table->dropIndex('hd_time_entries_ticket_ended_idx');
            $table->dropColumn(['started_at', 'ended_at']);
        });
    }
};
