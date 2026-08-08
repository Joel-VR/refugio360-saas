<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('lost_found_posts', function (Blueprint $table) {
            $table->id();

            $table->foreignId('user_id')
                ->constrained()
                ->onDelete('cascade');

            $table->enum('type', ['perdida', 'encontrada']);
            $table->string('pet_name')->nullable();
            $table->string('species')->nullable();
            $table->string('zone');
            $table->text('description');
            $table->char('contact_phone', 9);
            $table->string('photo_path')->nullable();

            $table->enum('status', ['pending_review', 'approved', 'rejected'])->default('pending_review');
            $table->text('admin_notes')->nullable();

            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('lost_found_posts');
    }
};
