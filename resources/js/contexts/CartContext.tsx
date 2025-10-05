import React, { createContext, useContext, useEffect, useState } from 'react';
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
    stock_quantity: number; // Alias for max_quantity
}

interface CartContextType {
    items: CartItem[];
    cart: CartItem[]; // Alias for items
    totalItems: number;
    totalAmount: number;
    addToCart: (product: any, quantity?: number) => void;
    removeFromCart: (productId: number) => void;
    updateQuantity: (productId: number, quantity: number) => void;
    clearCart: () => void;
    getCartTotal: () => number; // Alias for totalAmount
    isLoading: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
    const [items, setItems] = useState<CartItem[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    // Load cart from localStorage on mount
    useEffect(() => {
        const savedCart = localStorage.getItem('cart');
        if (savedCart) {
            try {
                const parsedCart = JSON.parse(savedCart);
                // Ensure prices are numbers when loading from localStorage
                const normalizedCart = parsedCart.map((item: CartItem) => ({
                    ...item,
                    price: parseFloat(item.price.toString()) || 0
                }));
                setItems(normalizedCart);
            } catch (error) {
                console.error('Error loading cart from localStorage:', error);
                localStorage.removeItem('cart');
            }
        }
    }, []);

    // Save cart to localStorage whenever items change
    useEffect(() => {
        localStorage.setItem('cart', JSON.stringify(items));
    }, [items]);

    const addToCart = (product: any, quantity: number = 1) => {
        setIsLoading(true);
        
        try {
            setItems(currentItems => {
                const existingItem = currentItems.find(item => item.product_id === product.id);
                
                if (existingItem) {
                    // Update quantity if item already exists
                    const newQuantity = Math.min(existingItem.quantity + quantity, product.quantity || 999);
                    return currentItems.map(item =>
                        item.product_id === product.id
                            ? { ...item, quantity: newQuantity }
                            : item
                    );
                } else {
                    // Add new item to cart
                    const newItem: CartItem = {
                        id: Date.now(), // temporary ID
                        product_id: product.id,
                        name: product.name,
                        price: parseFloat(product.price) || 0,
                        quantity: Math.min(quantity, product.quantity || 999),
                        primary_image: product.primary_image,
                        seller: product.seller,
                        max_quantity: product.quantity || 999,
                        stock_quantity: product.quantity || 999, // Alias for max_quantity
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
        setItems(currentItems => currentItems.filter(item => item.product_id !== productId));
    };

    const updateQuantity = (productId: number, quantity: number) => {
        if (quantity <= 0) {
            removeFromCart(productId);
            return;
        }

        setItems(currentItems =>
            currentItems.map(item =>
                item.product_id === productId
                    ? { ...item, quantity: Math.min(quantity, item.max_quantity) }
                    : item
            )
        );
    };

    const clearCart = () => {
        setItems([]);
    };

    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
    const totalAmount = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    const getCartTotal = () => totalAmount;

    const value: CartContextType = {
        items,
        cart: items, // Alias for backward compatibility
        totalItems,
        totalAmount,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getCartTotal,
        isLoading,
    };

    return (
        <CartContext.Provider value={value}>
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
}