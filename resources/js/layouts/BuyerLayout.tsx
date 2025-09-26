import React, { useState, useRef, useEffect } from 'react';
import { Link, usePage, router } from '@inertiajs/react';
import { ShoppingCart, Menu, X, LogOut, User, Bell, Heart, Package, Settings, ChevronDown, House  } from 'lucide-react';
import { type SharedData } from '@/types';

interface BuyerLayoutProps {
    children: React.ReactNode;
    title?: string;
    cartItems?: number;
}

export default function BuyerLayout({ children, title, cartItems = 0 }: BuyerLayoutProps) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const userMenuRef = useRef<HTMLDivElement>(null);

    const { auth } = usePage<SharedData>().props;
    const user = auth.user;

    const handleLogout = () => {
        router.post('/logout');
    };

    // Close user menu when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
                setIsUserMenuOpen(false);
            }
        }

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const buyerNavigation = [
        { name: 'Home', href: '/buyer/dashboard', icon: House },
        { name: 'Products', href: '/products', icon: Package },
        { name: 'Wishlist', href: '/buyer/wishlist', icon: Heart },
        { name: 'My Orders', href: '/buyer/orders', icon: Package },
        { name: 'Artisans', href: '/artisans', icon: User },
    ];

    return (
        <div className="min-h-screen bg-background">
            {/* Buyer Navigation Header */}
            <header className="sticky top-0 z-50 bg-white shadow-sm border-b border-gray-200">
                <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        {/* Logo */}
                        <div className="flex-shrink-0">
                            <Link 
                                href="/buyer/dashboard" 
                                className="text-2xl font-bold text-primary hover:text-primary/80 transition-all duration-200 px-2 py-1 rounded-lg hover:bg-primary/5 active:bg-primary/10 active:scale-95"
                            >
                                Support Local
                            </Link>
                        </div>

                        {/* Desktop Navigation - Buyer Specific */}
                        <div className="hidden md:block">
                            <div className="ml-10 flex items-baseline space-x-6">
                                {buyerNavigation.map((item) => {
                                    const Icon = item.icon;
                                    return (
                                        <Link
                                            key={item.name}
                                            href={item.href}
                                            className="flex items-center gap-2 text-gray-700 hover:text-primary px-3 py-2 text-sm font-medium transition-all duration-200 rounded-md hover:bg-primary/5 active:bg-primary/10 active:scale-95"
                                        >
                                            <Icon className="h-4 w-4" />
                                            {item.name}
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Right side - User specific actions */}
                        <div className="flex items-center space-x-4">
                            {/* Notifications */}
                            <Link
                                href="/buyer/notifications"
                                className="relative p-2 text-gray-700 hover:text-primary transition-all duration-200 rounded-md hover:bg-primary/5 active:bg-primary/10 active:scale-95"
                            >
                                <Bell className="h-5 w-5" />
                                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center animate-pulse">
                                    3
                                </span>
                            </Link>

                            {/* Cart Icon */}
                            <Link
                                href="/buyer/cart"
                                className="relative p-2 text-gray-700 hover:text-primary transition-all duration-200 rounded-md hover:bg-primary/5 active:bg-primary/10 active:scale-95"
                            >
                                <ShoppingCart className="h-5 w-5" />
                                {cartItems > 0 && (
                                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                                        {cartItems}
                                    </span>
                                )}
                            </Link>

                            {/* User Profile Section with Dropdown */}
                            <div className="relative flex items-center space-x-3 border-l border-gray-200 pl-4" ref={userMenuRef}>
                                <button
                                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                                    className={`flex items-center space-x-2 p-2 rounded-lg transition-all duration-200 ${
                                        isUserMenuOpen 
                                            ? 'bg-primary/10 ring-2 ring-primary/20 shadow-sm' 
                                            : 'hover:bg-gray-50 hover:shadow-sm active:bg-gray-100 active:scale-95'
                                    }`}
                                >
                                    <div className="h-8 w-8 bg-primary/10 rounded-full flex items-center justify-center">
                                        <User className="h-4 w-4 text-primary" />
                                    </div>
                                    <div className="hidden sm:block text-left">
                                        <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                                        <p className="text-xs text-gray-500">Buyer</p>
                                    </div>
                                    <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${isUserMenuOpen ? 'rotate-180' : ''}`} />
                                </button>

                                {/* Dropdown Menu */}
                                {isUserMenuOpen && (
                                    <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                                        {/* User Info Header */}
                                        <div className="px-4 py-3 border-b border-gray-100">
                                            <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                                            <p className="text-sm text-gray-500">{user?.email}</p>
                                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 mt-1">
                                                Buyer Account
                                            </span>
                                        </div>

                                        {/* Menu Items */}
                                        <div className="py-1">
                                            <Link
                                                href="/buyer/profile"
                                                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-primary/5 hover:text-primary transition-all duration-200 rounded-md mx-1 active:bg-primary/10"
                                                onClick={() => setIsUserMenuOpen(false)}
                                            >
                                                <User className="h-4 w-4 mr-3 text-gray-400 group-hover:text-primary transition-colors duration-200" />
                                                View Profile
                                            </Link>
                                            
                                            <Link
                                                href="/buyer/settings"
                                                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-primary/5 hover:text-primary transition-all duration-200 rounded-md mx-1 active:bg-primary/10"
                                                onClick={() => setIsUserMenuOpen(false)}
                                            >
                                                <Settings className="h-4 w-4 mr-3 text-gray-400 group-hover:text-primary transition-colors duration-200" />
                                                Account Settings
                                            </Link>

                                            <div className="border-t border-gray-100 my-1"></div>

                                            <button
                                                onClick={() => {
                                                    setIsUserMenuOpen(false);
                                                    handleLogout();
                                                }}
                                                className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 hover:text-red-700 transition-all duration-200 rounded-md mx-1 active:bg-red-100"
                                            >
                                                <LogOut className="h-4 w-4 mr-3 transition-colors duration-200" />
                                                Logout
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Mobile menu button */}
                            <div className="md:hidden">
                                <button
                                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                                    className="p-2 text-gray-700 hover:text-primary"
                                >
                                    {isMenuOpen ? (
                                        <X className="h-6 w-6" />
                                    ) : (
                                        <Menu className="h-6 w-6" />
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Mobile Navigation Menu */}
                    {isMenuOpen && (
                        <div className="md:hidden">
                            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t border-gray-200">
                                {buyerNavigation.map((item) => {
                                    const Icon = item.icon;
                                    return (
                                        <Link
                                            key={item.name}
                                            href={item.href}
                                            className="flex items-center gap-3 text-gray-700 hover:text-primary px-3 py-2 text-base font-medium rounded-md hover:bg-primary/5 active:bg-primary/10 transition-all duration-200"
                                            onClick={() => setIsMenuOpen(false)}
                                        >
                                            <Icon className="h-5 w-5" />
                                            {item.name}
                                        </Link>
                                    );
                                })}
                                <div className="border-t border-gray-200 pt-2 mt-2">
                                    <div className="flex items-center gap-3 px-3 py-2 text-sm text-gray-600">
                                        <User className="h-4 w-4" />
                                        <div>
                                            <p className="font-medium text-gray-900">{user?.name}</p>
                                            <p className="text-xs text-gray-500">{user?.email}</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={handleLogout}
                                        className="flex items-center gap-3 w-full px-3 py-2 text-left text-red-600 hover:bg-red-50 hover:text-red-700 rounded-md transition-all duration-200 active:bg-red-100"
                                    >
                                        <LogOut className="h-4 w-4" />
                                        Logout
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </nav>
            </header>

            {/* Page Title */}
            {title && (
                <div className="bg-gray-50 py-6">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
                    </div>
                </div>
            )}

            {/* Main Content */}
            <main className="flex-1">
                {children}
            </main>

            {/* Footer - Buyer specific */}
            <footer className="bg-gray-900 text-white">
                <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div>
                            <h3 className="text-lg font-semibold mb-4">Support Local</h3>
                            <p className="text-gray-300 text-sm">
                                Connecting buyers with amazing local artisans and their handcrafted products.
                            </p>
                        </div>
                        <div>
                            <h4 className="text-md font-semibold mb-3">Quick Links</h4>
                            <ul className="space-y-2 text-sm">
                                <li><Link href="/products" className="text-gray-300 hover:text-white">Browse Products</Link></li>
                                <li><Link href="/buyer/wishlist" className="text-gray-300 hover:text-white">My Wishlist</Link></li>
                                <li><Link href="/buyer/orders" className="text-gray-300 hover:text-white">My Orders</Link></li>
                                <li><Link href="/artisans" className="text-gray-300 hover:text-white">Find Artisans</Link></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="text-md font-semibold mb-3">Support</h4>
                            <ul className="space-y-2 text-sm">
                                <li><Link href="/help" className="text-gray-300 hover:text-white">Help Center</Link></li>
                                <li><Link href="/contact" className="text-gray-300 hover:text-white">Contact Us</Link></li>
                                <li><Link href="/buyer/settings" className="text-gray-300 hover:text-white">Account Settings</Link></li>
                            </ul>
                        </div>
                    </div>
                    <div className="border-t border-gray-800 mt-6 pt-6 text-center text-gray-300 text-sm">
                        <p>&copy; 2025 Support Local. Empowering buyers and artisans.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
}