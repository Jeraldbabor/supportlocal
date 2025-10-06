# Customer Management Feature for Sellers/Artisans

This feature allows sellers and artisans to view and manage their customers, including customer details and order history.

## Features

### 1. Customer Listing
- **Route**: `/seller/customers`
- **View**: List of all customers who have placed orders with the seller
- **Features**:
  - Search customers by name, email, or phone number
  - Sort by name, email, total orders, total spent, or last order date
  - Pagination support
  - Statistics overview (total customers, revenue, average order value, repeat customers)
  - Customer avatars and contact information
  - Quick access to customer details

### 2. Customer Details
- **Route**: `/seller/customers/{customer}`
- **View**: Detailed customer profile and order summary
- **Features**:
  - Customer profile information (name, email, phone, address)
  - Customer statistics (total orders, total spent, average order value)
  - Order status breakdown
  - Favorite products (most purchased items)
  - Recent orders list
  - Link to view all customer orders

### 3. Customer Order History
- **Route**: `/seller/customers/{customer}/orders`
- **View**: Complete order history for a specific customer
- **Features**:
  - Filter orders by status
  - Sort by date, total amount, or status
  - Detailed order information with product images
  - Order item summaries
  - Links to individual order details
  - Pagination support

## Navigation

The customer management feature is accessible through the seller sidebar navigation:
- **Dashboard** → **Customers**
- Icon: Users icon
- Position: Between "Orders" and "Analytics"

## Technical Implementation

### Backend (Laravel)

#### Controller
- **File**: `app/Http/Controllers/Seller/CustomerController.php`
- **Methods**:
  - `index()`: List customers with statistics and filtering
  - `show()`: Show customer details and recent orders
  - `orders()`: Show customer's complete order history

#### Routes
- **File**: `routes/web.php`
- **Routes**:
  ```php
  Route::get('/seller/customers', [CustomerController::class, 'index'])->name('seller.customers');
  Route::get('/seller/customers/{customer}', [CustomerController::class, 'show'])->name('seller.customers.show');
  Route::get('/seller/customers/{customer}/orders', [CustomerController::class, 'orders'])->name('seller.customers.orders');
  ```

#### Models
- **Updated**: `app/Models/User.php`
- **Added relationships**:
  - `orders()`: Get orders where user is the buyer
  - `sellerOrders()`: Get orders where user is the seller

### Frontend (React/TypeScript)

#### Components
1. **Customer Index**: `resources/js/Pages/seller/customers/index.tsx`
   - Customer listing with search and sorting
   - Statistics cards
   - Pagination

2. **Customer Details**: `resources/js/Pages/seller/customers/show.tsx`
   - Customer profile information
   - Statistics overview
   - Favorite products
   - Recent orders

3. **Customer Orders**: `resources/js/Pages/seller/customers/orders.tsx`
   - Complete order history
   - Filtering and sorting
   - Order details with product images

#### Navigation
- **Updated**: `resources/js/components/app-sidebar.tsx`
- **Added**: "Customers" menu item for sellers

## Data Flow

### Customer Listing
1. Get all buyers who have placed orders with the current seller
2. Calculate aggregate statistics (total orders, total spent)
3. Add computed fields (last order date, last order status)
4. Apply search and sorting filters
5. Return paginated results with statistics

### Customer Details
1. Verify customer has orders with the seller
2. Get customer's orders with the seller (with product details)
3. Calculate customer-specific statistics
4. Get order status breakdown
5. Find favorite products (most ordered items)
6. Return customer data with computed statistics

### Order History
1. Verify customer relationship with seller
2. Get all customer orders with the seller
3. Apply status and sorting filters
4. Include order items and product details
5. Return paginated order history

## Security

- **Authorization**: Only sellers can access their customer data
- **Data Isolation**: Sellers can only see customers who have ordered from them
- **Route Protection**: All routes are protected by seller role middleware
- **Customer Verification**: Each request verifies the customer has orders with the seller

## Usage Examples

### View All Customers
Navigate to `/seller/customers` to see:
- List of all customers
- Search and filter options
- Customer statistics
- Quick actions

### View Customer Details
Click on a customer to see:
- Customer profile
- Order statistics
- Favorite products
- Recent order history

### View Customer Orders
From customer details, click "View All Orders" to see:
- Complete order history
- Filter by order status
- Sort by various criteria
- Detailed order information

## Benefits

1. **Customer Relationship Management**: Better understanding of customer behavior
2. **Business Insights**: Track customer value and order patterns
3. **Customer Service**: Quick access to customer information and order history
4. **Marketing Opportunities**: Identify repeat customers and favorite products
5. **Order Management**: Easy navigation from customer to specific orders

## Future Enhancements

- Customer notes and tags
- Customer communication history
- Export customer data
- Customer segmentation
- Advanced analytics and reporting
- Email marketing integration