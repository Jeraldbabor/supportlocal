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
        Schema::create('seller_ratings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('seller_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->tinyInteger('rating')->unsigned()->comment('Rating from 1 to 5');
            $table->text('review')->nullable();
            $table->timestamps();
            
            // Ensure one user can only rate a seller once
            $table->unique(['seller_id', 'user_id']);
            
            // Add indexes for performance
            $table->index('seller_id');
            $table->index('user_id');
            $table->index('rating');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('seller_ratings');
    }
};
