<?php

namespace Tests\Feature;

use App\Models\LostFoundPost;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class LostFoundPostTest extends TestCase
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

    private function superAdmin(): User
    {
        return User::create([
            'name' => 'Super Admin',
            'email' => 'super-' . uniqid() . '@example.test',
            'password' => 'Password123!',
            'role' => 'super_admin',
            'status' => true,
        ]);
    }

    public function test_guest_cannot_publish(): void
    {
        $this->postJson('/api/v1/lost-found-posts', [
            'type' => 'perdida',
            'zone' => 'Amarilis',
            'description' => 'Perro perdido cerca del parque.',
            'contact_phone' => '987654321',
        ])->assertStatus(401);
    }

    public function test_natural_person_can_publish_and_it_stays_pending(): void
    {
        $user = $this->naturalPerson();

        $response = $this->actingAs($user, 'sanctum')->postJson('/api/v1/lost-found-posts', [
            'type' => 'perdida',
            'pet_name' => 'Luna',
            'zone' => 'Amarilis',
            'description' => 'Perro perdido cerca del parque.',
            'contact_phone' => '987654321',
        ]);

        $response->assertStatus(201);
        $response->assertJsonPath('status', 'pending_review');

        $this->assertDatabaseHas('lost_found_posts', [
            'user_id' => $user->id,
            'pet_name' => 'Luna',
            'status' => 'pending_review',
        ]);
    }

    public function test_pending_post_is_hidden_from_public_index_until_approved(): void
    {
        $user = $this->naturalPerson();

        $post = LostFoundPost::create([
            'user_id' => $user->id,
            'type' => 'perdida',
            'zone' => 'Amarilis',
            'description' => 'Perro perdido.',
            'contact_phone' => '987654321',
            'status' => 'pending_review',
        ]);

        $before = $this->getJson('/api/v1/lost-found-posts');
        $before->assertStatus(200);
        $this->assertFalse(collect($before->json('data'))->pluck('id')->contains($post->id));

        $admin = $this->superAdmin();
        $this->actingAs($admin, 'sanctum')
            ->patchJson("/api/v1/superadmin/lost-found-posts/{$post->id}/status", ['status' => 'approved'])
            ->assertStatus(200)
            ->assertJsonPath('status', 'approved');

        $after = $this->getJson('/api/v1/lost-found-posts');
        $after->assertStatus(200);
        $this->assertTrue(collect($after->json('data'))->pluck('id')->contains($post->id));
    }

    public function test_only_owner_or_admin_can_delete_a_post(): void
    {
        $owner = $this->naturalPerson();
        $other = $this->naturalPerson();

        $post = LostFoundPost::create([
            'user_id' => $owner->id,
            'type' => 'encontrada',
            'zone' => 'Amarilis',
            'description' => 'Gato encontrado.',
            'contact_phone' => '987654321',
            'status' => 'pending_review',
        ]);

        $this->actingAs($other, 'sanctum')
            ->deleteJson("/api/v1/lost-found-posts/{$post->id}")
            ->assertStatus(403);

        $this->actingAs($owner, 'sanctum')
            ->deleteJson("/api/v1/lost-found-posts/{$post->id}")
            ->assertStatus(204);
    }
}
