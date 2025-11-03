import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft, Eye, Minus, Package, Plus, Share2, ShoppingCart, Star, User } from 'lucide-react';
import { useState } from 'react';
import Toast from '../../../components/Toast';
import { useCart } from '../../../contexts/CartContext';
import BuyerLayout from '../../../layouts/BuyerLayout';

interface Product {
    id: number;
    name: string;
    price: number;
    description: string;
    primary_image: string;
    images: string[];
    seller: {
        id: number;
        name: string;
        email: string;
        created_at: string;
    };
    category: {
        id: number;
        name: string;
    };
    average_rating: number;
    rating_count: number;
    stock_status: string;
    quantity: number;
    view_count: number;
    specifications: { [key: string]: string };
    created_at: string;
}

interface RelatedProduct {
    id: number;
    name: string;
    price: number;
    primary_image: string;
    seller?: {
        id: number;
        name: string;
    };
    average_rating: number;
}

interface ProductShowProps {
    product: Product;
    relatedProducts: RelatedProduct[];
}

export default function Show({ product, relatedProducts }: ProductShowProps) {
    const [selectedImage, setSelectedImage] = useState(product.primary_image);
    const [quantity, setQuantity] = useState(1);
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const { addToCart, isLoading } = useCart();

    const handleAddToCart = () => {
        if (product.stock_status === 'out_of_stock') return;
        addToCart(product, quantity);
        setToastMessage(`${product.name} added to cart!`);
        setShowToast(true);
    };

    const handleBuyNow = () => {
        if (product.stock_status === 'out_of_stock') return;
        addToCart(product, quantity);
        router.visit('/buyer/checkout');
    };

    const handleSellerClick = () => {
        router.visit(`/buyer/seller/${product.seller.id}`);
    };

    const handleRelatedProductClick = (productId: number) => {
        router.visit(`/buyer/product/${productId}`);
    };

    const incrementQuantity = () => {
        if (quantity < product.quantity) {
            setQuantity(quantity + 1);
        }
    };

    const decrementQuantity = () => {
        if (quantity > 1) {
            setQuantity(quantity - 1);
        }
    };

    return (
        <BuyerLayout title={product.name}>
            <Head title={product.name} />

            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                <div className="mb-6">
                    <Link href="/buyer/products" className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Products
                    </Link>
                </div>

                <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
                    {/* Product Images */}
                    <div className="space-y-4">
                        <div className="relative aspect-square overflow-hidden rounded-lg bg-gray-100">
                            {selectedImage ? (
                                <img src={`/storage/${selectedImage}`} alt={product.name} className="h-full w-full object-cover" />
                            ) : (
                                <div className="flex h-full w-full items-center justify-center bg-gray-200">
                                    <Package className="h-24 w-24 text-gray-400" />
                                </div>
                            )}
                        </div>

                        {/* Image Thumbnails */}
                        {product.images && product.images.length > 0 && (
                            <div className="grid grid-cols-4 gap-2">
                                <button
                                    onClick={() => setSelectedImage(product.primary_image)}
                                    className={`relative overflow-hidden rounded-md border-2 ${
                                        selectedImage === product.primary_image ? 'border-primary' : 'border-gray-200'
                                    }`}
                                >
                                    <img src={`/storage/${product.primary_image}`} alt={product.name} className="h-20 w-full object-cover" />
                                </button>
                                {product.images.map((image, index) => (
                                    <button
                                        key={index}
                                        onClick={() => setSelectedImage(image)}
                                        className={`relative overflow-hidden rounded-md border-2 ${
                                            selectedImage === image ? 'border-primary' : 'border-gray-200'
                                        }`}
                                    >
                                        <img src={`/storage/${image}`} alt={`${product.name} ${index + 1}`} className="h-20 w-full object-cover" />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Product Details */}
                    <div className="space-y-6">
                        <div>
                            <span className="mb-2 inline-block rounded-full bg-primary/10 px-3 py-1 text-sm text-primary">
                                {product.category.name}
                            </span>
                            <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>

                            <div className="mt-2 flex items-center gap-4">
                                <div className="flex items-center">
                                    <div className="flex">
                                        {[...Array(5)].map((_, i) => (
                                            <Star
                                                key={i}
                                                className={`h-5 w-5 ${
                                                    i < Math.floor(product.average_rating) ? 'fill-current text-yellow-400' : 'text-gray-300'
                                                }`}
                                            />
                                        ))}
                                    </div>
                                    <span className="ml-2 text-sm text-gray-600">
                                        {product.average_rating} ({product.rating_count} reviews)
                                    </span>
                                </div>

                                <div className="flex items-center text-sm text-gray-500">
                                    <Eye className="mr-1 h-4 w-4" />
                                    {product.view_count} views
                                </div>
                            </div>
                        </div>

                        <div>
                            <span className="text-3xl font-bold text-gray-900">₱{product.price}</span>
                            <span
                                className={`ml-4 inline-block rounded-full px-3 py-1 text-sm ${
                                    product.stock_status === 'in_stock'
                                        ? 'bg-green-100 text-green-800'
                                        : product.stock_status === 'low_stock'
                                          ? 'bg-yellow-100 text-yellow-800'
                                          : 'bg-red-100 text-red-800'
                                }`}
                            >
                                {product.stock_status === 'in_stock'
                                    ? 'In Stock'
                                    : product.stock_status === 'low_stock'
                                      ? 'Low Stock'
                                      : 'Out of Stock'}
                            </span>
                        </div>

                        {/* Product Details Section */}
                        <div className="space-y-6">
                            {/* Description */}
                            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                                <h3 className="mb-4 flex items-center text-xl font-bold text-gray-900">
                                    <Package className="mr-2 h-5 w-5 text-primary" />
                                    Product Description
                                </h3>
                                <div className="prose prose-sm max-w-none">
                                    <p className="leading-relaxed whitespace-pre-wrap text-gray-700">
                                        {product.description || 'No detailed description available for this product.'}
                                    </p>
                                </div>
                            </div>

                            {/* Product Specifications */}
                            {product.specifications && Object.keys(product.specifications).length > 0 && (
                                <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                                    <h3 className="mb-4 text-xl font-bold text-gray-900">Specifications</h3>
                                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                                        {Object.entries(product.specifications).map(([key, value], index) => (
                                            <div
                                                key={index}
                                                className="flex items-center justify-between border-b border-gray-100 py-2 last:border-b-0"
                                            >
                                                <span className="font-medium text-gray-600 capitalize">{key.replace('_', ' ')}</span>
                                                <span className="text-gray-900">{value}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Seller Information */}
                        <div className="rounded-lg border bg-gray-50 p-4">
                            <h3 className="mb-2 text-lg font-semibold text-gray-900">Seller Information</h3>
                            <button onClick={handleSellerClick} className="hover:text-primary-dark flex items-center text-primary">
                                <User className="mr-2 h-5 w-5" />
                                <div>
                                    <div className="font-medium">{product.seller.name}</div>
                                    <div className="text-sm text-gray-600">Member since {new Date(product.seller.created_at).getFullYear()}</div>
                                </div>
                            </button>
                        </div>

                        {/* Specifications */}
                        {product.specifications && Object.keys(product.specifications).length > 0 && (
                            <div>
                                <h3 className="mb-2 text-lg font-semibold text-gray-900">Specifications</h3>
                                <div className="space-y-2">
                                    {Object.entries(product.specifications).map(([key, value]) => (
                                        <div key={key} className="flex justify-between border-b py-2">
                                            <span className="font-medium text-gray-700">{key}:</span>
                                            <span className="text-gray-600">{value}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Quantity and Actions */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-4">
                                <span className="font-medium text-gray-700">Quantity:</span>
                                <div className="flex items-center rounded-lg border">
                                    <button
                                        onClick={decrementQuantity}
                                        disabled={quantity <= 1}
                                        className="p-2 hover:bg-gray-100 disabled:opacity-50"
                                    >
                                        <Minus className="h-4 w-4" />
                                    </button>
                                    <span className="px-4 py-2 font-medium">{quantity}</span>
                                    <button
                                        onClick={incrementQuantity}
                                        disabled={quantity >= product.quantity || product.stock_status === 'out_of_stock'}
                                        className="p-2 hover:bg-gray-100 disabled:opacity-50"
                                    >
                                        <Plus className="h-4 w-4" />
                                    </button>
                                </div>
                                {product.quantity > 0 && <span className="text-sm text-gray-500">{product.quantity} available</span>}
                            </div>

                            {/* Action Buttons */}
                            <div className="space-y-4">
                                <div className="flex gap-4">
                                    <button
                                        onClick={handleAddToCart}
                                        disabled={product.stock_status === 'out_of_stock' || isLoading}
                                        className={`flex flex-1 transform items-center justify-center gap-2 rounded-lg px-6 py-4 text-lg font-semibold transition-all duration-200 ${
                                            product.stock_status === 'out_of_stock' || isLoading
                                                ? 'cursor-not-allowed bg-gray-100 text-gray-400'
                                                : 'bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-lg hover:-translate-y-0.5 hover:from-amber-700 hover:to-orange-700 hover:shadow-xl focus:ring-2 focus:ring-amber-200 active:transform-none'
                                        }`}
                                    >
                                        <ShoppingCart className="h-5 w-5" />
                                        {product.stock_status === 'out_of_stock' ? 'Out of Stock' : 'Add to Cart'}
                                    </button>

                                    <button
                                        onClick={handleBuyNow}
                                        disabled={product.stock_status === 'out_of_stock' || isLoading}
                                        className={`flex flex-1 transform items-center justify-center gap-2 rounded-lg px-6 py-4 text-lg font-semibold transition-all duration-200 ${
                                            product.stock_status === 'out_of_stock' || isLoading
                                                ? 'cursor-not-allowed bg-gray-100 text-gray-400'
                                                : 'border-2 border-amber-300 bg-white text-amber-700 shadow-md hover:-translate-y-0.5 hover:bg-gradient-to-r hover:from-amber-50 hover:to-orange-50 hover:border-amber-400 hover:shadow-lg focus:ring-2 focus:ring-amber-200 active:transform-none'
                                        }`}
                                    >
                                        <ShoppingCart className="h-5 w-5" />
                                        Buy Now
                                    </button>
                                </div>

                                <div className="flex gap-4">
                                    <button className="flex transform items-center justify-center gap-2 rounded-lg border-2 border-gray-200 bg-white px-6 py-3 font-medium text-gray-700 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-primary hover:bg-primary/5 hover:text-primary hover:shadow-md">
                                        <Share2 className="h-5 w-5" />
                                        Share Product
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Related Products */}
                {relatedProducts && relatedProducts.length > 0 && (
                    <div className="mt-16">
                        <h2 className="mb-8 text-2xl font-bold text-gray-900">Related Products</h2>
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                            {relatedProducts.map((relatedProduct: RelatedProduct) => (
                                <div
                                    key={relatedProduct.id}
                                    onClick={() => handleRelatedProductClick(relatedProduct.id)}
                                    className="group cursor-pointer overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition-all hover:shadow-lg"
                                >
                                    <div className="relative aspect-square overflow-hidden bg-gray-100">
                                        {relatedProduct.primary_image ? (
                                            <img
                                                src={`/storage/${relatedProduct.primary_image}`}
                                                alt={relatedProduct.name}
                                                className="h-full w-full object-cover transition-transform group-hover:scale-105"
                                            />
                                        ) : (
                                            <div className="flex h-full w-full items-center justify-center bg-gray-200">
                                                <Package className="h-12 w-12 text-gray-400" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="p-4">
                                        <h3 className="line-clamp-1 font-semibold text-gray-900">{relatedProduct.name}</h3>
                                        {relatedProduct.seller && <p className="mt-1 text-sm text-gray-600">by {relatedProduct.seller.name}</p>}
                                        <div className="mt-2 flex items-center justify-between">
                                            <span className="font-bold text-gray-900">₱{Number(relatedProduct.price).toLocaleString()}</span>
                                            {relatedProduct.average_rating > 0 && (
                                                <div className="flex items-center">
                                                    <Star className="h-4 w-4 fill-current text-yellow-400" />
                                                    <span className="ml-1 text-sm text-gray-600">{relatedProduct.average_rating.toFixed(1)}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Toast Notification */}
            {showToast && <Toast message={toastMessage} type="success" onClose={() => setShowToast(false)} />}
        </BuyerLayout>
    );
}
