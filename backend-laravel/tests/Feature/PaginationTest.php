<?php

namespace Tests\Feature;

use App\Models\Animal;
use App\Models\Shelter;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PaginationTest extends TestCase
{
    use RefreshDatabase;

    public function test_animals_index_is_paginated_and_caps_per_page(): void
    {
        $shelter = Shelter::create([
            'name' => 'Refugio Grande',
            'slug' => 'refugio-grande-' . uniqid(),
            'is_active' => true,
            'approval_status' => 'approved',
        ]);

        for ($i = 0; $i < 5; $i++) {
            Animal::create([
                'shelter_id' => $shelter->id,
                'name' => "Animal $i",
                'species' => 'perro',
                'lifecycle_status' => 'apto',
            ]);
        }

        $response = $this->getJson('/api/v1/animals?per_page=2');

        $response->assertStatus(200);
        $response->assertJsonStructure(['data', 'current_page', 'last_page', 'per_page', 'total']);
        $this->assertCount(2, $response->json('data'));
        $this->assertSame(5, $response->json('total'));

        // el tope máximo de per_page (100) se respeta aunque se pida más
        $capped = $this->getJson('/api/v1/animals?per_page=99999');
        $capped->assertStatus(200);
        $this->assertSame(100, $capped->json('per_page'));
    }
}
