<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateTicketRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return auth()->check() && auth()->user()->is_admin;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'title' => ['sometimes', 'string', 'max:255'],
            'content' => ['sometimes', 'string'],
            'priority_id' => ['nullable', 'integer', 'exists:helpdesk_ticket_priorities,id'],
            'type_id' => ['nullable', 'integer', 'exists:helpdesk_ticket_types,id'],
            'status_id' => ['nullable', 'integer', 'exists:helpdesk_ticket_statuses,id'],
            'assignee_id' => ['nullable', 'integer', 'exists:users,id'],
            'time_estimate' => ['nullable', 'string', 'max:50'],
        ];
    }

    /**
     * Get custom messages for validator errors.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'title.string' => 'Title must be a string.',
            'content.string' => 'Content must be a string.',
            'priority_id.exists' => 'The selected priority does not exist.',
            'type_id.exists' => 'The selected type does not exist.',
            'status_id.exists' => 'The selected status does not exist.',
            'assignee_id.exists' => 'The selected assignee does not exist.',
        ];
    }
}
