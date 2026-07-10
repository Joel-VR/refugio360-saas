<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('shelters', function (Blueprint $table) {
            $table->string('yape_phone')->nullable()->after('logo_path');
            $table->string('yape_owner')->nullable()->after('yape_phone');
            $table->string('yape_qr_path')->nullable()->after('yape_owner');
            $table->string('plin_phone')->nullable()->after('yape_qr_path');
            $table->string('plin_owner')->nullable()->after('plin_phone');
            $table->string('plin_qr_path')->nullable()->after('plin_owner');
        });
    }

    public function down(): void
    {
        Schema::table('shelters', function (Blueprint $table) {
            $table->dropColumn([
                'yape_phone', 'yape_owner', 'yape_qr_path',
                'plin_phone', 'plin_owner', 'plin_qr_path',
            ]);
        });
    }
};