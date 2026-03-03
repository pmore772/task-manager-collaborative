<?php

namespace App\Policies;

use App\Models\Task;
use App\Models\User;

class TaskPolicy
{
    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, Task $task): bool
    {
        // User can view if they own the project or are assigned to the task
        return $user->id === $task->project->user_id 
            || $task->assignees->contains($user);
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, Task $task): bool
    {
        // User can update if they own the project or are assigned to the task
        return $user->id === $task->project->user_id 
            || $task->assignees->contains($user);
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, Task $task): bool
    {
        // Only project owner can delete tasks
        return $user->id === $task->project->user_id;
    }
}
