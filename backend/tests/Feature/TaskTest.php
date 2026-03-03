<?php

namespace Tests\Feature;

use App\Models\Project;
use App\Models\Task;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use PHPOpenSourceSaver\JWTAuth\Facades\JWTAuth;
use Tests\TestCase;

class TaskTest extends TestCase
{
    use RefreshDatabase;

    protected User $user;
    protected Project $project;
    protected string $token;

    protected function setUp(): void
    {
        parent::setUp();
        
        $this->user = User::factory()->create();
        $this->project = Project::factory()->create(['user_id' => $this->user->id]);
        $this->token = JWTAuth::fromUser($this->user);
    }

    /**
     * Test creating a task.
     */
    public function test_user_can_create_task(): void
    {
        $taskData = [
            'title' => 'New Test Task',
            'description' => 'Task description',
            'status' => 'todo',
            'priority' => 'high',
        ];

        $response = $this->withHeader('Authorization', 'Bearer ' . $this->token)
            ->postJson("/api/projects/{$this->project->id}/tasks", $taskData);

        $response->assertStatus(201)
            ->assertJson([
                'message' => 'Tâche créée avec succès',
                'data' => [
                    'title' => 'New Test Task',
                    'description' => 'Task description',
                    'status' => 'todo',
                    'priority' => 'high',
                ]
            ]);

        $this->assertDatabaseHas('tasks', [
            'title' => 'New Test Task',
            'project_id' => $this->project->id,
            'creator_id' => $this->user->id,
        ]);
    }

    /**
     * Test task creation validation.
     */
    public function test_task_creation_requires_title(): void
    {
        $response = $this->withHeader('Authorization', 'Bearer ' . $this->token)
            ->postJson("/api/projects/{$this->project->id}/tasks", [
                'description' => 'Task without title',
            ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['title']);
    }

    /**
     * Test updating task status.
     */
    public function test_user_can_update_task_status(): void
    {
        $task = Task::factory()->create([
            'project_id' => $this->project->id,
            'creator_id' => $this->user->id,
            'status' => 'todo',
        ]);

        $response = $this->withHeader('Authorization', 'Bearer ' . $this->token)
            ->patchJson("/api/tasks/{$task->id}/status", [
                'status' => 'in_progress',
            ]);

        $response->assertStatus(200)
            ->assertJson([
                'message' => 'Statut mis à jour avec succès',
                'data' => [
                    'status' => 'in_progress',
                ]
            ]);

        $this->assertDatabaseHas('tasks', [
            'id' => $task->id,
            'status' => 'in_progress',
        ]);
    }

    /**
     * Test assigning users to task.
     */
    public function test_user_can_assign_users_to_task(): void
    {
        $task = Task::factory()->create([
            'project_id' => $this->project->id,
            'creator_id' => $this->user->id,
        ]);

        $assignees = User::factory()->count(2)->create();

        $response = $this->withHeader('Authorization', 'Bearer ' . $this->token)
            ->postJson("/api/tasks/{$task->id}/assign", [
                'user_ids' => $assignees->pluck('id')->toArray(),
            ]);

        $response->assertStatus(200)
            ->assertJson([
                'message' => 'Assignation mise à jour avec succès',
            ]);

        $this->assertCount(2, $task->fresh()->assignees);
    }

    /**
     * Test filtering tasks by status.
     */
    public function test_user_can_filter_tasks_by_status(): void
    {
        Task::factory()->count(3)->create([
            'project_id' => $this->project->id,
            'creator_id' => $this->user->id,
            'status' => 'todo',
        ]);

        Task::factory()->count(2)->create([
            'project_id' => $this->project->id,
            'creator_id' => $this->user->id,
            'status' => 'done',
        ]);

        $response = $this->withHeader('Authorization', 'Bearer ' . $this->token)
            ->getJson('/api/tasks?status=todo');

        $response->assertStatus(200);
        $this->assertCount(3, $response->json('data'));
    }

    /**
     * Test filtering tasks by priority.
     */
    public function test_user_can_filter_tasks_by_priority(): void
    {
        Task::factory()->count(2)->create([
            'project_id' => $this->project->id,
            'creator_id' => $this->user->id,
            'priority' => 'high',
        ]);

        Task::factory()->count(3)->create([
            'project_id' => $this->project->id,
            'creator_id' => $this->user->id,
            'priority' => 'low',
        ]);

        $response = $this->withHeader('Authorization', 'Bearer ' . $this->token)
            ->getJson('/api/tasks?priority=high');

        $response->assertStatus(200);
        $this->assertCount(2, $response->json('data'));
    }

    /**
     * Test deleting a task.
     */
    public function test_user_can_delete_task(): void
    {
        $task = Task::factory()->create([
            'project_id' => $this->project->id,
            'creator_id' => $this->user->id,
        ]);

        $response = $this->withHeader('Authorization', 'Bearer ' . $this->token)
            ->deleteJson("/api/tasks/{$task->id}");

        $response->assertStatus(200)
            ->assertJson([
                'message' => 'Tâche supprimée avec succès',
            ]);

        $this->assertDatabaseMissing('tasks', ['id' => $task->id]);
    }

    /**
     * Test unauthorized access to another user's task.
     */
    public function test_user_cannot_access_other_users_tasks(): void
    {
        $otherUser = User::factory()->create();
        $otherProject = Project::factory()->create(['user_id' => $otherUser->id]);
        $task = Task::factory()->create([
            'project_id' => $otherProject->id,
            'creator_id' => $otherUser->id,
        ]);

        $response = $this->withHeader('Authorization', 'Bearer ' . $this->token)
            ->getJson("/api/tasks/{$task->id}");

        $response->assertStatus(403);
    }
}
