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
        Schema::create('custom_order_requests', function (Blueprint $table) {
            $table->id();
            $table->string('request_number')->unique();
            $table->foreignId('buyer_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('seller_id')->constrained('users')->onDelete('cascade');
            
            // Request details
            $table->string('title');
            $table->text('description');
            $table->json('reference_images')->nullable();
            $table->decimal('budget_min', 10, 2)->nullable();
            $table->decimal('budget_max', 10, 2)->nullable();
            $table->integer('quantity')->default(1);
            $table->date('preferred_deadline')->nullable();
            $table->text('special_requirements')->nullable();
            
            // Seller response
            $table->enum('status', [
                'pending',           // Waiting for seller response
                'quoted',            // Seller sent a quote
                'accepted',          // Buyer accepted the quote
                'rejected',          // Seller rejected the request
                'declined',          // Buyer declined the quote
                'in_progress',       // Work in progress
                'ready_for_checkout', // Seller finished, waiting for buyer payment
                'completed',         // Buyer paid, order created
                'cancelled'          // Request cancelled
            ])->default('pending');
            
            // Quote details from seller
            $table->decimal('quoted_price', 10, 2)->nullable();
            $table->integer('estimated_days')->nullable();
            $table->text('seller_notes')->nullable();
            $table->timestamp('quoted_at')->nullable();
            
            // Response timestamps
            $table->timestamp('accepted_at')->nullable();
            $table->timestamp('rejected_at')->nullable();
            $table->text('rejection_reason')->nullable();
            $table->timestamp('completed_at')->nullable();
            
            // Link to product if seller creates one
            $table->foreignId('product_id')->nullable()->constrained('products')->onDelete('set null');
            $table->foreignId('order_id')->nullable()->constrained('orders')->onDelete('set null');
            
            $table->timestamps();
            
            // Indexes for better query performance
            $table->index(['buyer_id', 'status']);
            $table->index(['seller_id', 'status']);
            $table->index('created_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('custom_order_requests');
    }
};
