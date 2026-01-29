<?php

namespace App\Http\Controllers\Seller;

use App\Http\Controllers\Controller;
use App\Models\CustomOrderRequest;
use App\Notifications\CustomOrderQuoteReceived;
use App\Notifications\CustomOrderRejected;
use App\Notifications\CustomOrderStatusUpdated;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CustomOrderRequestController extends Controller
{
    /**
     * Display a listing of seller's custom order requests.
     */
    public function index(Request $request)
    {
        $query = CustomOrderRequest::with(['buyer'])
            ->forSeller(auth()->id())
            ->latest();

        // Filter by status
        if ($request->filled('status') && $request->status !== 'all') {
            $query->withStatus($request->status);
        }

        // Search by title, request number, or buyer name
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('request_number', 'like', "%{$search}%")
                  ->orWhereHas('buyer', function ($bq) use ($search) {
                      $bq->where('name', 'like', "%{$search}%");
                  });
            });
        }

        $requests = $query->paginate(10)->withQueryString();

        // Transform to include buyer's avatar_url
        $requests->getCollection()->transform(function ($item) {
            $item->buyer = [
                'id' => $item->buyer->id,
                'name' => $item->buyer->name,
                'email' => $item->buyer->email,
                'avatar_url' => $item->buyer->avatar_url,
            ];
            return $item;
        });

        return Inertia::render('seller/CustomOrders/Index', [
            'requests' => $requests,
            'filters' => $request->only(['status', 'search']),
            'statusCounts' => $this->getStatusCounts(auth()->id()),
        ]);
    }

    /**
     * Display the specified custom order request.
     */
    public function show(CustomOrderRequest $customOrderRequest)
    {
        // Ensure seller owns this request
        if ($customOrderRequest->seller_id !== auth()->id()) {
            abort(403, 'You do not have permission to view this request.');
        }

        $customOrderRequest->load([
            'buyer',
            'product:id,name,price,primary_image,slug',
            'order:id,order_number,status,total_amount',
        ]);

        // Transform the request to include buyer's avatar_url
        $requestData = $customOrderRequest->toArray();
        $requestData['buyer'] = [
            'id' => $customOrderRequest->buyer->id,
            'name' => $customOrderRequest->buyer->name,
            'email' => $customOrderRequest->buyer->email,
            'phone_number' => $customOrderRequest->buyer->phone_number,
            'address' => $customOrderRequest->buyer->address,
            'avatar_url' => $customOrderRequest->buyer->avatar_url,
        ];

        return Inertia::render('seller/CustomOrders/Show', [
            'request' => $requestData,
        ]);
    }

    /**
     * Submit a quote for the custom order request.
     */
    public function submitQuote(Request $request, CustomOrderRequest $customOrderRequest)
    {
        // Ensure seller owns this request
        if ($customOrderRequest->seller_id !== auth()->id()) {
            abort(403, 'You do not have permission to quote this request.');
        }

        if (!$customOrderRequest->canBeQuoted()) {
            return back()->with('error', 'This request cannot be quoted.');
        }

        $validated = $request->validate([
            'quoted_price' => 'required|numeric|min:1',
            'estimated_days' => 'required|integer|min:1|max:365',
            'seller_notes' => 'nullable|string|max:1000',
        ]);

        $customOrderRequest->update([
            'status' => CustomOrderRequest::STATUS_QUOTED,
            'quoted_price' => $validated['quoted_price'],
            'estimated_days' => $validated['estimated_days'],
            'seller_notes' => $validated['seller_notes'] ?? null,
            'quoted_at' => now(),
        ]);

        // Notify buyer
        $customOrderRequest->buyer->notify(new CustomOrderQuoteReceived($customOrderRequest));

        return back()->with('success', 'Quote submitted successfully! The buyer will be notified.');
    }

    /**
     * Reject the custom order request.
     */
    public function reject(Request $request, CustomOrderRequest $customOrderRequest)
    {
        // Ensure seller owns this request
        if ($customOrderRequest->seller_id !== auth()->id()) {
            abort(403, 'You do not have permission to reject this request.');
        }

        if (!$customOrderRequest->canBeRejected()) {
            return back()->with('error', 'This request cannot be rejected.');
        }

        $validated = $request->validate([
            'reason' => 'required|string|max:500',
        ]);

        $customOrderRequest->update([
            'status' => CustomOrderRequest::STATUS_REJECTED,
            'rejected_at' => now(),
            'rejection_reason' => $validated['reason'],
        ]);

        // Notify buyer
        $customOrderRequest->buyer->notify(new CustomOrderRejected($customOrderRequest));

        return back()->with('success', 'Request rejected. The buyer has been notified.');
    }

    /**
     * Start working on the accepted custom order.
     */
    public function startWork(CustomOrderRequest $customOrderRequest)
    {
        // Ensure seller owns this request
        if ($customOrderRequest->seller_id !== auth()->id()) {
            abort(403, 'You do not have permission to update this request.');
        }

        if (!$customOrderRequest->canStartWork()) {
            return back()->with('error', 'Work cannot be started on this request.');
        }

        $customOrderRequest->update([
            'status' => CustomOrderRequest::STATUS_IN_PROGRESS,
        ]);

        // Notify buyer
        $customOrderRequest->buyer->notify(new CustomOrderStatusUpdated($customOrderRequest, 'Work has started on your custom order!'));

        return back()->with('success', 'Status updated to In Progress. The buyer has been notified.');
    }

    /**
     * Send the custom order to buyer for checkout (seller finished work).
     */
    public function sendForCheckout(CustomOrderRequest $customOrderRequest)
    {
        // Ensure seller owns this request
        if ($customOrderRequest->seller_id !== auth()->id()) {
            abort(403, 'You do not have permission to update this request.');
        }

        if (!$customOrderRequest->canBeSentForCheckout()) {
            return back()->with('error', 'This request cannot be sent for checkout.');
        }

        $customOrderRequest->update([
            'status' => CustomOrderRequest::STATUS_READY_FOR_CHECKOUT,
        ]);

        // Notify buyer that the custom order is ready for payment
        $customOrderRequest->buyer->notify(new CustomOrderStatusUpdated(
            $customOrderRequest, 
            'Your custom order is ready! Please proceed to checkout to complete your purchase.'
        ));

        return back()->with('success', 'Custom order sent to buyer for checkout! They will receive a notification to pay.');
    }

    /**
     * Get status counts for seller.
     */
    private function getStatusCounts($sellerId): array
    {
        $counts = CustomOrderRequest::forSeller($sellerId)
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
