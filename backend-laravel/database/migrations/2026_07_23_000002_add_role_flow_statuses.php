<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('shelters', function (Blueprint $table) {
            if (!Schema::hasColumn('shelters', 'approval_status')) {
                $table->enum('approval_status', ['pending_review', 'approved', 'rejected'])
                    ->default('approved')
                    ->after('is_active');
            }
        });
    }

    public function down(): void
    {
        Schema::table('shelters', function (Blueprint $table) {
            if (Schema::hasColumn('shelters', 'approval_status')) {
                $table->dropColumn('approval_status');
            }
        });
    }
};
