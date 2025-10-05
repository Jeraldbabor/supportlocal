import { type SharedData } from '@/types/index';
import { Head, Link, usePage } from '@inertiajs/react';
import { ArrowRight, Bell, Clock, CreditCard, Heart, MapPin, Package, ShoppingBag, Star, TrendingUp, User } from 'lucide-react';
import BuyerLayout from '../../layouts/BuyerLayout';

export default function BuyerDashboard() {
    const { auth } = usePage<SharedData>().props;
    const user = auth.user;

    return (
        <BuyerLayout>
            <Head title="Buyer Dashboard" />
            <div className="min-h-screen bg-gray-50">
                {/* Hero Section */}
                <section className="relative mx-4 mt-6 overflow-hidden rounded-2xl bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 py-16">
                    <div className="absolute inset-0 bg-white/20 backdrop-blur-sm"></div>
                    <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="text-center">
                            <div className="mb-4 flex justify-center">
                                <div className="rounded-full bg-primary/10 p-3">
                                    <ShoppingBag className="h-8 w-8 text-primary" />
                                </div>
                            </div>
                            <h1 className="mb-4 text-4xl font-bold text-gray-900 md:text-5xl">
                                {new Date().getHours() < 12 ? 'Good Morning' : new Date().getHours() < 18 ? 'Good Afternoon' : 'Good Evening'},
                                <span className="mt-2 block text-primary">{user?.name}!</span>
                            </h1>
                            <p className="mx-auto mb-8 max-w-3xl text-xl leading-relaxed text-gray-700">
                                Ready to discover something amazing? Explore unique, handcrafted treasures from talented local artisans in your
                                community.
                            </p>
                            <div className="flex flex-col justify-center gap-4 sm:flex-row">
                                <Link
                                    href="/buyer/products"
                                    className="inline-flex transform items-center rounded-xl bg-primary px-8 py-4 font-semibold text-white shadow-lg transition-all duration-200 hover:scale-105 hover:bg-primary/90 hover:shadow-xl"
                                >
                                    <ShoppingBag className="mr-2 h-5 w-5" />
                                    Browse Products
                                </Link>
                                <Link
                                    href="/seller/apply"
                                    className="inline-flex transform items-center rounded-xl bg-gradient-to-r from-orange-500 to-pink-500 px-8 py-4 font-semibold text-white shadow-lg transition-all duration-200 hover:scale-105 hover:from-orange-600 hover:to-pink-600 hover:shadow-xl"
                                >
                                    <User className="mr-2 h-5 w-5" />
                                    Become a Seller
                                </Link>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Enhanced Stats Section */}
                <section className="mx-4 rounded-2xl border border-gray-100 bg-white py-8 shadow-sm">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="mb-12 text-center">
                            <h2 className="mb-4 text-3xl font-bold text-gray-900 md:text-4xl">Your Shopping Journey</h2>
                            <p className="text-lg text-gray-600">Track your orders and shopping activity at a glance</p>
                        </div>

                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                            {/* Orders Card */}
                            <div className="group rounded-xl border border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100 p-6 transition-all duration-200 hover:shadow-lg">
                                <div className="mb-4 flex items-center justify-between">
                                    <div className="rounded-full bg-blue-500 p-3 transition-transform duration-200 group-hover:scale-110">
                                        <ShoppingBag className="h-6 w-6 text-white" />
                                    </div>
                                    <TrendingUp className="h-4 w-4 text-blue-600" />
                                </div>
                                <h3 className="mb-2 text-lg font-semibold text-gray-800">Total Orders</h3>
                                <div className="flex items-baseline space-x-2">
                                    <p className="text-3xl font-bold text-blue-600">0</p>
                                    <span className="text-sm text-gray-600">orders placed</span>
                                </div>
                                <p className="mt-2 text-sm text-gray-500">Start shopping to see your orders here</p>
                            </div>

                            {/* Reviews Card */}
                            <div className="group rounded-xl border border-yellow-200 bg-gradient-to-br from-yellow-50 to-amber-100 p-6 transition-all duration-200 hover:shadow-lg">
                                <div className="mb-4 flex items-center justify-between">
                                    <div className="rounded-full bg-yellow-500 p-3 transition-transform duration-200 group-hover:scale-110">
                                        <Star className="h-6 w-6 text-white" />
                                    </div>
                                    <Star className="h-4 w-4 text-yellow-600" />
                                </div>
                                <h3 className="mb-2 text-lg font-semibold text-gray-800">Reviews Given</h3>
                                <div className="flex items-baseline space-x-2">
                                    <p className="text-3xl font-bold text-yellow-600">0</p>
                                    <span className="text-sm text-gray-600">reviews written</span>
                                </div>
                                <p className="mt-2 text-sm text-gray-500">Share your experience with others</p>
                            </div>

                            {/* Spending Card */}
                            <div className="group rounded-xl border border-green-200 bg-gradient-to-br from-green-50 to-emerald-100 p-6 transition-all duration-200 hover:shadow-lg">
                                <div className="mb-4 flex items-center justify-between">
                                    <div className="rounded-full bg-green-500 p-3 transition-transform duration-200 group-hover:scale-110">
                                        <CreditCard className="h-6 w-6 text-white" />
                                    </div>
                                    <TrendingUp className="h-4 w-4 text-green-600" />
                                </div>
                                <h3 className="mb-2 text-lg font-semibold text-gray-800">Total Spent</h3>
                                <div className="flex items-baseline space-x-2">
                                    <p className="text-3xl font-bold text-green-600">$0.00</p>
                                    <span className="text-sm text-gray-600">lifetime</span>
                                </div>
                                <p className="mt-2 text-sm text-gray-500">Supporting local artisans</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Recent Activity Feed */}
                <section className="mx-4 py-8">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                            <div className="mb-6 flex items-center justify-between">
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-900">Recent Activity</h2>
                                    <p className="text-gray-600">Keep track of your latest shopping activities</p>
                                </div>
                                <Clock className="h-6 w-6 text-gray-400" />
                            </div>

                            <div className="py-12 text-center">
                                <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-gray-100 p-4">
                                    <Clock className="mx-auto h-8 w-8 text-gray-400" />
                                </div>
                                <h3 className="mb-2 text-lg font-medium text-gray-600">No Recent Activity</h3>
                                <p className="mb-6 text-gray-500">Start shopping to see your activity here</p>
                                <Link
                                    href="/products"
                                    className="inline-flex items-center rounded-lg bg-primary px-6 py-3 font-medium text-white transition-colors duration-200 hover:bg-primary/90"
                                >
                                    <ShoppingBag className="mr-2 h-4 w-4" />
                                    Start Shopping
                                </Link>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Main Content Area */}
                <section className="mx-4 rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 py-8">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="grid gap-8 lg:grid-cols-3">
                            {/* Recent Orders - Enhanced */}
                            <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-shadow duration-300 hover:shadow-lg lg:col-span-2">
                                <div className="border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50 p-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h3 className="text-xl font-semibold text-gray-900">Recent Orders</h3>
                                            <p className="text-gray-600">Track your recent purchases</p>
                                        </div>
                                        <Package className="h-8 w-8 text-indigo-600" />
                                    </div>
                                </div>
                                <div className="p-6">
                                    <div className="py-12 text-center">
                                        <div className="mx-auto mb-6 h-20 w-20 rounded-full bg-blue-100 p-4">
                                            <Package className="mx-auto h-12 w-12 text-blue-600" />
                                        </div>
                                        <h4 className="mb-3 text-lg font-medium text-gray-600">No orders yet</h4>
                                        <p className="mx-auto mb-6 max-w-sm text-gray-500">
                                            Discover amazing handcrafted products from local artisans
                                        </p>
                                        <Link
                                            href="/products"
                                            className="inline-flex transform items-center rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-3 font-semibold text-white shadow-lg transition-all duration-200 hover:scale-105 hover:from-blue-700 hover:to-indigo-700 hover:shadow-xl"
                                        >
                                            <ShoppingBag className="mr-2 h-5 w-5" />
                                            Browse Products
                                        </Link>
                                    </div>
                                </div>
                            </div>

                            {/* Enhanced Quick Actions */}
                            <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-shadow duration-300 hover:shadow-lg">
                                <div className="border-b border-gray-100 bg-gradient-to-r from-purple-50 to-pink-50 p-6">
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
                                            className="group flex w-full items-center gap-4 rounded-xl border border-green-200 bg-gradient-to-r from-green-50 to-emerald-50 px-6 py-4 text-green-700 transition-all duration-200 hover:border-green-300 hover:from-green-100 hover:to-emerald-100"
                                        >
                                            <div className="rounded-lg bg-green-500 p-2 transition-transform duration-200 group-hover:scale-110">
                                                <ShoppingBag className="h-5 w-5 text-white" />
                                            </div>
                                            <div className="flex-1">
                                                <span className="font-semibold">Browse Products</span>
                                                <p className="text-sm text-green-600">Discover new items</p>
                                            </div>
                                            <ArrowRight className="h-4 w-4 opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
                                        </Link>

                                        <Link
                                            href="/buyer/orders"
                                            className="group flex w-full items-center gap-4 rounded-xl border border-blue-200 bg-gradient-to-r from-blue-50 to-sky-50 px-6 py-4 text-blue-700 transition-all duration-200 hover:border-blue-300 hover:from-blue-100 hover:to-sky-100"
                                        >
                                            <div className="rounded-lg bg-blue-500 p-2 transition-transform duration-200 group-hover:scale-110">
                                                <Package className="h-5 w-5 text-white" />
                                            </div>
                                            <div className="flex-1">
                                                <span className="font-semibold">Track Orders</span>
                                                <p className="text-sm text-blue-600">Order status</p>
                                            </div>
                                            <ArrowRight className="h-4 w-4 opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
                                        </Link>

                                        <Link
                                            href="/artisans"
                                            className="group flex w-full items-center gap-4 rounded-xl border border-purple-200 bg-gradient-to-r from-purple-50 to-violet-50 px-6 py-4 text-purple-700 transition-all duration-200 hover:border-purple-300 hover:from-purple-100 hover:to-violet-100"
                                        >
                                            <div className="rounded-lg bg-purple-500 p-2 transition-transform duration-200 group-hover:scale-110">
                                                <MapPin className="h-5 w-5 text-white" />
                                            </div>
                                            <div className="flex-1">
                                                <span className="font-semibold">Find Artisans</span>
                                                <p className="text-sm text-purple-600">Local creators</p>
                                            </div>
                                            <ArrowRight className="h-4 w-4 opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Enhanced Recommendations & Promotions */}
                <section className="mx-4 py-8">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="grid gap-6 md:grid-cols-2">
                            {/* Recommendations */}
                            <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
                                <div className="border-b border-gray-100 bg-gradient-to-r from-amber-50 to-orange-50 p-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h2 className="text-xl font-bold text-gray-900">Recommended for You</h2>
                                            <p className="text-gray-600">Personalized picks</p>
                                        </div>
                                        <Star className="h-6 w-6 text-amber-500" />
                                    </div>
                                </div>
                                <div className="p-6">
                                    <div className="py-8 text-center">
                                        <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-amber-100 p-4">
                                            <Star className="mx-auto h-8 w-8 text-amber-600" />
                                        </div>
                                        <h3 className="mb-2 text-lg font-semibold text-gray-700">Discover Your Style</h3>
                                        <p className="mb-6 text-sm text-gray-500">
                                            Shop more to get personalized recommendations based on your preferences
                                        </p>
                                        <div className="space-y-3">
                                            <Link
                                                href="/products"
                                                className="block w-full rounded-lg bg-amber-500 px-4 py-3 font-semibold text-white transition-colors duration-200 hover:bg-amber-600"
                                            >
                                                Explore Products
                                            </Link>
                                            <Link
                                                href="/categories"
                                                className="block w-full rounded-lg border-2 border-amber-300 px-4 py-3 font-semibold text-amber-700 transition-colors duration-200 hover:bg-amber-50"
                                            >
                                                Browse Categories
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Notifications & Updates */}
                            <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
                                <div className="border-b border-gray-100 bg-gradient-to-r from-blue-50 to-cyan-50 p-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h2 className="text-xl font-bold text-gray-900">Updates & Offers</h2>
                                            <p className="text-gray-600">Latest news</p>
                                        </div>
                                        <div className="relative">
                                            <Bell className="h-6 w-6 text-blue-500" />
                                            <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-red-500 text-xs text-white"></span>
                                        </div>
                                    </div>
                                </div>
                                <div className="p-6">
                                    <div className="space-y-4">
                                        <div className="rounded-lg border border-green-200 bg-green-50 p-4">
                                            <div className="flex items-start gap-3">
                                                <div className="mt-0.5 flex-shrink-0 rounded-full bg-green-500 p-1">
                                                    <span className="block h-2 w-2 rounded-full bg-white"></span>
                                                </div>
                                                <div>
                                                    <p className="font-medium text-green-900">Welcome Bonus!</p>
                                                    <p className="text-sm text-green-700">Get 10% off your first purchase from any local artisan</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                                            <div className="flex items-start gap-3">
                                                <div className="mt-0.5 flex-shrink-0 rounded-full bg-blue-500 p-1">
                                                    <span className="block h-2 w-2 rounded-full bg-white"></span>
                                                </div>
                                                <div>
                                                    <p className="font-medium text-blue-900">New Artisans Joined!</p>
                                                    <p className="text-sm text-blue-700">5 new local creators added this week</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="rounded-lg border border-purple-200 bg-purple-50 p-4">
                                            <div className="flex items-start gap-3">
                                                <div className="mt-0.5 flex-shrink-0 rounded-full bg-purple-500 p-1">
                                                    <span className="block h-2 w-2 rounded-full bg-white"></span>
                                                </div>
                                                <div>
                                                    <p className="font-medium text-purple-900">Seasonal Collection</p>
                                                    <p className="text-sm text-purple-700">Check out our spring handcraft collection</p>
                                                </div>
                                            </div>
                                        </div>

                                        <Link
                                            href="/buyer/notifications"
                                            className="block pt-2 text-center text-sm font-medium text-blue-600 hover:text-blue-800"
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
