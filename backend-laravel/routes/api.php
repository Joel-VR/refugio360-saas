<?php

use App\Http\Controllers\Api\AdoptionController;
use App\Http\Controllers\Api\AnimalController;
use Illuminate\Support\Facades\Route;

// animales
Route::apiResource('v1/animals', AnimalController::class);

// adopciones
Route::prefix('v1')->group(function () {
    Route::get('adoptions',                          [AdoptionController::class, 'index']);
    Route::post('adoptions',                         [AdoptionController::class, 'store']);
    Route::get('adoptions/{adoption}',               [AdoptionController::class, 'show']);
    Route::patch('adoptions/{adoption}/status',      [AdoptionController::class, 'updateStatus']);
    Route::delete('adoptions/{adoption}',            [AdoptionController::class, 'destroy']);
});