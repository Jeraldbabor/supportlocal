# Fix Remaining /storage/ References

## Quick Fix Command

To fix all remaining `/storage/` references in frontend files, use find and replace:

**In VS Code/Cursor:**
1. Press `Ctrl+Shift+H` (or `Cmd+Shift+H` on Mac)
2. Search for: `/storage/`
3. Replace with: `/images/`
4. Files to search: `resources/js/**/*.tsx`
5. Review and replace all

## Files That Still Need Fixing

Based on grep results, these files still have `/storage/` references:

### Buyer Pages:
- `resources/js/pages/buyer/sellers/Show.tsx`
- `resources/js/pages/buyer/sellers/Index.tsx`
- `resources/js/pages/buyer/orders/show.tsx`
- `resources/js/pages/buyer/orders/index.tsx`
- `resources/js/pages/buyer/Checkout.tsx`
- `resources/js/pages/buyer/Cart.tsx`

### Public/Shared Pages:
- `resources/js/pages/Products.tsx`
- `resources/js/pages/Artisans.tsx`
- `resources/js/pages/ArtisanProfile.tsx`
- `resources/js/pages/GuestCheckout.tsx`
- `resources/js/pages/Cart.tsx`

### Seller Pages:
- `resources/js/pages/seller/products/ProductRatings.tsx`
- `resources/js/pages/seller/products/Index.tsx`
- `resources/js/pages/seller/products/Show.tsx`
- `resources/js/pages/seller/products/Edit.tsx`
- `resources/js/pages/seller/customers/show.tsx`
- `resources/js/pages/seller/customers/orders.tsx`

### Components:
- `resources/js/components/AddToCartModal.tsx`
- `resources/js/pages/Wishlist/Index.tsx`

### Admin Pages:
- `resources/js/pages/admin/settings/index.tsx`

## Pattern to Replace

All instances should follow this pattern:
- **Before**: `src={`/storage/${variable}`}`
- **After**: `src={`/images/${variable}`}`

- **Before**: `src={/storage/${variable}}`
- **After**: `src={/images/${variable}}`

## Already Fixed ✅

- ✅ `resources/js/pages/buyer/products/Index.tsx`
- ✅ `resources/js/pages/buyer/products/Show.tsx`
- ✅ `resources/js/pages/seller/orders/show.tsx`
- ✅ `resources/js/pages/seller/orders/index.tsx`
- ✅ All controllers now use `ImageHelper::url()`

## Automated Fix Script

If you want to batch fix all files, you can use this command in Git Bash or PowerShell:

```bash
# Navigate to project root
cd c:\xampp1\htdocs\supportlocal

# Replace all /storage/ with /images/ in tsx files
find resources/js -name "*.tsx" -type f -exec sed -i 's|/storage/${|/images/${|g' {} +
find resources/js -name "*.tsx" -type f -exec sed -i 's|/storage/\([^$]|/images/\1|g' {} +
```

**Note**: Review changes before committing as some edge cases might need manual fixes.
