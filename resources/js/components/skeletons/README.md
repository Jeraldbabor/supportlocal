# Skeleton Loading Components

A comprehensive skeleton loading system for the application. These components provide smooth loading states that match your page layouts.

## Available Components

### Base Component

- **`Skeleton`** - Basic skeleton element with pulse animation

### Specialized Components

- **`ProductCardSkeleton`** - Skeleton for product cards
- **`ProductListSkeleton`** - Grid of product card skeletons
- **`DashboardStatsSkeleton`** - Dashboard statistics cards skeleton
- **`TableSkeleton`** - Table with rows and columns skeleton
- **`PageHeaderSkeleton`** - Page title and description skeleton
- **`FormSkeleton`** - Form fields skeleton
- **`ProfileSkeleton`** - User profile skeleton
- **`PageSkeleton`** - Full page skeleton (used automatically during page transitions)

## Usage

### Automatic Page Loading

The `PageLoader` component is automatically integrated into the app and shows a skeleton during page transitions. No additional setup needed!

### Manual Usage in Components

```tsx
import { ProductListSkeleton, DashboardStatsSkeleton } from '@/components/skeletons';

// In your component
export default function ProductsPage({ products, isLoading }) {
    if (isLoading) {
        return <ProductListSkeleton count={8} />;
    }

    return (
        <div className="grid grid-cols-4">
            {products.map((product) => (
                <ProductCard key={product.id} product={product} />
            ))}
        </div>
    );
}
```

### Dashboard Example

```tsx
import { DashboardStatsSkeleton, TableSkeleton } from '@/components/skeletons';

export default function Dashboard({ stats, orders, isLoading }) {
    if (isLoading) {
        return (
            <div className="space-y-6">
                <DashboardStatsSkeleton count={4} />
                <TableSkeleton rows={10} columns={5} />
            </div>
        );
    }

    return (
        // Your actual dashboard content
    );
}
```

### Form Example

```tsx
import { FormSkeleton } from '@/components/skeletons';

export default function EditProfile({ user, isLoading }) {
    if (isLoading) {
        return <FormSkeleton fields={6} />;
    }

    return (
        // Your form
    );
}
```

### Custom Skeleton

```tsx
import { Skeleton } from '@/components/ui/skeleton';

export default function CustomComponent({ isLoading }) {
    if (isLoading) {
        return (
            <div className="space-y-4">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-32 w-full" />
                <Skeleton className="h-8 w-3/4" />
            </div>
        );
    }

    return (
        // Your content
    );
}
```

## Component Props

### ProductListSkeleton

- `count?: number` - Number of product cards to show (default: 8)

### DashboardStatsSkeleton

- `count?: number` - Number of stat cards to show (default: 4)

### TableSkeleton

- `rows?: number` - Number of table rows (default: 5)
- `columns?: number` - Number of table columns (default: 4)

### FormSkeleton

- `fields?: number` - Number of form fields (default: 5)

### Skeleton

- `className?: string` - Additional CSS classes
- All standard div props

## Styling

All skeleton components use Tailwind CSS and respect your theme (light/dark mode). They automatically use the `muted` background color and `animate-pulse` for the loading animation.

## Best Practices

1. **Show skeletons immediately** - Don't wait for data, show skeletons right away
2. **Match the layout** - Use skeleton components that match your actual content structure
3. **Appropriate counts** - Use realistic counts (e.g., 8-12 products, not 100)
4. **Fast transitions** - Skeletons appear after 150ms delay to avoid flickering on fast loads
