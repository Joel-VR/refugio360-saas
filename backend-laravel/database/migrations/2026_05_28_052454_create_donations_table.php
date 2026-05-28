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
        Schema::create('donations', function (Blueprint $table) {
            $table->id();

            $table->foreignId('shelter_id')
                ->constrained()
                ->onDelete('cascade');

            $table->string('donor_name')->nullable();
            $table->string('donor_email')->nullable();

            $table->decimal('amount', 10, 2)->nullable();

            $table->enum('payment_method', [
                'yape',
                'plin',
                'paypal',
                'efectivo'
            ]);

            $table->string('operation_reference')->nullable();
            $table->string('voucher_path')->nullable();

            $table->text('notes')->nullable();

            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('donations');
    }
};
