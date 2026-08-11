<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Expense;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ExpenseController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $expenses = Expense::with('shelter')
            ->when($request->category, fn($q, $c) => $q->where('category', $c))
            ->when($request->status,   fn($q, $s) => $q->where('status', $s))
            ->when($request->date_from, fn($q, $d) => $q->whereDate('expense_date', '>=', $d))
            ->when($request->date_to,   fn($q, $d) => $q->whereDate('expense_date', '<=', $d))
            ->latest('expense_date')
            ->paginate($request->integer('per_page', 20));

        return response()->json($expenses);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'description'  => ['required', 'string', 'max:255'],
            'amount'       => ['required', 'numeric', 'min:0.01'],
            'category'     => ['required', 'in:alimentacion,veterinaria,infraestructura,otros'],
            'expense_date' => ['required', 'date'],
            'document'     => ['nullable', 'file', 'mimes:jpg,jpeg,png,pdf', 'max:5120'],
        ]);

        $user = $request->user();
        if (!$user || !$user->shelter_id) {
            abort(403, 'sin albergue asociado');
        }

        $path = null;
        if ($request->hasFile('document')) {
            $path = $request->file('document')->store('expenses', 'public');
        }

        $expense = Expense::create([
            'shelter_id'   => $user->shelter_id,
            'description'  => $data['description'],
            'amount'       => $data['amount'],
            'category'     => $data['category'],
            'expense_date' => $data['expense_date'],
            'status'       => 'approved',
            'document_path' => $path,
        ]);

        return response()->json($expense, 201);
    }

    public function show(Expense $expense): JsonResponse
    {
        return response()->json($expense->load('shelter'));
    }

    public function update(Request $request, Expense $expense): JsonResponse
    {
        $data = $request->validate([
            'description'  => ['sometimes', 'string', 'max:255'],
            'amount'       => ['sometimes', 'numeric', 'min:0.01'],
            'category'     => ['sometimes', 'in:alimentacion,veterinaria,infraestructura,otros'],
            'expense_date' => ['sometimes', 'date'],
        ]);

        $expense->update($data);

        return response()->json($expense);
    }
    
    public function destroy(Expense $expense): JsonResponse
    {
        $expense->delete();
        return response()->json(null, 204);
    }
}
