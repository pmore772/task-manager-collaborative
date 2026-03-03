<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\ProjectController;
use App\Http\Controllers\Api\TaskController;
use App\Http\Controllers\Api\UserController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// Public routes
Route::prefix('auth')->group(function () {
    Route::post('register', [AuthController::class, 'register']);
    Route::post('login', [AuthController::class, 'login']);
});

// Protected routes
Route::middleware('jwt.auth')->group(function () {
    
    // Auth routes
    Route::prefix('auth')->group(function () {
        Route::post('logout', [AuthController::class, 'logout']);
        Route::post('refresh', [AuthController::class, 'refresh']);
        Route::get('me', [AuthController::class, 'me']);
    });

    // Dashboard
    Route::get('dashboard', [DashboardController::class, 'index']);

    // Users (for task assignment)
    Route::get('users', [UserController::class, 'index']);

    // Projects
    Route::apiResource('projects', ProjectController::class);

    // Tasks routes
    Route::get('tasks', [TaskController::class, 'index']);
    Route::get('projects/{project}/tasks', [TaskController::class, 'projectTasks']);
    Route::post('projects/{project}/tasks', [TaskController::class, 'store']);
    Route::get('tasks/{task}', [TaskController::class, 'show']);
    Route::put('tasks/{task}', [TaskController::class, 'update']);
    Route::patch('tasks/{task}/status', [TaskController::class, 'updateStatus']);
    Route::post('tasks/{task}/assign', [TaskController::class, 'assign']);
    Route::delete('tasks/{task}', [TaskController::class, 'destroy']);
});
