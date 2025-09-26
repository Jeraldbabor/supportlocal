# Sidebar Button Highlighting

## Overview
The sidebar navigation now automatically highlights the active/current page button, providing clear visual feedback to users about their current location in the application.

## How It Works

### 1. Automatic Active State Detection
The `NavMain` component uses Inertia's `usePage()` to detect the current URL and automatically highlights the corresponding sidebar button:

```tsx
const isItemActive = (item: NavItem): boolean => {
    const currentUrl = page.url;
    const itemHref = typeof item.href === 'string' ? item.href : item.href.url;
    
    // Special handling for dashboard routes
    if (item.title === 'Dashboard') {
        return currentUrl === '/' || 
               currentUrl === '/dashboard' || 
               currentUrl.includes('/dashboard') ||
               currentUrl === itemHref;
    }
    
    // For other routes, check if current URL matches or starts with item href
    if (itemHref === '/') {
        return currentUrl === '/';
    }
    
    return currentUrl === itemHref || currentUrl.startsWith(itemHref + '/');
};
```

### 2. Visual Highlighting Styles
The SidebarMenuButton component uses the following CSS classes for active states:
- `data-[active=true]:bg-sidebar-accent` - Background color
- `data-[active=true]:font-medium` - Font weight
- `data-[active=true]:text-sidebar-accent-foreground` - Text color

### 3. Role-Specific Highlighting
Each user role has its own navigation items that get highlighted:

**Seller Dashboard Example:**
- When on `/seller/dashboard` → "Dashboard" button highlighted
- When on `/seller/products` → "My Products" button highlighted
- When on `/seller/orders` → "Orders" button highlighted

**Admin Dashboard Example:**
- When on `/admin/dashboard` → "Dashboard" button highlighted
- When on `/admin/users` → "Manage Users" button highlighted
- When on `/admin/reports` → "System Reports" button highlighted

**Buyer Dashboard Example:**
- When on `/buyer/dashboard` → "Dashboard" button highlighted
- When on `/products` → "Browse Products" button highlighted
- When on `/buyer/orders` → "My Orders" button highlighted

## Features

### ✅ **Automatic Detection**
- No manual state management required
- Uses Inertia's built-in URL tracking
- Works with browser navigation (back/forward buttons)

### ✅ **Smart Matching**
- Exact URL matches for specific pages
- Prefix matching for sub-routes
- Special handling for dashboard redirects

### ✅ **Visual Feedback**
- Clear background color change
- Bold font weight for active items
- Consistent with design system

### ✅ **Accessibility**
- Uses proper ARIA attributes
- Screen reader friendly
- Keyboard navigation support

## Implementation Details

The highlighting system consists of three main parts:

1. **NavMain Component**: Handles active state detection logic
2. **SidebarMenuButton**: Provides the visual styling
3. **Role-based Navigation**: Each role has specific routes that get highlighted

## Customization

To customize the highlighting colors, update the CSS custom properties:

```css
:root {
  --sidebar-accent: /* Your active background color */;
  --sidebar-accent-foreground: /* Your active text color */;
}
```

Or modify the component's className:

```tsx
<SidebarMenuButton
    className="data-[active=true]:bg-blue-500 data-[active=true]:text-white"
    // ... other props
/>
```

## Troubleshooting

### Issue: Button not highlighting
**Possible Causes:**
1. URL doesn't match the href exactly
2. Special characters in URL not handled
3. Route not defined properly

**Solution:** Check the `isItemActive` function logic and ensure URLs match expected patterns.

### Issue: Multiple buttons highlighted
**Possible Cause:** URL matching logic too broad

**Solution:** Make the URL matching more specific in the `isItemActive` function.

### Issue: Dashboard button not highlighting
**Solution:** The dashboard has special redirect logic, ensure you're testing on the actual role-specific dashboard URL (e.g., `/seller/dashboard`, not just `/dashboard`).

## Testing the Highlighting

1. **Login as different user roles**
2. **Navigate between pages** and observe the sidebar highlighting
3. **Use browser back/forward** buttons to test automatic detection
4. **Check sub-routes** to ensure parent items remain highlighted

The highlighting should work immediately without any additional configuration!