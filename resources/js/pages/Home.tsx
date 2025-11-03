import { Link, router, usePage } from '@inertiajs/react';
import { ArrowRight, Heart, Star, Truck, ShoppingCart } from 'lucide-react';
import { useState } from 'react';
import MainLayout from '../layouts/MainLayout';
import AddToCartModal from '../components/AddToCartModal';
import Toast from '../components/Toast';
import { useCart } from '../contexts/CartContext';
import { Product as GlobalProduct } from '@/types';

interface Product {
    id: number;
    name: string;
    price: number;
    image: string;
    artisan: string;
    artisan_image?: string;
    rating: number;
}

interface HomeProps {
    featuredProducts: Product[];
}

export default function Home({ featuredProducts = [] }: HomeProps) {
    const [modalProduct, setModalProduct] = useState<Product | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const { addToCart, isLoading } = useCart();
    const { props } = usePage();
    const isAuthenticated = !!(props as any)?.auth?.user;

    const handleAddToCart = (e: React.MouseEvent, product: Product) => {
        e.preventDefault();
        e.stopPropagation();
        
        // Redirect authenticated users to buyer products page
        if (isAuthenticated) {
            setToastMessage('⚠️ Please use the buyer cart from your dashboard.');
            setShowToast(true);
            setTimeout(() => {
                router.visit('/buyer/products');
            }, 1500);
            return;
        }
        
        // Open modal for quantity selection for guests
        setModalProduct(product);
        setIsModalOpen(true);
    };

    const handleBuyNow = (e: React.MouseEvent, product: Product) => {
        e.preventDefault();
        e.stopPropagation();
        
        // Redirect authenticated users to buyer products page
        if (isAuthenticated) {
            setToastMessage('⚠️ Please use the buyer cart from your dashboard.');
            setShowToast(true);
            setTimeout(() => {
                router.visit('/buyer/products');
            }, 1500);
            return;
        }
        
        // Open modal for quantity selection for guests
        setModalProduct(product);
        setIsModalOpen(true);
    };

    const handleModalAddToCart = (quantity: number) => {
        if (!modalProduct) return;
        
        const cartProduct: GlobalProduct = {
            id: modalProduct.id,
            name: modalProduct.name,
            price: modalProduct.price,
            quantity: 999, // Default quantity available
            primary_image: modalProduct.image,
            seller: {
                id: 0,
                name: modalProduct.artisan
            }
        };
        
        try {
            addToCart(cartProduct, quantity);
            // Close modal first
            setIsModalOpen(false);
            // Then show success message
            setTimeout(() => {
                setToastMessage(`✅ ${quantity} × ${modalProduct.name} added to cart successfully!`);
                setShowToast(true);
            }, 100);
        } catch (error) {
            console.error('Error adding to cart:', error);
            setIsModalOpen(false);
            setTimeout(() => {
                setToastMessage('❌ Failed to add item to cart. Please try again.');
                setShowToast(true);
            }, 100);
        }
    };

    const handleModalBuyNow = (quantity: number) => {
        if (!modalProduct) return;
        
        const cartProduct: GlobalProduct = {
            id: modalProduct.id,
            name: modalProduct.name,
            price: modalProduct.price,
            quantity: 999, // Default quantity available
            primary_image: modalProduct.image,
            seller: {
                id: 0,
                name: modalProduct.artisan
            }
        };
        
        try {
            addToCart(cartProduct, quantity);
            // Small delay before redirect to ensure cart is updated
            setTimeout(() => {
                router.visit('/cart');
            }, 200);
        } catch (error) {
            console.error('Error adding to cart:', error);
            setIsModalOpen(false);
            setTimeout(() => {
                setToastMessage('❌ Failed to add item to cart. Please try again.');
                setShowToast(true);
            }, 100);
        }
    };

    return (
        <MainLayout>
            {/* Hero Section */}
            <section className="relative bg-gradient-to-r from-amber-50 via-orange-50 to-amber-100 py-20 border-b-2 border-amber-200/50">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="text-center">
                        <h1 className="mb-6 text-4xl font-bold text-gray-900 md:text-6xl">
                            Discover Local
                            <span className="block bg-gradient-to-r from-amber-700 to-orange-700 bg-clip-text text-transparent">Artisan Crafts in Hinoba-an</span>
                        </h1>
                        <p className="mx-auto mb-8 max-w-3xl text-xl text-gray-700">
                            Support local craftsmen and women by purchasing unique, handmade items created with passion and skill in your community.
                        </p>
                        <div className="flex flex-col justify-center gap-4 sm:flex-row">
                            <Link
                                href="/products"
                                className="inline-flex items-center rounded-lg bg-gradient-to-r from-amber-600 via-amber-700 to-orange-600 px-8 py-3 font-semibold text-white shadow-lg transition-all duration-200 hover:from-amber-700 hover:via-amber-800 hover:to-orange-700 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
                            >
                                Shop Now
                                <ArrowRight className="ml-2 h-5 w-5" />
                            </Link>
                            <Link
                                href="/about"
                                className="inline-flex items-center rounded-lg border-2 border-amber-300 bg-white px-8 py-3 font-semibold text-amber-700 shadow-md transition-all duration-200 hover:bg-gradient-to-r hover:from-amber-50 hover:to-orange-50 hover:border-amber-400 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]"
                            >
                                Learn More
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="bg-white py-16">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
                        <div className="text-center">
                            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                                <Heart className="h-8 w-8 text-primary" />
                            </div>
                            <h3 className="mb-2 text-xl font-semibold">Handmade with Love</h3>
                            <p className="text-gray-600">Every item is crafted by skilled artisans who pour their passion into their work.</p>
                        </div>
                        <div className="text-center">
                            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                                <Star className="h-8 w-8 text-primary" />
                            </div>
                            <h3 className="mb-2 text-xl font-semibold">Premium Quality</h3>
                            <p className="text-gray-600">We curate only the finest handcrafted items that meet our high standards.</p>
                        </div>
                        <div className="text-center">
                            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                                <Truck className="h-8 w-8 text-primary" />
                            </div>
                            <h3 className="mb-2 text-xl font-semibold">Fast Shipping</h3>
                            <p className="text-gray-600">Quick and secure delivery to get your handmade treasures to you safely.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Featured Products */}
            <section className="bg-gray-50 py-16">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="mb-12 text-center">
                        <h2 className="mb-4 text-3xl font-bold text-gray-900 md:text-4xl">Featured Products</h2>
                        <p className="text-xl text-gray-600">Discover our handpicked selection of exceptional artisan crafts</p>
                    </div>

                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                        {featuredProducts.map((product) => (
                            <div
                                key={product.id}
                                className="overflow-hidden rounded-lg bg-white shadow-sm transition-shadow duration-200 hover:shadow-md"
                            >
                                <Link href={`/product/${product.id}`}>
                                    <img src={product.image} alt={product.name} className="h-48 w-full object-cover cursor-pointer" />
                                </Link>
                                <div className="p-4">
                                    <Link href={`/product/${product.id}`}>
                                        <h3 className="mb-1 text-lg font-semibold text-gray-900 hover:text-primary cursor-pointer">{product.name}</h3>
                                    </Link>
                                    <div className="mb-2 flex items-center gap-2">
                                        {product.artisan_image && (
                                            <img 
                                                src={product.artisan_image} 
                                                alt={product.artisan}
                                                className="h-5 w-5 rounded-full object-cover"
                                            />
                                        )}
                                        <p className="text-sm text-gray-600">by {product.artisan}</p>
                                    </div>
                                    <div className="mb-3 flex items-center">
                                        <div className="flex items-center">
                                            {[...Array(5)].map((_, i) => (
                                                <Star
                                                    key={i}
                                                    className={`h-4 w-4 ${
                                                        i < Math.floor(product.rating) ? 'fill-current text-yellow-400' : 'text-gray-300'
                                                    }`}
                                                />
                                            ))}
                                        </div>
                                        <span className="ml-1 text-sm text-gray-600">({product.rating})</span>
                                    </div>
                                    <div className="mb-3">
                                        <span className="text-xl font-bold text-gray-900">₱{product.price.toFixed(2)}</span>
                                    </div>
                                    <div className="flex gap-2">
                                        <button 
                                            onClick={(e) => handleAddToCart(e, product)}
                                            className="flex-1 rounded-md bg-gradient-to-r from-amber-600 to-orange-600 px-3 py-2 text-sm font-medium text-white shadow-md transition-all duration-200 hover:from-amber-700 hover:to-orange-700 hover:shadow-lg hover:scale-105 active:scale-95 flex items-center justify-center gap-1"
                                        >
                                            <ShoppingCart className="h-4 w-4" />
                                            Add to Cart
                                        </button>
                                        <button 
                                            onClick={(e) => handleBuyNow(e, product)}
                                            className="flex-1 rounded-md border-2 border-amber-600 bg-white px-3 py-2 text-sm font-medium text-amber-700 shadow-sm transition-all duration-200 hover:bg-amber-50 hover:shadow-md hover:scale-105 active:scale-95"
                                        >
                                            Buy Now
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-12 text-center">
                        <Link
                            href="/products"
                            className="inline-flex items-center rounded-lg bg-gradient-to-r from-amber-600 via-amber-700 to-orange-600 px-6 py-3 font-semibold text-white shadow-lg transition-all duration-200 hover:from-amber-700 hover:via-amber-800 hover:to-orange-700 hover:shadow-xl hover:scale-105 active:scale-95"
                        >
                            View All Products
                            <ArrowRight className="ml-2 h-5 w-5" />
                        </Link>
                    </div>
                </div>
            </section>

            {/* Newsletter Section */}
            <section className="relative overflow-hidden bg-white py-20">
                {/* Background Pattern */}
                <div className="absolute inset-0 bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100 opacity-50"></div>
                
                <div className="relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
                    <div className="rounded-3xl bg-gradient-to-r from-amber-600 via-amber-700 to-orange-600 p-8 shadow-2xl md:p-12">
                        <div className="text-center">
                            {/* Icon */}
                            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
                                <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                            </div>
                            
                            {/* Heading */}
                            <h2 className="mb-3 text-3xl font-bold text-white md:text-4xl">Stay Connected with Local Artisans</h2>
                            <p className="mb-8 text-lg text-amber-50 md:text-xl">
                                Subscribe to receive updates on new handcrafted products, exclusive deals, and stories from our talented craftsmen
                            </p>
                            
                            {/* Email Form */}
                            <div className="mx-auto max-w-xl">
                                <div className="flex flex-col gap-3 sm:flex-row">
                                    <input
                                        type="email"
                                        placeholder="Enter your email address"
                                        className="flex-1 rounded-xl border-2 border-white/20 bg-white/10 px-6 py-4 text-white placeholder-amber-100 backdrop-blur-sm transition-all focus:border-white focus:bg-white/20 focus:outline-none focus:ring-4 focus:ring-white/30"
                                    />
                                    <button className="group rounded-xl bg-white px-8 py-4 font-bold text-amber-700 shadow-xl transition-all duration-300 hover:bg-amber-50 hover:shadow-2xl hover:scale-105 active:scale-95">
                                        <span className="flex items-center justify-center gap-2">
                                            Subscribe
                                            <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                                        </span>
                                    </button>
                                </div>
                                
                                {/* Privacy Note */}
                                <p className="mt-4 text-sm text-amber-100">
                                    🔒 We respect your privacy. Unsubscribe at any time.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Add to Cart Modal */}
            {modalProduct && (
                <AddToCartModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    product={{
                        id: modalProduct.id,
                        name: modalProduct.name,
                        price: modalProduct.price,
                        image: modalProduct.image,
                        seller: { id: 0, name: modalProduct.artisan }
                    }}
                    onAddToCart={handleModalAddToCart}
                    onBuyNow={handleModalBuyNow}
                />
            )}

            {/* Toast Notification */}
            {showToast && (
                <Toast
                    message={toastMessage}
                    type={toastMessage.includes('✅') ? 'success' : 'error'}
                    onClose={() => setShowToast(false)}
                />
            )}
        </MainLayout>
    );
}
