import React from 'react';
import { Link } from '@inertiajs/react';
import BuyerLayout from '../../layouts/BuyerLayout';
import { type SharedData } from '@/types/index';
import { Head, usePage } from '@inertiajs/react';
import { ShoppingBag, Heart, Star, Package, CreditCard, MapPin, ArrowRight, Bell, TrendingUp, Clock, User } from 'lucide-react';

export default function BuyerDashboard() {
    const { auth } = usePage<SharedData>().props;
    const user = auth.user;

    return (
        <BuyerLayout>
            <Head title="Buyer Dashboard" />
            <div className="min-h-screen bg-gray-50">
                {/* Hero Section */}
                <section className="relative bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 py-16 mx-4 mt-6 rounded-2xl overflow-hidden">
                    <div className="absolute inset-0 bg-white/20 backdrop-blur-sm"></div>
                    <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center">
                            <div className="flex justify-center mb-4">
                                <div className="bg-primary/10 p-3 rounded-full">
                                    <ShoppingBag className="h-8 w-8 text-primary" />
                                </div>
                            </div>
                            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                                {new Date().getHours() < 12 ? 'Good Morning' : 
                                 new Date().getHours() < 18 ? 'Good Afternoon' : 'Good Evening'}, 
                                <span className="text-primary block mt-2">{user?.name}!</span>
                            </h1>
                            <p className="text-xl text-gray-700 mb-8 max-w-3xl mx-auto leading-relaxed">
                                Ready to discover something amazing? Explore unique, handcrafted treasures from talented local artisans in your community.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <Link
                                    href="/products"
                                    className="inline-flex items-center px-8 py-4 bg-primary text-white font-semibold rounded-xl hover:bg-primary/90 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
                                >
                                    <ShoppingBag className="mr-2 h-5 w-5" />
                                    Browse Products
                                </Link>
                                <Link
                                    href="/buyer/wishlist"
                                    className="inline-flex items-center px-8 py-4 border-2 border-primary text-primary font-semibold rounded-xl hover:bg-primary hover:text-white transition-all duration-200 shadow-md hover:shadow-lg"
                                >
                                    <Heart className="mr-2 h-5 w-5" />
                                    View Wishlist
                                </Link>
                                <Link
                                    href="/seller/apply"
                                    className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-orange-500 to-pink-500 text-white font-semibold rounded-xl hover:from-orange-600 hover:to-pink-600 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
                                >
                                    <User className="mr-2 h-5 w-5" />
                                    Become a Seller
                                </Link>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Enhanced Stats Section */}
                <section className="py-8 mx-4 bg-white rounded-2xl shadow-sm border border-gray-100">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-12">
                            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                                Your Shopping Journey
                            </h2>
                            <p className="text-lg text-gray-600">
                                Track your orders, wishlist, and shopping activity at a glance
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {/* Orders Card */}
                            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl border border-blue-200 hover:shadow-lg transition-all duration-200 group">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="bg-blue-500 p-3 rounded-full group-hover:scale-110 transition-transform duration-200">
                                        <ShoppingBag className="h-6 w-6 text-white" />
                                    </div>
                                    <TrendingUp className="h-4 w-4 text-blue-600" />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-800 mb-2">Total Orders</h3>
                                <div className="flex items-baseline space-x-2">
                                    <p className="text-3xl font-bold text-blue-600">0</p>
                                    <span className="text-sm text-gray-600">orders placed</span>
                                </div>
                                <p className="text-sm text-gray-500 mt-2">Start shopping to see your orders here</p>
                            </div>
                            
                            {/* Wishlist Card */}
                            <div className="bg-gradient-to-br from-red-50 to-pink-100 p-6 rounded-xl border border-red-200 hover:shadow-lg transition-all duration-200 group">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="bg-red-500 p-3 rounded-full group-hover:scale-110 transition-transform duration-200">
                                        <Heart className="h-6 w-6 text-white" />
                                    </div>
                                    <Heart className="h-4 w-4 text-red-600" />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-800 mb-2">Wishlist Items</h3>
                                <div className="flex items-baseline space-x-2">
                                    <p className="text-3xl font-bold text-red-600">0</p>
                                    <span className="text-sm text-gray-600">items saved</span>
                                </div>
                                <p className="text-sm text-gray-500 mt-2">Save items you love for later</p>
                            </div>

                            {/* Reviews Card */}
                            <div className="bg-gradient-to-br from-yellow-50 to-amber-100 p-6 rounded-xl border border-yellow-200 hover:shadow-lg transition-all duration-200 group">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="bg-yellow-500 p-3 rounded-full group-hover:scale-110 transition-transform duration-200">
                                        <Star className="h-6 w-6 text-white" />
                                    </div>
                                    <Star className="h-4 w-4 text-yellow-600" />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-800 mb-2">Reviews Given</h3>
                                <div className="flex items-baseline space-x-2">
                                    <p className="text-3xl font-bold text-yellow-600">0</p>
                                    <span className="text-sm text-gray-600">reviews written</span>
                                </div>
                                <p className="text-sm text-gray-500 mt-2">Share your experience with others</p>
                            </div>

                            {/* Spending Card */}
                            <div className="bg-gradient-to-br from-green-50 to-emerald-100 p-6 rounded-xl border border-green-200 hover:shadow-lg transition-all duration-200 group">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="bg-green-500 p-3 rounded-full group-hover:scale-110 transition-transform duration-200">
                                        <CreditCard className="h-6 w-6 text-white" />
                                    </div>
                                    <TrendingUp className="h-4 w-4 text-green-600" />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-800 mb-2">Total Spent</h3>
                                <div className="flex items-baseline space-x-2">
                                    <p className="text-3xl font-bold text-green-600">$0.00</p>
                                    <span className="text-sm text-gray-600">lifetime</span>
                                </div>
                                <p className="text-sm text-gray-500 mt-2">Supporting local artisans</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Recent Activity Feed */}
                <section className="py-8 mx-4">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-900">Recent Activity</h2>
                                    <p className="text-gray-600">Keep track of your latest shopping activities</p>
                                </div>
                                <Clock className="h-6 w-6 text-gray-400" />
                            </div>
                            
                            <div className="text-center py-12">
                                <div className="bg-gray-100 p-4 rounded-full w-16 h-16 mx-auto mb-4">
                                    <Clock className="h-8 w-8 text-gray-400 mx-auto" />
                                </div>
                                <h3 className="text-lg font-medium text-gray-600 mb-2">No Recent Activity</h3>
                                <p className="text-gray-500 mb-6">Start shopping to see your activity here</p>
                                <Link
                                    href="/products"
                                    className="inline-flex items-center px-6 py-3 bg-primary text-white font-medium rounded-lg hover:bg-primary/90 transition-colors duration-200"
                                >
                                    <ShoppingBag className="mr-2 h-4 w-4" />
                                    Start Shopping
                                </Link>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Main Content Area */}
                <section className="py-8 mx-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="grid gap-8 lg:grid-cols-3">
                            {/* Recent Orders - Enhanced */}
                            <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow duration-300">
                                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 border-b border-gray-100">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h3 className="text-xl font-semibold text-gray-900">Recent Orders</h3>
                                            <p className="text-gray-600">Track your recent purchases</p>
                                        </div>
                                        <Package className="h-8 w-8 text-indigo-600" />
                                    </div>
                                </div>
                                <div className="p-6">
                                    <div className="text-center py-12">
                                        <div className="bg-blue-100 p-4 rounded-full w-20 h-20 mx-auto mb-6">
                                            <Package className="h-12 w-12 text-blue-600 mx-auto" />
                                        </div>
                                        <h4 className="text-lg font-medium text-gray-600 mb-3">No orders yet</h4>
                                        <p className="text-gray-500 mb-6 max-w-sm mx-auto">
                                            Discover amazing handcrafted products from local artisans
                                        </p>
                                        <Link
                                            href="/products"
                                            className="inline-flex items-center px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-indigo-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
                                        >
                                            <ShoppingBag className="mr-2 h-5 w-5" />
                                            Browse Products
                                        </Link>
                                    </div>
                                </div>
                            </div>

                            {/* Enhanced Quick Actions */}
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow duration-300">
                                <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 border-b border-gray-100">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h3 className="text-xl font-semibold text-gray-900">Quick Actions</h3>
                                            <p className="text-gray-600">Navigate faster</p>
                                        </div>
                                        <ArrowRight className="h-6 w-6 text-purple-600" />
                                    </div>
                                </div>
                                <div className="p-6">
                                    <div className="space-y-4">
                                        <Link
                                            href="/products"
                                            className="group w-full bg-gradient-to-r from-green-50 to-emerald-50 hover:from-green-100 hover:to-emerald-100 text-green-700 px-6 py-4 rounded-xl transition-all duration-200 flex items-center gap-4 border border-green-200 hover:border-green-300"
                                        >
                                            <div className="bg-green-500 p-2 rounded-lg group-hover:scale-110 transition-transform duration-200">
                                                <ShoppingBag className="h-5 w-5 text-white" />
                                            </div>
                                            <div className="flex-1">
                                                <span className="font-semibold">Browse Products</span>
                                                <p className="text-sm text-green-600">Discover new items</p>
                                            </div>
                                            <ArrowRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                                        </Link>
                                        
                                        <Link
                                            href="/buyer/wishlist"
                                            className="group w-full bg-gradient-to-r from-red-50 to-pink-50 hover:from-red-100 hover:to-pink-100 text-red-700 px-6 py-4 rounded-xl transition-all duration-200 flex items-center gap-4 border border-red-200 hover:border-red-300"
                                        >
                                            <div className="bg-red-500 p-2 rounded-lg group-hover:scale-110 transition-transform duration-200">
                                                <Heart className="h-5 w-5 text-white" />
                                            </div>
                                            <div className="flex-1">
                                                <span className="font-semibold">View Wishlist</span>
                                                <p className="text-sm text-red-600">Saved favorites</p>
                                            </div>
                                            <ArrowRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                                        </Link>
                                        
                                        <Link
                                            href="/buyer/orders"
                                            className="group w-full bg-gradient-to-r from-blue-50 to-sky-50 hover:from-blue-100 hover:to-sky-100 text-blue-700 px-6 py-4 rounded-xl transition-all duration-200 flex items-center gap-4 border border-blue-200 hover:border-blue-300"
                                        >
                                            <div className="bg-blue-500 p-2 rounded-lg group-hover:scale-110 transition-transform duration-200">
                                                <Package className="h-5 w-5 text-white" />
                                            </div>
                                            <div className="flex-1">
                                                <span className="font-semibold">Track Orders</span>
                                                <p className="text-sm text-blue-600">Order status</p>
                                            </div>
                                            <ArrowRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                                        </Link>
                                        
                                        <Link
                                            href="/artisans"
                                            className="group w-full bg-gradient-to-r from-purple-50 to-violet-50 hover:from-purple-100 hover:to-violet-100 text-purple-700 px-6 py-4 rounded-xl transition-all duration-200 flex items-center gap-4 border border-purple-200 hover:border-purple-300"
                                        >
                                            <div className="bg-purple-500 p-2 rounded-lg group-hover:scale-110 transition-transform duration-200">
                                                <MapPin className="h-5 w-5 text-white" />
                                            </div>
                                            <div className="flex-1">
                                                <span className="font-semibold">Find Artisans</span>
                                                <p className="text-sm text-purple-600">Local creators</p>
                                            </div>
                                            <ArrowRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Enhanced Recommendations & Promotions */}
                <section className="py-8 mx-4">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="grid gap-6 md:grid-cols-2">
                            {/* Recommendations */}
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                                <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-6 border-b border-gray-100">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h2 className="text-xl font-bold text-gray-900">Recommended for You</h2>
                                            <p className="text-gray-600">Personalized picks</p>
                                        </div>
                                        <Star className="h-6 w-6 text-amber-500" />
                                    </div>
                                </div>
                                <div className="p-6">
                                    <div className="text-center py-8">
                                        <div className="bg-amber-100 p-4 rounded-full w-16 h-16 mx-auto mb-4">
                                            <Star className="h-8 w-8 text-amber-600 mx-auto" />
                                        </div>
                                        <h3 className="text-lg font-semibold text-gray-700 mb-2">Discover Your Style</h3>
                                        <p className="text-gray-500 mb-6 text-sm">
                                            Shop more to get personalized recommendations based on your preferences
                                        </p>
                                        <div className="space-y-3">
                                            <Link
                                                href="/products"
                                                className="block w-full px-4 py-3 bg-amber-500 text-white font-semibold rounded-lg hover:bg-amber-600 transition-colors duration-200"
                                            >
                                                Explore Products
                                            </Link>
                                            <Link
                                                href="/categories"
                                                className="block w-full px-4 py-3 border-2 border-amber-300 text-amber-700 font-semibold rounded-lg hover:bg-amber-50 transition-colors duration-200"
                                            >
                                                Browse Categories
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Notifications & Updates */}
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                                <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-6 border-b border-gray-100">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h2 className="text-xl font-bold text-gray-900">Updates & Offers</h2>
                                            <p className="text-gray-600">Latest news</p>
                                        </div>
                                        <div className="relative">
                                            <Bell className="h-6 w-6 text-blue-500" />
                                            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-3 w-3"></span>
                                        </div>
                                    </div>
                                </div>
                                <div className="p-6">
                                    <div className="space-y-4">
                                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                            <div className="flex items-start gap-3">
                                                <div className="bg-green-500 p-1 rounded-full flex-shrink-0 mt-0.5">
                                                    <span className="block w-2 h-2 bg-white rounded-full"></span>
                                                </div>
                                                <div>
                                                    <p className="font-medium text-green-900">Welcome Bonus!</p>
                                                    <p className="text-sm text-green-700">Get 10% off your first purchase from any local artisan</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                            <div className="flex items-start gap-3">
                                                <div className="bg-blue-500 p-1 rounded-full flex-shrink-0 mt-0.5">
                                                    <span className="block w-2 h-2 bg-white rounded-full"></span>
                                                </div>
                                                <div>
                                                    <p className="font-medium text-blue-900">New Artisans Joined!</p>
                                                    <p className="text-sm text-blue-700">5 new local creators added this week</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                                            <div className="flex items-start gap-3">
                                                <div className="bg-purple-500 p-1 rounded-full flex-shrink-0 mt-0.5">
                                                    <span className="block w-2 h-2 bg-white rounded-full"></span>
                                                </div>
                                                <div>
                                                    <p className="font-medium text-purple-900">Seasonal Collection</p>
                                                    <p className="text-sm text-purple-700">Check out our spring handcraft collection</p>
                                                </div>
                                            </div>
                                        </div>

                                        <Link 
                                            href="/notifications"
                                            className="block text-center text-sm text-blue-600 hover:text-blue-800 font-medium pt-2"
                                        >
                                            View all notifications →
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </BuyerLayout>
    );
}