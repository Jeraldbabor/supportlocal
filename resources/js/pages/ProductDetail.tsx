import { Link } from '@inertiajs/react';
import { ArrowLeft, Heart, Minus, Plus, Shield, Star, Truck, ShoppingCart } from 'lucide-react';
import { useState } from 'react';
import MainLayout from '../layouts/MainLayout';

interface Product {
    id: number;
    name: string;
    price: number;
    images: string[];
    artisan: string;
    artisan_id: number;
    artisan_image?: string;
    rating: number;
    reviewCount: number;
    category: string;
    description: string;
    materials: string[];
    dimensions: string;
    care: string;
    inStock: boolean;
    stockCount: number;
    weight?: number;
    sku?: string;
    tags?: string[];
}

interface RelatedProduct {
    id: number;
    name: string;
    price: number;
    image: string;
    artisan: string;
    artisan_image?: string;
    rating: number;
}

interface ProductDetailProps {
    product: Product;
    relatedProducts?: RelatedProduct[];
}

export default function ProductDetail({ product, relatedProducts = [] }: ProductDetailProps) {
    if (!product) {
        return (
            <MainLayout>
                <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                    <div className="text-center">
                        <h1 className="text-2xl font-bold text-gray-900">Product not found</h1>
                        <Link href="/products" className="mt-4 inline-flex items-center font-medium text-primary hover:text-primary/80">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Products
                        </Link>
                    </div>
                </div>
            </MainLayout>
        );
    }
    const [selectedImage, setSelectedImage] = useState(0);
    const [quantity, setQuantity] = useState(1);
    const [isFavorited, setIsFavorited] = useState(false);

    const addToCart = async (productId?: number, qty?: number) => {
        const targetProductId = productId || product.id;
        const targetQuantity = qty || quantity;
        
        try {
            const response = await fetch('/cart/add', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify({
                    product_id: targetProductId,
                    quantity: targetQuantity,
                }),
            });

            if (response.ok) {
                const result = await response.json();
                if (productId) {
                    alert('Product added to cart!');
                } else {
                    alert(`Added ${targetQuantity} ${product.name} to cart!`);
                }
            } else {
                const error = await response.json();
                alert(error.error || 'Failed to add product to cart');
            }
        } catch (error) {
            console.error('Error adding to cart:', error);
            alert('Failed to add product to cart');
        }
    };

    return (
        <MainLayout>
            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                {/* Breadcrumb */}
                <div className="mb-8">
                    <Link href="/products" className="inline-flex items-center font-medium text-primary hover:text-primary/80">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Products
                    </Link>
                </div>

                <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
                    {/* Product Images */}
                    <div>
                        <div className="mb-4 aspect-square">
                            <img
                                src={product.images[selectedImage]}
                                alt={product.name}
                                className="h-full w-full rounded-lg object-cover"
                            />
                        </div>
                        {product.images.length > 1 && (
                            <div className="flex space-x-2">
                                {product.images.map((image, index) => (
                                    <button
                                        key={index}
                                        onClick={() => setSelectedImage(index)}
                                        className={`h-20 w-20 overflow-hidden rounded-md border-2 ${
                                            selectedImage === index ? 'border-primary' : 'border-gray-200'
                                        }`}
                                    >
                                        <img src={image} alt={`${product.name} ${index + 1}`} className="h-full w-full object-cover" />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Product Info */}
                    <div>
                        <div className="mb-4">
                            <span className="rounded-full bg-primary/10 px-3 py-1 text-sm text-primary">{product.category}</span>
                        </div>

                        <h1 className="mb-2 text-3xl font-bold text-gray-900">{product.name}</h1>

                        <div className="mb-4 flex items-center gap-2 text-gray-600">
                            {product.artisan_image && (
                                <img 
                                    src={product.artisan_image} 
                                    alt={product.artisan}
                                    className="h-6 w-6 rounded-full object-cover"
                                />
                            )}
                            <span>by <span className="font-medium">{product.artisan}</span></span>
                        </div>

                        <div className="mb-4 flex items-center">
                            <div className="flex items-center">
                                {[...Array(5)].map((_, i) => (
                                    <Star
                                        key={i}
                                        className={`h-5 w-5 ${
                                            i < Math.floor(product.rating) ? 'fill-current text-yellow-400' : 'text-gray-300'
                                        }`}
                                    />
                                ))}
                            </div>
                            <span className="ml-2 text-sm text-gray-600">
                                {product.rating} ({product.reviewCount} reviews)
                            </span>
                        </div>

                        <div className="mb-6 text-3xl font-bold text-primary">₱{product.price.toFixed(2)}</div>

                        <div className="mb-6">
                            <p className="leading-relaxed text-gray-700">{product.description}</p>
                        </div>

                        {/* Quantity and Add to Cart */}
                        <div className="mb-6">
                            <div className="mb-4 flex items-center space-x-4">
                                <label className="text-sm font-medium text-gray-700">Quantity:</label>
                                <div className="flex items-center rounded-md border border-gray-300">
                                    <button
                                        onClick={() => quantity > 1 && setQuantity(quantity - 1)}
                                        className="p-2 text-gray-600 hover:text-gray-800"
                                        disabled={quantity <= 1}
                                    >
                                        <Minus className="h-4 w-4" />
                                    </button>
                                    <span className="min-w-[60px] px-4 py-2 text-center">{quantity}</span>
                                    <button
                                        onClick={() => setQuantity(quantity + 1)}
                                        className="p-2 text-gray-600 hover:text-gray-800"
                                        disabled={quantity >= product.stockCount}
                                    >
                                        <Plus className="h-4 w-4" />
                                    </button>
                                </div>
                                <span className="text-sm text-gray-600">{product.stockCount} available</span>
                            </div>

                            <div className="flex space-x-4">
                                <button
                                    onClick={() => addToCart()}
                                    disabled={!product.inStock}
                                    className="flex-1 rounded-lg bg-gradient-to-r from-amber-600 to-orange-600 px-6 py-3 font-semibold text-white shadow-md transition-all duration-200 hover:from-amber-700 hover:to-orange-700 hover:shadow-lg hover:scale-105 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center gap-2"
                                >
                                    <ShoppingCart className="h-5 w-5" />
                                    {product.inStock ? 'Add to Cart' : 'Out of Stock'}
                                </button>
                                <button
                                    onClick={() => setIsFavorited(!isFavorited)}
                                    className={`rounded-lg border-2 p-3 transition-all duration-200 ${
                                        isFavorited
                                            ? 'border-amber-500 bg-amber-50 text-amber-600 hover:scale-110'
                                            : 'border-gray-300 text-gray-600 hover:border-amber-500 hover:text-amber-600 hover:scale-110'
                                    }`}
                                >
                                    <Heart className={`h-6 w-6 ${isFavorited ? 'fill-current' : ''}`} />
                                </button>
                            </div>
                        </div>

                        {/* Product Details */}
                        <div className="mb-6 space-y-4">
                            <div>
                                <h3 className="mb-2 font-semibold text-gray-900">Materials</h3>
                                <div className="flex flex-wrap gap-2">
                                    {product.materials.map((material, index) => (
                                        <span key={index} className="rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-700">
                                            {material}
                                        </span>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <h3 className="mb-1 font-semibold text-gray-900">Dimensions</h3>
                                <p className="text-gray-600">{product.dimensions}</p>
                            </div>
                            <div>
                                <h3 className="mb-1 font-semibold text-gray-900">Care Instructions</h3>
                                <p className="text-gray-600">{product.care}</p>
                            </div>
                        </div>

                        {/* Features */}
                        <div className="border-t border-gray-200 pt-6">
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div className="flex items-center">
                                    <Truck className="mr-3 h-5 w-5 text-primary" />
                                    <span className="text-sm text-gray-600">Free shipping on orders over ₱75</span>
                                </div>
                                <div className="flex items-center">
                                    <Shield className="mr-3 h-5 w-5 text-primary" />
                                    <span className="text-sm text-gray-600">30-day return policy</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Related Products */}
                {relatedProducts.length > 0 && (
                    <section className="mt-16 border-t border-gray-200 pt-16">
                        <div className="mb-8">
                            <h2 className="text-2xl font-bold text-gray-900">Related Products</h2>
                            <p className="text-gray-600">More items you might like from this category</p>
                        </div>
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                            {relatedProducts.map((relatedProduct) => (
                                <div
                                    key={relatedProduct.id}
                                    className="overflow-hidden rounded-lg bg-white shadow-sm transition-shadow duration-200 hover:shadow-md"
                                >
                                    <Link href={`/product/${relatedProduct.id}`}>
                                        <img 
                                            src={relatedProduct.image} 
                                            alt={relatedProduct.name} 
                                            className="h-48 w-full object-cover cursor-pointer" 
                                        />
                                    </Link>
                                    <div className="p-4">
                                        <Link href={`/product/${relatedProduct.id}`}>
                                            <h3 className="mb-1 text-lg font-semibold text-gray-900 hover:text-primary cursor-pointer">
                                                {relatedProduct.name}
                                            </h3>
                                        </Link>
                                        <div className="mb-2 flex items-center gap-2">
                                            {relatedProduct.artisan_image && (
                                                <img 
                                                    src={relatedProduct.artisan_image} 
                                                    alt={relatedProduct.artisan}
                                                    className="h-5 w-5 rounded-full object-cover"
                                                />
                                            )}
                                            <p className="text-sm text-gray-600">by {relatedProduct.artisan}</p>
                                        </div>
                                        <div className="mb-3 flex items-center">
                                            <div className="flex items-center">
                                                {[...Array(5)].map((_, i) => (
                                                    <Star
                                                        key={i}
                                                        className={`h-4 w-4 ${
                                                            i < Math.floor(relatedProduct.rating) 
                                                                ? 'fill-current text-yellow-400' 
                                                                : 'text-gray-300'
                                                        }`}
                                                    />
                                                ))}
                                            </div>
                                            <span className="ml-1 text-sm text-gray-600">({relatedProduct.rating})</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-lg font-semibold text-primary">
                                                ₱{relatedProduct.price.toFixed(2)}
                                            </span>
                                            <button 
                                                onClick={() => addToCart(relatedProduct.id, 1)}
                                                className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white transition-colors duration-200 hover:bg-primary/90 flex items-center gap-1"
                                            >
                                                <ShoppingCart className="h-4 w-4" />
                                                Add
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}
            </div>
        </MainLayout>
    );
}
