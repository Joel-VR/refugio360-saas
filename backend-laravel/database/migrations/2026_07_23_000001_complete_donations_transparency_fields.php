<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('donations', function (Blueprint $table) {
            if (!Schema::hasColumn('donations', 'is_anonymous')) {
                $table->boolean('is_anonymous')->default(false)->after('is_recurring');
            }
        });

        Schema::table('expenses', function (Blueprint $table) {
            if (!Schema::hasColumn('expenses', 'category')) {
                $table->enum('category', ['alimentacion', 'veterinaria', 'infraestructura', 'otros'])
                    ->default('otros')
                    ->after('amount');
            }

            if (!Schema::hasColumn('expenses', 'status')) {
                $table->enum('status', ['pending', 'approved', 'rejected'])
                    ->default('approved')
                    ->after('category');
            }
        });
    }

    public function down(): void
    {
        Schema::table('donations', function (Blueprint $table) {
            if (Schema::hasColumn('donations', 'is_anonymous')) {
                $table->dropColumn('is_anonymous');
            }
        });

        Schema::table('expenses', function (Blueprint $table) {
            $columns = [];
            if (Schema::hasColumn('expenses', 'category')) {
                $columns[] = 'category';
            }
            if (Schema::hasColumn('expenses', 'status')) {
                $columns[] = 'status';
            }
            if ($columns !== []) {
                $table->dropColumn($columns);
            }
        });
    }
};
