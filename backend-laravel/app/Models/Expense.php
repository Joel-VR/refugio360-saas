<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Builder;

class Expense extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'shelter_id',
        'description',
        'amount',
        'document_path',
        'expense_date',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'expense_date' => 'date',
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