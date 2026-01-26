<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreTicketRequest extends FormRequest
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
            'project_id' => ['required', 'integer', 'exists:helpdesk_projects,id'],
            'title' => ['required', 'string', 'max:255'],
            'content' => ['required', 'string'],
            'priority_id' => ['nullable', 'integer', 'exists:helpdesk_ticket_priorities,id'],
            'type_id' => ['nullable', 'integer', 'exists:helpdesk_ticket_types,id'],
            'status_id' => ['nullable', 'integer', 'exists:helpdesk_ticket_statuses,id'],
            'assignee_id' => ['nullable', 'integer', 'exists:users,id'],
            'submitter_user_id' => ['nullable', 'integer', 'exists:users,id'],
            'submitter_name' => ['nullable', 'string', 'max:255'],
            'submitter_email' => ['nullable', 'email', 'max:255'],
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
            'project_id.required' => 'A project must be selected.',
            'project_id.exists' => 'The selected project does not exist.',
            'title.required' => 'A title is required.',
            'content.required' => 'Content is required.',
            'priority_id.exists' => 'The selected priority does not exist.',
            'type_id.exists' => 'The selected type does not exist.',
            'status_id.exists' => 'The selected status does not exist.',
            'assignee_id.exists' => 'The selected assignee does not exist.',
            'submitter_email.email' => 'A valid email address is required.',
        ];
    }
}
