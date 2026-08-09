<?php

namespace Database\Seeders;

use App\Models\Shelter;
use App\Models\User;
use App\Models\Animal;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class TestDataSeeder extends Seeder
{
    public function run(): void
    {
        // ── Albergue 1: Aprobado y activo ──────────────────────────────
        $shelter1 = Shelter::updateOrCreate(
            ['slug' => 'huellitas-felices'],
            [
                'name' => 'Huellitas Felices',
                'description' => 'Refugio dedicado al rescate de perros y gatos abandonados.',
                'email' => 'contacto@huellitasfelices.com',
                'phone' => '999111222',
                'address' => 'Av. Los Alamos 123, Huánuco',
                'approval_status' => 'approved',
                'is_active' => true,
            ]
        );

        User::updateOrCreate(
            ['email' => 'admin@huellitasfelices.com'],
            [
                'shelter_id' => $shelter1->id,
                'name' => 'Admin Huellitas',
                'password' => Hash::make('ClaveSegura123!'),
                'role' => 'shelter_admin',
                'status' => true,
                'email_verified_at' => now(),
            ]
        );

        // ── Albergue 2: Aprobado y activo ──────────────────────────────
        $shelter2 = Shelter::updateOrCreate(
            ['slug' => 'patitas-al-rescate'],
            [
                'name' => 'Patitas al Rescate',
                'description' => 'Organización sin fines de lucro para adopción responsable.',
                'email' => 'contacto@patitasalrescate.com',
                'phone' => '999333444',
                'address' => 'Jr. San Martín 456, Huánuco',
                'approval_status' => 'approved',
                'is_active' => true,
            ]
        );

        User::updateOrCreate(
            ['email' => 'admin@patitasalrescate.com'],
            [
                'shelter_id' => $shelter2->id,
                'name' => 'Admin Patitas',
                'password' => Hash::make('ClaveSegura123!'),
                'role' => 'shelter_admin',
                'status' => true,
                'email_verified_at' => now(),
            ]
        );

        // ── Albergue 3: Pendiente de revisión ──────────────────────────
        $shelter3 = Shelter::updateOrCreate(
            ['slug' => 'refugio-esperanza'],
            [
                'name' => 'Refugio Esperanza',
                'description' => 'Nuevo albergue solicitando ingreso a la plataforma.',
                'email' => 'contacto@refugioesperanza.com',
                'phone' => '999555666',
                'address' => 'Calle Las Flores 789, Huánuco',
                'approval_status' => 'pending_review',
                'is_active' => false,
            ]
        );

        User::updateOrCreate(
            ['email' => 'admin@refugioesperanza.com'],
            [
                'shelter_id' => $shelter3->id,
                'name' => 'Admin Esperanza',
                'password' => Hash::make('ClaveSegura123!'),
                'role' => 'shelter_admin',
                'status' => false,
                'email_verified_at' => now(),
            ]
        );

        // ── Albergue 4: Pendiente de revisión ──────────────────────────
        $shelter4 = Shelter::updateOrCreate(
            ['slug' => 'amigos-peludos'],
            [
                'name' => 'Amigos Peludos',
                'description' => 'Colectivo de voluntarios rescatando animales de la calle.',
                'email' => 'contacto@amigospeludos.com',
                'phone' => '999777888',
                'address' => 'Av. Circunvalación 321, Huánuco',
                'approval_status' => 'pending_review',
                'is_active' => false,
            ]
        );

        User::updateOrCreate(
            ['email' => 'admin@amigospeludos.com'],
            [
                'shelter_id' => $shelter4->id,
                'name' => 'Admin Amigos Peludos',
                'password' => Hash::make('ClaveSegura123!'),
                'role' => 'shelter_admin',
                'status' => false,
                'email_verified_at' => now(),
            ]
        );

        // ── Animales para Huellitas Felices (aprobado) ─────────────────
        Animal::updateOrCreate(
            ['name' => 'Rocky', 'shelter_id' => $shelter1->id],
            [
                'species' => 'perro',
                'estimated_age' => 3,
                'health_status' => 'Saludable, vacunas al día.',
                'is_sterilized' => true,
                'lifecycle_status' => 'apto',
            ]
        );

        Animal::updateOrCreate(
            ['name' => 'Michi', 'shelter_id' => $shelter1->id],
            [
                'species' => 'gato',
                'estimated_age' => 1,
                'health_status' => 'En tratamiento por resfriado felino.',
                'is_sterilized' => false,
                'lifecycle_status' => 'tratamiento',
            ]
        );

        Animal::updateOrCreate(
            ['name' => 'Firulais', 'shelter_id' => $shelter1->id],
            [
                'species' => 'perro',
                'estimated_age' => 5,
                'health_status' => 'En cuarentena, recién rescatado.',
                'is_sterilized' => false,
                'lifecycle_status' => 'cuarentena',
            ]
        );

        // ── Animales para Patitas al Rescate (aprobado) ────────────────
        Animal::updateOrCreate(
            ['name' => 'Luna', 'shelter_id' => $shelter2->id],
            [
                'species' => 'gato',
                'estimated_age' => 2,
                'health_status' => 'Lista para adopción.',
                'is_sterilized' => true,
                'lifecycle_status' => 'apto',
            ]
        );

        Animal::updateOrCreate(
            ['name' => 'Max', 'shelter_id' => $shelter2->id],
            [
                'species' => 'perro',
                'estimated_age' => 4,
                'health_status' => 'Adoptado recientemente.',
                'is_sterilized' => true,
                'lifecycle_status' => 'adoptado',
            ]
        );

        Animal::updateOrCreate(
            ['name' => 'Kiara', 'shelter_id' => $shelter2->id],
            [
                'species' => 'otro',
                'estimated_age' => 1,
                'health_status' => 'Conejo rescatado, en observación.',
                'is_sterilized' => false,
                'lifecycle_status' => 'apto',
            ]
        );
        // ── Usuario natural para publicar posts ────────────────────────
        $person = User::updateOrCreate(
            ['email' => 'usuario.prueba@test.com'],
            [
                'name' => 'Usuario de Prueba',
                'password' => Hash::make('ClaveSegura123!'),
                'role' => 'natural_person',
                'status' => true,
                'email_verified_at' => now(),
            ]
        );

        // ── Mascotas perdidas / encontradas ─────────────────────────────
        \App\Models\LostFoundPost::updateOrCreate(
            ['pet_name' => 'Toby', 'user_id' => $person->id],
            [
                'type' => 'perdida',
                'species' => 'perro',
                'zone' => 'Cayhuayna, Huánuco',
                'description' => 'Perdido cerca del parque, collar rojo, muy asustadizo.',
                'contact_phone' => '987654321',
                'status' => 'pending_review',
            ]
        );

        \App\Models\LostFoundPost::updateOrCreate(
            ['pet_name' => 'Mimi', 'user_id' => $person->id],
            [
                'type' => 'encontrada',
                'species' => 'gato',
                'zone' => 'Amarilis, Huánuco',
                'description' => 'Gata encontrada en la calle, muy dócil, sin colgante.',
                'contact_phone' => '987654322',
                'status' => 'pending_review',
            ]
        );

        \App\Models\LostFoundPost::updateOrCreate(
            ['pet_name' => 'Rex', 'user_id' => $person->id],
            [
                'type' => 'perdida',
                'species' => 'perro',
                'zone' => 'Pillco Marca, Huánuco',
                'description' => 'Se escapó de casa hace 2 días, responde a su nombre.',
                'contact_phone' => '987654323',
                'status' => 'approved',
            ]
        );

        \App\Models\LostFoundPost::updateOrCreate(
            ['pet_name' => null, 'user_id' => $person->id],
            [
                'type' => 'encontrada',
                'species' => 'otro',
                'zone' => 'Centro de Huánuco',
                'description' => 'Conejo encontrado deambulando cerca del mercado central.',
                'contact_phone' => '987654324',
                'status' => 'rejected',
                'admin_notes' => 'Reportado como mascota ya reclamada por su dueño.',
            ]
        );

        $this->command->info('4 albergues, 4 admins y 6 animales creados correctamente.');
    }
}