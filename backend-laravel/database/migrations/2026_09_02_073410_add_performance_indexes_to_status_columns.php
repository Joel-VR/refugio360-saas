<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('animals', function (Blueprint $table) {
            $table->index('lifecycle_status');
        });

        Schema::table('adoptions', function (Blueprint $table) {
            $table->index('status');
        });

        Schema::table('lost_found_posts', function (Blueprint $table) {
            $table->index('status');
        });

        Schema::table('donations', function (Blueprint $table) {
            $table->index('status');
        });

        Schema::table('expenses', function (Blueprint $table) {
            $table->index('status');
        });
    }

    public function down(): void
    {
        Schema::table('animals', function (Blueprint $table) {
            $table->dropIndex(['lifecycle_status']);
        });

        Schema::table('adoptions', function (Blueprint $table) {
            $table->dropIndex(['status']);
        });

        Schema::table('lost_found_posts', function (Blueprint $table) {
            $table->dropIndex(['status']);
        });

        Schema::table('donations', function (Blueprint $table) {
            $table->dropIndex(['status']);
        });

        Schema::table('expenses', function (Blueprint $table) {
            $table->dropIndex(['status']);
        });
    }
};
