<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Donation;
use Illuminate\Http\Request;

class DonationController extends Controller
{
    /**
     * POST /api/v1/donations
     */
    public function store(Request $request)
    {
        $data = $request->validate([
            'shelter_id'          => 'required|integer|exists:shelters,id',
            'animal_id'           => 'nullable|integer|exists:animals,id',
            'payment_method'      => 'required|in:yape,plin,paypal,efectivo',
            'donor_name'          => 'nullable|string|max:255',
            'donor_email'         => 'nullable|email|max:255',
            'amount'              => 'nullable|numeric|min:0.01',
            'operation_reference' => 'nullable|string|max:255',
            'notes'               => 'nullable|string|max:500',
            'voucher'             => 'required|file|mimes:jpg,jpeg,png,gif|max:5120',
        ]);

        $path = $request->file('voucher')->store('vouchers', 'public');

        $donation = Donation::create([
            'shelter_id'          => $data['shelter_id'],
            'animal_id'           => $data['animal_id'] ?? null,
            'donation_type'       => !empty($data['animal_id']) ? 'specific' : 'general',
            'payment_method'      => $data['payment_method'],
            'donor_name'          => $data['donor_name'] ?? null,
            'donor_email'         => $data['donor_email'] ?? null,
            'amount'              => $data['amount'] ?? null,
            'operation_reference' => $data['operation_reference'] ?? null,
            'notes'               => $data['notes'] ?? null,
            'voucher_path'        => $path,
            'status'              => 'pending',
        ]);

        return response()->json($donation, 201);
    }

    /**
     * GET /api/v1/donations
     * Filtros: shelter_id, status, search, date_from, date_to, per_page
     */
    public function index(Request $request)
    {
        $donations = Donation::with(['shelter', 'animal'])
            ->when($request->shelter_id, fn ($q, $id) => $q->where('shelter_id', $id))
            ->when($request->status, fn ($q, $status) => $q->where('status', $status))
            ->when($request->date_from, fn ($q, $d) => $q->whereDate('created_at', '>=', $d))
            ->when($request->date_to, fn ($q, $d) => $q->whereDate('created_at', '<=', $d))
            ->when($request->search, function ($q, $search) {
                $q->where(function ($q2) use ($search) {
                    $q2->where('donor_name', 'ilike', "%{$search}%")
                       ->orWhere('operation_reference', 'ilike', "%{$search}%")
                       ->orWhere('amount', 'ilike', "%{$search}%");
                });
            })
            ->latest()
            ->paginate($request->integer('per_page', 20));

        return response()->json($donations);
    }

    public function show(Donation $donation)
    {
        return response()->json($donation->load(['shelter', 'animal']));
    }

    /**
     * PATCH /api/v1/donations/{donation}/status
     */
    public function updateStatus(Request $request, Donation $donation)
    {
        $data = $request->validate([
            'status'      => 'required|in:pending,approved,rejected',
            'admin_notes' => 'nullable|string',
        ]);

        $donation->update($data);

        return response()->json($donation->fresh()->load(['shelter', 'animal']));
    }
}