<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Animal;
use App\Models\Donation;
use App\Models\Shelter;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Response;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class DonationController extends Controller
{
    /**
     * POST /api/v1/donations
     */
    public function store(Request $request, CloudinaryMedia $media)
    {
        $data = $request->validate([
            'shelter_id'          => ['required', 'integer', Rule::exists('shelters', 'id')->where('is_active', true)],
            'animal_id'           => ['nullable', 'integer', 'exists:animals,id'],
            'payment_method'      => ['required', 'in:yape,plin'],
            'donor_name'          => 'nullable|string|max:255',
            'donor_email'         => 'nullable|email|max:255',
            'amount'              => 'required|numeric|min:0.01',
            'operation_reference' => 'required|string|max:255',
            'donation_type'       => 'required|in:general,specific',
            'is_recurring'        => 'sometimes|boolean',
            'is_anonymous'        => 'sometimes|boolean',
            'notes'               => 'nullable|string|max:500',
            'voucher'             => 'required|file|mimes:jpg,jpeg,png,gif|max:5120',
        ]);

        $shelter = Shelter::findOrFail($data['shelter_id']);
        $methodPhone = $data['payment_method'] . '_phone';
        $methodOwner = $data['payment_method'] . '_owner';
        if (blank($shelter->$methodPhone) || blank($shelter->$methodOwner)) {
            throw ValidationException::withMessages([
                'payment_method' => 'El albergue no tiene configurado este mÃ©todo de pago.',
            ]);
        }

        $isAnonymous = $request->boolean('is_anonymous');
        if (!$isAnonymous && blank($data['donor_name'] ?? null)) {
            throw ValidationException::withMessages([
                'donor_name' => 'El nombre es obligatorio salvo que dones como anÃ³nimo.',
            ]);
        }

        if ($data['donation_type'] === 'specific') {
            if (empty($data['animal_id'])) {
                throw ValidationException::withMessages([
                    'animal_id' => 'Selecciona un animal para el apadrinamiento.',
                ]);
            }

            $belongsToShelter = Animal::withoutGlobalScopes()
                ->where('id', $data['animal_id'])
                ->where('shelter_id', $shelter->id)
                ->exists();

            if (!$belongsToShelter) {
                throw ValidationException::withMessages([
                    'animal_id' => 'El animal seleccionado no pertenece a este albergue.',
                ]);
            }
        } else {
            $data['animal_id'] = null;
        }

        $path = $media->upload($request->file('voucher'), 'vouchers');

        $donation = Donation::create([
            'user_id'             => $request->user()->id,
            'shelter_id'          => $data['shelter_id'],
            'animal_id'           => $data['animal_id'] ?? null,
            'donation_type'       => $data['donation_type'],
            'payment_method'      => $data['payment_method'],
            'donor_name'          => $isAnonymous ? null : ($data['donor_name'] ?? null),
            'donor_email'         => $data['donor_email'] ?? null,
            'amount'              => $data['amount'],
            'operation_reference' => $data['operation_reference'] ?? null,
            'notes'               => $data['notes'] ?? null,
            'voucher_path'        => $path,
            'status'              => 'pending',
            'is_recurring'        => $request->boolean('is_recurring'),
            'is_anonymous'        => $isAnonymous,
        ]);

        return response()->json($donation, 201);
    }

    /**
     * GET /api/v1/donations/mine
     * Donaciones del usuario autenticado, en cualquier estado.
     */
    public function mine(Request $request)
    {
        $donations = Donation::with(['shelter:id,name,slug', 'animal:id,name'])
            ->where('user_id', $request->user()->id)
            ->latest()
            ->paginate($request->integer('per_page', 20));

        return response()->json($donations);
    }

    /**
     * GET /api/v1/donations
     * Filtros: shelter_id, status, search, date_from, date_to, per_page
     */
    public function index(Request $request)
    {
        return $this->adminIndex($request);
    }

    public function adminIndex(Request $request)
    {
        $donations = $this->adminDonationQuery($request)
            ->when($request->shelter_id, fn ($q, $id) => $q->where('shelter_id', $id))
            ->when($request->status, fn ($q, $status) => $q->where('status', $status))
            ->when($request->payment_method, fn ($q, $method) => $q->where('payment_method', $method))
            ->when($request->donation_type, fn ($q, $type) => $q->where('donation_type', $type))
            ->when($request->date_from, fn ($q, $d) => $q->whereDate('created_at', '>=', $d))
            ->when($request->date_to, fn ($q, $d) => $q->whereDate('created_at', '<=', $d))
            ->when($request->search, function ($q, $search) {
                $q->where(function ($q2) use ($search) {
                    $q2->where('donor_name', 'like', "%{$search}%")
                       ->orWhere('operation_reference', 'like', "%{$search}%")
                       ->orWhere('amount', 'like', "%{$search}%");
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
        $this->authorizeDonation($request, $donation);

        $data = $request->validate([
            'status'      => 'required|in:pending,approved,rejected',
            'admin_notes' => 'nullable|string',
        ]);

        $donation->update($data);

        return response()->json($donation->fresh()->load(['shelter', 'animal']));
    }

    public function exportCsv(Request $request)
    {
        $rows = $this->adminDonationQuery($request)
            ->when($request->status, fn ($q, $status) => $q->where('status', $status))
            ->when($request->payment_method, fn ($q, $method) => $q->where('payment_method', $method))
            ->when($request->donation_type, fn ($q, $type) => $q->where('donation_type', $type))
            ->when($request->date_from, fn ($q, $d) => $q->whereDate('created_at', '>=', $d))
            ->when($request->date_to, fn ($q, $d) => $q->whereDate('created_at', '<=', $d))
            ->latest()
            ->get();

        $callback = function () use ($rows) {
            $out = fopen('php://output', 'w');
            fputcsv($out, ['fecha', 'donante', 'email', 'monto', 'metodo', 'referencia', 'estado', 'tipo', 'animal', 'recurrente', 'notas_admin']);
            foreach ($rows as $donation) {
                fputcsv($out, [
                    optional($donation->created_at)->toDateTimeString(),
                    $donation->is_anonymous ? 'AnÃ³nimo' : ($donation->donor_name ?: 'AnÃ³nimo'),
                    $donation->donor_email,
                    $donation->amount,
                    $donation->payment_method,
                    $donation->operation_reference,
                    $donation->status,
                    $donation->donation_type,
                    optional($donation->animal)->name,
                    $donation->is_recurring ? 'si' : 'no',
                    $donation->admin_notes,
                ]);
            }
            fclose($out);
        };

        return Response::streamDownload($callback, 'donaciones.csv', [
            'Content-Type' => 'text/csv; charset=UTF-8',
        ]);
    }

    private function adminDonationQuery(Request $request)
    {
        $query = Donation::withoutGlobalScopes()->with(['shelter', 'animal']);
        $user = $request->user();

        if ($user && $user->role === 'shelter_admin') {
            $query->where('shelter_id', $user->shelter_id);
        }

        return $query;
    }

    private function authorizeDonation(Request $request, Donation $donation): void
    {
        $user = $request->user();
        if (!$user || $user->role === 'super_admin') {
            return;
        }
        if ((int) $user->shelter_id !== (int) $donation->shelter_id) {
            abort(403, 'No puedes administrar esta donaciÃ³n.');
        }
    }
}


