import { Link, router } from '@inertiajs/react';
import { ArrowLeft, Star, MapPin, Globe, Award, ShoppingCart, Package, Eye, Mail, Phone, Calendar, User } from 'lucide-react';
import React, { useState } from 'react';
import MainLayout from '../layouts/MainLayout';
import Toast from '../components/Toast';
import AddToCartModal from '../components/AddToCartModal';
import { useCart } from '../contexts/CartContext';
import { Product as GlobalProduct } from '@/types';

interface Artisan {
    id: number;
    name: string;
    email?: string;
    business_name?: string;
    bio?: string;
    image: string;
    location: string;
    phone?: string;
    specialties: string[];
    rating: number;
    years_of_experience?: number;
    website?: string;
    social_links?: any;
    products_count: number;
    total_sales?: number;
    created_at?: string;
    is_verified?: boolean;
}

interface Product {
    id: number;
    name: string;
    price: number;
    primary_image: string;
    short_description: string;
    stock_status: string;
    average_rating: number;
    view_count: number;
    quantity: number;
    seller: {
        id: number;
        name: string;
    };
}

interface ArtisanProfileProps {
    artisan: Artisan;
    products: {
        data: Product[];
        links: { url: string | null; label: string; active: boolean }[];
        current_page: number;
        last_page: number;
        total: number;
    };
    filters: {
        search: string | null;
        sort: string;
        direction: string;
    };
}

