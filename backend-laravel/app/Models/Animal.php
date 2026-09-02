<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\Cache;

class Animal extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'shelter_id',
        'name',
        'species',
        'estimated_age',
        'health_status',
        'is_sterilized',
        'lifecycle_status',
    ];

    protected $casts = [
        'is_sterilized' => 'boolean',
    ];

    /*
    |--------------------------------------------------------------------------
    | Relaciones
    |--------------------------------------------------------------------------
    */

    public function photos()
    {
        return $this->hasMany(AnimalPhoto::class);
    }

    public function adoptions()
    {
        return $this->hasMany(Adoption::class);
    }

    public function shelter()
    {
        return $this->belongsTo(Shelter::class);
    }

    /*
    |--------------------------------------------------------------------------
    | Multi-Tenant Global Scope
    |--------------------------------------------------------------------------
    */

    protected static function booted()
    {
        static::addGlobalScope('shelter', function (Builder $builder) {
            if (auth()->check() && auth()->user()->shelter_id) {
                $builder->where('shelter_id', auth()->user()->shelter_id);
            }
        });

        // Altas/bajas/cambios de estado cambian el animals_count y la lista
        // pública cacheados en PublicShelterController — sin esto quedan
        // desactualizados hasta que expire el Cache::remember (hasta 60s).
        $forgetPublicCache = function (Animal $animal) {
            Cache::forget('public_shelters_index');
            if ($slug = $animal->shelter?->slug) {
                Cache::forget("public_shelter_animals_{$slug}");
            }
        };
        static::saved($forgetPublicCache);
        static::deleted($forgetPublicCache);
    }
}