<?php

use App\Http\Controllers\Api\AdoptionController;
use App\Http\Controllers\Api\AnimalController;
use App\Http\Controllers\Api\ShelterController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\DonationController;
use App\Http\Controllers\Api\PublicShelterController;
use App\Http\Controllers\Api\AdminPaymentMethodController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\SuperAdminController;
use Illuminate\Support\Facades\Route;

// ── Autenticación ───────────────────────────────────────────────────────────
Route::prefix('v1/auth')->group(function () {
    Route::post('register/persona', [AuthController::class, 'registerPerson']);
    Route::post('register/albergue', [AuthController::class, 'registerShelter']);
    Route::post('login', [AuthController::class, 'login']);
    Route::middleware('auth:sanctum')->group(function () {
        Route::get('me', [AuthController::class, 'me']);
        Route::put('profile', [AuthController::class, 'updateProfile']);
        Route::put('password', [AuthController::class, 'updatePassword']);
        Route::post('profile/photo', [AuthController::class, 'updatePhoto']);
        Route::post('logout', [AuthController::class, 'logout']);
    });
});

// ── Super Admin ─────────────────────────────────────────────────────────────
Route::prefix('v1/superadmin')->middleware(['auth:sanctum', 'role:super_admin'])->group(function () {
    Route::get('dashboard', [SuperAdminController::class, 'dashboard']);
    Route::get('shelters', [SuperAdminController::class, 'shelters']);
    Route::patch('shelters/{shelter}/status', [SuperAdminController::class, 'updateShelterStatus']);
    Route::get('users', [SuperAdminController::class, 'users']);
});

// ── Animales ────────────────────────────────────────────────────────────────
Route::apiResource('v1/animals', AnimalController::class);

// ── Adopciones ───────────────────────────────────────────────────────────────
Route::prefix('v1')->group(function () {
    Route::get('adoptions',                       [AdoptionController::class, 'index']);
    Route::post('adoptions',                      [AdoptionController::class, 'store'])->middleware(['auth:sanctum', 'role:natural_person']);
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
    Route::post('donations',                    [DonationController::class, 'store'])->middleware(['auth:sanctum', 'role:natural_person']);

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

// ── Gastos ────────────────────────────────────────────────────────────────
Route::prefix('v1/admin')->middleware(['auth:sanctum', 'admin.role'])->group(function () {
    Route::get('expenses',              [\App\Http\Controllers\Api\ExpenseController::class, 'index']);
    Route::post('expenses',             [\App\Http\Controllers\Api\ExpenseController::class, 'store']);
    Route::get('expenses/{expense}',    [\App\Http\Controllers\Api\ExpenseController::class, 'show']);
    Route::delete('expenses/{expense}', [\App\Http\Controllers\Api\ExpenseController::class, 'destroy']);
});

Route::prefix('v1')->group(function () {
    // Compatibilidad temporal para clientes antiguos.
    Route::middleware(['auth:sanctum', 'admin.role'])->group(function () {
        Route::get('donations/{donation}',          [DonationController::class, 'show']);
        Route::patch('donations/{donation}/status', [DonationController::class, 'updateStatus']);
    });
});
