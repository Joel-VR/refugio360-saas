<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Builder;

class Adoption extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'shelter_id',
        'animal_id',
        'applicant_name',
        'dni',
        'phone',
        'address',
        'status',
        'pdf_path',
        'notes',
    ];

    /*
    |--------------------------------------------------------------------------
    | Relaciones
    |--------------------------------------------------------------------------
    */

    public function shelter()
    {
        return $this->belongsTo(Shelter::class);
    }

    public function animal()
    {
        return $this->belongsTo(Animal::class);
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
    }
}