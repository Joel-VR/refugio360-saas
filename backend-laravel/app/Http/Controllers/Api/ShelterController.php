<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Shelter;
use App\Models\Animal;
use App\Models\Adoption;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class ShelterController extends Controller
{
    /**
     * Listar todos los albergues con conteo de animales y adopciones.
     *
     * withCount usa sub-queries directas sobre las tablas, sin pasar por
     * los global scopes de Animal/Adoption, así que es seguro.
     */
    public function index(Request $request): JsonResponse
    {
        $perPage = min($request->integer('per_page', 20), 100);

        $shelters = Shelter::withCount(['animals', 'adoptions'])
            ->when($request->boolean('only_active'), fn ($q) => $q->where('is_active', true))
            ->latest()
            ->paginate($perPage);

        return response()->json($shelters);
    }

    /**
     * Crear un nuevo albergue.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name'        => ['required', 'string', 'max:255'],
            'slug'        => ['required', 'string', 'max:100', 'unique:shelters,slug', 'regex:/^[a-z0-9\-]+$/'],
            'description' => ['nullable', 'string'],
            'email'       => ['nullable', 'email', 'max:255'],
            'phone'       => ['nullable', 'string', 'max:20'],
            'is_active'   => ['sometimes', 'boolean'],
            'approval_status' => ['sometimes', 'in:pending_review,approved,rejected'],
        ]);

        $shelter = Shelter::create($validated);

        return response()->json($shelter->loadCount(['animals', 'adoptions']), 201);
    }

    /**
     * Ver detalle de un albergue con estadísticas desagregadas.
     * Usa sub-queries directas para evitar el global scope.
     */
    public function show(Shelter $shelter): JsonResponse
    {
        $shelter->loadCount(['animals', 'adoptions']);

        // Conteos por estado — consultas directas a la BD sin pasar por scopes
        $animalStats = DB::table('animals')
            ->where('shelter_id', $shelter->id)
            ->whereNull('deleted_at')
            ->select('lifecycle_status', DB::raw('count(*) as total'))
            ->groupBy('lifecycle_status')
            ->pluck('total', 'lifecycle_status')
            ->toArray();

        $adoptionStats = DB::table('adoptions')
            ->where('shelter_id', $shelter->id)
            ->whereNull('deleted_at')
            ->select('status', DB::raw('count(*) as total'))
            ->groupBy('status')
            ->pluck('total', 'status')
            ->toArray();

        $stats = [
            'animals_apto'        => $animalStats['apto']        ?? 0,
            'animals_cuarentena'  => $animalStats['cuarentena']  ?? 0,
            'animals_tratamiento' => $animalStats['tratamiento'] ?? 0,
            'animals_adoptado'    => $animalStats['adoptado']    ?? 0,
            'adoptions_pendiente' => $adoptionStats['pendiente'] ?? 0,
            'adoptions_aprobado'  => $adoptionStats['aprobado']  ?? 0,
        ];

        return response()->json(array_merge($shelter->toArray(), ['stats' => $stats]));
    }

    /**
     * Actualizar datos de un albergue.
     */
    public function update(Request $request, Shelter $shelter): JsonResponse
    {
        $validated = $request->validate([
            'name'        => ['sometimes', 'string', 'max:255'],
            'slug'        => ['sometimes', 'string', 'max:100', 'unique:shelters,slug,' . $shelter->id, 'regex:/^[a-z0-9\-]+$/'],
            'description' => ['nullable', 'string'],
            'email'       => ['nullable', 'email', 'max:255'],
            'phone'       => ['nullable', 'string', 'max:20'],
            'is_active'   => ['sometimes', 'boolean'],
            'approval_status' => ['sometimes', 'in:pending_review,approved,rejected'],
        ]);

        $shelter->update($validated);

        return response()->json($shelter->fresh()->loadCount(['animals', 'adoptions']));
    }

    /**
     * Eliminar (soft delete) un albergue.
     */
    public function destroy(Shelter $shelter): JsonResponse
    {
        $shelter->delete();

        return response()->json(null, 204);
    }

    /**
     * Toggle rápido activo/inactivo.
     */
    public function toggleActive(Shelter $shelter): JsonResponse
    {
        $shelter->update(['is_active' => !$shelter->is_active]);

        return response()->json($shelter->fresh()->loadCount(['animals', 'adoptions']));
    }

    /**
     * Actualizar perfil del albergue (solo datos básicos: name, description, email, phone, address).
     * Acceso: el dueño del albergue (shelter_admin) o super_admin.
     */
    public function updateProfile(Request $request, Shelter $shelter): JsonResponse
    {
        $this->authorizeShelter($request, $shelter);

        $validated = $request->validate([
            'name'        => ['sometimes', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'email'       => ['nullable', 'email', 'max:255'],
            'phone'       => ['nullable', 'string', 'max:20'],
            'address'     => ['nullable', 'string', 'max:500'],
        ]);

        $shelter->update($validated);

        return response()->json($shelter->fresh());
    }

    /**
     * Actualizar logo del albergue.
     * Acceso: el dueño del albergue (shelter_admin) o super_admin.
     */
    public function updateLogo(Request $request, Shelter $shelter): JsonResponse
    {
        $this->authorizeShelter($request, $shelter);

        $request->validate([
            'logo' => ['required', 'image', 'mimes:jpg,jpeg,png,gif', 'max:2048'],
        ]);

        if ($request->hasFile('logo')) {
            // Borrar logo anterior si existe
            if ($shelter->logo_path) {
                Storage::disk('public')->delete($shelter->logo_path);
            }
            // Guardar nuevo logo
            $shelter->logo_path = $request->file('logo')->store('shelter_logos', 'public');
            $shelter->save();
        }

        return response()->json($shelter->fresh());
    }

    /**
     * Verificar que el usuario autenticado sea el dueño del albergue o un super_admin.
     */
    private function authorizeShelter(Request $request, Shelter $shelter): void
    {
        $user = $request->user();
        if ($user->role === 'super_admin') {
            return;
        }
        if ((int) $user->shelter_id !== (int) $shelter->id) {
            abort(403, 'No puedes administrar este albergue.');
        }
    }
}
