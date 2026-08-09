<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class SuperAdminSeeder extends Seeder
{
    public function run(): void
    {
        User::updateOrCreate(
            ['email' => 'admin@tuapp.com'],
            [
                'name' => 'Super Admin',
                'password' => Hash::make('ClaveSegura123!'),
                'role' => 'super_admin',
                'status' => true,
                'shelter_id' => null, // el super admin no pertenece a un shelter
                'email_verified_at' => now(),
            ]
        );
    }
}