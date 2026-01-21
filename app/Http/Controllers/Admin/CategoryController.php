<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ProductCategory;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class CategoryController extends Controller
{
    /**
     * Display a listing of all categories.
     */
    public function index(Request $request): Response
    {
        $query = ProductCategory::with(['parent', 'children']);

        // Apply search filter
        if ($request->filled('search')) {
            $query->where('name', 'like', "%{$request->search}%");
        }

        // Apply parent filter
        if ($request->filled('parent_id')) {
            if ($request->parent_id === 'root') {
                $query->whereNull('parent_id');
            } else {
                $query->where('parent_id', $request->parent_id);
            }
        }

        // Apply active filter
        if ($request->filled('is_active')) {
            $query->where('is_active', $request->is_active === 'true');
        }

        $categories = $query->orderBy('sort_order')
            ->orderBy('name')
            ->paginate(20)
            ->withQueryString()
            ->through(fn ($category) => [
                'id' => $category->id,
                'name' => $category->name,
                'slug' => $category->slug,
                'description' => $category->description,
                'icon' => $category->icon,
                'color' => $category->color,
                'image' => $category->image,
                'parent_id' => $category->parent_id,
                'parent' => $category->parent ? [
                    'id' => $category->parent->id,
                    'name' => $category->parent->name,
                ] : null,
                'children_count' => $category->children->count(),
                'products_count' => $category->products()->count(),
                'sort_order' => $category->sort_order,
                'is_active' => $category->is_active,
                'created_at' => $category->created_at,
            ]);

        return Inertia::render('admin/categories/index', [
            'categories' => $categories,
            'filters' => $request->only(['search', 'parent_id', 'is_active']),
            'rootCategories' => ProductCategory::root()->orderBy('name')->get(['id', 'name']),
            'stats' => [
                'total' => ProductCategory::count(),
                'active' => ProductCategory::where('is_active', true)->count(),
                'inactive' => ProductCategory::where('is_active', false)->count(),
                'root' => ProductCategory::root()->count(),
                'with_products' => ProductCategory::has('products')->count(),
            ],
        ]);
    }

    /**
     * Show the form for creating a new category.
     */
    public function create(): Response
    {
        return Inertia::render('admin/categories/create', [
            'rootCategories' => ProductCategory::root()->orderBy('name')->get(['id', 'name']),
        ]);
    }

    /**
     * Store a newly created category.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255', 'unique:product_categories,name'],
            'slug' => ['nullable', 'string', 'max:255', 'unique:product_categories,slug'],
            'description' => ['nullable', 'string', 'max:1000'],
            'icon' => ['nullable', 'string', 'max:100'],
            'color' => ['nullable', 'string', 'max:50'],
            'image' => ['nullable', 'image', 'mimes:jpeg,png,jpg,gif', 'max:2048'],
            'parent_id' => ['nullable', 'exists:product_categories,id'],
            'sort_order' => ['nullable', 'integer', 'min:0'],
            'is_active' => ['boolean'],
            'meta_title' => ['nullable', 'string', 'max:255'],
            'meta_description' => ['nullable', 'string', 'max:500'],
        ]);

        // Generate slug if not provided
        if (empty($validated['slug'])) {
            $validated['slug'] = Str::slug($validated['name']);
        }

        // Handle image upload
        if ($request->hasFile('image')) {
            $validated['image'] = $request->file('image')->store('categories', 'public');
        }

        $validated['is_active'] = $validated['is_active'] ?? true;

        ProductCategory::create($validated);

        return redirect()->route('admin.categories.index')
            ->with('message', 'Category created successfully.');
    }

    /**
     * Display the specified category.
     */
    public function show(ProductCategory $category): Response
    {
        $category->load(['parent', 'children', 'products']);

        return Inertia::render('admin/categories/show', [
            'category' => [
                'id' => $category->id,
                'name' => $category->name,
                'slug' => $category->slug,
                'description' => $category->description,
                'icon' => $category->icon,
                'color' => $category->color,
                'image' => $category->image,
                'parent_id' => $category->parent_id,
                'parent' => $category->parent ? [
                    'id' => $category->parent->id,
                    'name' => $category->parent->name,
                ] : null,
                'children' => $category->children->map(fn ($child) => [
                    'id' => $child->id,
                    'name' => $child->name,
                    'products_count' => $child->products()->count(),
                ]),
                'products_count' => $category->products()->count(),
                'sort_order' => $category->sort_order,
                'is_active' => $category->is_active,
                'meta_title' => $category->meta_title,
                'meta_description' => $category->meta_description,
                'created_at' => $category->created_at,
                'updated_at' => $category->updated_at,
            ],
        ]);
    }

    /**
     * Show the form for editing the specified category.
     */
    public function edit(ProductCategory $category): Response
    {
        return Inertia::render('admin/categories/edit', [
            'category' => [
                'id' => $category->id,
                'name' => $category->name,
                'slug' => $category->slug,
                'description' => $category->description,
                'icon' => $category->icon,
                'color' => $category->color,
                'image' => $category->image,
                'parent_id' => $category->parent_id,
                'sort_order' => $category->sort_order,
                'is_active' => $category->is_active,
                'meta_title' => $category->meta_title,
                'meta_description' => $category->meta_description,
            ],
            'rootCategories' => ProductCategory::root()
                ->where('id', '!=', $category->id)
                ->orderBy('name')
                ->get(['id', 'name']),
        ]);
    }

    /**
     * Update the specified category.
     */
    public function update(Request $request, ProductCategory $category)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255', 'unique:product_categories,name,'.$category->id],
            'slug' => ['nullable', 'string', 'max:255', 'unique:product_categories,slug,'.$category->id],
            'description' => ['nullable', 'string', 'max:1000'],
            'icon' => ['nullable', 'string', 'max:100'],
            'color' => ['nullable', 'string', 'max:50'],
            'image' => ['nullable', 'image', 'mimes:jpeg,png,jpg,gif', 'max:2048'],
            'parent_id' => ['nullable', 'exists:product_categories,id', 'different:'.$category->id],
            'sort_order' => ['nullable', 'integer', 'min:0'],
            'is_active' => ['boolean'],
            'meta_title' => ['nullable', 'string', 'max:255'],
            'meta_description' => ['nullable', 'string', 'max:500'],
        ]);

        // Generate slug if not provided and name changed
        if (empty($validated['slug']) && $category->isDirty('name')) {
            $validated['slug'] = Str::slug($validated['name']);
        }

        // Handle image upload
        if ($request->hasFile('image')) {
            // Delete old image
            \App\Helpers\ImageHelper::delete($category->image);
            $validated['image'] = \App\Helpers\ImageHelper::store($request->file('image'), 'categories');
        }

        $category->update($validated);

        return redirect()->route('admin.categories.index')
            ->with('message', 'Category updated successfully.');
    }

    /**
     * Remove the specified category.
     */
    public function destroy(ProductCategory $category)
    {
        // Check if category has products
        if ($category->products()->count() > 0) {
            return back()->with('error', 'Cannot delete category with associated products.');
        }

        // Check if category has children
        if ($category->children()->count() > 0) {
            return back()->with('error', 'Cannot delete category with child categories. Please delete or reassign child categories first.');
        }

        // Delete image if exists
        \App\Helpers\ImageHelper::delete($category->image);

        $category->delete();

        return redirect()->route('admin.categories.index')
            ->with('message', 'Category deleted successfully.');
    }

    /**
     * Toggle category active status.
     */
    public function toggleStatus(ProductCategory $category)
    {
        $category->is_active = ! $category->is_active;
        $category->save();

        $status = $category->is_active ? 'activated' : 'deactivated';

        return back()->with('message', "Category {$status} successfully.");
    }
}
