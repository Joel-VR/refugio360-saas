<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Adoption;
use App\Models\Animal;
use App\Models\Shelter;
use Illuminate\Http\JsonResponse;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function stats(): JsonResponse
    {
        // Cacheado por usuario (el global scope de Animal/Adoption filtra por su
        // shelter_id, así que la clave debe ser por-tenant para no filtrar datos).
        $cacheKey = 'dashboard_stats_user_' . Auth::id();

        $stats = Cache::remember($cacheKey, 30, function () {
            // Animales por estado — usa el global scope del modelo para filtrar por shelter_id del usuario
            $animalsByStatus = Animal::select('lifecycle_status', DB::raw('count(*) as total'))
                ->groupBy('lifecycle_status')
                ->pluck('total', 'lifecycle_status')
                ->toArray();

            // Adopciones por estado — usa el global scope del modelo
            $adoptionsByStatus = Adoption::select('status', DB::raw('count(*) as total'))
                ->groupBy('status')
                ->pluck('total', 'status')
                ->toArray();

            // Últimas 5 adopciones — usa el global scope
            $recentAdoptions = Adoption::with([
                    'animal:id,name,species',
                    'shelter:id,name',
                ])
                ->latest()
                ->limit(5)
                ->get(['id', 'shelter_id', 'animal_id', 'applicant_name', 'status', 'created_at'])
                ->toArray();

            return [
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
                'recent_adoptions' => $recentAdoptions,
            ];
        });

        return response()->json($stats);
    }
}
