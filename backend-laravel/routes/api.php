<?php

use App\Http\Controllers\Api\AnimalController;
use Illuminate\Support\Facades\Route;

Route::apiResource('v1/animals', AnimalController::class);
