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
        Schema::create('page_contents', function (Blueprint $table) {
            $table->id();
            $table->string('page_type'); // 'about' or 'contact'
            $table->string('section'); // e.g., 'mission', 'values', 'story', 'contact_info', 'faq', etc.
            $table->string('title')->nullable();
            $table->text('content')->nullable(); // HTML or plain text content
            $table->json('metadata')->nullable(); // For storing additional structured data
            $table->integer('sort_order')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            // Indexes
            $table->index(['page_type', 'section']);
            $table->index(['page_type', 'is_active']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('page_contents');
    }
};
