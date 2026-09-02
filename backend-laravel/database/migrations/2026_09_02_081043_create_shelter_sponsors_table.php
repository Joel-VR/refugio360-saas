<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('shelter_sponsors', function (Blueprint $table) {
            $table->id();

            $table->foreignId('shelter_id')
                ->constrained()
                ->onDelete('cascade');

            $table->string('name');
            $table->string('logo_path');
            $table->string('url')->nullable();
            $table->unsignedInteger('order')->default(0);

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('shelter_sponsors');
    }
};
