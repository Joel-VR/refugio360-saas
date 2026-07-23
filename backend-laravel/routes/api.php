<?php

use App\Http\Controllers\Api\AdoptionController;
use App\Http\Controllers\Api\AnimalController;
use App\Http\Controllers\Api\ShelterController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\DonationController;
use App\Http\Controllers\Api\PublicShelterController;
use App\Http\Controllers\Api\AdminPaymentMethodController;
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

// ── Donaciones ────────────────────────────────────────────────────────────────
Route::prefix('v1')->group(function () {
    Route::post('donations',                    [DonationController::class, 'store']);

    Route::get('public/shelters',                        [PublicShelterController::class, 'index']);
    Route::get('public/shelters/{slug}',                  [PublicShelterController::class, 'show']);
    Route::get('public/shelters/{slug}/animals',          [PublicShelterController::class, 'animals']);
    Route::get('public/shelters/{slug}/transparency',     [PublicShelterController::class, 'transparency']);

    // Compatibilidad temporal: protegido igual que las rutas admin.
    Route::middleware(['auth:sanctum', 'admin.role'])->get('donations', [DonationController::class, 'adminIndex']);
});

Route::prefix('v1/admin')->middleware(['auth:sanctum', 'admin.role'])->group(function () {
    Route::get('donations',                     [DonationController::class, 'adminIndex']);
    Route::get('donations/export.csv',          [DonationController::class, 'exportCsv']);
    Route::patch('donations/{donation}/status', [DonationController::class, 'updateStatus']);
    Route::post('shelters/{shelter}/payment-methods', [AdminPaymentMethodController::class, 'update']);
    Route::delete('shelters/{shelter}/payment-methods/{method}/qr', [AdminPaymentMethodController::class, 'destroyQr']);
});

Route::prefix('v1')->group(function () {
    // Compatibilidad temporal para clientes antiguos.
    Route::middleware(['auth:sanctum', 'admin.role'])->group(function () {
        Route::get('donations/{donation}',          [DonationController::class, 'show']);
        Route::patch('donations/{donation}/status', [DonationController::class, 'updateStatus']);
    });
});
