<?php

use App\Http\Controllers\Api\AdoptionController;
use App\Http\Controllers\Api\AnimalController;
use App\Http\Controllers\Api\ShelterController;
use App\Http\Controllers\Api\DashboardController;
use Illuminate\Support\Facades\Route;

// ── Animales ────────────────────────────────────────────────────────────────
Route::apiResource('v1/animals', AnimalController::class);

// ── Adopciones ───────────────────────────────────────────────────────────────
Route::prefix('v1')->group(function () {
    Route::get('adoptions',                       [AdoptionController::class, 'index']);
    Route::post('adoptions',                      [AdoptionController::class, 'store']);
    Route::get('adoptions/{adoption}',            [AdoptionController::class, 'show']);
    Route::patch('adoptions/{adoption}/status',   [AdoptionController::class, 'updateStatus']);
    Route::delete('adoptions/{adoption}',         [AdoptionController::class, 'destroy']);
});

// ── Albergues ────────────────────────────────────────────────────────────────
Route::prefix('v1')->group(function () {
    Route::get('shelters',                        [ShelterController::class, 'index']);
    Route::post('shelters',                       [ShelterController::class, 'store']);
    Route::get('shelters/{shelter}',              [ShelterController::class, 'show']);
    Route::put('shelters/{shelter}',              [ShelterController::class, 'update']);
    Route::delete('shelters/{shelter}',           [ShelterController::class, 'destroy']);
    Route::patch('shelters/{shelter}/toggle',     [ShelterController::class, 'toggleActive']);
});

// ── Dashboard / Estadísticas ─────────────────────────────────────────────────
Route::prefix('v1')->group(function () {
    Route::get('dashboard/stats',                 [DashboardController::class, 'stats']);
});
