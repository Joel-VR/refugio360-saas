<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Builder;

class Donation extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'shelter_id',
        'donor_name',
        'donor_email',
        'amount',
        'payment_method',
        'operation_reference',
        'voucher_path',
        'notes',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
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