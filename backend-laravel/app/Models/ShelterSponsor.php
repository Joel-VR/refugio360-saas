<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Cache;

class ShelterSponsor extends Model
{
    protected $fillable = [
        'shelter_id',
        'name',
        'logo_path',
        'url',
        'order',
    ];

    public function shelter()
    {
        return $this->belongsTo(Shelter::class);
    }

    protected static function booted(): void
    {
        $forgetPublicCache = function (ShelterSponsor $sponsor) {
            if ($slug = $sponsor->shelter?->slug) {
                Cache::forget("public_shelter_show_{$slug}");
            }
        };
        static::saved($forgetPublicCache);
        static::deleted($forgetPublicCache);
    }
}
