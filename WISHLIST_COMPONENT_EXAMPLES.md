# Wishlist Button Component Usage Examples

## Basic Usage

### Icon Button (Default)
```tsx
import WishlistButton from '@/components/WishlistButton';

// Simple icon button
<WishlistButton productId={product.id} />
```

### Icon Button with Initial State
```tsx
// If you already know if the product is in the wishlist
<WishlistButton 
    productId={product.id} 
    initialInWishlist={product.in_wishlist} 
/>
```

### Filled Icon Button
```tsx
// Icon with background circle
<WishlistButton 
    productId={product.id}
    variant="icon-filled"
    size="lg"
/>
```

### Full Button with Text
```tsx
// Button with text label
<WishlistButton 
    productId={product.id}
    variant="button"
    showCount={true}
/>
```

## Product Card Integration

```tsx
export default function ProductCard({ product }) {
    return (
        <div className="relative rounded-lg border p-4">
            {/* Wishlist button in top right corner */}
            <div className="absolute right-2 top-2 z-10">
                <WishlistButton 
                    productId={product.id}
                    initialInWishlist={product.in_wishlist}
                    variant="icon-filled"
                    size="md"
                />
            </div>
            
            <img src={product.image} alt={product.name} />
            <h3>{product.name}</h3>
            <p>${product.price}</p>
        </div>
    );
}
```

## Product Detail Page

```tsx
export default function ProductDetail({ product, inWishlist }) {
    const handleWishlistToggle = (isInWishlist: boolean) => {
        console.log(`Product ${isInWishlist ? 'added to' : 'removed from'} wishlist`);
        // Show toast notification, etc.
    };

    return (
        <div>
            <h1>{product.name}</h1>
            
            <div className="flex gap-4">
                <button className="btn-primary">Add to Cart</button>
                
                <WishlistButton 
                    productId={product.id}
                    initialInWishlist={inWishlist}
                    variant="button"
                    onToggle={handleWishlistToggle}
                />
            </div>
        </div>
    );
}
```

## Product Grid with Multiple Products

```tsx
export default function ProductGrid({ products }) {
    return (
        <div className="grid grid-cols-3 gap-4">
            {products.map(product => (
                <div key={product.id} className="relative">
                    <WishlistButton 
                        productId={product.id}
                        variant="icon-filled"
                        className="absolute right-2 top-2"
                    />
                    {/* Product content */}
                </div>
            ))}
        </div>
    );
}
```

## Custom Styling

```tsx
<WishlistButton 
    productId={product.id}
    variant="icon"
    size="lg"
    className="hover:scale-110 transition-transform"
/>
```

## Using the Wishlist Hook Directly

For more control, use the `useWishlist` hook directly:

```tsx
import { useWishlist } from '@/hooks/useWishlist';
import { useState } from 'react';

export default function CustomWishlistComponent({ product }) {
    const { toggleWishlist, isLoading } = useWishlist();
    const [inWishlist, setInWishlist] = useState(false);

    const handleToggle = async () => {
        const result = await toggleWishlist(product.id);
        if (result) {
            setInWishlist(result.in_wishlist);
            // Show success message
            alert(result.message);
        }
    };

    return (
        <button 
            onClick={handleToggle}
            disabled={isLoading}
            className="custom-button"
        >
            {inWishlist ? '❤️ Remove' : '🤍 Add'}
        </button>
    );
}
```

## Checking Multiple Products at Once

```tsx
import { useWishlist } from '@/hooks/useWishlist';
import { useEffect, useState } from 'react';

export default function ProductList({ products }) {
    const { checkProducts } = useWishlist();
    const [wishlistStatus, setWishlistStatus] = useState<Record<number, boolean>>({});

    useEffect(() => {
        // Check all products at once
        const productIds = products.map(p => p.id);
        checkProducts(productIds).then(setWishlistStatus);
    }, [products]);

    return (
        <div>
            {products.map(product => (
                <div key={product.id}>
                    <h3>{product.name}</h3>
                    <WishlistButton 
                        productId={product.id}
                        initialInWishlist={wishlistStatus[product.id] || false}
                    />
                </div>
            ))}
        </div>
    );
}
```

## Component Props Reference

### WishlistButton Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| productId | number | required | The ID of the product |
| initialInWishlist | boolean | false | Initial wishlist state |
| size | 'sm' \| 'md' \| 'lg' | 'md' | Size of the button/icon |
| variant | 'icon' \| 'button' \| 'icon-filled' | 'icon' | Button style variant |
| className | string | '' | Additional CSS classes |
| showCount | boolean | false | Show wishlist count (button variant only) |
| onToggle | (inWishlist: boolean) => void | undefined | Callback when toggled |

### useWishlist Hook Returns

| Method | Type | Description |
|--------|------|-------------|
| toggleWishlist | (productId: number) => Promise<WishlistToggleResponse \| null> | Toggle product in wishlist |
| addToWishlist | (productId: number) => void | Add product (page reload) |
| removeFromWishlist | (productId: number) => void | Remove product (page reload) |
| clearWishlist | () => void | Clear all items |
| getWishlistCount | () => Promise<number> | Get total count |
| checkProducts | (productIds: number[]) => Promise<Record<number, boolean>> | Check multiple products |
| isLoading | boolean | Loading state |
