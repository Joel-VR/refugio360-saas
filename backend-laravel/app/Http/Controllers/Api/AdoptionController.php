<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreAdoptionRequest;
use App\Http\Resources\AdoptionResource;
use App\Models\Adoption;
use App\Models\Animal;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class AdoptionController extends Controller
{
    /**
     * listar todas las solicitudes de adopcion
     * permite filtrar por status y por animal_id.
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        $query = Adoption::with(['animal.photos', 'shelter']);

        if ($request->filled('status')) {
            $query->where('status', $request->string('status'));
        }

        if ($request->filled('animal_id')) {
            $query->where('animal_id', $request->integer('animal_id'));
        }

        $perPage = min($request->integer('per_page', 20), 100);

        // se retorna directamente (no envuelto en response()->json()) para que
        // Laravel agregue el wrapper de paginación data/links/meta.
        return AdoptionResource::collection($query->latest()->paginate($perPage));
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

        $adoption = Adoption::create([
            ...$request->validated(),
            'shelter_id' => $animal->shelter_id,
            'user_id' => $request->user()->id,
        ]);

        return response()->json($adoption->load(['animal.photos', 'shelter']), 201);
    }

    /**
     * solicitudes del usuario autenticado, en cualquier estado.
     */
    public function mine(Request $request): AnonymousResourceCollection
    {
        $perPage = min($request->integer('per_page', 20), 100);

        $adoptions = Adoption::with(['animal.photos', 'shelter'])
            ->where('user_id', $request->user()->id)
            ->latest()
            ->paginate($perPage);

        return AdoptionResource::collection($adoptions);
    }

    /**
     * ver el detalle de una solicitud especifica
     */
    public function show(Adoption $adoption): JsonResponse
    {
        return response()->json(new AdoptionResource($adoption->load(['animal.photos', 'shelter'])));
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

        return response()->json(new AdoptionResource($adoption->fresh()->load(['animal.photos', 'shelter'])));
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