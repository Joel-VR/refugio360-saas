<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Shelter;

class ShelterSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Shelter::updateOrCreate(
            ['id' => 3], // Condición para buscar si ya existe el ID 3
            [
                'yape_phone' => '987654321',
                'yape_owner' => 'Refugio Principal',
                'plin_phone' => '912345678',
                'plin_owner' => 'Refugio Principal',
            ]
        );
    }
}