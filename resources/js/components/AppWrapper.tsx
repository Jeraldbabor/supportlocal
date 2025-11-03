import { CartProvider } from '@/contexts/CartContext';
import { usePage } from '@inertiajs/react';
import React, { useEffect, useState } from 'react';

interface AppWrapperProps {
    children: React.ReactNode;
}

// Inner component that can use usePage
function CartProviderWrapper({ children }: { children: React.ReactNode }) {
    const { props } = usePage();
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        const authStatus = !!(props as any)?.auth?.user;
        setIsAuthenticated(authStatus);
        
        // Clear guest cart when user authenticates
        if (authStatus) {
            const guestCart = localStorage.getItem('guest_cart');
            if (guestCart) {
                console.log('User authenticated - clearing guest cart from localStorage');
                localStorage.removeItem('guest_cart');
                localStorage.removeItem('cart_item_count');
                localStorage.removeItem('last_seen_cart_count');
            }
        }
    }, [(props as any)?.auth?.user]);

    return (
        <CartProvider isAuthenticated={isAuthenticated}>
            {children}
        </CartProvider>
    );
}

export default function AppWrapper({ children }: AppWrapperProps) {
    return (
        <CartProviderWrapper>
            {children}
        </CartProviderWrapper>
    );
}
