<?php

namespace Tests\Feature;

use App\Models\Animal;
use App\Models\Shelter;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AuthorizationTest extends TestCase
{
    use RefreshDatabase;

    private function shelter(array $overrides = []): Shelter
    {
        return Shelter::create(array_merge([
            'name' => 'Refugio Test',
            'slug' => 'refugio-test-' . uniqid(),
            'is_active' => true,
            'approval_status' => 'approved',
        ], $overrides));
    }

    private function shelterAdmin(Shelter $shelter): User
    {
        return User::create([
            'shelter_id' => $shelter->id,
            'name' => 'Admin Refugio',
            'email' => 'admin-' . uniqid() . '@example.test',
            'password' => 'Password123!',
            'role' => 'shelter_admin',
            'status' => true,
        ]);
    }

    public function test_guest_cannot_mutate_animals(): void
    {
        $shelter = $this->shelter();
        $animal = Animal::create([
            'shelter_id' => $shelter->id,
            'name' => 'Firulais',
            'species' => 'perro',
            'lifecycle_status' => 'apto',
        ]);

        $this->postJson('/api/v1/animals', ['shelter_id' => $shelter->id, 'name' => 'X', 'species' => 'perro', 'lifecycle_status' => 'apto'])
            ->assertStatus(401);

        $this->putJson("/api/v1/animals/{$animal->id}", ['name' => 'Y'])
            ->assertStatus(401);

        $this->deleteJson("/api/v1/animals/{$animal->id}")
            ->assertStatus(401);
    }

    public function test_guest_can_read_animals(): void
    {
        $this->shelter();

        $this->getJson('/api/v1/animals')->assertStatus(200);
    }

    public function test_guest_cannot_mutate_shelters(): void
    {
        $shelter = $this->shelter();

        $this->postJson('/api/v1/shelters', ['name' => 'Nuevo', 'slug' => 'nuevo-' . uniqid()])
            ->assertStatus(401);

        $this->putJson("/api/v1/shelters/{$shelter->id}", ['name' => 'Otro'])
            ->assertStatus(401);

        $this->deleteJson("/api/v1/shelters/{$shelter->id}")
            ->assertStatus(401);
    }

    public function test_shelter_admin_cannot_create_shelters(): void
    {
        $shelter = $this->shelter();
        $admin = $this->shelterAdmin($shelter);

        $this->actingAs($admin, 'sanctum')
            ->postJson('/api/v1/shelters', ['name' => 'Otro', 'slug' => 'otro-' . uniqid()])
            ->assertStatus(403);
    }

    public function test_guest_cannot_list_or_manage_adoptions(): void
    {
        $shelter = $this->shelter();
        $animal = Animal::create([
            'shelter_id' => $shelter->id,
            'name' => 'Firulais',
            'species' => 'perro',
            'lifecycle_status' => 'apto',
        ]);
        $adoption = \App\Models\Adoption::create([
            'shelter_id' => $shelter->id,
            'animal_id' => $animal->id,
            'applicant_name' => 'Juan Perez',
            'dni' => '12345678',
            'phone' => '987654321',
            'address' => 'Av. Siempre Viva 123',
        ]);

        $this->getJson('/api/v1/adoptions')->assertStatus(401);
        $this->getJson("/api/v1/adoptions/{$adoption->id}")->assertStatus(401);
        $this->patchJson("/api/v1/adoptions/{$adoption->id}/status", ['status' => 'aprobado'])->assertStatus(401);
        $this->deleteJson("/api/v1/adoptions/{$adoption->id}")->assertStatus(401);
    }

    public function test_shelter_admin_cannot_touch_animal_from_another_shelter(): void
    {
        $ownShelter = $this->shelter();
        $otherShelter = $this->shelter();
        $admin = $this->shelterAdmin($ownShelter);

        $foreignAnimal = Animal::create([
            'shelter_id' => $otherShelter->id,
            'name' => 'Ajeno',
            'species' => 'gato',
            'lifecycle_status' => 'apto',
        ]);

        $this->actingAs($admin, 'sanctum')
            ->putJson("/api/v1/animals/{$foreignAnimal->id}", ['name' => 'Hackeado'])
            ->assertStatus(404);

        $this->actingAs($admin, 'sanctum')
            ->deleteJson("/api/v1/animals/{$foreignAnimal->id}")
            ->assertStatus(404);
    }
}
