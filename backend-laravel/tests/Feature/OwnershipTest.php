<?php

namespace Tests\Feature;

use App\Models\Animal;
use App\Models\Shelter;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class OwnershipTest extends TestCase
{
    use RefreshDatabase;

    private function naturalPerson(): User
    {
        return User::create([
            'name' => 'Persona',
            'email' => 'persona-' . uniqid() . '@example.test',
            'password' => 'Password123!',
            'role' => 'natural_person',
            'status' => true,
        ]);
    }

    private function shelter(): Shelter
    {
        return Shelter::create([
            'name' => 'Refugio Test',
            'slug' => 'refugio-test-' . uniqid(),
            'is_active' => true,
            'approval_status' => 'approved',
            'yape_phone' => '987654321',
            'yape_owner' => 'Refugio Test',
        ]);
    }

    public function test_adoption_is_linked_to_the_authenticated_user_and_only_visible_to_them(): void
    {
        $shelter = $this->shelter();
        $animal = Animal::create([
            'shelter_id' => $shelter->id,
            'name' => 'Luna',
            'species' => 'gato',
            'lifecycle_status' => 'apto',
        ]);

        $owner = $this->naturalPerson();
        $other = $this->naturalPerson();

        $this->actingAs($owner, 'sanctum')->postJson('/api/v1/adoptions', [
            'animal_id' => $animal->id,
            'applicant_name' => 'Owner',
            'dni' => '12345678',
            'phone' => '987654321',
            'address' => 'Av. Siempre Viva 123',
        ])->assertStatus(201);

        $ownerView = $this->actingAs($owner, 'sanctum')->getJson('/api/v1/adoptions/mine');
        $ownerView->assertStatus(200);
        $this->assertCount(1, $ownerView->json('data'));

        $otherView = $this->actingAs($other, 'sanctum')->getJson('/api/v1/adoptions/mine');
        $otherView->assertStatus(200);
        $this->assertCount(0, $otherView->json('data'));
    }

    public function test_donation_is_linked_to_the_authenticated_user_and_only_visible_to_them(): void
    {
        Storage::fake('public');

        $shelter = $this->shelter();
        $owner = $this->naturalPerson();
        $other = $this->naturalPerson();

        $this->actingAs($owner, 'sanctum')->post('/api/v1/donations', [
            'shelter_id' => $shelter->id,
            'payment_method' => 'yape',
            'donor_name' => 'Owner',
            'amount' => 25,
            'operation_reference' => 'OP-123',
            'donation_type' => 'general',
            'voucher' => UploadedFile::fake()->image('voucher.jpg'),
        ])->assertStatus(201);

        $ownerView = $this->actingAs($owner, 'sanctum')->getJson('/api/v1/donations/mine');
        $ownerView->assertStatus(200);
        $this->assertCount(1, $ownerView->json('data'));

        $otherView = $this->actingAs($other, 'sanctum')->getJson('/api/v1/donations/mine');
        $otherView->assertStatus(200);
        $this->assertCount(0, $otherView->json('data'));
    }
}
