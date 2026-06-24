<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Adoption;
use App\Models\Animal;
use App\Models\Shelter;
use Illuminate\Http\JsonResponse;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    /**
     * Estadísticas globales para el panel administrativo.
     *
     * IMPORTANTE: usamos withoutGlobalScopes() porque el modelo Animal y Adoption
     * tienen un global scope multi-tenant que filtra por shelter_id del usuario auth.
     * Como el panel admin funciona sin auth activa, el scope no filtra pero puede
     * generar errores. withoutGlobalScopes() lo elimina de forma segura.
     */
    public function stats(): JsonResponse
    {
        // Animales por estado — sin scope
        $animalsByStatus = Animal::withoutGlobalScopes()
            ->select('lifecycle_status', DB::raw('count(*) as total'))
            ->groupBy('lifecycle_status')
            ->pluck('total', 'lifecycle_status')
            ->toArray();

        // Adopciones por estado — sin scope
        $adoptionsByStatus = Adoption::withoutGlobalScopes()
            ->select('status', DB::raw('count(*) as total'))
            ->groupBy('status')
            ->pluck('total', 'status')
            ->toArray();

        // Últimas 5 adopciones — sin scope, con relaciones básicas
        $recentAdoptions = Adoption::withoutGlobalScopes()
            ->with([
                'animal' => fn ($q) => $q->withoutGlobalScopes()->select('id', 'name', 'species'),
                'shelter:id,name',
            ])
            ->latest()
            ->limit(5)
            ->get(['id', 'shelter_id', 'animal_id', 'applicant_name', 'status', 'created_at']);

        // Albergues
        $shelterStats = Shelter::select(
            DB::raw('count(*) as total'),
            DB::raw('sum(case when is_active then 1 else 0 end) as active')
        )->first();

        return response()->json([
            'animals' => [
                'total'       => array_sum($animalsByStatus),
                'apto'        => $animalsByStatus['apto']        ?? 0,
                'cuarentena'  => $animalsByStatus['cuarentena']  ?? 0,
                'tratamiento' => $animalsByStatus['tratamiento'] ?? 0,
                'adoptado'    => $animalsByStatus['adoptado']    ?? 0,
            ],
            'adoptions' => [
                'total'      => array_sum($adoptionsByStatus),
                'pendiente'  => $adoptionsByStatus['pendiente']  ?? 0,
                'evaluacion' => $adoptionsByStatus['evaluacion'] ?? 0,
                'aprobado'   => $adoptionsByStatus['aprobado']   ?? 0,
                'rechazado'  => $adoptionsByStatus['rechazado']  ?? 0,
                'adoptado'   => $adoptionsByStatus['adoptado']   ?? 0,
            ],
            'shelters' => [
                'total'  => (int) ($shelterStats->total  ?? 0),
                'active' => (int) ($shelterStats->active ?? 0),
            ],
            'recent_adoptions' => $recentAdoptions,
        ]);
    }
}
