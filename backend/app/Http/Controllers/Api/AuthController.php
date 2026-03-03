<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Requests\Auth\RegisterRequest;
use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    /**
     * Register a new user.
     */
    public function register(RegisterRequest $request): JsonResponse
    {
        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
        ]);

        $token = auth()->login($user);

        return $this->respondWithToken($token, $user, 201);
    }

    /**
     * Authenticate user and return token.
     */
    public function login(LoginRequest $request): JsonResponse
    {
        $credentials = $request->only('email', 'password');

        if (!$token = auth()->attempt($credentials)) {
            return response()->json([
                'message' => 'Identifiants invalides',
                'errors' => [
                    'email' => ['Ces identifiants ne correspondent pas à nos enregistrements.']
                ]
            ], 401);
        }

        return $this->respondWithToken($token, auth()->user());
    }

    /**
     * Get the authenticated user.
     */
    public function me(): JsonResponse
    {
        return response()->json([
            'data' => new UserResource(auth()->user())
        ]);
    }

    /**
     * Log the user out (invalidate the token).
     */
    public function logout(): JsonResponse
    {
        auth()->logout();

        return response()->json([
            'message' => 'Déconnexion réussie'
        ]);
    }

    /**
     * Refresh a token.
     */
    public function refresh(): JsonResponse
    {
        return $this->respondWithToken(auth()->refresh(), auth()->user());
    }

    /**
     * Get the token array structure.
     */
    protected function respondWithToken(string $token, User $user, int $status = 200): JsonResponse
    {
        return response()->json([
            'access_token' => $token,
            'token_type' => 'bearer',
            'expires_in' => auth()->factory()->getTTL() * 60,
            'user' => new UserResource($user)
        ], $status);
    }
}
