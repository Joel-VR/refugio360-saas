<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureRole
{
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        $user = $request->user();

        if (!$user || !in_array($user->role, $roles, true)) {
            return response()->json(['message' => 'No autorizado para este rol.'], 403);
        }

        if (!$user->status) {
            return response()->json(['message' => 'Tu cuenta aún no está activa.'], 403);
        }

        if ($user->role === 'shelter_admin' && optional($user->shelter)->approval_status !== 'approved') {
            return response()->json(['message' => 'El albergue aún no está aprobado.'], 403);
        }

        return $next($request);
    }
}
