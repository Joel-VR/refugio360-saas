<?php

namespace App\Models;

use App\Models\Expense;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;

class Shelter extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'name',
        'slug',
        'description',
        'email',
        'phone',
        'address',
        'logo_path',
        'is_active',
        'approval_status',
        'yape_phone',
        'yape_owner',
        'yape_qr_path',
        'plin_phone',
        'plin_owner',
        'plin_qr_path',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    // Relaciones
    public function users()
    {
        return $this->hasMany(User::class);
    }

    public function animals()
    {
        return $this->hasMany(Animal::class);
    }

    public function adoptions()
    {
        return $this->hasMany(Adoption::class);
    }

    public function donations()
    {
        return $this->hasMany(Donation::class);
    }

    public function expenses()
    {
        return $this->hasMany(Expense::class);
    }

    // Método para obtener QR de Yape o Plin
    public function getQrUrl(string $method): ?string
    {
        $field = $method . '_qr_path';
        return $this->$field
            ? asset('storage/' . $this->$field)
            : null;
    }
}
