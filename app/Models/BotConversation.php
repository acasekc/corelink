<?php

namespace App\Models;

use App\Enums\InteractionMode;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class BotConversation extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'session_id',
        'turn_number',
        'user_message',
        'user_audio_url',
        'user_audio_transcribed',
        'assistant_message',
        'assistant_audio_url',
        'interaction_mode',
        'tokens_used',
        'turn_context',
    ];

    protected function casts(): array
    {
        return [
            'user_audio_transcribed' => 'boolean',
            'tokens_used' => 'array',
            'turn_context' => 'array',
            'interaction_mode' => InteractionMode::class,
        ];
    }

    public function session(): BelongsTo
    {
        return $this->belongsTo(BotSession::class, 'session_id');
    }
}
