<?php

namespace App\Http\Requests\Task;

use App\Enums\TaskPriority;
use App\Enums\TaskStatus;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreTaskRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:2000'],
            'status' => ['nullable', Rule::enum(TaskStatus::class)],
            'priority' => ['nullable', Rule::enum(TaskPriority::class)],
            'due_date' => ['nullable', 'date', 'after_or_equal:today'],
            'assignee_ids' => ['nullable', 'array'],
            'assignee_ids.*' => ['exists:users,id'],
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
            'title.required' => 'Le titre de la tâche est requis.',
            'title.max' => 'Le titre ne doit pas dépasser 255 caractères.',
            'description.max' => 'La description ne doit pas dépasser 2000 caractères.',
            'status.enum' => 'Le statut doit être: todo, in_progress ou done.',
            'priority.enum' => 'La priorité doit être: low, medium ou high.',
            'due_date.date' => 'La date d\'échéance doit être une date valide.',
            'due_date.after_or_equal' => 'La date d\'échéance doit être aujourd\'hui ou après.',
            'assignee_ids.array' => 'Les assignés doivent être un tableau.',
            'assignee_ids.*.exists' => 'Un des utilisateurs assignés n\'existe pas.',
        ];
    }
}
