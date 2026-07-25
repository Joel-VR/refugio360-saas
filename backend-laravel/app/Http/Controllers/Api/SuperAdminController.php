<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Animal;
use App\Models\Shelter;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class SuperAdminController extends Controller
{
    public function dashboard(): JsonResponse
    {
        return response()->json([
            'stats' => [
                'shelters_total' => Shelter::count(),
                'shelters_pending' => Shelter::where('approval_status', 'pending_review')->count(),
                'shelters_approved' => Shelter::where('approval_status', 'approved')->count(),
                'shelters_rejected' => Shelter::where('approval_status', 'rejected')->count(),
                'users_total' => User::count(),
                'natural_people' => User::where('role', 'natural_person')->count(),
                'shelter_admins' => User::where('role', 'shelter_admin')->count(),
                'animals_total' => Animal::withoutGlobalScopes()->count(),
                'lost_posts_pending' => 0,
                'found_posts_pending' => 0,
            ],
            'pending_shelters' => $this->shelterQuery()
                ->where('approval_status', 'pending_review')
                ->limit(6)
                ->get(),
        ]);
    }

    public function shelters(Request $request): JsonResponse
    {
        $status = $request->query('status');

        $shelters = $this->shelterQuery()
            ->when($status, fn ($query) => $query->where('approval_status', $status))
            ->get();

        return response()->json($shelters);
    }

    public function updateShelterStatus(Request $request, Shelter $shelter): JsonResponse
    {
        $validated = $request->validate([
            'approval_status' => ['required', Rule::in(['approved', 'rejected'])],
        ]);

        $shelter->update([
            'approval_status' => $validated['approval_status'],
            'is_active' => $validated['approval_status'] === 'approved',
        ]);

        $shelter->users()
            ->where('role', 'shelter_admin')
            ->update(['status' => $validated['approval_status'] === 'approved']);

        return response()->json($this->shelterQuery()->findOrFail($shelter->id));
    }

    public function users(): JsonResponse
    {
        $users = User::query()
            ->with('shelter:id,name,approval_status,is_active')
            ->latest()
            ->get()
            ->map(fn (User $user) => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
                'status' => (bool) $user->status,
                'shelter_id' => $user->shelter_id,
                'shelter' => $user->shelter,
                'created_at' => $user->created_at,
            ]);

        return response()->json($users);
    }

    private function shelterQuery()
    {
        return Shelter::query()
            ->with(['users:id,name,email,role,status,shelter_id'])
            ->withCount(['animals', 'adoptions'])
            ->latest();
    }
}
