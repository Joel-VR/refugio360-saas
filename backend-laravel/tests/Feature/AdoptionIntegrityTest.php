<?php

namespace Tests\Feature;

use App\Models\Animal;
use App\Models\Shelter;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdoptionIntegrityTest extends TestCase
{
    use RefreshDatabase;

    public function test_adoption_always_uses_the_animals_real_shelter_id(): void
    {
        $realShelter = Shelter::create([
            'name' => 'Refugio Real',
            'slug' => 'refugio-real-' . uniqid(),
            'is_active' => true,
            'approval_status' => 'approved',
        ]);

        $otherShelter = Shelter::create([
            'name' => 'Otro Refugio',
            'slug' => 'otro-refugio-' . uniqid(),
            'is_active' => true,
            'approval_status' => 'approved',
        ]);

        $animal = Animal::create([
            'shelter_id' => $realShelter->id,
            'name' => 'Luna',
            'species' => 'gato',
            'lifecycle_status' => 'apto',
        ]);

        $applicant = User::create([
            'name' => 'Solicitante',
            'email' => 'solicitante-' . uniqid() . '@example.test',
            'password' => 'Password123!',
            'role' => 'natural_person',
            'status' => true,
        ]);

        $response = $this->actingAs($applicant, 'sanctum')->postJson('/api/v1/adoptions', [
            'shelter_id' => $otherShelter->id,
            'animal_id' => $animal->id,
            'applicant_name' => 'Solicitante',
            'dni' => '12345678',
            'phone' => '987654321',
            'address' => 'Av. Siempre Viva 123',
        ]);

        $response->assertStatus(201);
        $response->assertJsonPath('shelter_id', $realShelter->id);

        $this->assertDatabaseHas('adoptions', [
            'animal_id' => $animal->id,
            'shelter_id' => $realShelter->id,
        ]);
    }
}
