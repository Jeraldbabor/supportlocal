import { Product } from '@/types';
import React, { createContext, useContext, useEffect, useState } from 'react';

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
    addToCart: (product: Product, quantity?: number) => Promise<void>;
    removeFromCart: (productId: number) => Promise<void>;
    updateQuantity: (productId: number, quantity: number) => Promise<void>;
    clearCart: () => Promise<void>;
    getCartTotal: () => number;
    isLoading: boolean;
    isAuthenticated: boolean;
    refreshCart: () => Promise<void>;
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

        setIsAuthenticated(nowAuthenticated);

        // If user just logged in, transfer guest cart and clear profile dismissal
        if (!wasAuthenticated && nowAuthenticated && !hasTransferredCart) {
            console.log('[CartContext] User just logged in, initiating cart transfer...');
            // Clear profile completion banner dismissal for new users
            localStorage.removeItem('profile_completion_banner_dismissed');
            transferGuestCartToBackend();
        } else if (nowAuthenticated && !wasAuthenticated) {
            // Load authenticated cart
            loadCart();
        }
    }, [authProp]);

    // Initial cart load
    useEffect(() => {
        loadCart();
    }, [isAuthenticated]);

    // Listen for cart-updated events from other components
    useEffect(() => {
        const handleCartUpdate = () => {
            console.log('[CartContext] Received cart-updated event, refreshing cart...');
            loadCart();
        };

        window.addEventListener('cart-updated', handleCartUpdate);
        return () => window.removeEventListener('cart-updated', handleCartUpdate);
    }, [isAuthenticated]);

    // Transfer guest cart to backend when user logs in
    const transferGuestCartToBackend = async () => {
        const guestCart = localStorage.getItem('guest_cart');

        if (!guestCart) {
            console.log('[CartContext] No guest cart to transfer');
            setHasTransferredCart(true);
            return;
        }

        try {
            const cartItems = JSON.parse(guestCart);

            if (cartItems.length === 0) {
                console.log('[CartContext] Guest cart is empty');
                localStorage.removeItem('guest_cart');
                setHasTransferredCart(true);
                return;
            }

            console.log('[CartContext] Transferring', cartItems.length, 'items to backend');

            const response = await fetch('/api/cart/transfer', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify({ items: cartItems }),
            });

            const result = await response.json();

            if (response.ok) {
                console.log('[CartContext] Cart transfer successful!');
                localStorage.removeItem('guest_cart');
                setHasTransferredCart(true);

                // Reload page to show transferred cart
                window.location.reload();
            } else {
                console.error('[CartContext] Cart transfer failed:', result);
                setHasTransferredCart(true);
            }
        } catch (error) {
            console.error('[CartContext] Error transferring cart:', error);
            setHasTransferredCart(true);
        }
    };

    // Load cart based on authentication status
    const loadCart = async () => {
        if (isAuthenticated) {
            await loadAuthenticatedCart();
        } else {
            loadGuestCart();
        }
    };

    // Load cart from backend (authenticated users)
    const loadAuthenticatedCart = async () => {
        try {
            const response = await fetch('/api/buyer/cart', {
                headers: { Accept: 'application/json' },
            });

            if (response.ok) {
                const data = await response.json();
                setItems(data.items || []);
                updateCartBadge(data.items || []);
            }
        } catch (error) {
            console.error('[CartContext] Error loading authenticated cart:', error);
        }
    };

    // Load cart from localStorage (guest users)
    const loadGuestCart = () => {
        const savedCart = localStorage.getItem('guest_cart');
        if (savedCart) {
            try {
                const parsedCart = JSON.parse(savedCart);
                setItems(parsedCart);
                updateCartBadge(parsedCart);
            } catch (error) {
                console.error('[CartContext] Error loading guest cart:', error);
                localStorage.removeItem('guest_cart');
            }
        } else {
            setItems([]);
            updateCartBadge([]);
        }
    };

    // Save guest cart to localStorage
    const saveGuestCart = (cartItems: CartItem[]) => {
        localStorage.setItem('guest_cart', JSON.stringify(cartItems));
        updateCartBadge(cartItems);
    };

    // Update cart badge count
    const updateCartBadge = (cartItems: CartItem[]) => {
        const count = cartItems.reduce((sum: number, item: CartItem) => sum + item.quantity, 0);
        localStorage.setItem('cart_item_count', count.toString());
        window.dispatchEvent(new CustomEvent('cart-updated', { detail: { count } }));
    };

    // Add to cart (works for both guests and authenticated users)
    const addToCart = async (product: Product, quantity: number = 1) => {
        setIsLoading(true);

        try {
            if (isAuthenticated) {
                await addToCartAuthenticated(product, quantity);
            } else {
                addToCartGuest(product, quantity);
            }
        } catch (error) {
            console.error('[CartContext] Error adding to cart:', error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    // Add to cart for authenticated users (API call)
    const addToCartAuthenticated = async (product: Product, quantity: number) => {
        const response = await fetch('/api/buyer/cart/add', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
            },
            body: JSON.stringify({
                product_id: product.id,
                quantity: quantity,
            }),
        });

        if (response.ok) {
            const result = await response.json();
            console.log('[CartContext] Added to cart (authenticated):', result);
            await loadAuthenticatedCart();
        } else {
            const error = await response.json();
            throw new Error(error.message || 'Failed to add to cart');
        }
    };

    // Add to cart for guest users (localStorage)
    const addToCartGuest = (product: Product, quantity: number) => {
        const existingItem = items.find((item) => item.product_id === product.id);

        let updatedCart: CartItem[];

        if (existingItem) {
            const newQuantity = Math.min(existingItem.quantity + quantity, product.quantity || 999);
            updatedCart = items.map((item) => (item.product_id === product.id ? { ...item, quantity: newQuantity } : item));
        } else {
            const newItem: CartItem = {
                id: Date.now(),
                product_id: product.id,
                name: product.name,
                price: typeof product.price === 'string' ? parseFloat(product.price) : product.price || 0,
                quantity: Math.min(quantity, product.quantity || 999),
                primary_image: product.primary_image || '',
                seller: product.seller,
                max_quantity: product.quantity || 999,
                stock_quantity: product.quantity || 999,
            };
            updatedCart = [...items, newItem];
        }

        setItems(updatedCart);
        saveGuestCart(updatedCart);
        console.log('[CartContext] Added to cart (guest):', updatedCart);
    };

    // Remove from cart
    const removeFromCart = async (productId: number) => {
        setIsLoading(true);

        try {
            if (isAuthenticated) {
                await removeFromCartAuthenticated(productId);
            } else {
                removeFromCartGuest(productId);
            }
        } finally {
            setIsLoading(false);
        }
    };

    // Remove from cart for authenticated users
    const removeFromCartAuthenticated = async (productId: number) => {
        const response = await fetch('/api/buyer/cart/remove', {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
            },
            body: JSON.stringify({ product_id: productId }),
        });

        if (response.ok) {
            await loadAuthenticatedCart();
        }
    };

    // Remove from cart for guest users
    const removeFromCartGuest = (productId: number) => {
        const updatedCart = items.filter((item) => item.product_id !== productId);
        setItems(updatedCart);
        saveGuestCart(updatedCart);
    };

    // Update quantity
    const updateQuantity = async (productId: number, quantity: number) => {
        if (quantity <= 0) {
            await removeFromCart(productId);
            return;
        }

        setIsLoading(true);

        try {
            if (isAuthenticated) {
                await updateQuantityAuthenticated(productId, quantity);
            } else {
                updateQuantityGuest(productId, quantity);
            }
        } finally {
            setIsLoading(false);
        }
    };

    // Update quantity for authenticated users
    const updateQuantityAuthenticated = async (productId: number, quantity: number) => {
        const response = await fetch('/api/buyer/cart/update', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
            },
            body: JSON.stringify({ product_id: productId, quantity }),
        });

        if (response.ok) {
            await loadAuthenticatedCart();
        }
    };

    // Update quantity for guest users
    const updateQuantityGuest = (productId: number, quantity: number) => {
        const updatedCart = items.map((item) =>
            item.product_id === productId ? { ...item, quantity: Math.min(quantity, item.max_quantity) } : item,
        );
        setItems(updatedCart);
        saveGuestCart(updatedCart);
    };

    // Clear cart
    const clearCart = async () => {
        setIsLoading(true);

        try {
            if (isAuthenticated) {
                await clearCartAuthenticated();
            } else {
                clearCartGuest();
            }
        } finally {
            setIsLoading(false);
        }
    };

    // Clear cart for authenticated users
    const clearCartAuthenticated = async () => {
        const response = await fetch('/api/buyer/cart/clear', {
            method: 'DELETE',
            headers: {
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
            },
        });

        if (response.ok) {
            setItems([]);
            updateCartBadge([]);
        }
    };

    // Clear cart for guest users
    const clearCartGuest = () => {
        setItems([]);
        localStorage.removeItem('guest_cart');
        updateCartBadge([]);
    };

    // Refresh cart
    const refreshCart = async () => {
        await loadCart();
    };

    // Calculate totals
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
        refreshCart,
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
