import { Link } from '@inertiajs/react';
import { ArrowRight, Heart, Star, Truck } from 'lucide-react';
import MainLayout from '../layouts/MainLayout';

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
            price: 45.0,
            image: '/api/placeholder/300/300',
            artisan: 'Sarah Chen',
            rating: 4.8,
        },
        {
            id: 2,
            name: 'Wooden Cutting Board',
            price: 35.0,
            image: '/api/placeholder/300/300',
            artisan: 'Mike Rodriguez',
            rating: 4.9,
        },
        {
            id: 3,
            name: 'Knitted Wool Scarf',
            price: 65.0,
            image: '/api/placeholder/300/300',
            artisan: 'Emma Thompson',
            rating: 4.7,
        },
        {
            id: 4,
            name: 'Leather Journal',
            price: 55.0,
            image: '/api/placeholder/300/300',
            artisan: 'David Kim',
            rating: 4.9,
        },
    ];

    const products = featuredProducts.length > 0 ? featuredProducts : defaultProducts;

    return (
        <MainLayout>
            {/* Hero Section */}
            <section className="relative bg-gradient-to-r from-blue-50 to-indigo-100 py-20">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="text-center">
                        <h1 className="mb-6 text-4xl font-bold text-gray-900 md:text-6xl">
                            Discover Local
                            <span className="block text-primary">Artisan Crafts in Hinoba-an</span>
                        </h1>
                        <p className="mx-auto mb-8 max-w-3xl text-xl text-gray-600">
                            Support local craftsmen and women by purchasing unique, handmade items created with passion and skill in your community.
                        </p>
                        <div className="flex flex-col justify-center gap-4 sm:flex-row">
                            <Link
                                href="/products"
                                className="inline-flex items-center rounded-lg bg-primary px-8 py-3 font-semibold text-white transition-colors duration-200 hover:bg-primary/90"
                            >
                                Shop Now
                                <ArrowRight className="ml-2 h-5 w-5" />
                            </Link>
                            <Link
                                href="/about"
                                className="inline-flex items-center rounded-lg border-2 border-primary px-8 py-3 font-semibold text-primary transition-colors duration-200 hover:bg-primary hover:text-white"
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
                        {products.map((product) => (
                            <div
                                key={product.id}
                                className="overflow-hidden rounded-lg bg-white shadow-sm transition-shadow duration-200 hover:shadow-md"
                            >
                                <img src={product.image} alt={product.name} className="h-48 w-full object-cover" />
                                <div className="p-4">
                                    <h3 className="mb-1 text-lg font-semibold text-gray-900">{product.name}</h3>
                                    <p className="mb-2 text-sm text-gray-600">by {product.artisan}</p>
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
                                    <div className="flex items-center justify-between">
                                        <span className="text-xl font-bold text-primary">${product.price.toFixed(2)}</span>
                                        <button className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white transition-colors duration-200 hover:bg-primary/90">
                                            Add to Cart
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-12 text-center">
                        <Link
                            href="/products"
                            className="inline-flex items-center rounded-lg bg-primary px-6 py-3 font-semibold text-white transition-colors duration-200 hover:bg-primary/90"
                        >
                            View All Products
                            <ArrowRight className="ml-2 h-5 w-5" />
                        </Link>
                    </div>
                </div>
            </section>

            {/* Newsletter Section */}
            <section className="bg-primary py-16">
                <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
                    <h2 className="mb-4 text-3xl font-bold text-white md:text-4xl">Stay Connected</h2>
                    <p className="mb-8 text-xl text-primary-foreground">Get updates on new artisan products and exclusive offers</p>
                    <div className="mx-auto flex max-w-md gap-4">
                        <input
                            type="email"
                            placeholder="Enter your email"
                            className="flex-1 rounded-lg border-0 px-4 py-3 focus:ring-2 focus:ring-white focus:outline-none"
                        />
                        <button className="rounded-lg bg-white px-6 py-3 font-semibold text-primary transition-colors duration-200 hover:bg-gray-100">
                            Subscribe
                        </button>
                    </div>
                </div>
            </section>
        </MainLayout>
    );
}
