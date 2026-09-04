<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Animal;
use App\Models\Donation;
use App\Models\Expense;
use App\Models\Shelter;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

class PublicShelterController extends Controller
{
    /** Segundos que se cachean las lecturas públicas (bajo tráfico, dato tolera algo de retraso). */
    private const CACHE_TTL = 60;

    public function index(): JsonResponse
    {
        $shelters = Cache::remember('public_shelters_index', self::CACHE_TTL, function () {
            return Shelter::query()
                ->where('is_active', true)
                ->where('approval_status', 'approved')
                ->withCount(['animals'])
                ->latest()
                ->get()
                ->map(fn (Shelter $shelter) => $this->publicShelter($shelter))
                ->all();
        });

        return response()->json($shelters);
    }

    public function show(string $slug): JsonResponse
    {
        $data = Cache::remember("public_shelter_show_{$slug}", self::CACHE_TTL, function () use ($slug) {
            $shelter = Shelter::where('slug', $slug)->where('is_active', true)->where('approval_status', 'approved')
                ->with('sponsors')
                ->firstOrFail();

            return $this->publicShelter($shelter);
        });

        return response()->json($data);
    }

    public function animals(string $slug): JsonResponse
    {
        $animals = Cache::remember("public_shelter_animals_{$slug}", self::CACHE_TTL, function () use ($slug) {
            $shelter = Shelter::where('slug', $slug)->where('is_active', true)->where('approval_status', 'approved')->firstOrFail();

            return Animal::withoutGlobalScopes()
                ->with('photos')
                ->where('shelter_id', $shelter->id)
                ->whereIn('lifecycle_status', ['apto', 'tratamiento'])
                ->latest()
                ->get()
                ->toArray();
        });

        return response()->json($animals);
    }

    public function transparency(Request $request, string $slug): JsonResponse
    {
        $cacheKey = 'public_shelter_transparency_' . $slug . '_' . http_build_query($request->query());

        $payload = Cache::remember($cacheKey, self::CACHE_TTL, function () use ($request, $slug) {
            return $this->buildTransparencyPayload($request, $slug);
        });

        return response()->json($payload);
    }

    private function buildTransparencyPayload(Request $request, string $slug): array
    {
        $shelter = Shelter::where('slug', $slug)->where('is_active', true)->where('approval_status', 'approved')->firstOrFail();

        $approvedDonations = Donation::withoutGlobalScopes()
            ->where('shelter_id', $shelter->id)
            ->where('status', 'approved');

        $approvedExpenses = Expense::withoutGlobalScopes()
            ->where('shelter_id', $shelter->id)
            ->where('status', 'approved');

        $income = (clone $approvedDonations)->sum('amount');
        $expenses = (clone $approvedExpenses)->sum('amount');

        $expenseCategories = (clone $approvedExpenses)
            ->select('category', DB::raw('sum(amount) as total'))
            ->groupBy('category')
            ->pluck('total', 'category');

        $donations = (clone $approvedDonations)
            ->latest()
            ->paginate($request->integer('donations_per_page', 10), [
                'id', 'donor_name', 'amount', 'donation_type', 'is_anonymous', 'is_recurring', 'created_at',
            ], 'donations_page');

        $expensesList = (clone $approvedExpenses)
            ->latest('expense_date')
            ->paginate($request->integer('expenses_per_page', 10), [
                'id', 'description', 'amount', 'category', 'document_path', 'expense_date',
            ], 'expenses_page');

        $donations->getCollection()->transform(fn (Donation $donation) => [
            'id' => $donation->id,
            'donor_name' => $donation->is_anonymous ? 'Anónimo' : ($donation->donor_name ?: 'Anónimo'),
            'amount' => $donation->amount,
            'donation_type' => $donation->donation_type,
            'is_recurring' => $donation->is_recurring,
            'created_at' => $donation->created_at,
        ]);

        return [
            'shelter' => $this->publicShelter($shelter),
            'summary' => [
                'total_income' => round((float) $income, 2),
                'total_expenses' => round((float) $expenses, 2),
                'balance' => round((float) $income - (float) $expenses, 2),
            ],
            'expense_categories' => [
                'alimentacion' => round((float) ($expenseCategories['alimentacion'] ?? 0), 2),
                'veterinaria' => round((float) ($expenseCategories['veterinaria'] ?? 0), 2),
                'infraestructura' => round((float) ($expenseCategories['infraestructura'] ?? 0), 2),
                'otros' => round((float) ($expenseCategories['otros'] ?? 0), 2),
            ],
            'donations' => $donations->toArray(),
            'expenses' => $expensesList->toArray(),
        ];
    }

    private function publicShelter(Shelter $shelter): array
    {
        $hasYape = filled($shelter->yape_phone) && filled($shelter->yape_owner);
        $hasPlin = filled($shelter->plin_phone) && filled($shelter->plin_owner);

        return [
            'id' => $shelter->id,
            'name' => $shelter->name,
            'slug' => $shelter->slug,
            'description' => $shelter->description,
            'logo_path' => $shelter->logo_path,
            'address' => $shelter->address,
            'latitude' => $shelter->latitude !== null ? (float) $shelter->latitude : null,
            'longitude' => $shelter->longitude !== null ? (float) $shelter->longitude : null,
            'is_active' => $shelter->is_active,
            'accepts_donations' => $hasYape || $hasPlin,
            'payment_methods' => [
                'yape' => [
                    'enabled' => $hasYape,
                    'phone' => $shelter->yape_phone,
                    'owner' => $shelter->yape_owner,
                    'qr_path' => $shelter->yape_qr_path,
                ],
                'plin' => [
                    'enabled' => $hasPlin,
                    'phone' => $shelter->plin_phone,
                    'owner' => $shelter->plin_owner,
                    'qr_path' => $shelter->plin_qr_path,
                ],
            ],
            'animals_count' => $shelter->animals_count ?? null,
            'sponsors' => $shelter->relationLoaded('sponsors')
                ? $shelter->sponsors->map(fn ($sponsor) => [
                    'id' => $sponsor->id,
                    'name' => $sponsor->name,
                    'logo_path' => $sponsor->logo_path,
                    'url' => $sponsor->url,
                ])->all()
                : [],
        ];
    }
}
