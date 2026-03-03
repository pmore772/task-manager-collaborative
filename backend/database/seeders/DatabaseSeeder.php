<?php

namespace Database\Seeders;

use App\Models\Project;
use App\Models\Task;
use App\Models\User;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Create demo user
        $user = User::factory()->create([
            'name' => 'Demo User',
            'email' => 'demo@example.com',
            'password' => bcrypt('password'),
        ]);

        // Create additional users for task assignment
        $users = User::factory()->count(5)->create();

        // Create projects for demo user
        $projects = Project::factory()->count(3)->create(['user_id' => $user->id]);

        foreach ($projects as $project) {
            // Create tasks with various statuses and priorities
            Task::factory()->count(5)->create([
                'project_id' => $project->id,
                'creator_id' => $user->id,
            ])->each(function ($task) use ($users) {
                // Randomly assign some users to tasks
                $task->assignees()->attach(
                    $users->random(rand(0, 3))->pluck('id')
                );
            });

            // Create some overdue tasks
            Task::factory()->count(2)->overdue()->create([
                'project_id' => $project->id,
                'creator_id' => $user->id,
            ]);
        }
    }
}
