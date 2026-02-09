<?php

namespace App\Http\Controllers\Buyer;

use App\Http\Controllers\Controller;
use App\Models\CustomOrderBid;
use App\Models\CustomOrderRequest;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\User;
use App\Notifications\BidAccepted;
use App\Notifications\CustomOrderQuoteAccepted;
use App\Notifications\CustomOrderQuoteDeclined;
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
            ->withCount('bids')
            ->forBuyer(auth()->id())
            ->latest();

        // Filter by status
        if ($request->filled('status') && $request->status !== 'all') {
            $query->withStatus($request->status);
        }

        // Filter by type (public/direct)
        if ($request->filled('type')) {
            if ($request->type === 'public') {
                $query->where('is_public', true);
            } elseif ($request->type === 'direct') {
                $query->where('is_public', false);
            }
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
            if ($item->seller) {
                $item->seller = [
                    'id' => $item->seller->id,
                    'name' => $item->seller->name,
                    'avatar_url' => $item->seller->avatar_url,
                ];
            }

            return $item;
        });

        return Inertia::render('buyer/CustomOrders/Index', [
            'requests' => $requests,
            'filters' => $request->only(['status', 'search', 'type']),
            'statusCounts' => $this->getStatusCounts(auth()->id()),
            'categories' => CustomOrderRequest::$categories,
        ]);
    }

    /**
     * Show the form for creating a new custom order request.
     */
    public function create(Request $request)
    {
        return Inertia::render('buyer/CustomOrders/Create', [
            'categories' => CustomOrderRequest::$categories,
        ]);
    }

    /**
     * Store a newly created custom order request (public bidding).
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'category' => 'required|string|in:'.implode(',', array_keys(CustomOrderRequest::$categories)),
            'description' => 'required|string|min:20|max:2000',
            'budget_min' => 'nullable|numeric|min:0',
            'budget_max' => 'nullable|numeric|min:0|gte:budget_min',
            'quantity' => 'required|integer|min:1|max:100',
            'preferred_deadline' => 'nullable|date|after:today',
            'special_requirements' => 'nullable|string|max:1000',
            'reference_images' => 'nullable|array|max:5',
            'reference_images.*' => 'image|mimes:jpeg,png,jpg,gif,webp|max:5120',
        ]);

        // Handle reference images upload
        $imagePaths = [];
        if ($request->hasFile('reference_images')) {
            foreach ($request->file('reference_images') as $image) {
                $path = \App\Helpers\ImageHelper::store($image, 'custom-orders/references');
                if ($path) {
                    $imagePaths[] = $path;
                }
            }
        }

        // Create the public custom order request
        $customOrderRequest = CustomOrderRequest::create([
            'buyer_id' => auth()->id(),
            'seller_id' => null, // No seller yet - open for bidding
            'is_public' => true,
            'title' => $validated['title'],
            'category' => $validated['category'],
            'description' => $validated['description'],
            'budget_min' => $validated['budget_min'] ?? null,
            'budget_max' => $validated['budget_max'] ?? null,
            'quantity' => $validated['quantity'],
            'preferred_deadline' => $validated['preferred_deadline'] ?? null,
            'special_requirements' => $validated['special_requirements'] ?? null,
            'reference_images' => $imagePaths ?: null,
            'status' => CustomOrderRequest::STATUS_OPEN,
        ]);

        // Notify all active sellers about the new marketplace request
        $this->notifySellersAboutNewRequest($customOrderRequest);

        return redirect()
            ->route('buyer.custom-orders.show', $customOrderRequest)
            ->with('success', 'Your custom order request is now live! Artisans can view and submit bids on your project.');
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
            'bids.seller',
            'acceptedBid.seller',
        ]);

        // Transform the request to include seller's avatar_url
        $requestData = $customOrderRequest->toArray();

        if ($customOrderRequest->seller) {
            $requestData['seller'] = [
                'id' => $customOrderRequest->seller->id,
                'name' => $customOrderRequest->seller->name,
                'email' => $customOrderRequest->seller->email,
                'phone_number' => $customOrderRequest->seller->phone_number,
                'address' => $customOrderRequest->seller->address,
                'avatar_url' => $customOrderRequest->seller->avatar_url,
            ];
        } else {
            $requestData['seller'] = null;
        }

        // Transform bids with seller info
        $requestData['bids'] = $customOrderRequest->bids
            ->sortByDesc('created_at')
            ->map(function ($bid) {
                return $bid->toArrayWithSeller();
            })
            ->values()
            ->toArray();

        return Inertia::render('buyer/CustomOrders/Show', [
            'request' => $requestData,
            'categories' => CustomOrderRequest::$categories,
        ]);
    }

    /**
     * Accept a bid on a public request.
     */
    public function acceptBid(CustomOrderRequest $customOrderRequest, CustomOrderBid $bid)
    {
        // Ensure buyer owns this request
        if ($customOrderRequest->buyer_id !== auth()->id()) {
            abort(403, 'You do not have permission to accept this bid.');
        }

        // Ensure bid belongs to this request
        if ($bid->custom_order_request_id !== $customOrderRequest->id) {
            abort(403, 'This bid does not belong to this request.');
        }

        if (! $bid->canBeAccepted()) {
            return back()->with('error', 'This bid cannot be accepted.');
        }

        DB::beginTransaction();
        try {
            // Update the bid status
            $bid->update([
                'status' => CustomOrderBid::STATUS_ACCEPTED,
                'accepted_at' => now(),
            ]);

            // Get other pending bids before rejecting them (for notifications)
            $rejectedBids = $customOrderRequest->bids()
                ->where('id', '!=', $bid->id)
                ->where('status', CustomOrderBid::STATUS_PENDING)
                ->with('seller')
                ->get();

            // Reject all other pending bids
            $customOrderRequest->bids()
                ->where('id', '!=', $bid->id)
                ->where('status', CustomOrderBid::STATUS_PENDING)
                ->update([
                    'status' => CustomOrderBid::STATUS_REJECTED,
                    'rejected_at' => now(),
                    'rejection_reason' => 'Another bid was accepted',
                ]);

            // Update the request with seller info and accepted bid
            $customOrderRequest->update([
                'seller_id' => $bid->seller_id,
                'status' => CustomOrderRequest::STATUS_ACCEPTED,
                'quoted_price' => $bid->proposed_price,
                'estimated_days' => $bid->estimated_days,
                'seller_notes' => $bid->message,
                'quoted_at' => $bid->created_at,
                'accepted_at' => now(),
                'accepted_bid_id' => $bid->id,
            ]);

            DB::commit();

            // Notify the winning seller
            $bid->seller->notify(new BidAccepted($bid));

            // Notify other sellers that their bids were not selected
            foreach ($rejectedBids as $rejectedBid) {
                try {
                    $rejectedBid->seller->notify(new \App\Notifications\BidRejected($rejectedBid, true));
                } catch (\Exception $e) {
                    Log::warning('Failed to notify seller about rejected bid', [
                        'bid_id' => $rejectedBid->id,
                        'seller_id' => $rejectedBid->seller_id,
                        'error' => $e->getMessage(),
                    ]);
                }
            }

            return back()->with('success', 'Bid accepted! The artisan will start working on your custom order.');

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Failed to accept bid', [
                'bid_id' => $bid->id,
                'request_id' => $customOrderRequest->id,
                'error' => $e->getMessage(),
            ]);

            return back()->with('error', 'Failed to accept bid. Please try again.');
        }
    }

    /**
     * Reject a bid on a public request.
     */
    public function rejectBid(Request $request, CustomOrderRequest $customOrderRequest, CustomOrderBid $bid)
    {
        // Ensure buyer owns this request
        if ($customOrderRequest->buyer_id !== auth()->id()) {
            abort(403, 'You do not have permission to reject this bid.');
        }

        // Ensure bid belongs to this request
        if ($bid->custom_order_request_id !== $customOrderRequest->id) {
            abort(403, 'This bid does not belong to this request.');
        }

        if (! $bid->canBeRejected()) {
            return back()->with('error', 'This bid cannot be rejected.');
        }

        $validated = $request->validate([
            'reason' => 'nullable|string|max:500',
        ]);

        $bid->update([
            'status' => CustomOrderBid::STATUS_REJECTED,
            'rejected_at' => now(),
            'rejection_reason' => $validated['reason'] ?? 'Bid rejected by buyer',
        ]);

        // Notify the seller about the rejection
        try {
            $bid->load('seller');
            $bid->seller->notify(new \App\Notifications\BidRejected($bid, false));
        } catch (\Exception $e) {
            Log::warning('Failed to notify seller about rejected bid', [
                'bid_id' => $bid->id,
                'seller_id' => $bid->seller_id,
                'error' => $e->getMessage(),
            ]);
        }

        return back()->with('success', 'Bid rejected.');
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
            'open' => $counts[CustomOrderRequest::STATUS_OPEN] ?? 0,
            'pending' => $counts[CustomOrderRequest::STATUS_PENDING] ?? 0,
            'quoted' => $counts[CustomOrderRequest::STATUS_QUOTED] ?? 0,
            'accepted' => $counts[CustomOrderRequest::STATUS_ACCEPTED] ?? 0,
            'in_progress' => $counts[CustomOrderRequest::STATUS_IN_PROGRESS] ?? 0,
            'ready_for_checkout' => $counts[CustomOrderRequest::STATUS_READY_FOR_CHECKOUT] ?? 0,
            'completed' => $counts[CustomOrderRequest::STATUS_COMPLETED] ?? 0,
        ];
    }

    /**
     * Notify all active sellers about a new marketplace request.
     */
    private function notifySellersAboutNewRequest(CustomOrderRequest $customOrderRequest): void
    {
        // Get all active sellers
        $sellers = User::where('role', User::ROLE_SELLER)
            ->where('is_active', true)
            ->get();

        // Send notification to each seller
        foreach ($sellers as $seller) {
            try {
                $seller->notify(new \App\Notifications\NewMarketplaceRequest($customOrderRequest));
            } catch (\Exception $e) {
                Log::warning('Failed to notify seller about new marketplace request', [
                    'seller_id' => $seller->id,
                    'request_id' => $customOrderRequest->id,
                    'error' => $e->getMessage(),
                ]);
            }
        }
    }
}
