import { Heart } from 'lucide-react';
import { useState } from 'react';
import { useWishlist } from '../hooks/useWishlist';

interface WishlistButtonProps {
    productId: number;
    initialInWishlist?: boolean;
    size?: 'sm' | 'md' | 'lg';
    variant?: 'icon' | 'button' | 'icon-filled';
    className?: string;
    showCount?: boolean;
    onToggle?: (inWishlist: boolean) => void;
}

export default function WishlistButton({
    productId,
    initialInWishlist = false,
    size = 'md',
    variant = 'icon',
    className = '',
    showCount = false,
    onToggle,
}: WishlistButtonProps) {
    const [inWishlist, setInWishlist] = useState(initialInWishlist);
    const [count, setCount] = useState<number | null>(null);
    const { toggleWishlist, isLoading } = useWishlist();

    const handleClick = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (isLoading) return;

        const result = await toggleWishlist(productId);
        if (result) {
            setInWishlist(result.in_wishlist);
            setCount(result.count);
            onToggle?.(result.in_wishlist);
        }
    };

    // Size classes
    const sizeClasses = {
        sm: 'h-4 w-4',
        md: 'h-5 w-5',
        lg: 'h-6 w-6',
    };

    const buttonSizeClasses = {
        sm: 'p-1.5',
        md: 'p-2',
        lg: 'p-3',
    };

    // Variant styles
    const getVariantClasses = () => {
        switch (variant) {
            case 'button':
                return `inline-flex items-center gap-2 rounded-lg border ${
                    inWishlist
                        ? 'border-red-500 bg-red-50 text-red-600 hover:bg-red-100'
                        : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                } px-4 py-2 font-medium transition-colors`;
            case 'icon-filled':
                return `rounded-full ${buttonSizeClasses[size]} ${
                    inWishlist
                        ? 'bg-red-100 text-red-600 hover:bg-red-200'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                } transition-colors`;
            case 'icon':
            default:
                return `${buttonSizeClasses[size]} ${
                    inWishlist ? 'text-red-600' : 'text-gray-400 hover:text-red-600'
                } transition-colors`;
        }
    };

    const iconClasses = sizeClasses[size];

    return (
        <button
            onClick={handleClick}
            disabled={isLoading}
            className={`${getVariantClasses()} ${className} ${
                isLoading ? 'cursor-wait opacity-50' : ''
            }`}
            aria-label={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
            title={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
        >
            {variant === 'button' ? (
                <>
                    <Heart
                        className={iconClasses}
                        fill={inWishlist ? 'currentColor' : 'none'}
                    />
                    <span>{inWishlist ? 'In Wishlist' : 'Add to Wishlist'}</span>
                    {showCount && count !== null && (
                        <span className="rounded-full bg-gray-200 px-2 py-0.5 text-xs">
                            {count}
                        </span>
                    )}
                </>
            ) : (
                <Heart
                    className={iconClasses}
                    fill={inWishlist ? 'currentColor' : 'none'}
                />
            )}
        </button>
    );
}
