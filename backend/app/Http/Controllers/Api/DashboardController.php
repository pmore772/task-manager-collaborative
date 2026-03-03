<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Task;
use Illuminate\Http\JsonResponse;

class DashboardController extends Controller
{
    /**
     * Get dashboard statistics.
     */
    public function index(): JsonResponse
    {
        $userId = auth()->id();

        // Get all tasks from user's projects or assigned to user
        $userTasksQuery = Task::where(function ($query) use ($userId) {
            $query->whereHas('project', function ($q) use ($userId) {
                $q->where('user_id', $userId);
            })
            ->orWhereHas('assignees', function ($q) use ($userId) {
                $q->where('user_id', $userId);
            });
        });

        $totalTasks = (clone $userTasksQuery)->count();
        $todoTasks = (clone $userTasksQuery)->where('status', 'todo')->count();
        $inProgressTasks = (clone $userTasksQuery)->where('status', 'in_progress')->count();
        $doneTasks = (clone $userTasksQuery)->where('status', 'done')->count();
        $overdueTasks = (clone $userTasksQuery)
            ->where('due_date', '<', now())
            ->where('status', '!=', 'done')
            ->count();

        // Tasks by priority
        $highPriorityTasks = (clone $userTasksQuery)->where('priority', 'high')->where('status', '!=', 'done')->count();
        $mediumPriorityTasks = (clone $userTasksQuery)->where('priority', 'medium')->where('status', '!=', 'done')->count();
        $lowPriorityTasks = (clone $userTasksQuery)->where('priority', 'low')->where('status', '!=', 'done')->count();

        // Projects count
        $projectsCount = auth()->user()->projects()->count();

        // Recent tasks
        $recentTasks = Task::where(function ($query) use ($userId) {
            $query->whereHas('project', function ($q) use ($userId) {
                $q->where('user_id', $userId);
            })
            ->orWhereHas('assignees', function ($q) use ($userId) {
                $q->where('user_id', $userId);
            });
        })
        ->with(['project', 'assignees'])
        ->orderBy('created_at', 'desc')
        ->limit(5)
        ->get();

        return response()->json([
            'data' => [
                'statistics' => [
                    'total_tasks' => $totalTasks,
                    'todo_tasks' => $todoTasks,
                    'in_progress_tasks' => $inProgressTasks,
                    'done_tasks' => $doneTasks,
                    'overdue_tasks' => $overdueTasks,
                    'projects_count' => $projectsCount,
                ],
                'by_priority' => [
                    'high' => $highPriorityTasks,
                    'medium' => $mediumPriorityTasks,
                    'low' => $lowPriorityTasks,
                ],
                'recent_tasks' => $recentTasks,
            ]
        ]);
    }
}
