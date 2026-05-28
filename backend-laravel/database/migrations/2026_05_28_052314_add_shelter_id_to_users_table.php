<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->foreignId('shelter_id')
                  ->nullable()
                  ->constrained()
                  ->onDelete('cascade');

            $table->string('role')->default('shelter_admin');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['shelter_id', 'role']);
        });
    }
};