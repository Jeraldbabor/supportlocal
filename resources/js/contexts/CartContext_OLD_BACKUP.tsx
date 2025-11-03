import React, { createContext, useContext, useEffect, useState } from 'react';
import { Product } from '@/types';
import { router } from '@inertiajs/react';

export interface CartItem {
    id: number;
    product_id: number;
    name: string;
    price: number;
    quantity: number;
    primary_image: string;
    seller: {
        id: number;
        name: string;
    };
    max_quantity: number;
    stock_quantity: number;
}

interface CartContextType {
    items: CartItem[];
    cart: CartItem[];
    totalItems: number;
    totalAmount: number;
    addToCart: (product: Product, quantity?: number) => void;
    removeFromCart: (productId: number) => void;
    updateQuantity: (productId: number, quantity: number) => void;
    clearCart: () => void;
    getCartTotal: () => number;
    isLoading: boolean;
    isAuthenticated: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

interface CartProviderProps {
    children: React.ReactNode;
    isAuthenticated?: boolean;
}

export function CartProvider({ children, isAuthenticated: authProp }: CartProviderProps) {
    const [items, setItems] = useState<CartItem[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState(authProp || false);
    const [hasTransferredCart, setHasTransferredCart] = useState(false);

    // Update authentication state when prop changes
    useEffect(() => {
        const wasAuthenticated = isAuthenticated;
        const nowAuthenticated = authProp || false;
        
        console.log('Auth state change:', { wasAuthenticated, nowAuthenticated, hasTransferredCart });
        
        setIsAuthenticated(nowAuthenticated);
        
        // If user just logged in (transitioned from false to true)
        if (!wasAuthenticated && nowAuthenticated && !hasTransferredCart) {
            console.log('User just logged in, initiating cart transfer...');
            transferGuestCartToBackend();
        }
    }, [authProp, hasTransferredCart, isAuthenticated]);

    // Transfer guest cart to authenticated user's cart
    const transferGuestCartToBackend = async () => {
        const guestCart = localStorage.getItem('guest_cart');
        
        console.log('=== TRANSFER FUNCTION CALLED ===');
        console.log('Guest cart from localStorage:', guestCart);
        
        if (!guestCart) {
            console.log('No guest cart to transfer');
            setHasTransferredCart(true);
            return;
        }

        try {
            const cartItems = JSON.parse(guestCart);
            
            console.log('Parsed cart items:', cartItems);
            console.log('Cart items count:', cartItems.length);
            
            if (cartItems.length === 0) {
                console.log('Guest cart is empty, clearing localStorage');
                // Clear empty cart
                localStorage.removeItem('guest_cart');
                localStorage.removeItem('cart_item_count');
                localStorage.removeItem('last_seen_cart_count');
                setHasTransferredCart(true);
                return;
            }

            console.log('Transferring guest cart to authenticated user:', cartItems);
            console.log('Request body:', JSON.stringify({ items: cartItems }));

            // Send cart items to backend to merge with user's cart
            const response = await fetch('/api/cart/transfer', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify({ items: cartItems }),
            });

            console.log('Response status:', response.status);
            console.log('Response ok?:', response.ok);

            const result = await response.json();
            
            console.log('Response data:', result);
            
            if (response.ok) {
                console.log('Cart transfer successful:', result);
                
                // Clear guest cart after successful transfer
                localStorage.removeItem('guest_cart');
                localStorage.removeItem('cart_item_count');
                localStorage.removeItem('last_seen_cart_count');
                
                console.log('Guest cart successfully transferred to authenticated user');
                setHasTransferredCart(true);
                
                // Reload the page to show the transferred items
                window.location.reload();
            } else {
                console.error('Cart transfer failed:', result);
                setHasTransferredCart(true); // Mark as attempted even on failure
            }
            
        } catch (error) {
            console.error('Error transferring guest cart:', error);
            // Even if transfer fails, mark as attempted to prevent infinite loops
            setHasTransferredCart(true);
        }
    };

    // Load cart from localStorage on mount (guest only)
    useEffect(() => {
        // If user is authenticated, don't load guest cart into state
        // The backend will handle the authenticated user's cart
        if (isAuthenticated) {
            setItems([]);
            return;
        }

        const savedCart = localStorage.getItem('guest_cart');
        if (savedCart) {
            try {
                const parsedCart = JSON.parse(savedCart);
                const normalizedCart = parsedCart.map((item: CartItem) => ({
                    ...item,
                    price: parseFloat(item.price.toString()) || 0,
                }));
                setItems(normalizedCart);
            } catch (error) {
                console.error('Error loading cart from localStorage:', error);
                localStorage.removeItem('guest_cart');
            }
        }
    }, [isAuthenticated]);

    // Save cart to localStorage whenever items change (guest only)
    useEffect(() => {
        if (!isAuthenticated) {
            localStorage.setItem('guest_cart', JSON.stringify(items));
        }
    }, [items, isAuthenticated]);

    const addToCart = (product: Product, quantity: number = 1) => {
        // Authenticated users should use the buyer cart system
        if (isAuthenticated) {
            console.warn('Authenticated users should use the buyer cart at /buyer/cart');
            return;
        }

        setIsLoading(true);

        try {
            setItems((currentItems) => {
                const existingItem = currentItems.find((item) => item.product_id === product.id);

                if (existingItem) {
                    const newQuantity = Math.min(existingItem.quantity + quantity, product.quantity || 999);
                    return currentItems.map((item) => 
                        item.product_id === product.id ? { ...item, quantity: newQuantity } : item
                    );
                } else {
                    const newItem: CartItem = {
                        id: Date.now(),
                        product_id: product.id,
                        name: product.name,
                        price: typeof product.price === 'string' ? parseFloat(product.price) || 0 : product.price || 0,
                        quantity: Math.min(quantity, product.quantity || 999),
                        primary_image: product.primary_image,
                        seller: product.seller,
                        max_quantity: product.quantity || 999,
                        stock_quantity: product.quantity || 999,
                    };
                    return [...currentItems, newItem];
                }
            });
        } catch (error) {
            console.error('Error adding to cart:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const removeFromCart = (productId: number) => {
        if (isAuthenticated) {
            console.warn('Authenticated users should use the buyer cart.');
            return;
        }
        setItems((currentItems) => currentItems.filter((item) => item.product_id !== productId));
    };

    const updateQuantity = (productId: number, quantity: number) => {
        if (isAuthenticated) {
            console.warn('Authenticated users should use the buyer cart.');
            return;
        }

        if (quantity <= 0) {
            removeFromCart(productId);
            return;
        }

        setItems((currentItems) =>
            currentItems.map((item) => 
                item.product_id === productId ? { ...item, quantity: Math.min(quantity, item.max_quantity) } : item
            )
        );
    };

    const clearCart = () => {
        setItems([]);
        if (!isAuthenticated) {
            localStorage.removeItem('guest_cart');
        }
    };

    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
    const totalAmount = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const getCartTotal = () => totalAmount;

    const value: CartContextType = {
        items,
        cart: items,
        totalItems,
        totalAmount,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getCartTotal,
        isLoading,
        isAuthenticated,
    };

    return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
}
