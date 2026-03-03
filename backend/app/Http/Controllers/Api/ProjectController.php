<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Project\StoreProjectRequest;
use App\Http\Requests\Project\UpdateProjectRequest;
use App\Http\Resources\ProjectResource;
use App\Models\Project;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class ProjectController extends Controller
{
    /**
     * Display a listing of the user's projects.
     */
    public function index(): AnonymousResourceCollection
    {
        $projects = auth()->user()->projects()
            ->withCount(['tasks', 'tasks as completed_tasks_count' => function ($query) {
                $query->where('status', 'done');
            }])
            ->orderBy('created_at', 'desc')
            ->get();

        return ProjectResource::collection($projects);
    }

    /**
     * Store a newly created project.
     */
    public function store(StoreProjectRequest $request): JsonResponse
    {
        $project = auth()->user()->projects()->create($request->validated());

        return response()->json([
            'message' => 'Projet créé avec succès',
            'data' => new ProjectResource($project)
        ], 201);
    }

    /**
     * Display the specified project.
     */
    public function show(Project $project): JsonResponse
    {
        $this->authorize('view', $project);

        $project->loadCount(['tasks', 'tasks as completed_tasks_count' => function ($query) {
            $query->where('status', 'done');
        }]);

        return response()->json([
            'data' => new ProjectResource($project)
        ]);
    }

    /**
     * Update the specified project.
     */
    public function update(UpdateProjectRequest $request, Project $project): JsonResponse
    {
        $this->authorize('update', $project);

        $project->update($request->validated());

        return response()->json([
            'message' => 'Projet mis à jour avec succès',
            'data' => new ProjectResource($project)
        ]);
    }

    /**
     * Remove the specified project.
     */
    public function destroy(Project $project): JsonResponse
    {
        $this->authorize('delete', $project);

        $project->delete();

        return response()->json([
            'message' => 'Projet supprimé avec succès'
        ]);
    }
}
