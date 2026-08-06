<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('shelters', function (Blueprint $table) {
            if (!Schema::hasColumn('shelters', 'address')) {
                $table->string('address')->nullable()->after('phone');
            }
        });
    }

    public function down(): void
    {
        Schema::table('shelters', function (Blueprint $table) {
            if (Schema::hasColumn('shelters', 'address')) {
                $table->dropColumn('address');
            }
        });
    }
};
