<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TicketResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'number' => $this->number,
            'title' => $this->title,
            'content' => $this->content,
            'project' => [
                'id' => $this->project?->id,
                'name' => $this->project?->name,
                'slug' => $this->project?->slug,
            ],
            'status' => [
                'id' => $this->status?->id,
                'name' => $this->status?->name,
                'slug' => $this->status?->slug,
                'color' => $this->status?->color,
            ],
            'priority' => [
                'id' => $this->priority?->id,
                'name' => $this->priority?->name,
                'slug' => $this->priority?->slug,
                'color' => $this->priority?->color,
            ],
            'type' => [
                'id' => $this->type?->id,
                'name' => $this->type?->name,
                'slug' => $this->type?->slug,
            ],
            'assignee' => $this->assignee ? [
                'id' => $this->assignee->id,
                'name' => $this->assignee->name,
                'email' => $this->assignee->email,
            ] : null,
            'submitter' => [
                'name' => $this->submitter_name,
                'email' => $this->submitter_email,
                'user_id' => $this->submitter_user_id,
            ],
            'labels' => $this->labels->map(fn ($label) => [
                'id' => $label->id,
                'name' => $label->name,
                'color' => $label->color,
            ]),
            'github_issue_url' => $this->github_issue_url,
            'time_tracking' => [
                'estimate' => $this->formatted_time_estimate,
                'estimate_minutes' => $this->time_estimate_minutes,
                'time_spent' => $this->formatted_time_spent,
                'time_spent_minutes' => $this->total_time_spent,
            ],
            'created_at' => $this->created_at->toIso8601String(),
            'updated_at' => $this->updated_at->toIso8601String(),
        ];
    }
}
