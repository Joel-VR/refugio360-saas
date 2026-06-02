<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Animal;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AnimalController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Animal::with('photos');

        if ($request->filled('status')) {
            $query->where('lifecycle_status', $request->string('status'));
        }

        return response()->json($query->latest()->get());
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'shelter_id' => ['required', 'exists:shelters,id'],
            'name' => ['required', 'string', 'max:255'],
            'species' => ['required', 'string', 'max:20'],
            'estimated_age' => ['nullable', 'integer', 'min:0'],
            'health_status' => ['nullable', 'string'],
            'is_sterilized' => ['sometimes', 'boolean'],
            'lifecycle_status' => ['required', 'in:cuarentena,tratamiento,apto,adoptado'],
        ]);

        $animal = Animal::create($validated);

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
            'lifecycle_status' => ['sometimes', 'in:cuarentena,tratamiento,apto,adoptado'],
        ]);

        $animal->update($validated);

        return response()->json($animal->fresh()->load('photos'));
    }

    public function destroy(Animal $animal): JsonResponse
    {
        $animal->delete();

        return response()->json(null, 204);
    }
}
