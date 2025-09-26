# Role-Based Sidebar Navigation

## Overview
The sidebar now dynamically displays navigation items based on the logged-in user's role. This ensures each user only sees relevant navigation options while maintaining proper session handling.

## How It Works

### 1. Session-Safe User Access
The sidebar uses `usePage<SharedData>().props` to access user data, which ensures the user session is properly maintained:

```tsx
const { auth } = usePage<SharedData>().props;
const user = auth.user;
```

### 2. Role-Based Navigation Items
Navigation items are dynamically generated based on the user's role:

**Seller/Artisan Navigation:**
- Dashboard
- My Products (`/seller/products`)
- Orders (`/seller/orders`)
- Analytics (`/seller/analytics`)

**Administrator Navigation:**
- Dashboard
- Manage Users (`/admin/users`)
- System Reports (`/admin/reports`)
- Settings (`/admin/settings`)

**Buyer Navigation:**
- Dashboard
- Browse Products (`/products`)
- My Orders (`/buyer/orders`)
- Wishlist (`/buyer/wishlist`)

### 3. Middleware Protection
All role-specific routes are protected by the `role` middleware:

```php
Route::middleware(['role:seller'])->group(function () {
    // Seller routes...
});

Route::middleware(['role:administrator'])->group(function () {
    // Admin routes...
});

Route::middleware(['role:buyer'])->group(function () {
    // Buyer routes...
});
```

## Key Benefits

### ✅ **Session Maintained**
- Uses Inertia's `usePage()` to access user data
- No separate API calls that might break session
- User authentication state is preserved

### ✅ **Role-Based Access**
- Users only see navigation items relevant to their role
- Automatic route protection via middleware
- Clean, focused user experience

### ✅ **Dynamic Updates**
- Navigation automatically updates if user role changes
- No manual refresh required
- Reactive to authentication state

## Adding New Navigation Items

To add new navigation items for a specific role:

1. **Add the route** in `routes/web.php`:
```php
Route::middleware(['role:seller'])->group(function () {
    Route::get('/seller/new-feature', function () {
        return Inertia::render('seller/new-feature');
    })->name('seller.new-feature');
});
```

2. **Update the sidebar function** in `app-sidebar.tsx`:
```tsx
case 'seller':
    return [
        // existing items...
        {
            title: 'New Feature',
            href: '/seller/new-feature',
            icon: NewFeatureIcon,
        },
    ];
```

3. **Create the page component** in `resources/js/pages/seller/new-feature.tsx`

## Troubleshooting

### Issue: "Users feel like they don't have a session"
**Solution:** Always use `usePage<SharedData>().props` to access user data instead of making separate API calls or using external state management.

### Issue: Navigation items not updating
**Solution:** Ensure you're using the proper TypeScript interfaces and that the user role is being passed correctly through the Inertia page props.

### Issue: Routes not accessible
**Solution:** Verify that the routes are properly protected with the correct role middleware and that the user has the appropriate role.

## Security Features
- All navigation items are backed by middleware-protected routes
- Users cannot access routes they don't have permission for
- Role checking happens on both frontend (UI) and backend (routes)
- Session validation ensures only authenticated users see role-specific navigation