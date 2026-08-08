<?php

namespace Tests\Feature;

use App\Models\Adoption;
use App\Models\Animal;
use App\Models\Shelter;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdoptionPiiTest extends TestCase
{
    use RefreshDatabase;

    private function shelterWithAdoption(string $slug): array
    {
        $shelter = Shelter::create([
            'name' => 'Refugio ' . $slug,
            'slug' => $slug . '-' . uniqid(),
            'is_active' => true,
            'approval_status' => 'approved',
        ]);

        $animal = Animal::create([
            'shelter_id' => $shelter->id,
            'name' => 'Animal ' . $slug,
            'species' => 'perro',
            'lifecycle_status' => 'apto',
        ]);

        $adoption = Adoption::create([
            'shelter_id' => $shelter->id,
            'animal_id' => $animal->id,
            'applicant_name' => 'Solicitante ' . $slug,
            'dni' => '12345678',
            'phone' => '987654321',
            'address' => 'Direccion ' . $slug,
        ]);

        return [$shelter, $adoption];
    }

    public function test_natural_person_cannot_list_adoptions(): void
    {
        [, $adoption] = $this->shelterWithAdoption('a');

        $naturalPerson = User::create([
            'name' => 'Persona',
            'email' => 'persona-' . uniqid() . '@example.test',
            'password' => 'Password123!',
            'role' => 'natural_person',
            'status' => true,
        ]);

        $this->actingAs($naturalPerson, 'sanctum')
            ->getJson('/api/v1/adoptions')
            ->assertStatus(403);
    }

    public function test_shelter_admin_only_sees_its_own_shelter_adoptions(): void
    {
        [$shelterA, $adoptionA] = $this->shelterWithAdoption('a');
        [$shelterB, $adoptionB] = $this->shelterWithAdoption('b');

        $adminA = User::create([
            'shelter_id' => $shelterA->id,
            'name' => 'Admin A',
            'email' => 'admin-a-' . uniqid() . '@example.test',
            'password' => 'Password123!',
            'role' => 'shelter_admin',
            'status' => true,
        ]);

        $response = $this->actingAs($adminA, 'sanctum')->getJson('/api/v1/adoptions');

        $response->assertStatus(200);
        $ids = collect($response->json('data'))->pluck('id');

        $this->assertTrue($ids->contains($adoptionA->id));
        $this->assertFalse($ids->contains($adoptionB->id));
    }
}
