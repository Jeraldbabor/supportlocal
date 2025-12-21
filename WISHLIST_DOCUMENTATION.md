# Wishlist Feature Documentation

## Overview

The wishlist feature allows both **guest users** and **authenticated buyers** to save products they're interested in for later purchase. Guest wishlists are stored using session tokens and automatically merge with user accounts upon login.

## Features

- ✅ **Guest Support**: Guests can add products to wishlist without an account
- ✅ **User Support**: Authenticated users have persistent wishlists
- ✅ **Automatic Merging**: Guest wishlists merge into user accounts on login
- ✅ **Duplicate Prevention**: Each product can only be added once per user/guest
- ✅ **Session Management**: Guest wishlists use secure session tokens
- ✅ **Full CRUD**: Add, remove, view, and clear wishlist items
- ✅ **API Endpoints**: JSON responses for AJAX interactions

## Database Structure

### Table: `wishlist_items`

| Column | Type | Description |
|--------|------|-------------|
| id | bigint | Primary key |
| user_id | bigint (nullable) | Foreign key to users table |
| product_id | bigint | Foreign key to products table |
| guest_token | string (nullable) | Session token for guest users |
| created_at | timestamp | When item was added |
| updated_at | timestamp | Last update time |

**Unique Constraints:**
- `[user_id, product_id]` - Prevents duplicate products per user
- `[guest_token, product_id]` - Prevents duplicate products per guest

## Backend Components

### Models

#### `WishlistItem` Model
Located: `app/Models/WishlistItem.php`

**Relationships:**
- `user()` - BelongsTo User
- `product()` - BelongsTo Product

**Scopes:**
- `forUser($userId)` - Filter by authenticated user
- `forGuest($guestToken)` - Filter by guest token

#### Extended `User` Model
New relationships:
- `wishlistItems()` - HasMany WishlistItem
- `wishlist()` - BelongsToMany Product through wishlist_items

#### Extended `Product` Model
New relationships:
- `wishlistItems()` - HasMany WishlistItem
- `wishlistedBy()` - BelongsToMany User through wishlist_items

### Helper Class

#### `WishlistHelper`
Located: `app/Helpers/WishlistHelper.php`

**Methods:**

```php
// Get guest token (creates if doesn't exist)
WishlistHelper::getGuestToken(): string

// Get all wishlist items
WishlistHelper::getItems(): Collection

// Get wishlist count
WishlistHelper::getCount(): int

// Check if product is in wishlist
WishlistHelper::hasProduct(int $productId): bool

// Add product to wishlist
WishlistHelper::addProduct(int $productId): bool

// Remove product from wishlist
WishlistHelper::removeProduct(int $productId): bool

// Clear all wishlist items
WishlistHelper::clear(): bool

// Merge guest wishlist with user account
WishlistHelper::mergeGuestWishlist(int $userId): void

// Get array of product IDs in wishlist
WishlistHelper::getProductIds(): array
```

### Controller

#### `WishlistController`
Located: `app/Http/Controllers/WishlistController.php`

**Routes & Actions:**

| Method | Route | Action | Description |
|--------|-------|--------|-------------|
| GET | `/wishlist` | index() | Display wishlist page |
| POST | `/wishlist/add` | store() | Add product to wishlist |
| DELETE | `/wishlist/remove` | destroy() | Remove product from wishlist |
| DELETE | `/wishlist/clear` | clear() | Clear all wishlist items |
| POST | `/wishlist/toggle` | toggle() | Toggle product in/out of wishlist (JSON) |
| GET | `/wishlist/count` | count() | Get wishlist count (JSON) |
| POST | `/wishlist/check` | check() | Check multiple products (JSON) |

### Event Listener

#### `MergeGuestWishlist`
Located: `app/Listeners/MergeGuestWishlist.php`

Automatically merges guest wishlist items into user account when they log in.

Registered in: `app/Providers/AppServiceProvider.php`

```php
Event::listen(Login::class, MergeGuestWishlist::class);
```

## Frontend Component

### Wishlist Page
Located: `resources/js/pages/Wishlist/Index.tsx`

**Features:**
- Grid display of wishlist items
- Product images with sale badges
- Quick add to cart
- Remove individual items
- Clear all items
- Empty state with call-to-action

## API Usage Examples

### Add to Wishlist
```javascript
// Using Inertia
router.post('/wishlist/add', {
    product_id: 123
});

// Using fetch
fetch('/wishlist/add', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'X-CSRF-TOKEN': token
    },
    body: JSON.stringify({ product_id: 123 })
});
```

### Toggle Wishlist (AJAX-friendly)
```javascript
fetch('/wishlist/toggle', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'X-CSRF-TOKEN': token
    },
    body: JSON.stringify({ product_id: 123 })
})
.then(res => res.json())
.then(data => {
    // data.in_wishlist - boolean
    // data.count - total items in wishlist
    // data.message - success message
});
```

