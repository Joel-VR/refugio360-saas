<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreAdoptionRequest;
use App\Models\Adoption;
use App\Models\Animal;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdoptionController extends Controller
{
    /**
     * listar todas las solicitudes de adopcion
     * permite filtrar por status y por animal_id.
     */
    public function index(Request $request): JsonResponse
    {
        $query = Adoption::with(['animal.photos', 'shelter']);

        if ($request->filled('status')) {
            $query->where('status', $request->string('status'));
        }

        if ($request->filled('animal_id')) {
            $query->where('animal_id', $request->integer('animal_id'));
        }

        return response()->json($query->latest()->get());
    }

    /**
     * registrar una nueva solicitud de adopcion
     * calida que el animal este en estado 'apto' antes de aceptar
     */
    public function store(StoreAdoptionRequest $request): JsonResponse
    {
        $animal = Animal::findOrFail($request->integer('animal_id'));

        if ($animal->lifecycle_status !== 'apto') {
            return response()->json([
                'message' => 'El animal no está disponible para adopción en este momento.',
            ], 422);
        }

        $adoption = Adoption::create($request->validated());

        return response()->json($adoption->load(['animal.photos', 'shelter']), 201);
    }

    /**
     * ver el detalle de una solicitud especifica
     */
    public function show(Adoption $adoption): JsonResponse
    {
        return response()->json($adoption->load(['animal.photos', 'shelter']));
    }

    /**
     * cambiar el estado de una solicitud de adopcion
     * si se marca como 'adoptado', actualiza tambien el animal.
     */
    public function updateStatus(Request $request, Adoption $adoption): JsonResponse
    {
        $validated = $request->validate([
            'status' => ['required', 'in:pendiente,evaluacion,aprobado,rechazado,adoptado'],
            'notes'  => ['nullable', 'string'],
        ]);

        $adoption->update($validated);

        if ($validated['status'] === 'adoptado') {
            $adoption->animal->update(['lifecycle_status' => 'adoptado']);
        }

        return response()->json($adoption->fresh()->load(['animal.photos', 'shelter']));
    }

    /**
     * eliminar (soft delete) una solicitud de adopcion.
     */
    public function destroy(Adoption $adoption): JsonResponse
    {
        $adoption->delete();

        return response()->json(null, 204);
    }
}