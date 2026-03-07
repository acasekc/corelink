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
        if (! Schema::hasTable('helpdesk_notification_digests')) {
            Schema::create('helpdesk_notification_digests', function (Blueprint $table) {
                $table->id();
                $table->string('recipient_email');
                $table->timestamp('dispatch_after');
                $table->timestamp('sent_at')->nullable();
                $table->timestamps();

                $table->index(['recipient_email', 'sent_at'], 'hnd_recipient_sent_idx');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('helpdesk_notification_digests');
    }
};
