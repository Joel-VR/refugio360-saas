<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Shelter;
use App\Models\ShelterSponsor;
use App\Services\CloudinaryMedia;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminShelterSponsorController extends Controller
{
    public function __construct(private CloudinaryMedia $media)
    {
    }

    public function store(Request $request, Shelter $shelter): JsonResponse
    {
        $this->authorizeShelter($request, $shelter);

        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'url'  => ['nullable', 'url', 'max:255'],
            'logo' => ['required', 'image', 'mimes:jpg,jpeg,png,gif,webp,svg', 'max:2048'],
        ]);

        $nextOrder = (int) $shelter->sponsors()->max('order') + 1;

        $shelter->sponsors()->create([
            'name' => $data['name'],
            'url' => $data['url'] ?? null,
            'logo_path' => $this->media->upload($request->file('logo'), 'shelter_sponsors'),
            'order' => $nextOrder,
        ]);

        return response()->json($shelter->fresh()->load('sponsors'), 201);
    }

    public function destroy(Request $request, Shelter $shelter, ShelterSponsor $sponsor): JsonResponse
    {
        $this->authorizeShelter($request, $shelter);

        if ((int) $sponsor->shelter_id !== (int) $shelter->id) {
            abort(404);
        }

        $this->media->delete($sponsor->logo_path);
        $sponsor->delete();

        return response()->json($shelter->fresh()->load('sponsors'));
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
