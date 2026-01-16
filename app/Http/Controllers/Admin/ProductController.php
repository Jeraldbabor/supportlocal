<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\ProductCategory;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class ProductController extends Controller
{
    /**
     * Display a listing of all products.
     */
    public function index(Request $request): Response
    {
        $query = Product::with(['seller', 'category']);

        // Apply search filter
        if ($request->filled('search')) {
            $query->search($request->search);
        }

        // Apply status filter
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        // Apply stock status filter
        if ($request->filled('stock_status')) {
            $query->where('stock_status', $request->stock_status);
        }

        // Apply seller filter
        if ($request->filled('seller_id')) {
            $query->where('seller_id', $request->seller_id);
        }

        // Apply category filter
        if ($request->filled('category_id')) {
            $query->where('category_id', $request->category_id);
        }

        $products = $query->latest()
            ->paginate(20)
            ->withQueryString()
            ->through(fn ($product) => [
                'id' => $product->id,
                'name' => $product->name,
                'sku' => $product->sku,
                'slug' => $product->slug,
                'price' => $product->price,
                'formatted_price' => $product->formatted_price,
                'quantity' => $product->quantity,
                'stock_status' => $product->stock_status,
                'status' => $product->status,
                'is_featured' => $product->is_featured,
                'view_count' => $product->view_count,
                'order_count' => $product->order_count,
                'average_rating' => $product->average_rating,
                'review_count' => $product->review_count,
                'primary_image' => \App\Helpers\ImageHelper::url($product->primary_image),
                'seller' => $product->seller ? [
                    'id' => $product->seller->id,
                    'name' => $product->seller->name,
                ] : null,
                'category' => $product->category ? [
                    'id' => $product->category->id,
                    'name' => $product->category->name,
                ] : null,
                'created_at' => $product->created_at,
                'published_at' => $product->published_at,
            ]);

        return Inertia::render('admin/products/index', [
            'products' => $products,
            'filters' => $request->only(['search', 'status', 'stock_status', 'seller_id', 'category_id']),
            'statuses' => Product::$statuses,
            'stockStatuses' => Product::$stockStatuses,
            'categories' => ProductCategory::active()->orderBy('name')->get(['id', 'name']),
            'stats' => [
                'total' => Product::count(),
                'active' => Product::where('status', Product::STATUS_ACTIVE)->count(),
                'inactive' => Product::where('status', Product::STATUS_INACTIVE)->count(),
                'draft' => Product::where('status', Product::STATUS_DRAFT)->count(),
                'archived' => Product::where('status', Product::STATUS_ARCHIVED)->count(),
                'out_of_stock' => Product::where('stock_status', Product::STOCK_OUT_OF_STOCK)->count(),
                'low_stock' => Product::where('stock_status', Product::STOCK_LOW_STOCK)->count(),
                'featured' => Product::where('is_featured', true)->count(),
            ],
        ]);
    }

    /**
     * Display the specified product.
     */
    public function show(Product $product): Response
    {
        $product->load(['seller', 'category', 'ratings.user']);

        return Inertia::render('admin/products/show', [
            'product' => [
                'id' => $product->id,
                'name' => $product->name,
                'description' => $product->description,
                'short_description' => $product->short_description,
                'sku' => $product->sku,
                'slug' => $product->slug,
                'price' => $product->price,
                'compare_price' => $product->compare_price,
                'cost_price' => $product->cost_price,
                'formatted_price' => $product->formatted_price,
                'formatted_compare_price' => $product->formatted_compare_price,
                'quantity' => $product->quantity,
                'low_stock_threshold' => $product->low_stock_threshold,
                'track_quantity' => $product->track_quantity,
                'allow_backorders' => $product->allow_backorders,
                'stock_status' => $product->stock_status,
                'weight' => $product->weight,
                'weight_unit' => $product->weight_unit,
                'dimensions' => $product->dimensions,
                'condition' => $product->condition,
                'meta_title' => $product->meta_title,
                'meta_description' => $product->meta_description,
                'tags' => $product->tags,
                'status' => $product->status,
                'is_featured' => $product->is_featured,
                'is_digital' => $product->is_digital,
                'requires_shipping' => $product->requires_shipping,
                'images' => \App\Helpers\ImageHelper::urls($product->images),
                'featured_image' => \App\Helpers\ImageHelper::url($product->featured_image),
                'primary_image' => \App\Helpers\ImageHelper::url($product->primary_image),
                'subcategories' => $product->subcategories,
                'shipping_weight' => $product->shipping_weight,
                'shipping_cost' => $product->shipping_cost,
                'free_shipping' => $product->free_shipping,
                'view_count' => $product->view_count,
                'order_count' => $product->order_count,
                'average_rating' => $product->average_rating,
                'review_count' => $product->review_count,
                'published_at' => $product->published_at,
                'seller' => $product->seller ? [
                    'id' => $product->seller->id,
                    'name' => $product->seller->name,
                    'email' => $product->seller->email,
                ] : null,
                'category' => $product->category ? [
                    'id' => $product->category->id,
                    'name' => $product->category->name,
                ] : null,
                'ratings' => $product->ratings->map(fn ($rating) => [
                    'id' => $rating->id,
                    'rating' => $rating->rating,
                    'review' => $rating->review,
                    'seller_reply' => $rating->seller_reply,
                    'user' => [
                        'id' => $rating->user->id,
                        'name' => $rating->user->name,
                        'avatar_url' => $rating->user->avatar_url,
                    ],
                    'created_at' => $rating->created_at,
                ]),
                'created_at' => $product->created_at,
                'updated_at' => $product->updated_at,
            ],
        ]);
    }

    /**
     * Show the form for editing the specified product.
     */
    public function edit(Product $product): Response
    {
        $product->load(['seller', 'category']);

        return Inertia::render('admin/products/edit', [
            'product' => [
                'id' => $product->id,
                'name' => $product->name,
                'description' => $product->description,
                'short_description' => $product->short_description,
                'sku' => $product->sku,
                'price' => $product->price,
                'compare_price' => $product->compare_price,
                'cost_price' => $product->cost_price,
                'quantity' => $product->quantity,
                'low_stock_threshold' => $product->low_stock_threshold,
                'track_quantity' => $product->track_quantity,
                'allow_backorders' => $product->allow_backorders,
                'stock_status' => $product->stock_status,
                'weight' => $product->weight,
                'weight_unit' => $product->weight_unit,
                'dimensions' => $product->dimensions,
                'condition' => $product->condition,
                'meta_title' => $product->meta_title,
                'meta_description' => $product->meta_description,
                'tags' => $product->tags,
                'status' => $product->status,
                'is_featured' => $product->is_featured,
                'is_digital' => $product->is_digital,
                'requires_shipping' => $product->requires_shipping,
                'images' => $product->images,
                'featured_image' => $product->featured_image,
                'category_id' => $product->category_id,
                'shipping_weight' => $product->shipping_weight,
                'shipping_cost' => $product->shipping_cost,
                'free_shipping' => $product->free_shipping,
            ],
            'statuses' => Product::$statuses,
            'stockStatuses' => Product::$stockStatuses,
            'conditions' => Product::$conditions,
            'categories' => ProductCategory::active()->orderBy('name')->get(['id', 'name', 'parent_id']),
        ]);
    }

    /**
     * Update the specified product in storage.
     */
    public function update(Request $request, Product $product)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'description' => ['required', 'string'],
            'short_description' => ['nullable', 'string', 'max:500'],
            'price' => ['required', 'numeric', 'min:0'],
            'compare_price' => ['nullable', 'numeric', 'min:0'],
            'cost_price' => ['nullable', 'numeric', 'min:0'],
            'quantity' => ['required', 'integer', 'min:0'],
            'low_stock_threshold' => ['nullable', 'integer', 'min:0'],
            'track_quantity' => ['boolean'],
            'allow_backorders' => ['boolean'],
            'weight' => ['nullable', 'numeric', 'min:0'],
            'weight_unit' => ['nullable', 'string', 'max:10'],
            'condition' => ['required', 'string'],
            'meta_title' => ['nullable', 'string', 'max:255'],
            'meta_description' => ['nullable', 'string', 'max:500'],
            'tags' => ['nullable', 'array'],
            'status' => ['required', 'string'],
            'is_featured' => ['boolean'],
            'is_digital' => ['boolean'],
            'requires_shipping' => ['boolean'],
            'category_id' => ['nullable', 'exists:product_categories,id'],
            'shipping_weight' => ['nullable', 'numeric', 'min:0'],
            'shipping_cost' => ['nullable', 'numeric', 'min:0'],
            'free_shipping' => ['boolean'],
        ]);

        $product->update($validated);
        $product->updateStockStatus();

        // If status is active and not published, publish it
        if ($validated['status'] === Product::STATUS_ACTIVE && ! $product->published_at) {
            $product->publish();
        }

        return redirect()->route('admin.products.index')
            ->with('message', 'Product updated successfully.');
    }

    /**
     * Remove the specified product from storage.
     */
    public function destroy(Product $product)
    {
        // Delete product images
        if ($product->images) {
            foreach ($product->images as $image) {
                if (Storage::disk('public')->exists($image)) {
                    Storage::disk('public')->delete($image);
                }
            }
        }

        if ($product->featured_image && Storage::disk('public')->exists($product->featured_image)) {
            Storage::disk('public')->delete($product->featured_image);
        }

        $product->delete();

        return redirect()->route('admin.products.index')
            ->with('message', 'Product deleted successfully.');
    }

    /**
     * Toggle product status (active/inactive).
     */
    public function toggleStatus(Product $product)
    {
        if ($product->status === Product::STATUS_ACTIVE) {
            $product->unpublish();
            $message = 'Product deactivated successfully.';
        } else {
            $product->publish();
            $message = 'Product activated successfully.';
        }

        return back()->with('message', $message);
    }

    /**
     * Toggle featured status.
     */
    public function toggleFeatured(Product $product)
    {
        $product->is_featured = ! $product->is_featured;
        $product->save();

        $status = $product->is_featured ? 'featured' : 'unfeatured';

        return back()->with('message', "Product {$status} successfully.");
    }

    /**
     * Bulk update product status.
     */
    public function bulkUpdate(Request $request)
    {
        $validated = $request->validate([
            'product_ids' => ['required', 'array'],
            'product_ids.*' => ['exists:products,id'],
            'status' => ['required', 'string'],
        ]);

        Product::whereIn('id', $validated['product_ids'])
            ->update(['status' => $validated['status']]);

        return back()->with('message', 'Products updated successfully.');
    }

    /**
     * Bulk delete products.
     */
    public function bulkDelete(Request $request)
    {
        $validated = $request->validate([
            'product_ids' => ['required', 'array'],
            'product_ids.*' => ['exists:products,id'],
        ]);

        $products = Product::whereIn('id', $validated['product_ids'])->get();

        foreach ($products as $product) {
            // Delete product images
            if ($product->images) {
                foreach ($product->images as $image) {
                    if (Storage::disk('public')->exists($image)) {
                        Storage::disk('public')->delete($image);
                    }
                }
            }

            if ($product->featured_image && Storage::disk('public')->exists($product->featured_image)) {
                Storage::disk('public')->delete($product->featured_image);
            }

            $product->delete();
        }

        return back()->with('message', 'Products deleted successfully.');
    }
}
