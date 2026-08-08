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
        'user_id',
        'shelter_id',
        'animal_id',
        'donor_name',
        'donor_email',
        'amount',
        'payment_method',
        'operation_reference',
        'voucher_path',
        'notes',
        'status',
        'donation_type',
        'is_recurring',
        'is_anonymous',
        'admin_notes',
    ];

    protected $casts = [
        'amount'       => 'decimal:2',
        'is_recurring' => 'boolean',
        'is_anonymous' => 'boolean',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function shelter()
    {
        return $this->belongsTo(Shelter::class);
    }

    public function animal()
    {
        return $this->belongsTo(Animal::class)->withDefault();
    }

    protected static function booted()
    {
        static::addGlobalScope('shelter', function (Builder $builder) {
            if (auth()->check() && auth()->user()->shelter_id) {
                $builder->where('shelter_id', auth()->user()->shelter_id);
            }
        });
    }
}
