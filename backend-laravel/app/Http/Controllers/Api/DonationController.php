<?php
 
namespace App\Http\Controllers\Api;
 
use App\Http\Controllers\Controller;
use App\Models\Donation;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
 
class DonationController extends Controller
{
    /**
     * POST /api/v1/donations
     */
    public function store(Request $request)
    {
        $data = $request->validate([
            'shelter_id'          => 'required|integer|exists:shelters,id',
            'payment_method'      => 'required|in:yape,plin,paypal,efectivo',
            'donor_name'          => 'nullable|string|max:255',
            'donor_email'         => 'nullable|email|max:255',
            'amount'              => 'nullable|numeric|min:0.01',
            'operation_reference' => 'nullable|string|max:255',
            'notes'               => 'nullable|string|max:500',
            'voucher'             => 'required|file|mimes:jpg,jpeg,png,gif|max:5120',
        ]);
 
        // Guardar comprobante en storage/app/public/vouchers
        $path = $request->file('voucher')->store('vouchers', 'public');
 
        $donation = Donation::create([
            'shelter_id'          => $data['shelter_id'],
            'payment_method'      => $data['payment_method'],
            'donor_name'          => $data['donor_name']          ?? null,
            'donor_email'         => $data['donor_email']         ?? null,
            'amount'              => $data['amount']              ?? null,
            'operation_reference' => $data['operation_reference'] ?? null,
            'notes'               => $data['notes']               ?? null,
            'voucher_path'        => $path,
            'status'              => 'pending',
        ]);
 
        return response()->json($donation, 201);
    }
 
    /**
     * GET /api/v1/donations
     */
    public function index(Request $request)
    {
        $donations = Donation::with('shelter')
            ->when($request->shelter_id, fn($q, $id) => $q->where('shelter_id', $id))
            ->latest()
            ->paginate(20);
 
        return response()->json($donations);
    }
 
    /**
     * GET /api/v1/donations/{donation}
     */
    public function show(Donation $donation)
    {
        return response()->json($donation->load('shelter'));
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
 
        return response()->json($donation);
    }
}