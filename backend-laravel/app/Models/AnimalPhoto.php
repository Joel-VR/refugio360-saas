<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AnimalPhoto extends Model
{
    public function animal()
{
    return $this->belongsTo(Animal::class);
}
}
