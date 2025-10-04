import { dashboard, login, register } from '@/routes';
import { type SharedData } from '@/types';
import { Link, router, usePage } from '@inertiajs/react';
import { LogOut, Menu, ShoppingCart, X } from 'lucide-react';
import React, { useState } from 'react';

interface MainLayoutProps {
    children: React.ReactNode;
    title?: string;
    cartItems?: number;
}

export default function MainLayout({ children, title, cartItems = 0 }: MainLayoutProps) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const { auth } = usePage<SharedData>().props;

    const handleLogout = () => {
        router.post('/logout');
    };

    const navigation = [
        { name: 'Home', href: '/' },
        { name: 'Products', href: '/products' },
        { name: 'About', href: '/about' },
        { name: 'Contact', href: '/contact' },
    ];

    return (
        <div className="min-h-screen bg-background">
            {/* Navigation Header */}
            <header className="sticky top-0 z-50 border-b border-gray-200 bg-white shadow-sm">
                <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex h-16 items-center justify-between">
                        {/* Logo */}
                        <div className="flex-shrink-0">
                            <Link href="/" className="text-2xl font-bold text-primary">
                                Support Local
                            </Link>
                        </div>

                        {/* Desktop Navigation */}
                        <div className="hidden md:block">
                            <div className="ml-10 flex items-baseline space-x-8">
                                {navigation.map((item) => (
                                    <Link
                                        key={item.name}
                                        href={item.href}
                                        className="px-3 py-2 text-sm font-medium text-gray-700 transition-colors duration-200 hover:text-primary"
                                    >
                                        {item.name}
                                    </Link>
                                ))}
                            </div>
                        </div>

                        {/* Cart and Mobile Menu Button */}
                        <div className="flex items-center space-x-4">
                            {/* Cart Icon */}
                            <Link href="/cart" className="relative p-2 text-gray-700 transition-colors duration-200 hover:text-primary">
                                <ShoppingCart className="h-6 w-6" />
                                {cartItems > 0 && (
                                    <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white">
                                        {cartItems}
                                    </span>
                                )}
                            </Link>

                            <nav className="flex items-center justify-end gap-4">
                                {auth.user ? (
                                    <>
                                        <Link
                                            href={dashboard().url}
                                            className="inline-block rounded-sm border border-[#19140035] px-5 py-1.5 text-sm leading-normal text-[#1b1b18] hover:border-[#1915014a] dark:border-[#3E3E3A] dark:text-[#EDEDEC] dark:hover:border-[#62605b]"
                                        >
                                            Dashboard
                                        </Link>
                                        <button
                                            onClick={handleLogout}
                                            className="inline-flex items-center gap-2 rounded-sm border border-red-200 px-4 py-1.5 text-sm leading-normal text-red-600 transition-colors duration-200 hover:border-red-300 hover:bg-red-50"
                                        >
                                            <LogOut className="h-4 w-4" />
                                            Logout
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <Link
                                            href={login().url}
                                            className="inline-block rounded-sm border border-transparent px-5 py-1.5 text-sm leading-normal text-[#1b1b18] hover:border-[#19140035] dark:text-[#EDEDEC] dark:hover:border-[#3E3E3A]"
                                        >
                                            Log in
                                        </Link>
                                        <Link
                                            href={register().url}
                                            className="inline-block rounded-sm border border-[#19140035] px-5 py-1.5 text-sm leading-normal text-[#1b1b18] hover:border-[#1915014a] dark:border-[#3E3E3A] dark:text-[#EDEDEC] dark:hover:border-[#62605b]"
                                        >
                                            Get Started
                                        </Link>
                                    </>
                                )}
                            </nav>

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
                                {navigation.map((item) => (
                                    <Link
                                        key={item.name}
                                        href={item.href}
                                        className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-primary"
                                        onClick={() => setIsMenuOpen(false)}
                                    >
                                        {item.name}
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}
                </nav>
            </header>

            {/* Page Title */}
            {title && (
                <div className="bg-gray-50 py-8">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
                    </div>
                </div>
            )}

            {/* Main Content */}
            <main className="flex-1">{children}</main>

            {/* Footer */}
            <footer className="bg-gray-900 text-white">
                <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
                        <div className="col-span-1 md:col-span-2">
                            <h3 className="mb-4 text-2xl font-bold">ArtisanLocal</h3>
                            <p className="mb-4 text-gray-300">
                                Supporting local artisans and craftsmen by connecting them with customers who appreciate handmade, quality products.
                            </p>
                        </div>
                        <div>
                            <h4 className="mb-4 text-lg font-semibold">Quick Links</h4>
                            <ul className="space-y-2">
                                {navigation.map((item) => (
                                    <li key={item.name}>
                                        <Link href={item.href} className="text-gray-300 transition-colors duration-200 hover:text-white">
                                            {item.name}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div>
                            <h4 className="mb-4 text-lg font-semibold">Contact Info</h4>
                            <div className="space-y-2 text-gray-300">
                                <p>Email: hello@artisanlocal.com</p>
                                <p>Phone: (555) 123-4567</p>
                                <p>Hours: Mon-Fri 9AM-6PM</p>
                            </div>
                        </div>
                    </div>
                    <div className="mt-8 border-t border-gray-800 pt-8 text-center text-gray-300">
                        <p>&copy; 2025 ArtisanLocal. All rights reserved.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
}
