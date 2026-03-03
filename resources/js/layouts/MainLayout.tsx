import CookieConsent from '@/components/CookieConsent';
import { useCart } from '@/contexts/CartContext';
import { type SharedData } from '@/types';
import { Link, router, usePage } from '@inertiajs/react';
import { Bell, ChevronDown, Contact, Heart, House, LogOut, Menu, Phone, ShoppingCart, Store, User, X } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';

interface MainLayoutProps {
    children: React.ReactNode;
    title?: string;
    cartItems?: number;
}

export default function MainLayout({ children, title }: MainLayoutProps) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const [showCartNotification, setShowCartNotification] = useState(false);
    const userMenuRef = useRef<HTMLDivElement>(null);
    const mobileMenuRef = useRef<HTMLDivElement>(null);
    const mobileMenuButtonRef = useRef<HTMLButtonElement>(null);

    const { auth, wishlistCount } = usePage<SharedData>().props;
    const currentPath = usePage().url;
    const unreadCount = 0;
    const { totalItems } = useCart();

    // Simplified notification logic
    useEffect(() => {
        const notificationDismissed = localStorage.getItem('cart_notification_dismissed') === 'true';
        const lastSeenCount = parseInt(localStorage.getItem('cart_last_seen_count') || '0', 10);

        if (currentPath === '/cart') {
            setShowCartNotification(false);
            if (totalItems > 0) {
                localStorage.setItem('cart_notification_dismissed', 'true');
                localStorage.setItem('cart_last_seen_count', totalItems.toString());
            }
        } else if (totalItems === 0) {
            setShowCartNotification(false);
            localStorage.removeItem('cart_notification_dismissed');
            localStorage.removeItem('cart_last_seen_count');
        } else if (totalItems > lastSeenCount) {
            setShowCartNotification(true);
            localStorage.setItem('cart_notification_dismissed', 'false');
        } else if (!notificationDismissed && totalItems > 0) {
            setShowCartNotification(true);
        } else {
            setShowCartNotification(false);
        }
    }, [totalItems, currentPath]);

    const handleLogout = () => {
        router.post('/logout');
    };

    const handleCartClick = () => {
        // Immediately hide notification and mark as dismissed
        setShowCartNotification(false);
        localStorage.setItem('cart_notification_dismissed', 'true');
        localStorage.setItem('cart_last_seen_count', totalItems.toString());
    };

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
                setIsUserMenuOpen(false);
            }
            if (
                mobileMenuRef.current &&
                !mobileMenuRef.current.contains(event.target as Node) &&
                mobileMenuButtonRef.current &&
                !mobileMenuButtonRef.current.contains(event.target as Node)
            ) {
                setIsMenuOpen(false);
            }
        }

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    // Close menus when route changes
    useEffect(() => {
        setIsMenuOpen(false);
        setIsUserMenuOpen(false);
    }, [currentPath]);

    // Check if navigation item is active
    const isActiveRoute = (href: string) => {
        return currentPath === href || (href !== '/' && currentPath.startsWith(href));
    };

    const navigation = [
        { name: 'Home', href: '/', icon: House },
        { name: 'Marketplace', href: '/products', icon: Store },
        { name: 'Artisans', href: '/artisans', icon: User },
        { name: 'About', href: '/about', icon: Contact },
        { name: 'Contact', href: '/contact', icon: Phone },
    ];

    return (
        <div className="min-h-screen overflow-x-hidden bg-white" style={{ colorScheme: 'light' }}>
            {/* Navigation Header */}
            <header className="fixed top-0 z-50 w-full border-b border-gray-200 bg-white shadow-sm">
                <nav className="mx-auto w-full max-w-7xl px-3 sm:px-4 md:px-6 lg:px-8" role="navigation" aria-label="Main navigation">
                    <div className="flex h-14 items-center justify-between sm:h-16">
                        {/* Logo */}
                        <div className="min-w-0 flex-shrink-0">
                            <Link
                                href="/"
                                className="flex items-center gap-1.5 rounded-xl px-1.5 py-1.5 transition-all duration-300 hover:scale-105 focus:ring-2 focus:ring-orange-500/50 focus:ring-offset-2 focus:outline-none active:scale-95 sm:gap-2 sm:px-2 sm:py-2"
                                aria-label="Support Local Hinoba-an - Go to homepage"
                            >
                                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 shadow-md sm:h-10 sm:w-10">
                                    <svg className="h-5 w-5 text-white sm:h-6 sm:w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth="2"
                                            d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M9 5l8 4"
                                        />
                                    </svg>
                                </div>
                                <span className="hidden bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-lg font-bold text-transparent sm:inline sm:text-xl">
                                    Support Local Hinoba-an
                                </span>
                            </Link>
                        </div>

                        {/* Desktop Navigation */}
                        <div className="hidden flex-shrink-0 lg:block" style={{ colorScheme: 'light' }}>
                            <div className="flex items-center space-x-0.5">
                                {navigation.map((item) => {
                                    const Icon = item.icon;
                                    const isActive = isActiveRoute(item.href);
                                    return (
                                        <Link
                                            key={item.name}
                                            href={item.href}
                                            className={`group relative flex items-center gap-2 rounded-xl px-2.5 py-1.5 text-xs font-medium whitespace-nowrap transition-all duration-300 focus:ring-2 focus:ring-orange-500/50 focus:ring-offset-2 focus:outline-none sm:px-3 sm:py-2 sm:text-sm ${
                                                isActive
                                                    ? 'border border-orange-200 bg-gradient-to-r from-orange-100 to-amber-50 shadow-inner'
                                                    : 'hover:bg-gray-50 hover:shadow-sm'
                                            }`}
                                            style={{ color: isActive ? '#c2410c' : '#374151' }}
                                            aria-current={isActive ? 'page' : undefined}
                                        >
                                            <Icon
                                                className="h-3.5 w-3.5 flex-shrink-0 transition-all duration-300 sm:h-4 sm:w-4"
                                                style={{ color: isActive ? '#ea580c' : '#6b7280' }}
                                            />
                                            <span className="relative">
                                                {item.name}
                                                {isActive && (
                                                    <span className="absolute right-0 -bottom-1 left-0 h-0.5 rounded-full bg-gradient-to-r from-orange-500 to-amber-400"></span>
                                                )}
                                            </span>
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Cart and User Actions */}
                        <div className="flex flex-shrink-0 items-center space-x-0.5 sm:space-x-1" style={{ colorScheme: 'light' }}>
                            <Link
                                href="/buyer/notifications"
                                className={`group relative flex-shrink-0 rounded-xl p-1.5 transition-all duration-300 focus:ring-2 focus:ring-orange-500/50 focus:ring-offset-2 focus:outline-none sm:p-2 ${
                                    isActiveRoute('/buyer/notifications')
                                        ? 'bg-orange-100 shadow-sm ring-1 ring-orange-200'
                                        : 'hover:bg-orange-50 hover:shadow-sm'
                                }`}
                                style={{ colorScheme: 'light' }}
                                aria-label={`Notifications ${unreadCount > 0 ? `(${unreadCount} unread)` : ''}`}
                            >
                                <Bell
                                    className="h-4 w-4 transition-transform duration-300 group-hover:scale-110 sm:h-5 sm:w-5"
                                    style={{ color: isActiveRoute('/buyer/notifications') ? '#ea580c' : '#4b5563' }}
                                />
                                {unreadCount > 0 && (
                                    <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 animate-pulse items-center justify-center rounded-full bg-gradient-to-r from-red-500 to-red-600 text-[10px] font-medium text-white shadow-sm sm:-top-1 sm:-right-1 sm:h-5 sm:w-5 sm:text-xs">
                                        {unreadCount > 9 ? '9+' : unreadCount}
                                    </span>
                                )}
                            </Link>

                            {/* Wishlist Icon */}
                            <Link
                                href="/wishlist"
                                className={`group relative flex-shrink-0 rounded-xl p-1.5 transition-all duration-300 focus:ring-2 focus:ring-orange-500/50 focus:ring-offset-2 focus:outline-none sm:p-2 ${
                                    isActiveRoute('/wishlist')
                                        ? 'bg-orange-100 shadow-sm ring-1 ring-orange-200'
                                        : 'hover:bg-orange-50 hover:shadow-sm'
                                }`}
                                style={{ colorScheme: 'light' }}
                                aria-label={`Wishlist ${(wishlistCount ?? 0) > 0 ? `(${wishlistCount} items)` : '(empty)'}`}
                            >
                                <Heart
                                    className="h-4 w-4 transition-transform duration-300 group-hover:scale-110 sm:h-5 sm:w-5"
                                    style={{ color: isActiveRoute('/wishlist') ? '#ea580c' : '#4b5563' }}
                                />
                                {(wishlistCount ?? 0) > 0 && (
                                    <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-gradient-to-r from-pink-500 to-red-500 text-[10px] font-medium text-white shadow-sm sm:-top-1 sm:-right-1 sm:h-5 sm:w-5 sm:text-xs">
                                        {wishlistCount! > 99 ? '99+' : wishlistCount}
                                    </span>
                                )}
                            </Link>

                            {/* Cart Icon */}
                            <Link
                                href="/cart"
                                onClick={handleCartClick}
                                className={`group relative flex-shrink-0 rounded-xl p-1.5 transition-all duration-300 focus:ring-2 focus:ring-orange-500/50 focus:ring-offset-2 focus:outline-none sm:p-2 ${
                                    isActiveRoute('/cart') ? 'bg-orange-100 shadow-sm ring-1 ring-orange-200' : 'hover:bg-orange-50 hover:shadow-sm'
                                }`}
                                style={{ colorScheme: 'light' }}
                                aria-label={`Shopping cart ${totalItems > 0 ? `(${totalItems} items)` : '(empty)'}`}
                            >
                                <ShoppingCart
                                    className="h-4 w-4 transition-transform duration-300 group-hover:scale-110 sm:h-5 sm:w-5"
                                    style={{ color: isActiveRoute('/cart') ? '#ea580c' : '#4b5563' }}
                                />
                                {totalItems > 0 && showCartNotification && (
                                    <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 animate-pulse items-center justify-center rounded-full bg-gradient-to-r from-red-500 to-red-600 text-[10px] font-medium text-white shadow-sm sm:-top-1 sm:-right-1 sm:h-5 sm:w-5 sm:text-xs">
                                        {totalItems > 99 ? '99+' : totalItems}
                                    </span>
                                )}
                            </Link>

                            {/* User Authentication Section */}
                            {auth.user ? (
                                <div className="relative hidden flex-shrink-0 md:block" ref={userMenuRef}>
                                    <button
                                        onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                                        className={`flex items-center space-x-1.5 rounded-xl px-2 py-1.5 transition-all duration-300 focus:ring-2 focus:ring-orange-500/50 focus:ring-offset-2 focus:outline-none sm:space-x-2 sm:px-3 sm:py-2 ${
                                            isUserMenuOpen
                                                ? 'bg-gradient-to-r from-orange-100 to-amber-50 shadow-md ring-2 ring-orange-200'
                                                : 'hover:bg-gray-50 hover:shadow-sm'
                                        }`}
                                        aria-expanded={isUserMenuOpen}
                                        aria-haspopup="true"
                                        aria-label="User menu"
                                    >
                                        <div className="text-left">
                                            <p className="text-xs font-semibold text-gray-900 sm:text-sm">{auth.user?.name}</p>
                                            <p className="text-[10px] font-medium text-gray-500 sm:text-xs">Welcome back</p>
                                        </div>
                                        <ChevronDown
                                            className={`h-3.5 w-3.5 text-gray-400 transition-all duration-300 sm:h-4 sm:w-4 ${
                                                isUserMenuOpen ? 'rotate-180 text-orange-600' : 'group-hover:text-orange-600'
                                            }`}
                                        />
                                    </button>

                                    {/* User Dropdown Menu */}
                                    {isUserMenuOpen && (
                                        <div
                                            className="absolute top-full right-0 z-50 mt-3 w-56 rounded-xl border border-gray-200 bg-white py-2 shadow-xl ring-1 ring-black/5"
                                            role="menu"
                                            aria-orientation="vertical"
                                        >
                                            {/* User Info Header */}
                                            <div className="border-b border-gray-100 px-4 py-3">
                                                <p className="text-sm font-semibold text-gray-900">{auth.user?.name}</p>
                                                <p className="text-sm text-gray-600">{auth.user?.email}</p>
                                            </div>

                                            {/* Menu Items */}
                                            <div className="py-2">
                                                <Link
                                                    href="/dashboard"
                                                    className="group mx-2 flex items-center rounded-lg px-4 py-3 text-sm font-medium text-gray-700 transition-all duration-300 hover:bg-orange-50 hover:text-orange-700 focus:bg-orange-50 focus:text-orange-700 focus:outline-none"
                                                    onClick={() => setIsUserMenuOpen(false)}
                                                    role="menuitem"
                                                >
                                                    <User className="mr-3 h-4 w-4 text-gray-400 transition-colors duration-300 group-hover:text-orange-600" />
                                                    Dashboard
                                                </Link>

                                                <div className="mx-4 my-2 border-t border-gray-100"></div>

                                                <button
                                                    onClick={() => {
                                                        setIsUserMenuOpen(false);
                                                        handleLogout();
                                                    }}
                                                    className="group mx-2 flex w-full items-center rounded-lg px-4 py-3 text-sm font-medium text-red-600 transition-all duration-300 hover:bg-gradient-to-r hover:from-red-50 hover:to-red-50 hover:text-red-700 focus:bg-red-50 focus:text-red-700 focus:outline-none"
                                                    role="menuitem"
                                                >
                                                    <LogOut className="mr-3 h-4 w-4 transition-colors duration-300" />
                                                    Sign Out
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="hidden items-center gap-1.5 sm:gap-2 md:flex">
                                    <Link
                                        href="/login"
                                        className="rounded-xl px-2 py-1.5 text-xs font-medium text-gray-700 transition-all duration-300 hover:bg-gray-50 hover:text-orange-600 focus:ring-2 focus:ring-orange-500/50 focus:ring-offset-2 focus:outline-none sm:px-3 sm:py-2 sm:text-sm lg:px-4"
                                    >
                                        Log in
                                    </Link>
                                    <Link
                                        href="/register"
                                        className="rounded-xl border border-orange-200 bg-gradient-to-r from-orange-50 to-amber-50 px-2 py-1.5 text-xs font-medium text-orange-700 transition-all duration-300 hover:from-orange-100 hover:to-amber-100 hover:shadow-sm focus:ring-2 focus:ring-orange-500/50 focus:ring-offset-2 focus:outline-none sm:px-3 sm:py-2 sm:text-sm lg:px-4"
                                    >
                                        Get Started
                                    </Link>
                                </div>
                            )}

                            {/* Mobile menu button */}
                            <div className="ml-0.5 flex-shrink-0 sm:ml-1 lg:hidden">
                                <button
                                    ref={mobileMenuButtonRef}
                                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                                    className="rounded-xl p-1.5 text-gray-600 transition-all duration-300 hover:bg-orange-50 hover:text-orange-600 focus:ring-2 focus:ring-orange-500/50 focus:ring-offset-2 focus:outline-none sm:p-2"
                                    aria-expanded={isMenuOpen}
                                    aria-label="Toggle navigation menu"
                                >
                                    <div className="relative h-5 w-5 sm:h-6 sm:w-6">
                                        <Menu
                                            className={`pointer-events-none absolute inset-0 h-5 w-5 transition-all duration-300 sm:h-6 sm:w-6 ${isMenuOpen ? 'rotate-180 opacity-0' : 'rotate-0 opacity-100'}`}
                                        />
                                        <X
                                            className={`pointer-events-none absolute inset-0 h-5 w-5 transition-all duration-300 sm:h-6 sm:w-6 ${isMenuOpen ? 'rotate-0 opacity-100' : '-rotate-180 opacity-0'}`}
                                        />
                                    </div>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Mobile Navigation Menu */}
                    <div
                        className={`overflow-hidden transition-all duration-300 ease-in-out lg:hidden ${
                            isMenuOpen ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'
                        }`}
                        ref={mobileMenuRef}
                    >
                        <div className="border-t border-gray-200 bg-white px-3 py-3 shadow-lg sm:px-4 sm:py-4">
                            <div className="space-y-1.5 sm:space-y-2">
                                {navigation.map((item) => {
                                    const Icon = item.icon;
                                    const isActive = isActiveRoute(item.href);
                                    return (
                                        <Link
                                            key={item.name}
                                            href={item.href}
                                            className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-300 sm:gap-4 sm:px-4 sm:py-3 sm:text-base ${
                                                isActive
                                                    ? 'border border-orange-200 bg-gradient-to-r from-orange-100 to-amber-50 text-orange-700'
                                                    : 'text-gray-700 hover:bg-gray-50 hover:text-orange-600'
                                            }`}
                                            onClick={() => {
                                                setIsMenuOpen(false);
                                                setIsUserMenuOpen(false);
                                            }}
                                        >
                                            <Icon
                                                className={`h-4 w-4 flex-shrink-0 sm:h-5 sm:w-5 ${isActive ? 'text-orange-600' : 'text-gray-500'}`}
                                            />
                                            <span>{item.name}</span>
                                            {isActive && <div className="ml-auto h-2 w-2 rounded-full bg-orange-500"></div>}
                                        </Link>
                                    );
                                })}
                            </div>

                            {/* Mobile Auth Section */}
                            <div className="mt-6 border-t border-gray-200 pt-4">
                                {auth.user ? (
                                    <div>
                                        <div className="flex items-center gap-4 rounded-xl bg-gray-50 px-4 py-3">
                                            <div className="flex-1">
                                                <p className="font-semibold text-gray-900">{auth.user?.name}</p>
                                                <p className="text-sm text-gray-600">{auth.user?.email}</p>
                                            </div>
                                        </div>

                                        <div className="mt-3 space-y-2">
                                            <Link
                                                href="/dashboard"
                                                className="flex items-center gap-3 rounded-xl px-4 py-3 text-gray-700 transition-all duration-300 hover:bg-orange-50 hover:text-orange-700"
                                                onClick={() => setIsMenuOpen(false)}
                                            >
                                                <User className="h-5 w-5" />
                                                Dashboard
                                            </Link>

                                            <button
                                                onClick={() => {
                                                    setIsMenuOpen(false);
                                                    handleLogout();
                                                }}
                                                className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-red-600 transition-all duration-300 hover:bg-red-50 hover:text-red-700"
                                            >
                                                <LogOut className="h-5 w-5" />
                                                Sign Out
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        <Link
                                            href="/login"
                                            className="flex items-center justify-center rounded-xl px-4 py-3 text-gray-700 transition-all duration-300 hover:bg-gray-50 hover:text-orange-600"
                                            onClick={() => setIsMenuOpen(false)}
                                        >
                                            Log in
                                        </Link>
                                        <Link
                                            href="/register"
                                            className="flex items-center justify-center rounded-xl border border-orange-200 bg-gradient-to-r from-orange-50 to-amber-50 px-4 py-3 text-orange-700 transition-all duration-300 hover:from-orange-100 hover:to-amber-100"
                                            onClick={() => setIsMenuOpen(false)}
                                        >
                                            Get Started
                                        </Link>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </nav>
            </header>
            <div className="h-14 sm:h-16"></div>

            {/* Page Title */}
            {title && (
                <div className="bg-slate-50 py-4 sm:py-6 md:py-8">
                    <div className="mx-auto w-full max-w-7xl px-3 sm:px-4 md:px-6 lg:px-8">
                        <h1 className="text-xl font-bold text-slate-900 sm:text-2xl md:text-3xl">{title}</h1>
                    </div>
                </div>
            )}

            {/* Main Content */}
            <main className="flex-1 overflow-x-hidden bg-white">{children}</main>

            {/* Footer */}
            <footer className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
                <div className="mx-auto w-full max-w-7xl px-3 py-8 sm:px-4 sm:py-12 md:px-6 md:py-16 lg:px-8">
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-8 md:gap-12 lg:grid-cols-4">
                        {/* Brand Section */}
                        <div className="col-span-1 sm:col-span-2">
                            <div className="mb-4 flex items-center gap-2">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 shadow-lg">
                                    <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth="2"
                                            d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M9 5l8 4"
                                        />
                                    </svg>
                                </div>
                                <h3 className="bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-2xl font-bold text-transparent">
                                    Support Local Hinoba-an
                                </h3>
                            </div>
                            <p className="mb-6 leading-relaxed text-gray-300">
                                Empowering local artisans and craftsmen by connecting them with customers who value authenticity, quality, and the
                                beauty of handmade products.
                            </p>
                            <div className="flex flex-wrap gap-3 sm:gap-4">
                                <a
                                    href="#"
                                    className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-800 text-gray-400 transition-all hover:scale-110 hover:bg-gradient-to-r hover:from-amber-600 hover:to-orange-600 hover:text-white"
                                >
                                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                                    </svg>
                                </a>
                                <a
                                    href="#"
                                    className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-800 text-gray-400 transition-all hover:scale-110 hover:bg-gradient-to-r hover:from-amber-600 hover:to-orange-600 hover:text-white"
                                >
                                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                                    </svg>
                                </a>
                                <a
                                    href="#"
                                    className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-800 text-gray-400 transition-all hover:scale-110 hover:bg-gradient-to-r hover:from-amber-600 hover:to-orange-600 hover:text-white"
                                >
                                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                                    </svg>
                                </a>
                            </div>
                        </div>

                        {/* Quick Links */}
                        <div>
                            <h4 className="mb-4 text-lg font-semibold text-white">Explore</h4>
                            <ul className="space-y-3">
                                {navigation.map((item) => (
                                    <li key={item.name}>
                                        <Link
                                            href={item.href}
                                            className="group flex items-center text-gray-300 transition-all duration-200 hover:translate-x-1 hover:text-amber-400"
                                        >
                                            <span className="mr-2 text-amber-600 opacity-0 transition-opacity group-hover:opacity-100">→</span>
                                            {item.name}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Contact Info */}
                        <div>
                            <h4 className="mb-4 text-lg font-semibold text-white">Get in Touch</h4>
                            <div className="space-y-3">
                                <a
                                    href="mailto:hello@supportlocal.com"
                                    className="flex items-center gap-3 text-gray-300 transition-colors hover:text-amber-400"
                                >
                                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-800">
                                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth="2"
                                                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                                            />
                                        </svg>
                                    </div>
                                    <span className="text-sm">hello@supportlocal.com</span>
                                </a>
                                <a href="tel:5551234567" className="flex items-center gap-3 text-gray-300 transition-colors hover:text-amber-400">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-800">
                                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth="2"
                                                d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                                            />
                                        </svg>
                                    </div>
                                    <span className="text-sm">(555) 123-4567</span>
                                </a>
                                <div className="flex items-center gap-3 text-gray-300">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-800">
                                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth="2"
                                                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                            />
                                        </svg>
                                    </div>
                                    <span className="text-sm">Mon-Fri: 9AM-6PM</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Bottom Bar */}
                    <div className="mt-8 border-t border-gray-800 pt-6 sm:mt-12 sm:pt-8">
                        <div className="flex flex-col items-center justify-between gap-4 text-center md:flex-row md:text-left">
                            <p className="text-sm text-gray-400">
                                &copy; {new Date().getFullYear()} Support Local Hinoba-an. All rights reserved. Crafted with ❤️ for artisans, Develop
                                and Maintain by @Jerald B Babor.
                            </p>
                            <div className="flex flex-wrap justify-center gap-4 text-sm sm:gap-6 md:justify-start">
                                <Link href="/privacy-policy" className="text-gray-400 transition-colors hover:text-amber-400">
                                    Privacy Policy
                                </Link>
                                <Link href="/terms" className="text-gray-400 transition-colors hover:text-amber-400">
                                    Terms of Service
                                </Link>
                                <Link href="/cookies" className="text-gray-400 transition-colors hover:text-amber-400">
                                    Cookie Policy
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </footer>

            {/* Cookie Consent Banner */}
            <CookieConsent />
        </div>
    );
}
