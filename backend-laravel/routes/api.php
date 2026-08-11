<?php

use App\Http\Controllers\Api\AdoptionController;
use App\Http\Controllers\Api\AnimalController;
use App\Http\Controllers\Api\ShelterController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\DonationController;
use App\Http\Controllers\Api\LostFoundPostController;
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
    Route::get('lost-found-posts', [SuperAdminController::class, 'lostFoundPosts']);
    Route::patch('lost-found-posts/{post}/status', [SuperAdminController::class, 'updateLostFoundPostStatus']);
});

// ── Animales ────────────────────────────────────────────────────────────────
Route::prefix('v1')->group(function () {
    Route::get('animals',            [AnimalController::class, 'index']);
    Route::get('animals/{animal}',   [AnimalController::class, 'show']);

    Route::middleware(['auth:sanctum', 'role:shelter_admin,super_admin'])->group(function () {
        Route::post('animals',              [AnimalController::class, 'store']);
        Route::put('animals/{animal}',      [AnimalController::class, 'update']);
        Route::delete('animals/{animal}',   [AnimalController::class, 'destroy']);
    });
});

// ── Adopciones ───────────────────────────────────────────────────────────────
Route::prefix('v1')->group(function () {
    Route::post('adoptions', [AdoptionController::class, 'store'])->middleware(['auth:sanctum', 'role:natural_person']);

    // debe ir antes de 'adoptions/{adoption}' para que "mine" no se interprete como un id
    Route::get('adoptions/mine', [AdoptionController::class, 'mine'])->middleware('auth:sanctum');

    Route::middleware(['auth:sanctum', 'admin.role'])->group(function () {
        Route::get('adoptions',                       [AdoptionController::class, 'index']);
        Route::get('adoptions/{adoption}',            [AdoptionController::class, 'show']);
        Route::patch('adoptions/{adoption}/status',   [AdoptionController::class, 'updateStatus']);
        Route::delete('adoptions/{adoption}',         [AdoptionController::class, 'destroy']);
    });
});

// ── Albergues ────────────────────────────────────────────────────────────────
Route::prefix('v1')->group(function () {
    Route::get('shelters',                        [ShelterController::class, 'index']);
    Route::get('shelters/{shelter}',              [ShelterController::class, 'show']);

    Route::middleware(['auth:sanctum', 'role:super_admin'])->group(function () {
        Route::post('shelters',                       [ShelterController::class, 'store']);
        Route::put('shelters/{shelter}',              [ShelterController::class, 'update']);
        Route::delete('shelters/{shelter}',           [ShelterController::class, 'destroy']);
        Route::patch('shelters/{shelter}/toggle',     [ShelterController::class, 'toggleActive']);
    });
});

// ── Mascotas perdidas / encontradas ──────────────────────────────────────────
Route::prefix('v1')->group(function () {
    Route::get('lost-found-posts',            [LostFoundPostController::class, 'index']);

    Route::middleware('auth:sanctum')->group(function () {
        // debe ir antes de '{post}' para que "mine" no se interprete como un id
        Route::get('lost-found-posts/mine',       [LostFoundPostController::class, 'mine']);
        Route::delete('lost-found-posts/{post}',  [LostFoundPostController::class, 'destroy']);
    });

    Route::post('lost-found-posts', [LostFoundPostController::class, 'store'])
        ->middleware(['auth:sanctum', 'role:natural_person']);

    Route::get('lost-found-posts/{post}', [LostFoundPostController::class, 'show']);
});


// ── Donaciones ────────────────────────────────────────────────────────────────
Route::prefix('v1')->group(function () {
    Route::post('donations',                    [DonationController::class, 'store'])->middleware(['auth:sanctum', 'role:natural_person']);

    // debe ir antes de 'donations/{donation}' para que "mine" no se interprete como un id
    Route::get('donations/mine', [DonationController::class, 'mine'])->middleware('auth:sanctum');

    Route::get('public/shelters',                        [PublicShelterController::class, 'index']);
    Route::get('public/shelters/{slug}',                  [PublicShelterController::class, 'show']);
    Route::get('public/shelters/{slug}/animals',          [PublicShelterController::class, 'animals']);
    Route::get('public/shelters/{slug}/transparency',     [PublicShelterController::class, 'transparency']);

    // Compatibilidad temporal: protegido igual que las rutas admin.
    Route::middleware(['auth:sanctum', 'admin.role'])->get('donations', [DonationController::class, 'adminIndex']);
});

Route::prefix('v1/admin')->middleware(['auth:sanctum', 'admin.role'])->group(function () {
    Route::get('dashboard/stats',               [DashboardController::class, 'stats']);
    Route::get('donations',                     [DonationController::class, 'adminIndex']);
    Route::get('donations/export.csv',          [DonationController::class, 'exportCsv']);
    Route::patch('donations/{donation}/status', [DonationController::class, 'updateStatus']);
    Route::put('shelters/{shelter}/profile',    [ShelterController::class, 'updateProfile']);
    Route::post('shelters/{shelter}/logo',      [ShelterController::class, 'updateLogo']);
    Route::post('shelters/{shelter}/payment-methods', [AdminPaymentMethodController::class, 'update']);
    Route::delete('shelters/{shelter}/payment-methods/{method}/qr', [AdminPaymentMethodController::class, 'destroyQr']);
    
});

// ── Gastos ────────────────────────────────────────────────────────────────
Route::prefix('v1/admin')->middleware(['auth:sanctum', 'admin.role'])->group(function () {
    Route::get('expenses',              [\App\Http\Controllers\Api\ExpenseController::class, 'index']);
    Route::post('expenses',             [\App\Http\Controllers\Api\ExpenseController::class, 'store']);
    Route::get('expenses/{expense}',    [\App\Http\Controllers\Api\ExpenseController::class, 'show']);
    Route::put('expenses/{expense}', [\App\Http\Controllers\Api\ExpenseController::class, 'update']);
    Route::delete('expenses/{expense}', [\App\Http\Controllers\Api\ExpenseController::class, 'destroy']);
    
});

Route::prefix('v1')->group(function () {
    // Compatibilidad temporal para clientes antiguos.
    Route::middleware(['auth:sanctum', 'admin.role'])->group(function () {
        Route::get('donations/{donation}',          [DonationController::class, 'show']);
        Route::patch('donations/{donation}/status', [DonationController::class, 'updateStatus']);
    });
});
