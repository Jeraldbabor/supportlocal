<?php

namespace App\Http\Controllers\Buyer;

use App\Http\Controllers\Controller;
use App\Models\CustomOrderRequest;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\User;
use App\Notifications\CustomOrderQuoteAccepted;
use App\Notifications\CustomOrderQuoteDeclined;
use App\Notifications\NewCustomOrderRequest;
use App\Notifications\NewOrderReceived;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class CustomOrderRequestController extends Controller
{
    /**
     * Display a listing of buyer's custom order requests.
     */
    public function index(Request $request)
    {
        $query = CustomOrderRequest::with(['seller'])
            ->forBuyer(auth()->id())
            ->latest();

        // Filter by status
        if ($request->filled('status') && $request->status !== 'all') {
            $query->withStatus($request->status);
        }

        // Search by title or request number
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                    ->orWhere('request_number', 'like', "%{$search}%");
            });
        }

        $requests = $query->paginate(10)->withQueryString();

        // Transform to include seller's avatar_url
        $requests->getCollection()->transform(function ($item) {
            $item->seller = [
                'id' => $item->seller->id,
                'name' => $item->seller->name,
                'avatar_url' => $item->seller->avatar_url,
            ];

            return $item;
        });

        return Inertia::render('buyer/CustomOrders/Index', [
            'requests' => $requests,
            'filters' => $request->only(['status', 'search']),
            'statusCounts' => $this->getStatusCounts(auth()->id()),
        ]);
    }

    /**
     * Show the form for creating a new custom order request.
     */
    public function create(Request $request)
    {
        $sellerId = $request->query('seller_id');
        $seller = null;

        if ($sellerId) {
            $seller = User::where('id', $sellerId)
                ->where('role', User::ROLE_SELLER)
                ->first();

            if ($seller) {
                $seller = [
                    'id' => $seller->id,
                    'name' => $seller->name,
                    'avatar_url' => $seller->avatar_url,
                    'address' => $seller->address,
                ];
            }
        }

        // Get all sellers with their avatar_url
        $sellers = null;
        if (! $seller) {
            $sellers = User::where('role', User::ROLE_SELLER)
                ->where('is_active', true)
                ->orderBy('name')
                ->get()
                ->map(function ($user) {
                    return [
                        'id' => $user->id,
                        'name' => $user->name,
                        'avatar_url' => $user->avatar_url,
                        'address' => $user->address,
                    ];
                });
        }

        return Inertia::render('buyer/CustomOrders/Create', [
            'seller' => $seller,
            'sellers' => $sellers,
        ]);
    }

    /**
     * Store a newly created custom order request.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'seller_id' => 'required|exists:users,id',
            'title' => 'required|string|max:255',
            'description' => 'required|string|min:20|max:2000',
            'budget_min' => 'nullable|numeric|min:0',
            'budget_max' => 'nullable|numeric|min:0|gte:budget_min',
            'quantity' => 'required|integer|min:1|max:100',
            'preferred_deadline' => 'nullable|date|after:today',
            'special_requirements' => 'nullable|string|max:1000',
            'reference_images' => 'nullable|array|max:5',
            'reference_images.*' => 'image|mimes:jpeg,png,jpg,gif,webp|max:5120',
        ]);

        // Verify seller exists and is a seller
        $seller = User::where('id', $validated['seller_id'])
            ->where('role', User::ROLE_SELLER)
            ->firstOrFail();

        // Handle reference images upload
        $imagePaths = [];
        if ($request->hasFile('reference_images')) {
            foreach ($request->file('reference_images') as $image) {
                $path = $image->store('custom-orders/references', 'public');
                $imagePaths[] = $path;
            }
        }

        // Create the custom order request
        $customOrderRequest = CustomOrderRequest::create([
            'buyer_id' => auth()->id(),
            'seller_id' => $seller->id,
            'title' => $validated['title'],
            'description' => $validated['description'],
            'budget_min' => $validated['budget_min'] ?? null,
            'budget_max' => $validated['budget_max'] ?? null,
            'quantity' => $validated['quantity'],
            'preferred_deadline' => $validated['preferred_deadline'] ?? null,
            'special_requirements' => $validated['special_requirements'] ?? null,
            'reference_images' => $imagePaths ?: null,
            'status' => CustomOrderRequest::STATUS_PENDING,
        ]);

        // Notify seller
        $seller->notify(new NewCustomOrderRequest($customOrderRequest));

        return redirect()
            ->route('buyer.custom-orders.show', $customOrderRequest)
            ->with('success', 'Custom order request submitted successfully! The seller will review your request and respond soon.');
    }

    /**
     * Display the specified custom order request.
     */
    public function show(CustomOrderRequest $customOrderRequest)
    {
        // Ensure buyer owns this request
        if ($customOrderRequest->buyer_id !== auth()->id()) {
            abort(403, 'You do not have permission to view this request.');
        }

        $customOrderRequest->load([
            'seller',
            'product:id,name,price,primary_image,slug',
            'order:id,order_number,status,total_amount',
        ]);

        // Transform the request to include seller's avatar_url
        $requestData = $customOrderRequest->toArray();
        $requestData['seller'] = [
            'id' => $customOrderRequest->seller->id,
            'name' => $customOrderRequest->seller->name,
            'email' => $customOrderRequest->seller->email,
            'phone_number' => $customOrderRequest->seller->phone_number,
            'address' => $customOrderRequest->seller->address,
            'avatar_url' => $customOrderRequest->seller->avatar_url,
        ];

        return Inertia::render('buyer/CustomOrders/Show', [
            'request' => $requestData,
        ]);
    }

    /**
     * Accept the seller's quote.
     */
    public function acceptQuote(CustomOrderRequest $customOrderRequest)
    {
        // Ensure buyer owns this request
        if ($customOrderRequest->buyer_id !== auth()->id()) {
            abort(403, 'You do not have permission to accept this quote.');
        }

        if (! $customOrderRequest->canBeAccepted()) {
            return back()->with('error', 'This quote cannot be accepted.');
        }

        $customOrderRequest->update([
            'status' => CustomOrderRequest::STATUS_ACCEPTED,
            'accepted_at' => now(),
        ]);

        // Notify seller
        $customOrderRequest->seller->notify(new CustomOrderQuoteAccepted($customOrderRequest));

        return back()->with('success', 'Quote accepted! The seller will start working on your custom order.');
    }

    /**
     * Decline the seller's quote.
     */
    public function declineQuote(Request $request, CustomOrderRequest $customOrderRequest)
    {
        // Ensure buyer owns this request
        if ($customOrderRequest->buyer_id !== auth()->id()) {
            abort(403, 'You do not have permission to decline this quote.');
        }

        if (! $customOrderRequest->canBeDeclined()) {
            return back()->with('error', 'This quote cannot be declined.');
        }

        $validated = $request->validate([
            'reason' => 'nullable|string|max:500',
        ]);

        $customOrderRequest->update([
            'status' => CustomOrderRequest::STATUS_DECLINED,
            'rejection_reason' => $validated['reason'] ?? 'Quote declined by buyer',
        ]);

        // Notify seller
        $customOrderRequest->seller->notify(new CustomOrderQuoteDeclined($customOrderRequest));

        return back()->with('success', 'Quote declined. You can submit a new request to another seller if you wish.');
    }

    /**
     * Cancel the custom order request.
     */
    public function cancel(CustomOrderRequest $customOrderRequest)
    {
        // Ensure buyer owns this request
        if ($customOrderRequest->buyer_id !== auth()->id()) {
            abort(403, 'You do not have permission to cancel this request.');
        }

        if (! $customOrderRequest->canBeCancelled()) {
            return back()->with('error', 'This request cannot be cancelled.');
        }

        $customOrderRequest->update([
            'status' => CustomOrderRequest::STATUS_CANCELLED,
        ]);

        return back()->with('success', 'Request cancelled successfully.');
    }

    /**
     * Show checkout page for a ready custom order.
     */
    public function checkout(CustomOrderRequest $customOrderRequest)
    {
        // Ensure buyer owns this request
        if ($customOrderRequest->buyer_id !== auth()->id()) {
            abort(403, 'You do not have permission to checkout this order.');
        }

        if (! $customOrderRequest->canBeCheckedOut()) {
            return redirect()
                ->route('buyer.custom-orders.show', $customOrderRequest)
                ->with('error', 'This order is not ready for checkout.');
        }

        $customOrderRequest->load(['seller']);

        // Transform the request to include seller's avatar_url
        $requestData = $customOrderRequest->toArray();
        $requestData['seller'] = [
            'id' => $customOrderRequest->seller->id,
            'name' => $customOrderRequest->seller->name,
            'email' => $customOrderRequest->seller->email,
            'phone_number' => $customOrderRequest->seller->phone_number,
            'address' => $customOrderRequest->seller->address,
            'avatar_url' => $customOrderRequest->seller->avatar_url,
            'gcash_number' => $customOrderRequest->seller->gcash_number,
            'gcash_name' => $customOrderRequest->seller->gcash_name,
        ];

        $user = auth()->user();

        return Inertia::render('buyer/CustomOrders/Checkout', [
            'request' => $requestData,
            'user' => [
                'name' => $user->name,
                'email' => $user->email,
                'phone_number' => $user->phone_number,
                'delivery_address' => $user->delivery_address,
                'delivery_phone' => $user->delivery_phone,
                'delivery_notes' => $user->delivery_notes,
                'delivery_province' => $user->delivery_province,
                'delivery_city' => $user->delivery_city,
                'delivery_barangay' => $user->delivery_barangay,
                'delivery_street' => $user->delivery_street,
                'delivery_building_details' => $user->delivery_building_details,
            ],
        ]);
    }

    /**
     * Place the order for a custom order request.
     */
    public function placeOrder(Request $request, CustomOrderRequest $customOrderRequest)
    {
        // Ensure buyer owns this request
        if ($customOrderRequest->buyer_id !== auth()->id()) {
            abort(403, 'You do not have permission to checkout this order.');
        }

        if (! $customOrderRequest->canBeCheckedOut()) {
            return back()->with('error', 'This order is not ready for checkout.');
        }

        $validated = $request->validate([
            'delivery_address' => 'required|string|max:500',
            'delivery_phone' => 'required|string|max:20',
            'delivery_notes' => 'nullable|string|max:500',
            'payment_method' => 'required|in:cod,gcash',
            'gcash_reference' => 'nullable|required_if:payment_method,gcash|string|max:100',
        ]);

        try {
            DB::beginTransaction();

            $shippingFee = 50; // Default shipping fee
            $totalAmount = $customOrderRequest->quoted_price + $shippingFee;

            $paymentStatus = $validated['payment_method'] === Order::PAYMENT_COD
                ? Order::PAYMENT_PAID
                : Order::PAYMENT_PENDING;

            // Create the order
            $order = Order::create([
                'user_id' => auth()->id(),
                'seller_id' => $customOrderRequest->seller_id,
                'order_number' => 'CUS-'.strtoupper(uniqid()),
                'shipping_name' => auth()->user()->name,
                'shipping_email' => auth()->user()->email,
                'shipping_phone' => $validated['delivery_phone'],
                'shipping_address' => $validated['delivery_address'],
                'delivery_address' => $validated['delivery_address'],
                'delivery_phone' => $validated['delivery_phone'],
                'delivery_notes' => $validated['delivery_notes'],
                'payment_method' => $validated['payment_method'],
                'payment_status' => $paymentStatus,
                'gcash_reference' => $validated['gcash_reference'] ?? null,
                'special_instructions' => 'Custom Order: '.$customOrderRequest->title,
                'subtotal' => $customOrderRequest->quoted_price,
                'shipping_fee' => $shippingFee,
                'total_amount' => $totalAmount,
                'status' => Order::STATUS_PENDING,
            ]);

            // Load the seller relationship if not loaded
            $customOrderRequest->load('seller');

            // Create order item for the custom order
            OrderItem::create([
                'order_id' => $order->id,
                'product_id' => $customOrderRequest->product_id,
                'seller_id' => $customOrderRequest->seller_id,
                'product_name' => 'Custom Order: '.$customOrderRequest->title,
                'product_image' => $customOrderRequest->reference_image_urls[0] ?? null,
                'seller_name' => $customOrderRequest->seller->name ?? 'Seller',
                'quantity' => $customOrderRequest->quantity,
                'price' => $customOrderRequest->quoted_price / $customOrderRequest->quantity,
                'total' => $customOrderRequest->quoted_price,
            ]);

            // Update custom order request with order link and mark as completed
            $customOrderRequest->update([
                'status' => CustomOrderRequest::STATUS_COMPLETED,
                'order_id' => $order->id,
                'completed_at' => now(),
            ]);

            // Notify seller of new order
            $seller = User::find($customOrderRequest->seller_id);
            if ($seller) {
                $order->load('buyer');
                try {
                    $seller->notify(new NewOrderReceived($order));
                } catch (\Exception $e) {
                    Log::error('Failed to send custom order notification', [
                        'order_id' => $order->id,
                        'custom_order_request_id' => $customOrderRequest->id,
                        'error' => $e->getMessage(),
                    ]);
                }
            }

            DB::commit();

            return redirect()
                ->route('buyer.orders.show', $order)
                ->with('success', 'Order placed successfully! You can track your order status here.');

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Failed to place custom order', [
                'custom_order_request_id' => $customOrderRequest->id,
                'error' => $e->getMessage(),
            ]);

            return back()->with('error', 'Failed to place order. Please try again.');
        }
    }

    /**
     * Get status counts for buyer.
     */
    private function getStatusCounts($buyerId): array
    {
        $counts = CustomOrderRequest::forBuyer($buyerId)
            ->selectRaw('status, COUNT(*) as count')
            ->groupBy('status')
            ->pluck('count', 'status')
            ->toArray();

        return [
            'all' => array_sum($counts),
            'pending' => $counts[CustomOrderRequest::STATUS_PENDING] ?? 0,
            'quoted' => $counts[CustomOrderRequest::STATUS_QUOTED] ?? 0,
            'accepted' => $counts[CustomOrderRequest::STATUS_ACCEPTED] ?? 0,
            'in_progress' => $counts[CustomOrderRequest::STATUS_IN_PROGRESS] ?? 0,
            'ready_for_checkout' => $counts[CustomOrderRequest::STATUS_READY_FOR_CHECKOUT] ?? 0,
            'completed' => $counts[CustomOrderRequest::STATUS_COMPLETED] ?? 0,
        ];
    }
}
