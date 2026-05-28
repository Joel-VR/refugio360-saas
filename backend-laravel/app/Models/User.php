<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable, SoftDeletes;

    protected $fillable = [
        'shelter_id',
        'name',
        'email',
        'password',
        'role',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
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
    | Helpers de Roles
    |--------------------------------------------------------------------------
    */

    public function isSuperAdmin()
    {
        return $this->role === 'super_admin';
    }

    public function isShelterAdmin()
    {
        return $this->role === 'shelter_admin';
    }

    public function isVolunteer()
    {
        return $this->role === 'volunteer';
    }
}
