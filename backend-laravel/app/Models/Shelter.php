<?php

namespace App\Models;

use App\Models\Expense;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\Cache;

class Shelter extends Model
{
    use HasFactory, SoftDeletes;

    protected static function booted(): void
    {
        // Sin esto, cambios de aprobación/perfil quedan invisibles hasta que
        // expire el Cache::remember de PublicShelterController (hasta 60s).
        static::saved(fn (Shelter $shelter) => $shelter->forgetPublicCache());
        static::deleted(fn (Shelter $shelter) => $shelter->forgetPublicCache());
    }

    public function forgetPublicCache(): void
    {
        Cache::forget('public_shelters_index');
        Cache::forget("public_shelter_show_{$this->slug}");
        Cache::forget("public_shelter_animals_{$this->slug}");

        if ($original = $this->getOriginal('slug')) {
            Cache::forget("public_shelter_show_{$original}");
            Cache::forget("public_shelter_animals_{$original}");
        }
    }

    protected $fillable = [
        'name',
        'slug',
        'description',
        'email',
        'phone',
        'address',
        'latitude',
        'longitude',
        'facebook_url',
        'instagram_url',
        'tiktok_url',
        'whatsapp_url',
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

    public function sponsors()
    {
        return $this->hasMany(ShelterSponsor::class)->orderBy('order');
    }

    // MÃ©todo para obtener QR de Yape o Plin
    public function getQrUrl(string $method): ?string
    {
        $field = $method . '_qr_path';
        return $this->$field
            ? $this->$field
            : null;
    }
}

