<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Shelter;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\Rules\Password;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function registerPerson(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', 'confirmed', Password::min(8)->mixedCase()->numbers()->symbols()],
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => $validated['password'],
            'role' => 'natural_person',
            'status' => true,
        ]);

        return response()->json([
            'message' => 'Cuenta creada correctamente.',
            'user' => $this->serializeUser($user),
        ], 201);
    }

    public function registerShelter(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'shelter_name' => ['required', 'string', 'max:255'],
            'responsible_name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', 'unique:users,email'],
            'phone' => ['required', 'string', 'max:20'],
            'address' => ['required', 'string', 'max:255'],
            'description' => ['required', 'string', 'max:2000'],
            'password' => ['required', 'confirmed', Password::min(8)->mixedCase()->numbers()->symbols()],
        ]);

        $shelter = Shelter::create([
            'name' => $validated['shelter_name'],
            'slug' => $this->uniqueShelterSlug($validated['shelter_name']),
            'description' => $validated['description'],
            'email' => $validated['email'],
            'phone' => $validated['phone'],
            'address' => $validated['address'],
            'approval_status' => 'pending_review',
            'is_active' => false,
        ]);

        $user = User::create([
            'shelter_id' => $shelter->id,
            'name' => $validated['responsible_name'],
            'email' => $validated['email'],
            'password' => $validated['password'],
            'role' => 'shelter_admin',
            'status' => false,
        ]);

        return response()->json([
            'message' => 'Solicitud enviada a revisiÃ³n.',
            'user' => $this->serializeUser($user),
            'shelter' => $shelter->loadCount(['animals', 'adoptions']),
        ], 201);
    }

    public function login(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required', 'string'],
        ]);

        $user = User::where('email', $validated['email'])->first();

        if (!$user || !Hash::check($validated['password'], $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['Las credenciales no son correctas.'],
            ]);
        }

        $token = $user->createToken('web')->plainTextToken;

        return response()->json([
            'token' => $token,
            'user' => $this->serializeUser($user),
        ]);
    }

    public function me(Request $request): JsonResponse
    {
        return response()->json([
            'user' => $this->serializeUser($request->user()),
        ]);
    }

    public function updateProfile(Request $request): JsonResponse
    {
        $user = $request->user();

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', Rule::unique('users', 'email')->ignore($user->id)],
        ]);

        $user->update($validated);

        return response()->json([
            'message' => 'Perfil actualizado correctamente.',
            'user' => $this->serializeUser($user->fresh()),
        ]);
    }

    public function updatePassword(Request $request): JsonResponse
    {
        $user = $request->user();

        $validated = $request->validate([
            'current_password' => ['required', 'string'],
            'password' => ['required', 'confirmed', Password::min(8)->mixedCase()->numbers()->symbols()],
        ]);

        if (!Hash::check($validated['current_password'], $user->password)) {
            throw ValidationException::withMessages([
                'current_password' => ['La contraseÃ±a actual no es correcta.'],
            ]);
        }

        $user->update(['password' => $validated['password']]);

        return response()->json([
            'message' => 'ContraseÃ±a actualizada correctamente.',
        ]);
    }

    public function updatePhoto(Request $request): JsonResponse
    {
        $user = $request->user();

        $validated = $request->validate([
            'photo' => ['required', 'image', 'mimes:jpg,jpeg,png,webp', 'max:2048', 'dimensions:max_width=8000,max_height=8000'],
        ]);

        if ($user->profile_photo_path) {
            $media->delete($user->profile_photo_path);
        }

        $path = $media->upload($validated['photo'], 'profile-photos');
        $user->update(['profile_photo_path' => $path]);

        return response()->json([
            'message' => 'Foto de perfil actualizada correctamente.',
            'user' => $this->serializeUser($user->fresh()),
        ]);
    }

    public function logout(Request $request): JsonResponse
    {
        $request->user()?->currentAccessToken()?->delete();

        return response()->json(null, 204);
    }

    private function serializeUser(User $user): array
    {
        return [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'role' => $user->role,
            'status' => (bool) $user->status,
            'shelter_id' => $user->shelter_id,
            'shelter' => $user->shelter
                ? [
                    'id' => $user->shelter->id,
                    'name' => $user->shelter->name,
                    'approval_status' => $user->shelter->approval_status,
                    'is_active' => (bool) $user->shelter->is_active,
                ]
                : null,
            'profile_photo_path' => $user->profile_photo_path,
            'profile_photo_url' => $user->profile_photo_path,
        ];
    }

    private function uniqueShelterSlug(string $name): string
    {
        $base = Str::slug($name) ?: 'albergue';
        $slug = $base;
        $suffix = 2;

        while (Shelter::where('slug', $slug)->exists()) {
            $slug = "{$base}-{$suffix}";
            $suffix++;
        }

        return $slug;
    }
}



