<?php

namespace Database\Seeders;

use Faker\Generator;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class StressTestSeeder extends Seeder
{
    private const TOTAL_RECORDS = 1000;

    /**
     * Seed application tables with deterministic data for unit and stress tests.
     */
    public function run(): void
    {
        $now = Carbon::now();
        $faker = fake();

        $this->removePreviousStressData();

        $shelterIds = $this->seedShelters($now, $faker);
        $animalIdsByShelter = $this->seedAnimals($now, $faker, $shelterIds);

        $this->seedUsers($now, $faker, $shelterIds);
        $this->seedAnimalPhotos($now, $animalIdsByShelter);
        $this->seedDonations($now, $faker, $shelterIds, $animalIdsByShelter);
        $this->seedExpenses($now, $faker, $shelterIds);
        $this->seedAdoptions($now, $faker, $shelterIds, $animalIdsByShelter);
    }

    private function removePreviousStressData(): void
    {
        DB::table('animal_photos')
            ->where('photo_path', 'like', 'stress/animals/%')
            ->delete();

        DB::table('adoptions')
            ->where('pdf_path', 'like', 'stress/adoptions/%')
            ->delete();

        DB::table('donations')
            ->where('operation_reference', 'like', 'stress-donation-%')
            ->delete();

        DB::table('expenses')
            ->where('document_path', 'like', 'stress/expenses/%')
            ->delete();

        DB::table('animals')
            ->where('name', 'like', 'Stress Animal %')
            ->delete();

        DB::table('users')
            ->where('email', 'like', 'stress.user.%@example.test')
            ->delete();

        DB::table('shelters')
            ->where('slug', 'like', 'stress-shelter-%')
            ->delete();
    }

    private function seedShelters(Carbon $now, Generator $faker): array
    {
        $statuses = ['approved', 'pending_review', 'rejected'];
        $rows = [];

        for ($i = 1; $i <= self::TOTAL_RECORDS; $i++) {
            $status = $statuses[$i % count($statuses)];

            $rows[] = [
                'name' => "Stress Shelter {$i}",
                'slug' => "stress-shelter-{$i}",
                'description' => $faker->sentence(12),
                'email' => "stress.shelter.{$i}@example.test",
                'phone' => $this->peruvianPhone($i),
                'address' => $faker->streetAddress(),
                'logo_path' => "stress/shelters/logos/shelter-{$i}.png",
                'yape_phone' => $this->peruvianPhone($i + 1000),
                'yape_owner' => "Stress Shelter {$i}",
                'yape_qr_path' => "stress/shelters/qr/yape-{$i}.png",
                'plin_phone' => $this->peruvianPhone($i + 2000),
                'plin_owner' => "Stress Shelter {$i}",
                'plin_qr_path' => "stress/shelters/qr/plin-{$i}.png",
                'is_active' => $status === 'approved',
                'approval_status' => $status,
                'created_at' => $now,
                'updated_at' => $now,
            ];
        }

        $this->insertInChunks('shelters', $rows);

        return DB::table('shelters')
            ->where('slug', 'like', 'stress-shelter-%')
            ->orderBy('id')
            ->pluck('id')
            ->all();
    }

    private function seedUsers(Carbon $now, Generator $faker, array $shelterIds): void
    {
        $password = Hash::make('password');
        $roles = ['shelter_admin', 'volunteer', 'natural_person'];
        $rows = [];

        for ($i = 1; $i <= self::TOTAL_RECORDS; $i++) {
            $role = $i === 1 ? 'super_admin' : $roles[$i % count($roles)];
            $shelterId = in_array($role, ['super_admin', 'natural_person'], true)
                ? null
                : $shelterIds[($i - 1) % count($shelterIds)];

            $rows[] = [
                'shelter_id' => $shelterId,
                'name' => $role === 'super_admin' ? 'Stress Super Admin' : $faker->name(),
                'email' => "stress.user.{$i}@example.test",
                'email_verified_at' => $now,
                'password' => $password,
                'profile_photo_path' => "stress/users/user-{$i}.jpg",
                'remember_token' => Str::random(10),
                'role' => $role,
                'status' => true,
                'created_at' => $now,
                'updated_at' => $now,
            ];
        }

        $this->insertInChunks('users', $rows);
    }

    private function seedAnimals(Carbon $now, Generator $faker, array $shelterIds): array
    {
        $species = ['perro', 'gato', 'otro'];
        $statuses = ['cuarentena', 'tratamiento', 'apto', 'adoptado'];
        $rows = [];

        for ($i = 1; $i <= self::TOTAL_RECORDS; $i++) {
            $rows[] = [
                'shelter_id' => $shelterIds[($i - 1) % count($shelterIds)],
                'name' => "Stress Animal {$i}",
                'species' => $species[$i % count($species)],
                'estimated_age' => $i % 19,
                'health_status' => $faker->sentence(8),
                'is_sterilized' => $i % 2 === 0,
                'lifecycle_status' => $statuses[$i % count($statuses)],
                'created_at' => $now,
                'updated_at' => $now,
            ];
        }

        $this->insertInChunks('animals', $rows);

        return DB::table('animals')
            ->where('name', 'like', 'Stress Animal %')
            ->orderBy('id')
            ->get(['id', 'shelter_id'])
            ->groupBy('shelter_id')
            ->map(fn ($animals) => $animals->pluck('id')->all())
            ->all();
    }

    private function seedAnimalPhotos(Carbon $now, array $animalIdsByShelter): void
    {
        $animalIds = collect($animalIdsByShelter)->flatten()->values();
        $rows = [];

        for ($i = 1; $i <= self::TOTAL_RECORDS; $i++) {
            $animalId = $animalIds[($i - 1) % $animalIds->count()];

            $rows[] = [
                'animal_id' => $animalId,
                'photo_path' => "stress/animals/animal-{$animalId}-photo-{$i}.jpg",
                'display_order' => (($i - 1) % 5) + 1,
                'created_at' => $now,
                'updated_at' => $now,
            ];
        }

        $this->insertInChunks('animal_photos', $rows);
    }

    private function seedDonations(Carbon $now, Generator $faker, array $shelterIds, array $animalIdsByShelter): void
    {
        $methods = ['yape', 'plin', 'paypal', 'efectivo'];
        $statuses = ['pending', 'approved', 'rejected'];
        $rows = [];

        for ($i = 1; $i <= self::TOTAL_RECORDS; $i++) {
            $shelterId = $shelterIds[($i - 1) % count($shelterIds)];
            $donationType = $i % 4 === 0 ? 'specific' : 'general';

            $rows[] = [
                'shelter_id' => $shelterId,
                'animal_id' => $donationType === 'specific'
                    ? $this->animalIdForShelter($animalIdsByShelter, $shelterId, $i)
                    : null,
                'donor_name' => $i % 6 === 0 ? null : $faker->name(),
                'donor_email' => $i % 6 === 0 ? null : "stress.donor.{$i}@example.test",
                'amount' => ($i % 500) + 10,
                'payment_method' => $methods[$i % count($methods)],
                'operation_reference' => "stress-donation-{$i}",
                'voucher_path' => "stress/donations/voucher-{$i}.jpg",
                'notes' => $faker->sentence(10),
                'status' => $statuses[$i % count($statuses)],
                'donation_type' => $donationType,
                'is_recurring' => $i % 10 === 0,
                'is_anonymous' => $i % 6 === 0,
                'admin_notes' => $faker->sentence(8),
                'created_at' => $now,
                'updated_at' => $now,
            ];
        }

        $this->insertInChunks('donations', $rows);
    }

    private function seedExpenses(Carbon $now, Generator $faker, array $shelterIds): void
    {
        $categories = ['alimentacion', 'veterinaria', 'infraestructura', 'otros'];
        $statuses = ['pending', 'approved', 'rejected'];
        $rows = [];

        for ($i = 1; $i <= self::TOTAL_RECORDS; $i++) {
            $rows[] = [
                'shelter_id' => $shelterIds[($i - 1) % count($shelterIds)],
                'description' => $faker->sentence(7),
                'amount' => ($i % 900) + 25,
                'category' => $categories[$i % count($categories)],
                'status' => $statuses[$i % count($statuses)],
                'document_path' => "stress/expenses/document-{$i}.pdf",
                'expense_date' => $now->copy()->subDays($i % 365)->toDateString(),
                'created_at' => $now,
                'updated_at' => $now,
            ];
        }

        $this->insertInChunks('expenses', $rows);
    }

    private function seedAdoptions(Carbon $now, Generator $faker, array $shelterIds, array $animalIdsByShelter): void
    {
        $statuses = ['pendiente', 'evaluacion', 'aprobado', 'rechazado', 'adoptado'];
        $rows = [];

        for ($i = 1; $i <= self::TOTAL_RECORDS; $i++) {
            $shelterId = $shelterIds[($i - 1) % count($shelterIds)];

            $rows[] = [
                'shelter_id' => $shelterId,
                'animal_id' => $this->animalIdForShelter($animalIdsByShelter, $shelterId, $i),
                'applicant_name' => $faker->name(),
                'dni' => (string) (90000000 + $i),
                'phone' => $this->peruvianPhone($i + 3000),
                'address' => $faker->address(),
                'status' => $statuses[$i % count($statuses)],
                'pdf_path' => "stress/adoptions/adoption-{$i}.pdf",
                'notes' => $faker->sentence(10),
                'created_at' => $now,
                'updated_at' => $now,
            ];
        }

        $this->insertInChunks('adoptions', $rows);
    }

    private function insertInChunks(string $table, array $rows): void
    {
        foreach (array_chunk($rows, 250) as $chunk) {
            DB::table($table)->insert($chunk);
        }
    }

    private function animalIdForShelter(array $animalIdsByShelter, int $shelterId, int $index): int
    {
        $animalIds = $animalIdsByShelter[$shelterId];

        return $animalIds[($index - 1) % count($animalIds)];
    }

    private function peruvianPhone(int $index): string
    {
        return (string) (900000000 + ($index % 99999999));
    }
}
