# User Role System Documentation

## Overview
This system implements a three-role user management system for the SupportLocal e-commerce platform with the following roles:
- **Seller/Artisan** - Local artisans who sell products
- **Buyer** - Customers who purchase products
- **Administrator** - System administrators with full access

## Database Schema
The `users` table has been extended with a `role` column:
- Type: ENUM('seller', 'buyer', 'administrator')
- Default: 'buyer'

## User Model Features

### Role Constants
```php
User::ROLE_SELLER = 'seller'
User::ROLE_BUYER = 'buyer'  
User::ROLE_ADMINISTRATOR = 'administrator'
```

### Helper Methods
```php
$user->hasRole('seller')        // Check specific role
$user->isSeller()              // Check if seller/artisan
$user->isBuyer()               // Check if buyer
$user->isAdministrator()       // Check if administrator
$user->getRoleDisplayName()    // Get human-readable role name
```

## Middleware Usage

### Route Protection
Use the `role` middleware to protect routes:

```php
// Single role
Route::middleware(['role:seller'])->group(function () {
    Route::get('/seller/dashboard', [SellerController::class, 'dashboard']);
});

// Multiple roles
Route::middleware(['role:seller,administrator'])->group(function () {
    Route::get('/management', [ManagementController::class, 'index']);
});
```

### Session Management
The middleware automatically stores the user's role in the session:
```php
session('user_role') // Returns current user's role
```

## Registration System
Users can now select their role during registration. The registration form includes:
- Name
- Email
- Password
- Password Confirmation
- **Role Selection** (dropdown with all available roles)

## Default Users
The system comes with three default users (password: 'password'):

1. **Administrator**
   - Email: admin@supportlocal.com
   - Role: administrator

2. **Seller/Artisan**
   - Email: seller@supportlocal.com
   - Role: seller

3. **Buyer**
   - Email: buyer@supportlocal.com
   - Role: buyer

## Example Usage

### In Controllers
```php
public function dashboard()
{
    $user = auth()->user();
    
    if ($user->isSeller()) {
        return view('seller.dashboard');
    } elseif ($user->isBuyer()) {
        return view('buyer.dashboard');
    } else {
        return view('admin.dashboard');
    }
}
```

### In Views
```php
@if(auth()->user()->isAdministrator())
    <div>Admin-only content</div>
@endif

@if(auth()->user()->hasRole('seller'))
    <div>Seller-specific content</div>
@endif
```

## Running the System

1. Run migrations:
```bash
php artisan migrate
```

2. Seed default users:
```bash
php artisan db:seed --class=UserRolesSeeder
```

3. Access the application and register with role selection or login with default users.

## Security Features
- Role validation during registration
- Middleware-based route protection
- Session-based role storage
- Automatic access control with proper error handling (403 Forbidden)