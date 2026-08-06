<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Animal;
use App\Models\Donation;
use App\Models\Expense;
use App\Models\Shelter;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class PublicShelterController extends Controller
{
    public function index(): JsonResponse
    {
        $shelters = Shelter::query()
            ->where('is_active', true)
            ->where('approval_status', 'approved')
            ->withCount(['animals'])
            ->latest()
            ->get()
            ->map(fn (Shelter $shelter) => $this->publicShelter($shelter));

        return response()->json($shelters);
    }

    public function show(string $slug): JsonResponse
    {
        $shelter = Shelter::where('slug', $slug)->where('is_active', true)->where('approval_status', 'approved')->firstOrFail();

        return response()->json($this->publicShelter($shelter));
    }

    public function animals(string $slug): JsonResponse
    {
        $shelter = Shelter::where('slug', $slug)->where('is_active', true)->where('approval_status', 'approved')->firstOrFail();

        $animals = Animal::withoutGlobalScopes()
            ->with('photos')
            ->where('shelter_id', $shelter->id)
            ->whereIn('lifecycle_status', ['apto', 'tratamiento'])
            ->latest()
            ->get();

        return response()->json($animals);
    }

    public function transparency(Request $request, string $slug): JsonResponse
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

        return response()->json([
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
            'donations' => $donations,
            'expenses' => $expensesList,
        ]);
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
        ];
    }
}
