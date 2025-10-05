<?php

namespace App\Http\Controllers\Seller;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreProductRequest;
use App\Http\Requests\UpdateProductRequest;
use App\Models\Product;
use App\Models\ProductCategory;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class ProductController extends Controller
{
    /**
     * Display a listing of the seller's products.
     */
    public function index(Request $request): Response
    {
        $user = Auth::user();
        $search = $request->get('search');
        $category = $request->get('category');
        $status = $request->get('status');
        $sort = $request->get('sort', 'created_at');
        $direction = $request->get('direction', 'desc');

        $query = Product::where('seller_id', $user->id)
            ->with(['category']);

        // Apply filters
        if ($search) {
            $query->search($search);
        }

        if ($category) {
            $query->byCategory($category);
        }

        if ($status) {
            $query->where('status', $status);
        }

        // Apply sorting
        $query->orderBy($sort, $direction);

        $products = $query->paginate(12)->withQueryString();

        // Get categories for filter dropdown
        $categories = ProductCategory::active()
            ->root()
            ->orderBy('sort_order')
            ->get();

        // Get stats for dashboard
        $stats = [
            'total' => Product::where('seller_id', Auth::id())->count(),
            'active' => Product::where('seller_id', Auth::id())->where('status', Product::STATUS_ACTIVE)->count(),
            'low_stock' => Product::where('seller_id', Auth::id())->where('stock_status', Product::STOCK_LOW_STOCK)->count(),
            'out_of_stock' => Product::where('seller_id', Auth::id())->where('stock_status', Product::STOCK_OUT_OF_STOCK)->count(),
        ];

        return Inertia::render('seller/products/Index', [
            'products' => $products,
            'categories' => $categories,
            'stats' => $stats,
            'filters' => [
                'search' => $search,
                'category' => $category,
                'status' => $status,
                'sort' => $sort,
                'direction' => $direction,
            ],
            'statuses' => Product::$statuses,
            'stockStatuses' => Product::$stockStatuses,
        ]);
    }

    /**
     * Show the form for creating a new product.
     */
    public function create(): Response
    {
        $categories = ProductCategory::active()
            ->orderBy('sort_order')
            ->get()
            ->map(function ($category) {
                return [
                    'id' => $category->id,
                    'name' => $category->name,
                    'slug' => $category->slug,
                    'parent_id' => $category->parent_id,
                ];
            });

        return Inertia::render('seller/products/Create', [
            'categories' => $categories,
            'statuses' => Product::$statuses,
            'conditions' => Product::$conditions,
            'stockStatuses' => Product::$stockStatuses,
        ]);
    }

    /**
     * Store a newly created product in storage.
     */
    public function store(StoreProductRequest $request)
    {
        $validated = $request->validated();

        // Handle image uploads
        $images = [];
        if ($request->hasFile('images')) {
            foreach ($request->file('images') as $image) {
                $path = $image->store('products', 'public');
                $images[] = $path;
            }
        }

        $validated['images'] = $images;
        $validated['featured_image'] = $images[0] ?? null;
        $validated['seller_id'] = Auth::id();

        // Set published_at if status is active
        if ($validated['status'] === Product::STATUS_ACTIVE) {
            $validated['published_at'] = now();
        }

        $product = Product::create($validated);

        return redirect()
            ->route('seller.products.show', $product)
            ->with('success', 'Product created successfully!');
    }

    /**
     * Display the specified product.
     */
    public function show(Product $product): Response
    {
        // Ensure the product belongs to the authenticated seller
        $this->authorize('view', $product);

        $product->load(['category', 'seller']);

        return Inertia::render('seller/products/Show', [
            'product' => $product,
        ]);
    }

    /**
     * Show the form for editing the specified product.
     */
    public function edit(Product $product): Response
    {
        // Ensure the product belongs to the authenticated seller
        $this->authorize('update', $product);

        $product->load('category');

        $categories = ProductCategory::active()
            ->orderBy('sort_order')
            ->get()
            ->map(function ($category) {
                return [
                    'id' => $category->id,
                    'name' => $category->name,
                    'slug' => $category->slug,
                    'parent_id' => $category->parent_id,
                ];
            });

        return Inertia::render('seller/products/Edit', [
            'product' => $product,
            'categories' => $categories,
            'statuses' => Product::$statuses,
            'conditions' => Product::$conditions,
            'stockStatuses' => Product::$stockStatuses,
        ]);
    }

    /**
     * Update the specified product in storage.
     */
    public function update(UpdateProductRequest $request, Product $product)
    {
        // Authorization is handled by the form request
        $validated = $request->validated();

        // Handle image updates
        $currentImages = $product->images ?? [];

        // Remove images marked for deletion
        if ($request->has('remove_images')) {
            foreach ($request->remove_images as $imageToRemove) {
                if (in_array($imageToRemove, $currentImages)) {
                    Storage::disk('public')->delete($imageToRemove);
                    $currentImages = array_filter($currentImages, fn ($img) => $img !== $imageToRemove);
                }
            }
        }

        // Add new images
        if ($request->hasFile('new_images')) {
            foreach ($request->file('new_images') as $image) {
                $path = $image->store('products', 'public');
                $currentImages[] = $path;
            }
        }

        $validated['images'] = array_values($currentImages);
        $validated['featured_image'] = $validated['images'][0] ?? null;

        // Set or unset published_at based on status
        if ($validated['status'] === Product::STATUS_ACTIVE && ! $product->published_at) {
            $validated['published_at'] = now();
        } elseif ($validated['status'] !== Product::STATUS_ACTIVE) {
            $validated['published_at'] = null;
        }

        $product->update($validated);

        return redirect()
            ->route('seller.products.show', $product)
            ->with('success', 'Product updated successfully!');
    }

    /**
     * Remove the specified product from storage.
     */
    public function destroy(Product $product)
    {
        // Ensure the product belongs to the authenticated seller
        $this->authorize('delete', $product);

        // Delete associated images
        if ($product->images) {
            foreach ($product->images as $image) {
                Storage::disk('public')->delete($image);
            }
        }

        $product->delete();

        return redirect()
            ->route('seller.products.index')
            ->with('success', 'Product deleted successfully!');
    }

    /**
     * Toggle product status (publish/unpublish)
     */
    public function toggleStatus(Product $product)
    {
        $this->authorize('update', $product);

        if ($product->isActive()) {
            $product->unpublish();
            $message = 'Product unpublished successfully!';
        } else {
            $product->publish();
            $message = 'Product published successfully!';
        }

        return back()->with('success', $message);
    }

    /**
     * Duplicate a product
     */
    public function duplicate(Product $product)
    {
        $this->authorize('view', $product);

        $newProduct = $product->replicate();
        $newProduct->name = $product->name.' (Copy)';
        $newProduct->sku = null; // Will be auto-generated
        $newProduct->slug = null; // Will be auto-generated
        $newProduct->status = Product::STATUS_DRAFT;
        $newProduct->published_at = null;
        $newProduct->view_count = 0;
        $newProduct->order_count = 0;
        $newProduct->save();

        return redirect()
            ->route('seller.products.edit', $newProduct)
            ->with('success', 'Product duplicated successfully!');
    }

    /**
     * Update inventory for a product
     */
    public function updateInventory(Request $request, Product $product)
    {
        $this->authorize('update', $product);

        $validated = $request->validate([
            'quantity' => 'required|integer|min:0',
            'low_stock_threshold' => 'required|integer|min:0',
            'track_quantity' => 'boolean',
            'allow_backorders' => 'boolean',
        ]);

        $product->update($validated);

        return back()->with('success', 'Inventory updated successfully!');
    }
}