export default function ArtisanProfile({ artisan, products, filters }: ArtisanProfileProps) {
    const [searchTerm, setSearchTerm] = useState(filters?.search || '');
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const { addToCart, isLoading } = useCart();
    const [modalProduct, setModalProduct] = useState<Product | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<'cart' | 'buy'>('cart');

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(`/artisan/${artisan.id}`, { ...filters, search: searchTerm }, { preserveState: true });
    };

    const handleFilter = (key: string, value: string) => {
        router.get(`/artisan/${artisan.id}`, { ...filters, [key]: value }, { preserveState: true });
    };

    const handleProductClick = (productId: number) => {
        router.visit(`/product/${productId}`);
    };

    const handleAddToCart = (e: React.MouseEvent, product: Product) => {
        e.stopPropagation();
        if (product.stock_status === 'out_of_stock') return;
        
        // Open modal for quantity selection
        setModalProduct(product);
        setModalMode('cart');
        setIsModalOpen(true);
    };

    const handleBuyNow = (e: React.MouseEvent, product: Product) => {
        e.stopPropagation();
        if (product.stock_status === 'out_of_stock') return;
        
        // Open modal for quantity selection
        setModalProduct(product);
        setModalMode('buy');
        setIsModalOpen(true);
    };

    const handleModalAddToCart = async (quantity: number) => {
        if (!modalProduct) return;
        
        console.log('[ArtisanProfile] Adding to cart:', { product: modalProduct.name, quantity });
        
        const productWithSeller: GlobalProduct = {
            id: modalProduct.id,
            name: modalProduct.name,
            price: modalProduct.price,
            quantity: modalProduct.quantity,
            primary_image: modalProduct.primary_image,
            seller: {
                id: artisan.id,
                name: artisan.name
            }
        };
        
        try {
            await addToCart(productWithSeller, quantity);
            console.log('[ArtisanProfile] Successfully added to cart');
            // Close modal first
            setIsModalOpen(false);
            // Then show success message
            setTimeout(() => {
                setToastMessage(`✅ ${quantity} × ${modalProduct.name} added to cart successfully!`);
                setShowToast(true);
                console.log('[ArtisanProfile] Toast notification shown');
            }, 100);
        } catch (error) {
            console.error('[ArtisanProfile] Error adding to cart:', error);
            setIsModalOpen(false);
            setTimeout(() => {
                setToastMessage('❌ Failed to add item to cart. Please try again.');
                setShowToast(true);
            }, 100);
        }
    };

    const handleModalBuyNow = async (quantity: number) => {
        if (!modalProduct) return;
        
        console.log('[ArtisanProfile] Buy Now clicked:', { product: modalProduct.name, quantity });
        
        const productWithSeller: GlobalProduct = {
            id: modalProduct.id,
            name: modalProduct.name,
            price: modalProduct.price,
            quantity: modalProduct.quantity,
            primary_image: modalProduct.primary_image,
            seller: {
                id: artisan.id,
                name: artisan.name
            }
        };
        
        try {
            await addToCart(productWithSeller, quantity);
            setIsModalOpen(false);
            // Redirect to checkout
            router.visit('/checkout');
        } catch (error) {
            console.error('[ArtisanProfile] Error with Buy Now:', error);
            setIsModalOpen(false);
            setTimeout(() => {
                setToastMessage('❌ Failed to process order. Please try again.');
                setShowToast(true);
            }, 100);
        }
    };

    const productList = products?.data || [];

    return (
        <MainLayout title={artisan.business_name || artisan.name}>
            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                {/* Back Button */}
                <div className="mb-6">
                    <Link href="/artisans" className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Artisans
                    </Link>
                </div>

                {/* Artisan Profile Header */}
                <div className="mb-8 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                    <div className="flex flex-col space-y-4 md:flex-row md:items-start md:space-y-0 md:space-x-6">
                        <div className="flex-shrink-0">
                            {artisan.image ? (
                                <img src={artisan.image} alt={artisan.name} className="h-24 w-24 rounded-full object-cover" />
                            ) : (
                                <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gray-200">
                                    <User className="h-12 w-12 text-gray-400" />
                                </div>
                            )}
                        </div>

                        <div className="flex-1">
                            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                                <div>
                                    <div className="flex items-center space-x-3">
                                        <h1 className="text-2xl font-bold text-gray-900">{artisan.business_name || artisan.name}</h1>
                                        {artisan.is_verified && (
                                            <span className="inline-flex items-center rounded-full bg-gradient-to-r from-amber-100 to-orange-100 border border-amber-300 px-3 py-1 text-sm font-medium text-amber-900 shadow-sm">
                                                Verified Artisan
                                            </span>
                                        )}
                                    </div>
                                    <p className="mt-1 text-gray-600">by {artisan.name}</p>

                                    {artisan.location && (
                                        <div className="mt-2 flex items-center text-sm text-gray-500">
                                            <MapPin className="mr-1 h-4 w-4" />
                                            {artisan.location}
                                        </div>
                                    )}
                                </div>

                                <div className="mt-4 flex items-center space-x-6 md:mt-0">
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-gray-900">{artisan.products_count}</div>
                                        <div className="text-sm text-gray-500">Products</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="flex items-center justify-center">
                                            <Star className="mr-1 h-5 w-5 fill-current text-yellow-400" />
                                            <span className="text-2xl font-bold text-gray-900">
                                                {artisan.rating ? artisan.rating.toFixed(1) : '0.0'}
                                            </span>
                                        </div>
                                        <div className="text-sm text-gray-500">Rating</div>
                                    </div>
                                    {artisan.total_sales !== undefined && (
                                        <div className="text-center">
                                            <div className="text-2xl font-bold text-gray-900">{artisan.total_sales || 0}</div>
                                            <div className="text-sm text-gray-500">Sales</div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {artisan.bio && (
                                <div className="mt-4">
                                    <h3 className="mb-2 text-lg font-semibold text-gray-900">About</h3>
                                    <p className="leading-relaxed text-gray-600">{artisan.bio}</p>
                                </div>
                            )}

                            <div className="mt-4 flex flex-wrap gap-4 text-sm text-gray-500">
                                {artisan.email && (
                                    <div className="flex items-center">
                                        <Mail className="mr-1 h-4 w-4" />
                                        {artisan.email}
                                    </div>
                                )}
                                {artisan.phone && (
                                    <div className="flex items-center">
                                        <Phone className="mr-1 h-4 w-4" />
                                        {artisan.phone}
                                    </div>
                                )}
                                {artisan.years_of_experience && (
                                    <div className="flex items-center">
                                        <Award className="mr-1 h-4 w-4" />
                                        {artisan.years_of_experience}+ years experience
                                    </div>
                                )}
                                {artisan.website && (
                                    <a 
                                        href={artisan.website} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="flex items-center text-primary hover:text-primary/80"
                                    >
                                        <Globe className="mr-1 h-4 w-4" />
                                        Visit Website
                                    </a>
                                )}
                                {artisan.created_at && (
                                    <div className="flex items-center">
                                        <Calendar className="mr-1 h-4 w-4" />
                                        Member since {new Date(artisan.created_at).getFullYear()}
                                    </div>
                                )}
                            </div>

                            {/* Specialties */}
                            {artisan.specialties && artisan.specialties.length > 0 && (
                                <div className="mt-4">
                                    <h3 className="mb-2 text-sm font-semibold text-gray-900">Specialties</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {artisan.specialties.map((specialty, index) => (
                                            <span key={index} className="rounded-full bg-primary/10 px-3 py-1 text-sm text-primary">
                                                {specialty}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Products Section */}
                <div>
                    <div className="mb-6">
                        <h2 className="mb-4 text-2xl font-bold text-gray-900">Products by {artisan.business_name || artisan.name}</h2>

                        <div className="flex flex-col gap-4 md:flex-row">
                            <form onSubmit={handleSearch} className="flex-1">
                                <div className="relative">
                                    <Package className="absolute top-3 left-3 h-4 w-4 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Search products..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full rounded-lg border border-gray-300 py-2 pr-4 pl-10 focus:border-primary focus:ring-primary"
                                    />
                                </div>
                            </form>

                            <select
                                onChange={(e) => handleFilter('sort', e.target.value)}
                                value={filters?.sort || 'name'}
                                className="rounded-lg border border-gray-300 px-3 py-2 focus:border-primary focus:ring-primary"
                            >
                                <option value="name">Sort by Name</option>
                                <option value="price">Price: Low to High</option>
                                <option value="price_desc">Price: High to Low</option>
                                <option value="rating">Highest Rated</option>
                                <option value="newest">Newest</option>
                            </select>
                        </div>
                    </div>

                    {productList.length > 0 ? (
                        <>
                            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                                {productList.map((product) => (
                                    <div
                                        key={product.id}
                                        onClick={() => handleProductClick(product.id)}
                                        className="group cursor-pointer overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition-all hover:shadow-lg"
                                    >
                                        <div className="relative aspect-square overflow-hidden bg-gray-100">
                                            {product.primary_image ? (
                                                <img
                                                    src={`/storage/${product.primary_image}`}
                                                    alt={product.name}
                                                    className="h-full w-full object-cover transition-transform group-hover:scale-105"
                                                />
                                            ) : (
                                                <div className="flex h-full w-full items-center justify-center bg-gray-200">
                                                    <Package className="h-12 w-12 text-gray-400" />
                                                </div>
                                            )}
                                        </div>

                                        <div className="p-4">
                                            <h3 className="line-clamp-1 text-lg font-semibold text-gray-900">{product.name}</h3>

                                            <p className="mt-1 line-clamp-2 text-sm text-gray-600">{product.short_description}</p>

                                            <div className="mt-2 flex items-center justify-between">
                                                <div className="flex items-center">
                                                    <Star className="h-4 w-4 fill-current text-yellow-400" />
                                                    <span className="ml-1 text-sm text-gray-600">
                                                        {product.average_rating ? product.average_rating.toFixed(1) : '0.0'}
                                                    </span>
                                                </div>

                                                <div className="flex items-center">
                                                    <Eye className="mr-1 h-3 w-3 text-gray-400" />
                                                    <span className="text-xs text-gray-500">{product.view_count}</span>
                                                </div>
                                            </div>

                                            <div className="mt-3">
                                                <div className="mb-2 flex items-center justify-between">
                                                    <span className="text-lg font-bold text-gray-900">₱{product.price}</span>
                                                    <span
                                                        className={`rounded-full px-2 py-1 text-xs ${
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

                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={(e) => handleAddToCart(e, product)}
                                                        disabled={product.stock_status === 'out_of_stock' || isLoading}
                                                        className={`flex flex-1 transform items-center justify-center gap-1 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200 ${
                                                            product.stock_status === 'out_of_stock' || isLoading
                                                                ? 'cursor-not-allowed bg-gray-100 text-gray-400'
                                                                : 'bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-md hover:-translate-y-0.5 hover:from-amber-700 hover:to-orange-700 hover:shadow-lg focus:ring-2 focus:ring-amber-200 active:transform-none'
                                                        }`}
                                                    >
                                                        <ShoppingCart className="h-4 w-4" />
                                                        {product.stock_status === 'out_of_stock' ? 'Out of Stock' : 'Add to Cart'}
                                                    </button>
                                                    <button
                                                        onClick={(e) => handleBuyNow(e, product)}
                                                        disabled={product.stock_status === 'out_of_stock' || isLoading}
                                                        className={`flex transform items-center justify-center rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200 ${
                                                            product.stock_status === 'out_of_stock' || isLoading
                                                                ? 'cursor-not-allowed bg-gray-100 text-gray-400'
                                                                : 'border-2 border-amber-300 bg-white text-amber-700 shadow-sm hover:-translate-y-0.5 hover:bg-gradient-to-r hover:from-amber-50 hover:to-orange-50 hover:border-amber-400 hover:shadow-md focus:ring-2 focus:ring-amber-200 active:transform-none'
                                                        }`}
                                                        title="Buy Now"
                                                    >
                                                        <ShoppingCart className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Pagination */}
                            {products.last_page > 1 && (
                                <div className="mt-8 flex justify-center">
                                    <div className="flex space-x-2">
                                        {products.links.map((link, index) => (
                                            <Link
                                                key={index}
                                                href={link.url || '#'}
                                                className={`rounded-md px-3 py-2 text-sm ${
                                                    link.active ? 'bg-primary text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                } ${!link.url ? 'cursor-not-allowed opacity-50' : ''}`}
                                                dangerouslySetInnerHTML={{ __html: link.label }}
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="py-12 text-center">
                            <div className="mx-auto mb-4 h-12 w-12 text-gray-400">
                                <Package className="h-full w-full" />
                            </div>
                            <h3 className="mb-2 text-lg font-medium text-gray-900">No products found</h3>
                            <p className="text-gray-600">
                                {artisan.business_name || artisan.name} hasn't added any products yet or no products match your search.
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Toast Notification */}
            {showToast && <Toast message={toastMessage} type="success" onClose={() => setShowToast(false)} />}
            
            {/* Add to Cart Modal */}
            <AddToCartModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                product={modalProduct}
                onAddToCart={handleModalAddToCart}
                onBuyNow={modalMode === 'buy' ? handleModalBuyNow : undefined}
            />
        </MainLayout>
    );
}