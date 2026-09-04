<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Shelter;
use App\Services\CloudinaryMedia;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;

class AdminPaymentMethodController extends Controller
{
    public function update(Request $request, Shelter $shelter, CloudinaryMedia $media): JsonResponse
    {
        $this->authorizeShelter($request, $shelter);

        $data = $request->validate([
            'yape_phone' => ['nullable', 'regex:/^[0-9]{9}$/'],
            'yape_owner' => ['nullable', 'string', 'max:255'],
            'yape_qr' => ['nullable', 'image', 'mimes:jpg,jpeg,png,gif', 'max:5120', 'dimensions:max_width=8000,max_height=8000'],
            'plin_phone' => ['nullable', 'regex:/^[0-9]{9}$/'],
            'plin_owner' => ['nullable', 'string', 'max:255'],
            'plin_qr' => ['nullable', 'image', 'mimes:jpg,jpeg,png,gif', 'max:5120', 'dimensions:max_width=8000,max_height=8000'],
        ], [
            '*.regex' => 'El nÃºmero debe tener 9 dÃ­gitos.',
        ]);

        $payload = [
            'yape_phone' => $data['yape_phone'] ?? null,
            'yape_owner' => $data['yape_owner'] ?? null,
            'plin_phone' => $data['plin_phone'] ?? null,
            'plin_owner' => $data['plin_owner'] ?? null,
        ];

        foreach (['yape', 'plin'] as $method) {
            if ($request->hasFile($method . '_qr')) {
                $old = $shelter->{$method . '_qr_path'};
                if ($old) {
                    $media->delete($old);
                }
                $payload[$method . '_qr_path'] = $media->upload($request->file($method . '_qr'), 'payment_qrs');
            }
        }

        $hasYape = filled($payload['yape_phone']) && filled($payload['yape_owner']);
        $hasPlin = filled($payload['plin_phone']) && filled($payload['plin_owner']);
        if (!$hasYape && !$hasPlin) {
            throw ValidationException::withMessages([
                'payment_methods' => 'Configura al menos Yape o Plin con nÃºmero y titular.',
            ]);
        }

        $shelter->update($payload);

        return response()->json($shelter->fresh());
    }

    public function destroyQr(Request $request, Shelter $shelter, string $method, CloudinaryMedia $media): JsonResponse
    {
        $this->authorizeShelter($request, $shelter);

        if (!in_array($method, ['yape', 'plin'], true)) {
            abort(404);
        }

        $field = $method . '_qr_path';
        if ($shelter->$field) {
            $media->delete($shelter->$field);
        }

        $shelter->update([$field => null]);

        return response()->json($shelter->fresh());
    }

    private function authorizeShelter(Request $request, Shelter $shelter): void
    {
        $user = $request->user();
        if ($user->role === 'super_admin') {
            return;
        }
        if ((int) $user->shelter_id !== (int) $shelter->id) {
            abort(403, 'No puedes administrar este albergue.');
        }
    }
}



