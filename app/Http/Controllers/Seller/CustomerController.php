<?php

namespace App\Http\Controllers\Seller;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class CustomerController extends Controller
{
    /**
     * Display a listing of the seller's customers.
     */
    public function index(Request $request): Response
    {
        $seller = Auth::user();

        // Get query parameters for filtering and sorting
        $search = $request->get('search');
        $sortBy = $request->get('sort', 'total_orders');
        $sortOrder = $request->get('order', 'desc');
        $perPage = $request->get('per_page', 15);

        // Get customers who have placed orders with this seller
        $customersQuery = User::query()
            ->where('role', User::ROLE_BUYER)
            ->whereHas('orders', function ($query) use ($seller) {
                $query->where('seller_id', $seller->id);
            })
            ->withCount(['orders as total_orders' => function ($query) use ($seller) {
                $query->where('seller_id', $seller->id);
            }])
            ->with(['orders' => function ($query) use ($seller) {
                $query->where('seller_id', $seller->id)
                    ->select('user_id', 'total_amount', 'status', 'created_at')
                    ->latest()
                    ->limit(5); // Get a few recent orders for calculations
            }]);

        // Apply search filter
        if ($search) {
            $customersQuery->where(function ($query) use ($search) {
                $query->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhere('phone_number', 'like', "%{$search}%");
            });
        }

        // Apply sorting
        switch ($sortBy) {
            case 'name':
                $customersQuery->orderBy('users.name', $sortOrder);
                break;
            case 'email':
                $customersQuery->orderBy('users.email', $sortOrder);
                break;
            case 'total_spent':
            case 'total_orders':
            case 'last_order':
                // These will be sorted after transformation since they're computed
                break;
            default:
                $customersQuery->orderBy('users.name', $sortOrder);
                break;
        }

        $customers = $customersQuery->paginate($perPage);

        // Get total spent for each customer in a single query
        $customerIds = $customers->pluck('id');
        $totalSpentByCustomer = Order::where('seller_id', $seller->id)
            ->where('status', '!=', Order::STATUS_CANCELLED)
            ->whereIn('user_id', $customerIds)
            ->groupBy('user_id')
            ->selectRaw('user_id, SUM(total_amount) as total_spent')
            ->pluck('total_spent', 'user_id');

        // Add computed fields to each customer
        $customers->getCollection()->transform(function ($customer) use ($totalSpentByCustomer) {
            $customer->last_order_date = $customer->orders->first()?->created_at;
            $customer->last_order_status = $customer->orders->first()?->status;
            $customer->total_spent = $totalSpentByCustomer[$customer->id] ?? 0;

            return $customer;
        });

        // Handle sorting for computed fields after transformation
        if (in_array($sortBy, ['total_orders', 'total_spent', 'last_order'])) {
            $sortField = $sortBy === 'last_order' ? 'last_order_date' : $sortBy;
            $sortedCustomers = $customers->getCollection()->sortBy($sortField, SORT_REGULAR, $sortOrder === 'desc');
            $customers->setCollection($sortedCustomers->values());
        }

        // Get summary statistics
        $totalCustomers = User::where('role', User::ROLE_BUYER)
            ->whereHas('orders', function ($query) use ($seller) {
                $query->where('seller_id', $seller->id);
            })->count();

        $totalRevenue = Order::where('seller_id', $seller->id)
            ->where('status', '!=', Order::STATUS_CANCELLED)
            ->sum('total_amount');

        $averageOrderValue = Order::where('seller_id', $seller->id)
            ->where('status', '!=', Order::STATUS_CANCELLED)
            ->avg('total_amount');

        $repeatCustomers = DB::select('
            SELECT COUNT(*) as count FROM (
                SELECT users.id 
                FROM users 
                INNER JOIN orders ON users.id = orders.user_id 
                WHERE users.role = ? AND orders.seller_id = ? 
                GROUP BY users.id 
                HAVING COUNT(orders.id) > 1
            ) as repeat_customers
        ', [User::ROLE_BUYER, $seller->id])[0]->count;

        return Inertia::render('seller/customers/index', [
            'customers' => $customers,
            'filters' => [
                'search' => $search,
                'sort' => $sortBy,
                'order' => $sortOrder,
                'per_page' => $perPage,
            ],
            'statistics' => [
                'total_customers' => $totalCustomers,
                'total_revenue' => number_format($totalRevenue, 2),
                'average_order_value' => number_format($averageOrderValue ?: 0, 2),
                'repeat_customers' => $repeatCustomers,
                'repeat_rate' => $totalCustomers > 0 ? round(($repeatCustomers / $totalCustomers) * 100, 1) : 0,
            ],
        ]);
    }

    /**
     * Show detailed information about a specific customer.
     */
    public function show(User $customer): Response
    {
        $seller = Auth::user();

        // Verify the customer has orders with this seller
        $hasOrders = $customer->orders()->where('orders.seller_id', $seller->id)->exists();

        if (! $hasOrders) {
            abort(404, 'Customer not found.');
        }

        // Get customer's orders with this seller
        $orders = $customer->orders()
            ->where('orders.seller_id', $seller->id)
            ->with(['orderItems.product'])
            ->orderBy('created_at', 'desc')
            ->paginate(10);

        // Calculate customer statistics
        $totalOrders = $customer->orders()->where('orders.seller_id', $seller->id)->count();
        $totalSpent = $customer->orders()
            ->where('orders.seller_id', $seller->id)
            ->where('status', '!=', Order::STATUS_CANCELLED)
            ->sum('total_amount');
        $averageOrderValue = $totalOrders > 0 ? $totalSpent / $totalOrders : 0;

        $firstOrder = $customer->orders()
            ->where('orders.seller_id', $seller->id)
            ->oldest()
            ->first();

        $lastOrder = $customer->orders()
            ->where('orders.seller_id', $seller->id)
            ->latest()
            ->first();

        // Get order status breakdown
        $orderStatuses = $customer->orders()
            ->where('orders.seller_id', $seller->id)
            ->selectRaw('status, COUNT(*) as count')
            ->groupBy('status')
            ->pluck('count', 'status')
            ->toArray();

        // Get favorite products (most ordered)
        $favoriteProducts = $customer->orders()
            ->where('orders.seller_id', $seller->id)
            ->join('order_items', 'orders.id', '=', 'order_items.order_id')
            ->join('products', 'order_items.product_id', '=', 'products.id')
            ->selectRaw('products.id, MAX(products.name) as name, SUM(order_items.quantity) as total_quantity, COUNT(DISTINCT orders.id) as order_count')
            ->groupBy('products.id')
            ->orderBy('total_quantity', 'desc')
            ->limit(5)
            ->get();

        // Get images for the favorite products
        if ($favoriteProducts->isNotEmpty()) {
            $productIds = $favoriteProducts->pluck('id');
            $productImages = Product::whereIn('id', $productIds)
                ->pluck('images', 'id');

            $favoriteProducts->transform(function ($product) use ($productImages) {
                $product->images = $productImages[$product->id] ?? null;

                return $product;
            });
        }

        return Inertia::render('seller/customers/show', [
            'customer' => $customer,
            'orders' => $orders,
            'statistics' => [
                'total_orders' => $totalOrders,
                'total_spent' => number_format($totalSpent, 2),
                'average_order_value' => number_format($averageOrderValue, 2),
                'first_order_date' => $firstOrder?->created_at,
                'last_order_date' => $lastOrder?->created_at,
                'order_statuses' => $orderStatuses,
            ],
            'favorite_products' => $favoriteProducts,
        ]);
    }

    /**
     * Show customer's order history with this seller.
     */
    public function orders(User $customer, Request $request): Response
    {
        $seller = Auth::user();

        // Verify the customer has orders with this seller
        $hasOrders = $customer->orders()->where('orders.seller_id', $seller->id)->exists();

        if (! $hasOrders) {
            abort(404, 'Customer not found.');
        }

        // Get query parameters
        $status = $request->get('status');
        $sortBy = $request->get('sort', 'created_at');
        $sortOrder = $request->get('order', 'desc');
        $perPage = $request->get('per_page', 15);

        // Build the orders query
        $ordersQuery = $customer->orders()
            ->where('orders.seller_id', $seller->id)
            ->with(['orderItems.product']);

        // Apply status filter
        if ($status && $status !== 'all') {
            $ordersQuery->where('status', $status);
        }

        // Apply sorting
        $ordersQuery->orderBy($sortBy, $sortOrder);

        $orders = $ordersQuery->paginate($perPage);

        // Get available statuses for filter
        $availableStatuses = $customer->orders()
            ->where('orders.seller_id', $seller->id)
            ->distinct()
            ->pluck('status')
            ->filter()
            ->values();

        return Inertia::render('seller/customers/orders', [
            'customer' => $customer,
            'orders' => $orders,
            'filters' => [
                'status' => $status,
                'sort' => $sortBy,
                'order' => $sortOrder,
                'per_page' => $perPage,
            ],
            'available_statuses' => $availableStatuses,
        ]);
    }
}
