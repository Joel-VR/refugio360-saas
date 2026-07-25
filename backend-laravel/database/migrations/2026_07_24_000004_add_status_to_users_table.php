<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            if (!Schema::hasColumn('users', 'status')) {
                $table->boolean('status')->default(true)->after('role');
            }
        });

        DB::table('users')
            ->whereIn('role', ['natural_person', 'super_admin'])
            ->update(['status' => true]);

        DB::table('users')
            ->where('role', 'shelter_admin')
            ->update(['status' => false]);

        DB::table('users')
            ->join('shelters', 'users.shelter_id', '=', 'shelters.id')
            ->where('users.role', 'shelter_admin')
            ->where('shelters.approval_status', 'approved')
            ->update(['users.status' => true]);
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            if (Schema::hasColumn('users', 'status')) {
                $table->dropColumn('status');
            }
        });
    }
};
