<?php

namespace App\Http\Controllers\Api\Mobile\Seller;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\ProductCategory;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class ProductController extends Controller
{
    /**
     * List seller's products
     */
    public function index(Request $request): JsonResponse
    {
        $user = Auth::user();

        if ($user->role !== 'seller') {
            return response()->json([
                'success' => false,
                'message' => 'Access denied. Seller account required.',
            ], 403);
        }

        $query = Product::where('seller_id', $user->id);

        // Search
        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('sku', 'like', "%{$search}%");
            });
        }

        // Filter by status
        if ($status = $request->input('status')) {
            $query->where('status', $status);
        }

        // Filter by category
        if ($categoryId = $request->input('category_id')) {
            $query->where('category_id', $categoryId);
        }

        // Filter by stock status
        if ($stockStatus = $request->input('stock_status')) {
            switch ($stockStatus) {
                case 'in_stock':
                    $query->where('quantity', '>', 0);
                    break;
                case 'low_stock':
                    $query->whereColumn('quantity', '<=', 'low_stock_threshold')
                        ->where('quantity', '>', 0);
                    break;
                case 'out_of_stock':
                    $query->where('quantity', 0);
                    break;
            }
        }

        // Sorting
        $sortBy = $request->input('sort_by', 'created_at');
        $sortOrder = $request->input('sort_order', 'desc');
        $allowedSorts = ['name', 'price', 'quantity', 'created_at', 'updated_at'];
        if (in_array($sortBy, $allowedSorts)) {
            $query->orderBy($sortBy, $sortOrder);
        }

        $perPage = min($request->input('per_page', 20), 50);
        $products = $query->with('category:id,name')->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => $products->items(),
            'pagination' => [
                'current_page' => $products->currentPage(),
                'last_page' => $products->lastPage(),
                'per_page' => $products->perPage(),
                'total' => $products->total(),
            ],
        ]);
    }

    /**
     * Get single product details
     */
    public function show(Product $product): JsonResponse
    {
        $user = Auth::user();

        if ($product->seller_id !== $user->id) {
            return response()->json([
                'success' => false,
                'message' => 'Product not found.',
            ], 404);
        }

        $product->load('category:id,name');

        return response()->json([
            'success' => true,
            'data' => $product,
        ]);
    }

    /**
     * Create a new product
     */
    public function store(Request $request): JsonResponse
    {
        $user = Auth::user();

        if ($user->role !== 'seller') {
            return response()->json([
                'success' => false,
                'message' => 'Access denied. Seller account required.',
            ], 403);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'compare_price' => 'nullable|numeric|min:0',
            'category_id' => 'required|exists:product_categories,id',
            'quantity' => 'required|integer|min:0',
            'low_stock_threshold' => 'nullable|integer|min:0',
            'sku' => 'nullable|string|max:100|unique:products,sku',
            'status' => 'nullable|in:draft,active',
            'images' => 'nullable|array',
            'images.*' => 'image|mimes:jpeg,png,jpg,gif,webp|max:5120',
            'shipping_weight' => 'nullable|numeric|min:0',
            'shipping_length' => 'nullable|numeric|min:0',
            'shipping_width' => 'nullable|numeric|min:0',
            'shipping_height' => 'nullable|numeric|min:0',
        ]);

        DB::beginTransaction();
        try {
            // Generate slug
            $slug = Str::slug($validated['name']);
            $originalSlug = $slug;
            $counter = 1;
            while (Product::where('slug', $slug)->exists()) {
                $slug = $originalSlug.'-'.$counter++;
            }

            // Generate SKU if not provided
            $sku = $validated['sku'] ?? strtoupper(Str::random(8));

            // Handle image uploads
            $imagePaths = [];
            if ($request->hasFile('images')) {
                foreach ($request->file('images') as $image) {
                    $path = $image->store('products', 'public');
                    $imagePaths[] = Storage::url($path);
                }
            }

            $product = Product::create([
                'seller_id' => $user->id,
                'name' => $validated['name'],
                'slug' => $slug,
                'description' => $validated['description'] ?? null,
                'price' => $validated['price'],
                'compare_price' => $validated['compare_price'] ?? null,
                'category_id' => $validated['category_id'],
                'quantity' => $validated['quantity'],
                'low_stock_threshold' => $validated['low_stock_threshold'] ?? 5,
                'sku' => $sku,
                'status' => $validated['status'] ?? 'draft',
                'images' => $imagePaths,
                'shipping_weight' => $validated['shipping_weight'] ?? null,
                'shipping_length' => $validated['shipping_length'] ?? null,
                'shipping_width' => $validated['shipping_width'] ?? null,
                'shipping_height' => $validated['shipping_height'] ?? null,
                'published_at' => ($validated['status'] ?? 'draft') === 'active' ? now() : null,
            ]);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Product created successfully.',
                'data' => $product->load('category:id,name'),
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();

            return response()->json([
                'success' => false,
                'message' => 'Failed to create product.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Update a product
     */
    public function update(Request $request, Product $product): JsonResponse
    {
        $user = Auth::user();

        if ($product->seller_id !== $user->id) {
            return response()->json([
                'success' => false,
                'message' => 'Product not found.',
            ], 404);
        }

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'description' => 'nullable|string',
            'price' => 'sometimes|numeric|min:0',
            'compare_price' => 'nullable|numeric|min:0',
            'category_id' => 'sometimes|exists:product_categories,id',
            'quantity' => 'sometimes|integer|min:0',
            'low_stock_threshold' => 'nullable|integer|min:0',
            'sku' => ['sometimes', 'string', 'max:100', Rule::unique('products', 'sku')->ignore($product->id)],
            'status' => 'nullable|in:draft,active',
            'new_images' => 'nullable|array',
            'new_images.*' => 'image|mimes:jpeg,png,jpg,gif,webp|max:5120',
            'remove_images' => 'nullable|array',
            'remove_images.*' => 'string',
            'shipping_weight' => 'nullable|numeric|min:0',
            'shipping_length' => 'nullable|numeric|min:0',
            'shipping_width' => 'nullable|numeric|min:0',
            'shipping_height' => 'nullable|numeric|min:0',
        ]);

        DB::beginTransaction();
        try {
            // Handle image removals
            $currentImages = $product->images ?? [];
            if (! empty($validated['remove_images'])) {
                foreach ($validated['remove_images'] as $imageToRemove) {
                    $key = array_search($imageToRemove, $currentImages);
                    if ($key !== false) {
                        unset($currentImages[$key]);
                        // Delete from storage
                        $path = str_replace('/storage/', '', $imageToRemove);
                        Storage::disk('public')->delete($path);
                    }
                }
                $currentImages = array_values($currentImages);
            }

            // Handle new image uploads
            if ($request->hasFile('new_images')) {
                foreach ($request->file('new_images') as $image) {
                    $path = $image->store('products', 'public');
                    $currentImages[] = Storage::url($path);
                }
            }

            // Update slug if name changed
            if (isset($validated['name']) && $validated['name'] !== $product->name) {
                $slug = Str::slug($validated['name']);
                $originalSlug = $slug;
                $counter = 1;
                while (Product::where('slug', $slug)->where('id', '!=', $product->id)->exists()) {
                    $slug = $originalSlug.'-'.$counter++;
                }
                $validated['slug'] = $slug;
            }

            // Handle status change
            if (isset($validated['status']) && $validated['status'] === 'active' && $product->status !== 'active') {
                $validated['published_at'] = now();
            }

            $validated['images'] = $currentImages;
            unset($validated['new_images'], $validated['remove_images']);

            $product->update($validated);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Product updated successfully.',
                'data' => $product->fresh()->load('category:id,name'),
            ]);
        } catch (\Exception $e) {
            DB::rollBack();

            return response()->json([
                'success' => false,
                'message' => 'Failed to update product.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Delete a product
     */
    public function destroy(Product $product): JsonResponse
    {
        $user = Auth::user();

        if ($product->seller_id !== $user->id) {
            return response()->json([
                'success' => false,
                'message' => 'Product not found.',
            ], 404);
        }

        // Check if product has orders
        $hasOrders = $product->orderItems()->exists();
        if ($hasOrders) {
            return response()->json([
                'success' => false,
                'message' => 'Cannot delete product with existing orders. Consider setting it to draft instead.',
            ], 422);
        }

        // Delete images
        foreach ($product->images ?? [] as $image) {
            $path = str_replace('/storage/', '', $image);
            Storage::disk('public')->delete($path);
        }

        $product->delete();

        return response()->json([
            'success' => true,
            'message' => 'Product deleted successfully.',
        ]);
    }

    /**
     * Toggle product status (active/draft)
     */
    public function toggleStatus(Product $product): JsonResponse
    {
        $user = Auth::user();

        if ($product->seller_id !== $user->id) {
            return response()->json([
                'success' => false,
                'message' => 'Product not found.',
            ], 404);
        }

        $newStatus = $product->status === 'active' ? 'draft' : 'active';
        $product->update([
            'status' => $newStatus,
            'published_at' => $newStatus === 'active' ? now() : $product->published_at,
        ]);

        return response()->json([
            'success' => true,
            'message' => "Product is now {$newStatus}.",
            'data' => [
                'status' => $newStatus,
            ],
        ]);
    }

    /**
     * Update product inventory
     */
    public function updateInventory(Request $request, Product $product): JsonResponse
    {
        $user = Auth::user();

        if ($product->seller_id !== $user->id) {
            return response()->json([
                'success' => false,
                'message' => 'Product not found.',
            ], 404);
        }

        $validated = $request->validate([
            'quantity' => 'required|integer|min:0',
            'low_stock_threshold' => 'nullable|integer|min:0',
        ]);

        $product->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Inventory updated successfully.',
            'data' => [
                'quantity' => $product->quantity,
                'low_stock_threshold' => $product->low_stock_threshold,
            ],
        ]);
    }

    /**
     * Get categories for product creation/editing
     */
    public function categories(): JsonResponse
    {
        $categories = ProductCategory::where('is_active', true)
            ->orderBy('name')
            ->get(['id', 'name', 'slug', 'icon']);

        return response()->json([
            'success' => true,
            'data' => $categories,
        ]);
    }
}
