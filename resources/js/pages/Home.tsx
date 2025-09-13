import React from 'react';
import { Link } from '@inertiajs/react';
import MainLayout from '../layouts/MainLayout';
import { ArrowRight, Star, Heart, Truck } from 'lucide-react';

interface Product {
    id: number;
    name: string;
    price: number;
    image: string;
    artisan: string;
    rating: number;
}

interface HomeProps {
    featuredProducts: Product[];
}

export default function Home({ featuredProducts = [] }: HomeProps) {
    // Sample featured products if none provided
    const defaultProducts: Product[] = [
        {
            id: 1,
            name: 'Handwoven Ceramic Bowl',
            price: 45.00,
            image: '/api/placeholder/300/300',
            artisan: 'Sarah Chen',
            rating: 4.8
        },
        {
            id: 2,
            name: 'Wooden Cutting Board',
            price: 35.00,
            image: '/api/placeholder/300/300',
            artisan: 'Mike Rodriguez',
            rating: 4.9
        },
        {
            id: 3,
            name: 'Knitted Wool Scarf',
            price: 65.00,
            image: '/api/placeholder/300/300',
            artisan: 'Emma Thompson',
            rating: 4.7
        },
        {
            id: 4,
            name: 'Leather Journal',
            price: 55.00,
            image: '/api/placeholder/300/300',
            artisan: 'David Kim',
            rating: 4.9
        }
    ];

    const products = featuredProducts.length > 0 ? featuredProducts : defaultProducts;

    return (
        <MainLayout>
            {/* Hero Section */}
            <section className="relative bg-gradient-to-r from-blue-50 to-indigo-100 py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center">
                        <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
                            Discover Local
                            <span className="text-primary block">Artisan Crafts</span>
                        </h1>
                        <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
                            Support local craftsmen and women by purchasing unique, handmade items created with passion and skill in your community.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link
                                href="/products"
                                className="inline-flex items-center px-8 py-3 bg-primary text-white font-semibold rounded-lg hover:bg-primary/90 transition-colors duration-200"
                            >
                                Shop Now
                                <ArrowRight className="ml-2 h-5 w-5" />
                            </Link>
                            <Link
                                href="/about"
                                className="inline-flex items-center px-8 py-3 border-2 border-primary text-primary font-semibold rounded-lg hover:bg-primary hover:text-white transition-colors duration-200"
                            >
                                Learn More
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-16 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="text-center">
                            <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Heart className="h-8 w-8 text-primary" />
                            </div>
                            <h3 className="text-xl font-semibold mb-2">Handmade with Love</h3>
                            <p className="text-gray-600">Every item is crafted by skilled artisans who pour their passion into their work.</p>
                        </div>
                        <div className="text-center">
                            <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Star className="h-8 w-8 text-primary" />
                            </div>
                            <h3 className="text-xl font-semibold mb-2">Premium Quality</h3>
                            <p className="text-gray-600">We curate only the finest handcrafted items that meet our high standards.</p>
                        </div>
                        <div className="text-center">
                            <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Truck className="h-8 w-8 text-primary" />
                            </div>
                            <h3 className="text-xl font-semibold mb-2">Fast Shipping</h3>
                            <p className="text-gray-600">Quick and secure delivery to get your handmade treasures to you safely.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Featured Products */}
            <section className="py-16 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                            Featured Products
                        </h2>
                        <p className="text-xl text-gray-600">
                            Discover our handpicked selection of exceptional artisan crafts
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {products.map((product) => (
                            <div key={product.id} className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden">
                                <img
                                    src={product.image}
                                    alt={product.name}
                                    className="w-full h-48 object-cover"
                                />
                                <div className="p-4">
                                    <h3 className="font-semibold text-lg text-gray-900 mb-1">
                                        {product.name}
                                    </h3>
                                    <p className="text-sm text-gray-600 mb-2">
                                        by {product.artisan}
                                    </p>
                                    <div className="flex items-center mb-3">
                                        <div className="flex items-center">
                                            {[...Array(5)].map((_, i) => (
                                                <Star
                                                    key={i}
                                                    className={`h-4 w-4 ${
                                                        i < Math.floor(product.rating)
                                                            ? 'text-yellow-400 fill-current'
                                                            : 'text-gray-300'
                                                    }`}
                                                />
                                            ))}
                                        </div>
                                        <span className="text-sm text-gray-600 ml-1">
                                            ({product.rating})
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-xl font-bold text-primary">
                                            ${product.price.toFixed(2)}
                                        </span>
                                        <button className="bg-primary text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-primary/90 transition-colors duration-200">
                                            Add to Cart
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="text-center mt-12">
                        <Link
                            href="/products"
                            className="inline-flex items-center px-6 py-3 bg-primary text-white font-semibold rounded-lg hover:bg-primary/90 transition-colors duration-200"
                        >
                            View All Products
                            <ArrowRight className="ml-2 h-5 w-5" />
                        </Link>
                    </div>
                </div>
            </section>

            {/* Newsletter Section */}
            <section className="py-16 bg-primary">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                        Stay Connected
                    </h2>
                    <p className="text-xl text-primary-foreground mb-8">
                        Get updates on new artisan products and exclusive offers
                    </p>
                    <div className="max-w-md mx-auto flex gap-4">
                        <input
                            type="email"
                            placeholder="Enter your email"
                            className="flex-1 px-4 py-3 rounded-lg border-0 focus:ring-2 focus:ring-white focus:outline-none"
                        />
                        <button className="bg-white text-primary px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors duration-200">
                            Subscribe
                        </button>
                    </div>
                </div>
            </section>
        </MainLayout>
    );
}