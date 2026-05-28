<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('adoptions', function (Blueprint $table) {
            $table->id();

            $table->foreignId('shelter_id')
                  ->constrained()
                  ->onDelete('cascade');

            $table->foreignId('animal_id')
                  ->constrained()
                  ->onDelete('cascade');

            $table->string('applicant_name');
            $table->char('dni', 8);
            $table->char('phone', 9);
            $table->string('address');

            $table->enum('status', [
                'pendiente',
                'evaluacion',
                'aprobado',
                'rechazado',
                'adoptado'
            ])->default('pendiente');

            $table->string('pdf_path')->nullable(); // acta generada
            $table->text('notes')->nullable();

            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('adoptions');
    }
};