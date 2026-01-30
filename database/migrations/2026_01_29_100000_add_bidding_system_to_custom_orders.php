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
        // Update custom_order_requests table to support public bidding
        Schema::table('custom_order_requests', function (Blueprint $table) {
            // Make seller_id nullable for public requests
            // Need to drop foreign key first, then modify, then re-add
        });

        // Drop foreign key and make seller_id nullable
        try {
            Schema::table('custom_order_requests', function (Blueprint $table) {
                $table->dropForeign(['seller_id']);
            });
        } catch (\Exception $e) {
            // Foreign key might not exist or have different name
            try {
                Schema::table('custom_order_requests', function (Blueprint $table) {
                    $table->dropForeign('custom_order_requests_seller_id_foreign');
                });
            } catch (\Exception $e2) {
                // Ignore if already dropped
            }
        }

        Schema::table('custom_order_requests', function (Blueprint $table) {
            $table->foreignId('seller_id')->nullable()->change();
        });

        // Re-add foreign key
        try {
            Schema::table('custom_order_requests', function (Blueprint $table) {
                $table->foreign('seller_id')->references('id')->on('users')->onDelete('cascade');
            });
        } catch (\Exception $e) {
            // Ignore if already exists
        }

        // Add is_public column and category
        if (! Schema::hasColumn('custom_order_requests', 'is_public')) {
            Schema::table('custom_order_requests', function (Blueprint $table) {
                $table->boolean('is_public')->default(false)->after('seller_id');
                $table->string('category')->nullable()->after('title');
                $table->foreignId('accepted_bid_id')->nullable()->after('order_id');
                $table->index('is_public');
            });
        }

        // Create bids table
        Schema::create('custom_order_bids', function (Blueprint $table) {
            $table->id();
            $table->foreignId('custom_order_request_id')->constrained('custom_order_requests')->onDelete('cascade');
            $table->foreignId('seller_id')->constrained('users')->onDelete('cascade');

            // Bid details
            $table->decimal('proposed_price', 10, 2);
            $table->integer('estimated_days');
            $table->text('message'); // Seller's pitch/proposal
            $table->text('additional_notes')->nullable();

            // Status
            $table->enum('status', [
                'pending',    // Waiting for buyer review
                'accepted',   // Buyer accepted this bid
                'rejected',   // Buyer rejected this bid
                'withdrawn',  // Seller withdrew the bid
            ])->default('pending');

            $table->timestamp('accepted_at')->nullable();
            $table->timestamp('rejected_at')->nullable();
            $table->text('rejection_reason')->nullable();

            $table->timestamps();

            // Indexes
            $table->index(['custom_order_request_id', 'status']);
            $table->index(['seller_id', 'status']);
            $table->unique(['custom_order_request_id', 'seller_id']); // One bid per seller per request
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('custom_order_bids');

        if (Schema::hasColumn('custom_order_requests', 'is_public')) {
            Schema::table('custom_order_requests', function (Blueprint $table) {
                $table->dropColumn(['is_public', 'category', 'accepted_bid_id']);
            });
        }
    }
};
