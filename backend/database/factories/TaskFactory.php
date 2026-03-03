<?php

namespace Database\Factories;

use App\Enums\TaskPriority;
use App\Enums\TaskStatus;
use App\Models\Project;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Task>
 */
class TaskFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'title' => fake()->sentence(4),
            'description' => fake()->paragraph(),
            'status' => fake()->randomElement(TaskStatus::values()),
            'priority' => fake()->randomElement(TaskPriority::values()),
            'due_date' => fake()->optional(0.7)->dateTimeBetween('now', '+1 month'),
            'project_id' => Project::factory(),
            'creator_id' => User::factory(),
        ];
    }

    /**
     * Mark task as todo.
     */
    public function todo(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => TaskStatus::TODO->value,
        ]);
    }

    /**
     * Mark task as in progress.
     */
    public function inProgress(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => TaskStatus::IN_PROGRESS->value,
        ]);
    }

    /**
     * Mark task as done.
     */
    public function done(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => TaskStatus::DONE->value,
        ]);
    }

    /**
     * Set high priority.
     */
    public function highPriority(): static
    {
        return $this->state(fn (array $attributes) => [
            'priority' => TaskPriority::HIGH->value,
        ]);
    }

    /**
     * Mark task as overdue.
     */
    public function overdue(): static
    {
        return $this->state(fn (array $attributes) => [
            'due_date' => fake()->dateTimeBetween('-1 month', '-1 day'),
            'status' => fake()->randomElement([TaskStatus::TODO->value, TaskStatus::IN_PROGRESS->value]),
        ]);
    }
}
