<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\LostFoundPost;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use App\Services\CloudinaryMedia;

class LostFoundPostController extends Controller
{
    /**
     * listado pÃºblico de publicaciones aprobadas, filtrable por tipo.
     */
    public function index(Request $request): JsonResponse
    {
        $query = LostFoundPost::with('user:id,name')
            ->where('status', 'approved');

        if ($request->filled('type')) {
            $query->where('type', $request->string('type'));
        }

        $perPage = min($request->integer('per_page', 20), 100);

        return response()->json($query->latest()->paginate($perPage));
    }

    /**
     * publicaciones del usuario autenticado, en cualquier estado.
     */
    public function mine(Request $request): JsonResponse
    {
        $posts = LostFoundPost::where('user_id', $request->user()->id)
            ->latest()
            ->paginate($request->integer('per_page', 20));

        return response()->json($posts);
    }

    public function show(Request $request, LostFoundPost $post): JsonResponse
    {
        $user = $request->user();
        $isOwnerOrAdmin = $user && ($user->id === $post->user_id || $user->role === 'super_admin');

        if ($post->status !== 'approved' && !$isOwnerOrAdmin) {
            abort(404);
        }

        return response()->json($post->load('user:id,name'));
    }

    public function store(Request $request, CloudinaryMedia $media): JsonResponse
    {
        $validated = $request->validate([
            'type' => ['required', 'in:perdida,encontrada'],
            'pet_name' => ['nullable', 'string', 'max:255'],
            'species' => ['nullable', 'string', 'max:100'],
            'zone' => ['required', 'string', 'max:255'],
            'description' => ['required', 'string', 'max:2000'],
            'contact_phone' => ['required', 'digits:9'],
            'photo' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:2048'],
        ]);

        $photoPath = null;
        if ($request->hasFile('photo')) {
            $photoPath = $media->upload($request->file('photo'), 'lost-found');
        }

        $post = LostFoundPost::create([
            ...$validated,
            'user_id' => $request->user()->id,
            'photo_path' => $photoPath,
            'status' => 'pending_review',
        ]);

        return response()->json($post, 201);
    }

    public function destroy(Request $request, LostFoundPost $post): JsonResponse
    {
        $user = $request->user();

        if ($user->id !== $post->user_id && $user->role !== 'super_admin') {
            abort(403, 'No puedes eliminar esta publicaciÃ³n.');
        }

        $post->delete();

        return response()->json(null, 204);
    }
}
