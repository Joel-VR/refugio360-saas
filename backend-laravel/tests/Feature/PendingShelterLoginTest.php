<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PendingShelterLoginTest extends TestCase
{
    use RefreshDatabase;

    public function test_pending_shelter_admin_can_login_but_not_use_admin_routes(): void
    {
        $password = 'Password123!';

        $register = $this->postJson('/api/v1/auth/register/albergue', [
            'shelter_name' => 'Refugio Pendiente',
            'responsible_name' => 'Responsable',
            'email' => 'pendiente-' . uniqid() . '@example.test',
            'phone' => '987654321',
            'address' => 'Av. Siempre Viva 123',
            'description' => 'Un refugio en revisión.',
            'password' => $password,
            'password_confirmation' => $password,
        ]);

        $register->assertStatus(201);
        $email = $register->json('user.email');
        $this->assertFalse($register->json('user.status'));

        $login = $this->postJson('/api/v1/auth/login', [
            'email' => $email,
            'password' => $password,
        ]);

        $login->assertStatus(200);
        $token = $login->json('token');
        $this->assertNotEmpty($token);

        $this->withHeader('Authorization', "Bearer {$token}")
            ->getJson('/api/v1/auth/me')
            ->assertStatus(200);

        $this->withHeader('Authorization', "Bearer {$token}")
            ->getJson('/api/v1/admin/donations')
            ->assertStatus(403);
    }
}