### Get Wishlist Count
```javascript
fetch('/wishlist/count')
    .then(res => res.json())
    .then(data => {
        console.log(`Wishlist has ${data.count} items`);
    });
```

### Check Multiple Products
```javascript
fetch('/wishlist/check', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'X-CSRF-TOKEN': token
    },
    body: JSON.stringify({
        product_ids: [1, 2, 3, 4, 5]
    })
})
.then(res => res.json())
.then(data => {
    // data.in_wishlist = { 1: true, 2: false, 3: true, ... }
});
```

## Usage in Blade/Inertia

### Check if Product is in Wishlist
```php
use App\Helpers\WishlistHelper;

// In controller
$inWishlist = WishlistHelper::hasProduct($productId);

// Pass to view
return Inertia::render('Product/Show', [
    'product' => $product,
    'inWishlist' => $inWishlist
]);
```

### Get Wishlist Count for Header
```php
use App\Helpers\WishlistHelper;

// In middleware or shared data
Inertia::share([
    'wishlistCount' => WishlistHelper::getCount()
]);
```

## Database Migration

The migration file is located at:
`database/migrations/2025_12_19_015747_create_wishlist_items_table.php`

To run the migration:
```bash
php artisan migrate
```

## How It Works

### For Guest Users

1. **First Visit**: When a guest adds their first item, a unique UUID token is generated and stored in the session
2. **Subsequent Adds**: All wishlist items are associated with this guest token
3. **Persistence**: The wishlist persists across page loads using the session
4. **On Login**: The guest wishlist is automatically merged into the user's account

### For Authenticated Users

1. **Direct Database Storage**: All wishlist items are stored with the user's ID
2. **Persistent**: Wishlist persists across sessions and devices
3. **No Duplicates**: Unique constraints prevent duplicate products

### Guest → User Transition

When a guest logs in:

1. The `Login` event is fired by Laravel
2. `MergeGuestWishlist` listener is triggered
3. Guest wishlist items are retrieved using the session token
4. Each item is added to the user's wishlist (duplicates are ignored)
5. Guest items are deleted
6. Session token is removed

## Testing

### Manual Testing Steps

1. **As Guest:**
   - Visit `/products` and add items to wishlist
   - Visit `/wishlist` to see items
   - Check session storage for guest token
   - Remove items and verify they're gone

2. **Guest to User:**
   - Add items to wishlist as guest
   - Register or login
   - Verify guest items appear in user's wishlist
   - Verify guest token is removed from session

3. **As Authenticated User:**
   - Login and add items to wishlist
   - Logout and login again
   - Verify wishlist persists

4. **Toggle Functionality:**
   - Test AJAX toggle endpoint
   - Verify count updates correctly
   - Verify in_wishlist state is accurate

### Unit Test Example

```php
use App\Helpers\WishlistHelper;
use App\Models\Product;

/** @test */
public function guest_can_add_product_to_wishlist()
{
    $product = Product::factory()->create();
    
    $result = WishlistHelper::addProduct($product->id);
    
    $this->assertTrue($result);
    $this->assertTrue(WishlistHelper::hasProduct($product->id));
    $this->assertEquals(1, WishlistHelper::getCount());
}

/** @test */
public function guest_wishlist_merges_on_login()
{
    $product = Product::factory()->create();
    $user = User::factory()->create();
    
    // Add as guest
    WishlistHelper::addProduct($product->id);
    
    // Login
    $this->actingAs($user);
    event(new \Illuminate\Auth\Events\Login('web', $user, false));
    
    // Verify merged
    $this->assertTrue(WishlistHelper::hasProduct($product->id));
    $this->assertEquals(1, $user->wishlistItems()->count());
}
```

## Security Considerations

1. **Guest Tokens**: Stored in session, not exposed to client
2. **Validation**: All product IDs are validated before adding
3. **Authorization**: Products must be active to be added
4. **SQL Injection**: Protected by Eloquent ORM
5. **CSRF Protection**: All POST/DELETE routes require CSRF token

## Performance

- **Indexed**: `guest_token` column is indexed for fast lookups
- **Eager Loading**: Relationships are eager loaded to prevent N+1 queries
- **Unique Constraints**: Database-level duplicate prevention
- **Lightweight**: Minimal session storage (just UUID for guests)

## Future Enhancements

Potential improvements:
- Email notifications for price drops
- Wishlist sharing functionality
- Move items from wishlist to cart in bulk
- Wishlist analytics for sellers
- Product availability notifications
- Multiple wishlists per user
- Public/private wishlist visibility

## Support

For issues or questions:
1. Check this documentation
2. Review the code comments in helper and controller files
3. Test with Postman/Insomnia for API debugging
4. Check Laravel logs in `storage/logs/`
