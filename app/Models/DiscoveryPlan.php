<?php

namespace App\Models;

use App\Enums\PlanStatus;
use App\Models\User;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class DiscoveryPlan extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'session_id',
        'admin_user_id',
        'raw_conversation',
        'structured_requirements',
        'user_summary',
        'technical_plan',
        'cost_estimate',
        'timeline_estimate',
        'tech_recommendations',
        'status',
        'generated_at',
    ];

    protected $casts = [
        'raw_conversation' => 'array',
        'structured_requirements' => 'array',
        'user_summary' => 'array',
        'technical_plan' => 'array',
        'cost_estimate' => 'array',
        'timeline_estimate' => 'array',
        'tech_recommendations' => 'array',
        'status' => PlanStatus::class,
        'generated_at' => 'datetime',
    ];

    public function session(): BelongsTo
    {
        return $this->belongsTo(BotSession::class, 'session_id');
    }

    public function adminUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'admin_user_id');
    }

    public function outputs(): HasMany
    {
        return $this->hasMany(PlanOutput::class, 'plan_id');
    }

    public function markAsCompleted(): void
    {
        $this->update([
            'status' => PlanStatus::Completed,
            'generated_at' => now(),
        ]);
    }

    public function markAsFailed(): void
    {
        $this->update(['status' => PlanStatus::Failed]);
    }
}
