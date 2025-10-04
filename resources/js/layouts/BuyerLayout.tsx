import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { type SharedData } from '@/types';
import { Link, router, usePage } from '@inertiajs/react';
import { Bell, Briefcase, ChevronDown, Heart, House, LogOut, Menu, Package, ShoppingCart, User, X } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';

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
        { name: 'Products', href: '/buyer/products', icon: Package },
        { name: 'Wishlist', href: '/buyer/wishlist', icon: Heart },
        { name: 'My Orders', href: '/buyer/orders', icon: Package },
        { name: 'Artisans', href: '/artisans', icon: User },
    ];

    return (
        <div className="min-h-screen bg-background">
            {/* Buyer Navigation Header */}
            <header className="sticky top-0 z-50 border-b border-gray-200 bg-white shadow-sm">
                <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex h-16 items-center justify-between">
                        {/* Logo */}
                        <div className="flex-shrink-0">
                            <Link
                                href="/buyer/dashboard"
                                className="rounded-lg px-2 py-1 text-2xl font-bold text-primary transition-all duration-200 hover:bg-primary/5 hover:text-primary/80 active:scale-95 active:bg-primary/10"
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
                                            className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-gray-700 transition-all duration-200 hover:bg-primary/5 hover:text-primary active:scale-95 active:bg-primary/10"
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
                                className="relative rounded-md p-2 text-gray-700 transition-all duration-200 hover:bg-primary/5 hover:text-primary active:scale-95 active:bg-primary/10"
                            >
                                <Bell className="h-5 w-5" />
                                <span className="absolute -top-1 -right-1 flex h-4 w-4 animate-pulse items-center justify-center rounded-full bg-red-500 text-xs text-white">
                                    3
                                </span>
                            </Link>

                            {/* Cart Icon */}
                            <Link
                                href="/buyer/cart"
                                className="relative rounded-md p-2 text-gray-700 transition-all duration-200 hover:bg-primary/5 hover:text-primary active:scale-95 active:bg-primary/10"
                            >
                                <ShoppingCart className="h-5 w-5" />
                                {cartItems > 0 && (
                                    <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white">
                                        {cartItems}
                                    </span>
                                )}
                            </Link>

                            {/* User Profile Section with Dropdown */}
                            <div className="relative flex items-center space-x-3 border-l border-gray-200 pl-4" ref={userMenuRef}>
                                <button
                                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                                    className={`flex items-center space-x-2 rounded-lg p-2 transition-all duration-200 ${
                                        isUserMenuOpen
                                            ? 'bg-primary/10 shadow-sm ring-2 ring-primary/20'
                                            : 'hover:bg-gray-50 hover:shadow-sm active:scale-95 active:bg-gray-100'
                                    }`}
                                >
                                    <Avatar className="h-8 w-8">
                                        <AvatarImage
                                            src={user?.profile_picture ? `/storage/${user.profile_picture}` : ''}
                                            alt={user?.name || 'User'}
                                        />
                                        <AvatarFallback className="bg-primary/10 text-sm font-medium text-primary">
                                            {user?.name
                                                ? user.name
                                                      .split(' ')
                                                      .map((n: string) => n[0])
                                                      .join('')
                                                      .toUpperCase()
                                                      .slice(0, 2)
                                                : 'U'}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="hidden text-left sm:block">
                                        <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                                        <p className="text-xs text-gray-500">Buyer</p>
                                    </div>
                                    <ChevronDown
                                        className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${isUserMenuOpen ? 'rotate-180' : ''}`}
                                    />
                                </button>

                                {/* Dropdown Menu */}
                                {isUserMenuOpen && (
                                    <div className="absolute top-full right-0 z-50 mt-2 w-56 rounded-lg border border-gray-200 bg-white py-2 shadow-lg">
                                        {/* User Info Header */}
                                        <div className="border-b border-gray-100 px-4 py-3">
                                            <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                                            <p className="text-sm text-gray-500">{user?.email}</p>
                                            <span className="mt-1 inline-flex items-center rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800">
                                                Buyer Account
                                            </span>
                                        </div>

                                        {/* Menu Items */}
                                        <div className="py-1">
                                            <Link
                                                href="/buyer/profile"
                                                className="mx-1 flex items-center rounded-md px-4 py-2 text-sm text-gray-700 transition-all duration-200 hover:bg-primary/5 hover:text-primary active:bg-primary/10"
                                                onClick={() => setIsUserMenuOpen(false)}
                                            >
                                                <User className="mr-3 h-4 w-4 text-gray-400 transition-colors duration-200 group-hover:text-primary" />
                                                Profile & Settings
                                            </Link>

                                            <div className="my-1 border-t border-gray-100"></div>

                                            <Link
                                                href="/seller/apply"
                                                className="mx-1 flex items-center rounded-md px-4 py-2 text-sm text-gray-700 transition-all duration-200 hover:bg-orange-50 hover:text-orange-600 active:bg-orange-100"
                                                onClick={() => setIsUserMenuOpen(false)}
                                            >
                                                <Briefcase className="mr-3 h-4 w-4 text-gray-400 transition-colors duration-200 hover:text-orange-600" />
                                                Become a Seller
                                            </Link>

                                            <div className="my-1 border-t border-gray-100"></div>

                                            <button
                                                onClick={() => {
                                                    setIsUserMenuOpen(false);
                                                    handleLogout();
                                                }}
                                                className="mx-1 flex w-full items-center rounded-md px-4 py-2 text-sm text-red-600 transition-all duration-200 hover:bg-red-50 hover:text-red-700 active:bg-red-100"
                                            >
                                                <LogOut className="mr-3 h-4 w-4 transition-colors duration-200" />
                                                Logout
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Mobile menu button */}
                            <div className="md:hidden">
                                <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2 text-gray-700 hover:text-primary">
                                    {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Mobile Navigation Menu */}
                    {isMenuOpen && (
                        <div className="md:hidden">
                            <div className="space-y-1 border-t border-gray-200 bg-white px-2 pt-2 pb-3 sm:px-3">
                                {buyerNavigation.map((item) => {
                                    const Icon = item.icon;
                                    return (
                                        <Link
                                            key={item.name}
                                            href={item.href}
                                            className="flex items-center gap-3 rounded-md px-3 py-2 text-base font-medium text-gray-700 transition-all duration-200 hover:bg-primary/5 hover:text-primary active:bg-primary/10"
                                            onClick={() => setIsMenuOpen(false)}
                                        >
                                            <Icon className="h-5 w-5" />
                                            {item.name}
                                        </Link>
                                    );
                                })}
                                <div className="mt-2 border-t border-gray-200 pt-2">
                                    <div className="flex items-center gap-3 px-3 py-2 text-sm text-gray-600">
                                        <User className="h-4 w-4" />
                                        <div>
                                            <p className="font-medium text-gray-900">{user?.name}</p>
                                            <p className="text-xs text-gray-500">{user?.email}</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={handleLogout}
                                        className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-red-600 transition-all duration-200 hover:bg-red-50 hover:text-red-700 active:bg-red-100"
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
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
                    </div>
                </div>
            )}

            {/* Main Content */}
            <main className="flex-1">{children}</main>

            {/* Footer - Buyer specific */}
            <footer className="bg-gray-900 text-white">
                <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
                        <div>
                            <h3 className="mb-4 text-lg font-semibold">Support Local</h3>
                            <p className="text-sm text-gray-300">Connecting buyers with amazing local artisans and their handcrafted products.</p>
                        </div>
                        <div>
                            <h4 className="text-md mb-3 font-semibold">Quick Links</h4>
                            <ul className="space-y-2 text-sm">
                                <li>
                                    <Link href="/products" className="text-gray-300 hover:text-white">
                                        Browse Products
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/buyer/wishlist" className="text-gray-300 hover:text-white">
                                        My Wishlist
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/buyer/orders" className="text-gray-300 hover:text-white">
                                        My Orders
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/artisans" className="text-gray-300 hover:text-white">
                                        Find Artisans
                                    </Link>
                                </li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="text-md mb-3 font-semibold">Support</h4>
                            <ul className="space-y-2 text-sm">
                                <li>
                                    <Link href="/help" className="text-gray-300 hover:text-white">
                                        Help Center
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/contact" className="text-gray-300 hover:text-white">
                                        Contact Us
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/buyer/settings" className="text-gray-300 hover:text-white">
                                        Account Settings
                                    </Link>
                                </li>
                            </ul>
                        </div>
                    </div>
                    <div className="mt-6 border-t border-gray-800 pt-6 text-center text-sm text-gray-300">
                        <p>&copy; 2025 Support Local. Empowering buyers and artisans.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
}
