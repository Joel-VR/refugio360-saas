<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AnimalPhoto;
use App\Models\Animal;
use App\Services\CloudinaryMedia;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AnimalController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Animal::with('photos');

        if ($request->filled('status')) {
            $status = $this->normalizeLifecycleStatus($request->string('status')->toString());

            $query->where('lifecycle_status', $status);
        }

        $perPage = min($request->integer('per_page', 20), 100);

        return response()->json($query->latest()->paginate($perPage));
    }
    public function adminIndex(Request $request): JsonResponse
    {
        $query = Animal::with('photos');
        $user = $request->user();

        if ($user->role === 'shelter_admin') {
            $query->where('shelter_id', $user->shelter_id);
        }

        if ($request->filled('status')) {
            $status = $this->normalizeLifecycleStatus($request->string('status')->toString());
            $query->where('lifecycle_status', $status);
        }

        $perPage = min($request->integer('per_page', 20), 100);

        return response()->json($query->latest()->paginate($perPage));
    }


    public function store(Request $request, CloudinaryMedia $media): JsonResponse
    {
        $user = $request->user();
        $isSuperAdmin = $user->role === 'super_admin';

        $validated = $request->validate([
            'shelter_id' => [$isSuperAdmin ? 'required' : 'sometimes', 'exists:shelters,id'],
            'name' => ['required', 'string', 'max:255'],
            'species' => ['required', 'string', 'max:20'],
            'estimated_age' => ['nullable', 'integer', 'min:0'],
            'health_status' => ['nullable', 'string'],
            'is_sterilized' => ['sometimes', 'boolean'],
            'lifecycle_status' => ['required', 'in:cuarentena,tratamiento,apto,apto_adopcion,adoptado'],
            'photos' => ['nullable', 'array', 'max:3'],
            'photos.*' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:2048'],
        ]);

        if (!$isSuperAdmin) {
            $validated['shelter_id'] = $user->shelter_id;
        }

        $animal = DB::transaction(function () use ($request, $validated, $media) {
            $animalData = collect($validated)->except('photos')->all();
            $animalData['lifecycle_status'] = $this->normalizeLifecycleStatus(
                $animalData['lifecycle_status']
            );
            $animal = Animal::create($animalData);

            if ($request->hasFile('photos')) {
                foreach (array_slice($request->file('photos'), 0, 3) as $index => $photo) {
                    $path = $media->upload($photo, 'animals');

                    AnimalPhoto::create([
                        'animal_id' => $animal->id,
                        'photo_path' => $path,
                        'display_order' => $index + 1,
                    ]);
                }
            }

            return $animal;
        });

        return response()->json($animal->load('photos'), 201);
    }

    public function show(Animal $animal): JsonResponse
    {
        return response()->json($animal->load('photos'));
    }

    public function update(Request $request, Animal $animal): JsonResponse
    {
        $validated = $request->validate([
            'shelter_id' => ['sometimes', 'exists:shelters,id'],
            'name' => ['sometimes', 'string', 'max:255'],
            'species' => ['sometimes', 'string', 'max:20'],
            'estimated_age' => ['nullable', 'integer', 'min:0'],
            'health_status' => ['nullable', 'string'],
            'is_sterilized' => ['sometimes', 'boolean'],
            'lifecycle_status' => ['sometimes', 'in:cuarentena,tratamiento,apto,apto_adopcion,adoptado'],
        ]);

        if ($request->user()->role !== 'super_admin') {
            unset($validated['shelter_id']);
        }

        if (array_key_exists('lifecycle_status', $validated)) {
            $validated['lifecycle_status'] = $this->normalizeLifecycleStatus(
                $validated['lifecycle_status']
            );
        }

        $animal->update($validated);

        return response()->json($animal->fresh()->load('photos'));
    }

    public function destroy(Animal $animal): JsonResponse
    {
        $animal->delete();

        return response()->json(null, 204);
    }

    private function normalizeLifecycleStatus(string $status): string
    {
        return $status === 'apto_adopcion' ? 'apto' : $status;
    }
}
