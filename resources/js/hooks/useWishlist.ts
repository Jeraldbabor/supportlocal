import { router } from '@inertiajs/react';
import { useCallback, useState } from 'react';

interface WishlistToggleResponse {
    success: boolean;
    message: string;
    in_wishlist: boolean;
    count: number;
}

interface WishlistCheckResponse {
    in_wishlist: Record<number, boolean>;
}

export function useWishlist() {
    const [isLoading, setIsLoading] = useState(false);

    /**
     * Toggle a product in/out of the wishlist (AJAX)
     */
    const toggleWishlist = useCallback(async (productId: number): Promise<WishlistToggleResponse | null> => {
        setIsLoading(true);
        try {
            const response = await fetch('/wishlist/toggle', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify({ product_id: productId }),
            });

            if (!response.ok) {
                throw new Error('Failed to toggle wishlist');
            }

            const data: WishlistToggleResponse = await response.json();
            return data;
        } catch (error) {
            console.error('Error toggling wishlist:', error);
            return null;
        } finally {
            setIsLoading(false);
        }
    }, []);

    /**
     * Add a product to the wishlist (page reload)
     */
    const addToWishlist = useCallback((productId: number) => {
        router.post(
            '/wishlist/add',
            { product_id: productId },
            {
                preserveScroll: true,
                onSuccess: () => {
                    // Optionally show a success message
                },
            },
        );
    }, []);

    /**
     * Remove a product from the wishlist (page reload)
     */
    const removeFromWishlist = useCallback((productId: number) => {
        router.delete('/wishlist/remove', {
            data: { product_id: productId },
            preserveScroll: true,
            onSuccess: () => {
                // Optionally show a success message
            },
        });
    }, []);

    /**
     * Clear all items from the wishlist
     */
    const clearWishlist = useCallback(() => {
        if (confirm('Are you sure you want to clear your entire wishlist?')) {
            router.delete('/wishlist/clear', {
                preserveScroll: true,
            });
        }
    }, []);

    /**
     * Get wishlist count (AJAX)
     */
    const getWishlistCount = useCallback(async (): Promise<number> => {
        try {
            const response = await fetch('/wishlist/count');
            if (!response.ok) {
                throw new Error('Failed to get wishlist count');
            }
            const data = await response.json();
            return data.count;
        } catch (error) {
            console.error('Error getting wishlist count:', error);
            return 0;
        }
    }, []);

    /**
     * Check if multiple products are in the wishlist (AJAX)
     */
    const checkProducts = useCallback(async (productIds: number[]): Promise<Record<number, boolean>> => {
        try {
            const response = await fetch('/wishlist/check', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify({ product_ids: productIds }),
            });

            if (!response.ok) {
                throw new Error('Failed to check products');
            }

            const data: WishlistCheckResponse = await response.json();
            return data.in_wishlist;
        } catch (error) {
            console.error('Error checking products:', error);
            return {};
        }
    }, []);

    return {
        toggleWishlist,
        addToWishlist,
        removeFromWishlist,
        clearWishlist,
        getWishlistCount,
        checkProducts,
        isLoading,
    };
}
