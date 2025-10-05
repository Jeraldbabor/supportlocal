<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;

class StoreProductRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return Auth::check() && Auth::user()->hasRole('seller');
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'name' => 'required|string|max:255',
            'description' => 'required|string|min:10',
            'short_description' => 'nullable|string|max:500',
            'price' => 'required|numeric|min:0.01|max:999999.99',
            'compare_price' => 'nullable|numeric|min:0|gte:price',
            'cost_price' => 'nullable|numeric|min:0|lte:price',
            'category_id' => 'nullable|integer|exists:product_categories,id',
            'quantity' => 'required|integer|min:0|max:999999',
            'low_stock_threshold' => 'required|integer|min:0|lte:quantity',
            'track_quantity' => 'boolean',
            'allow_backorders' => 'boolean',
            'weight' => 'nullable|numeric|min:0|max:999999',
            'weight_unit' => 'required|string|in:kg,g,lb,oz',
            'dimensions' => 'nullable|array',
            'dimensions.length' => 'nullable|numeric|min:0|max:999999',
            'dimensions.width' => 'nullable|numeric|min:0|max:999999',
            'dimensions.height' => 'nullable|numeric|min:0|max:999999',
            'condition' => 'required|string|in:new,used,refurbished',
            'status' => 'required|string|in:draft,active,inactive',
            'is_featured' => 'boolean',
            'is_digital' => 'boolean',
            'requires_shipping' => 'boolean',
            'shipping_cost' => 'nullable|numeric|min:0|max:999999',
            'free_shipping' => 'boolean',
            'meta_title' => 'nullable|string|max:255',
            'meta_description' => 'nullable|string|max:500',
            'tags' => 'nullable|array|max:10',
            'tags.*' => 'string|max:50',
            'images' => 'nullable|array|max:10',
            'images.*' => 'file|image|mimes:jpeg,png,jpg,webp|max:2048',
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'name.required' => 'Product name is required.',
            'description.required' => 'Product description is required.',
            'description.min' => 'Product description must be at least 10 characters.',
            'price.required' => 'Product price is required.',
            'price.min' => 'Product price must be greater than 0.',
            'compare_price.gte' => 'Compare price must be greater than or equal to the selling price.',
            'cost_price.lte' => 'Cost price must be less than or equal to the selling price.',
            'quantity.required' => 'Product quantity is required.',
            'low_stock_threshold.lte' => 'Low stock threshold cannot be greater than available quantity.',
            'images.*.image' => 'All uploaded files must be images.',
            'images.*.max' => 'Each image must not exceed 2MB.',
        ];
    }

    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation(): void
    {
        $this->merge([
            'track_quantity' => $this->boolean('track_quantity', true),
            'allow_backorders' => $this->boolean('allow_backorders', false),
            'is_featured' => $this->boolean('is_featured', false),
            'is_digital' => $this->boolean('is_digital', false),
            'requires_shipping' => $this->boolean('requires_shipping', true),
            'free_shipping' => $this->boolean('free_shipping', false),
        ]);

        // Parse tags JSON string
        if ($this->has('tags') && is_string($this->input('tags'))) {
            $tags = json_decode($this->input('tags'), true);
            if (is_array($tags)) {
                $this->merge(['tags' => $tags]);
            }
        }
    }
}
