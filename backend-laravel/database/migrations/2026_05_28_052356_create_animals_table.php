<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('animals', function (Blueprint $table) {
            $table->id();

            $table->foreignId('shelter_id')
                ->constrained()
                ->onDelete('cascade');

            $table->string('name');
            $table->enum('species', ['perro', 'gato', 'otro']);
            $table->integer('estimated_age')->nullable();
            $table->text('health_status')->nullable();
            $table->boolean('is_sterilized')->default(false);

            $table->enum('lifecycle_status', [
                'cuarentena',
                'tratamiento',
                'apto',
                'adoptado'
            ])->default('cuarentena');

            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('animals');
    }
};
