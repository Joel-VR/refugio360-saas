<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('animal_photos', function (Blueprint $table) {
            $table->id();

            $table->foreignId('animal_id')
                  ->constrained()
                  ->onDelete('cascade');

            $table->string('photo_path');

            $table->integer('display_order')->default(1);

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('animal_photos');
    }
};