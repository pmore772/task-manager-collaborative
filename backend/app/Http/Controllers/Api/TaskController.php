<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Task\StoreTaskRequest;
use App\Http\Requests\Task\UpdateTaskRequest;
use App\Http\Requests\Task\UpdateTaskStatusRequest;
use App\Http\Requests\Task\AssignTaskRequest;
use App\Http\Resources\TaskResource;
use App\Models\Project;
use App\Models\Task;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class TaskController extends Controller
{
    /**
     * Display all tasks for the authenticated user (across all projects).
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        $query = Task::whereHas('project', function ($q) {
            $q->where('user_id', auth()->id());
        })
        ->orWhereHas('assignees', function ($q) {
            $q->where('user_id', auth()->id());
        })
        ->with(['project', 'creator', 'assignees']);

        // Filter by status
        if ($request->has('status') && $request->status) {
            $query->where('status', $request->status);
        }

        // Filter by priority
        if ($request->has('priority') && $request->priority) {
            $query->where('priority', $request->priority);
        }

        // Filter by project
        if ($request->has('project_id') && $request->project_id) {
            $query->where('project_id', $request->project_id);
        }

        $tasks = $query->orderBy('created_at', 'desc')->get();

        return TaskResource::collection($tasks);
    }

    /**
     * Display tasks for a specific project.
     */
    public function projectTasks(Request $request, Project $project): AnonymousResourceCollection
    {
        $this->authorize('view', $project);

        $query = $project->tasks()->with(['creator', 'assignees']);

        // Filter by status
        if ($request->has('status') && $request->status) {
            $query->where('status', $request->status);
        }

        // Filter by priority
        if ($request->has('priority') && $request->priority) {
            $query->where('priority', $request->priority);
        }

        $tasks = $query->orderBy('created_at', 'desc')->get();

        return TaskResource::collection($tasks);
    }

    /**
     * Store a newly created task.
     */
    public function store(StoreTaskRequest $request, Project $project): JsonResponse
    {
        $this->authorize('update', $project);

        $task = $project->tasks()->create([
            ...$request->validated(),
            'creator_id' => auth()->id(),
        ]);

        // Assign users if provided
        if ($request->has('assignee_ids')) {
            $task->assignees()->sync($request->assignee_ids);
        }

        $task->load(['creator', 'assignees', 'project']);

        return response()->json([
            'message' => 'Tâche créée avec succès',
            'data' => new TaskResource($task)
        ], 201);
    }

    /**
     * Display the specified task.
     */
    public function show(Task $task): JsonResponse
    {
        $this->authorize('view', $task);

        $task->load(['project', 'creator', 'assignees']);

        return response()->json([
            'data' => new TaskResource($task)
        ]);
    }

    /**
     * Update the specified task.
     */
    public function update(UpdateTaskRequest $request, Task $task): JsonResponse
    {
        $this->authorize('update', $task);

        $task->update($request->validated());

        // Update assignees if provided
        if ($request->has('assignee_ids')) {
            $task->assignees()->sync($request->assignee_ids);
        }

        $task->load(['creator', 'assignees', 'project']);

        return response()->json([
            'message' => 'Tâche mise à jour avec succès',
            'data' => new TaskResource($task)
        ]);
    }

    /**
     * Update task status only.
     */
    public function updateStatus(UpdateTaskStatusRequest $request, Task $task): JsonResponse
    {
        $this->authorize('update', $task);

        $task->update(['status' => $request->status]);

        $task->load(['creator', 'assignees', 'project']);

        return response()->json([
            'message' => 'Statut mis à jour avec succès',
            'data' => new TaskResource($task)
        ]);
    }

    /**
     * Assign users to a task.
     */
    public function assign(AssignTaskRequest $request, Task $task): JsonResponse
    {
        $this->authorize('update', $task);

        $task->assignees()->sync($request->user_ids);

        $task->load(['creator', 'assignees', 'project']);

        return response()->json([
            'message' => 'Assignation mise à jour avec succès',
            'data' => new TaskResource($task)
        ]);
    }

    /**
     * Remove the specified task.
     */
    public function destroy(Task $task): JsonResponse
    {
        $this->authorize('delete', $task);

        $task->delete();

        return response()->json([
            'message' => 'Tâche supprimée avec succès'
        ]);
    }
}
