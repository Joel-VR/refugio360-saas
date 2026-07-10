<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('donations', function (Blueprint $table) {
            $table->enum('status', ['pending', 'approved', 'rejected'])
                  ->default('pending')
                  ->after('notes');
            $table->enum('donation_type', ['general', 'specific'])
                  ->default('general')
                  ->after('status');
            $table->foreignId('animal_id')
                  ->nullable()
                  ->constrained()
                  ->onDelete('set null')
                  ->after('donation_type');
            $table->boolean('is_recurring')
                  ->default(false)
                  ->after('animal_id');
            $table->text('admin_notes')
                  ->nullable()
                  ->after('is_recurring');
        });
    }

    public function down(): void
    {
        Schema::table('donations', function (Blueprint $table) {
            $table->dropForeign(['animal_id']);
            $table->dropColumn([
                'status', 'donation_type', 'animal_id',
                'is_recurring', 'admin_notes',
            ]);
        });
    }
};