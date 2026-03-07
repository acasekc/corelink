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

        if (! Schema::hasTable('helpdesk_notification_digest_events')) {
            Schema::create('helpdesk_notification_digest_events', function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('notification_digest_id');
                $table->unsignedBigInteger('ticket_id')->nullable();
                $table->string('event_type', 64);
                $table->json('payload');
                $table->timestamps();

                $table->foreign('notification_digest_id', 'hnd_events_digest_fk')
                    ->references('id')
                    ->on('helpdesk_notification_digests')
                    ->cascadeOnDelete();
                $table->foreign('ticket_id', 'hnd_events_ticket_fk')
                    ->references('id')
                    ->on('helpdesk_tickets')
                    ->nullOnDelete();
                $table->index(['notification_digest_id', 'created_at'], 'hnd_events_digest_created_idx');
                $table->index('event_type', 'hnd_events_type_idx');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('helpdesk_notification_digest_events');
    }
};
