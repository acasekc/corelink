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
        Schema::table('helpdesk_project_users', function (Blueprint $table) {
            $table->boolean('auto_watch_all_tickets')->default(false)->after('receive_notifications');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('helpdesk_project_users', function (Blueprint $table) {
            $table->dropColumn('auto_watch_all_tickets');
        });
    }
};
