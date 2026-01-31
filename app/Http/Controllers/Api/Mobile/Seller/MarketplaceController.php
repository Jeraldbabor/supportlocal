<?php

namespace App\Http\Controllers\Api\Mobile\Seller;

use App\Http\Controllers\Controller;
use App\Models\CustomOrderBid;
use App\Models\CustomOrderRequest;
use App\Notifications\NewBidReceived;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class MarketplaceController extends Controller
{
    /**
     * Browse open custom order requests in the marketplace
     */
    public function index(Request $request): JsonResponse
    {
        $user = Auth::user();

        if ($user->role !== 'seller') {
            return response()->json([
                'success' => false,
                'message' => 'Access denied. Seller account required.',
            ], 403);
        }

        $query = CustomOrderRequest::where('is_public', true)
            ->where('status', CustomOrderRequest::STATUS_OPEN);

        // Filter by category
        if ($category = $request->input('category')) {
            $query->where('category', $category);
        }

        // Filter by budget range
        if ($minBudget = $request->input('min_budget')) {
            $query->where('budget_max', '>=', $minBudget);
        }
        if ($maxBudget = $request->input('max_budget')) {
            $query->where('budget_min', '<=', $maxBudget);
        }

        // Search
        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%");
            });
        }

        // Sorting
        $sortBy = $request->input('sort_by', 'created_at');
        $sortOrder = $request->input('sort_order', 'desc');

        switch ($sortBy) {
            case 'budget':
                $query->orderBy('budget_max', $sortOrder);
                break;
            case 'deadline':
                $query->orderBy('preferred_deadline', $sortOrder);
                break;
            case 'bids':
                $query->withCount('bids')->orderBy('bids_count', $sortOrder);
                break;
            default:
                $query->orderBy('created_at', $sortOrder);
        }

        $query->with('buyer:id,name,avatar')
            ->withCount('bids');

        $perPage = min($request->input('per_page', 20), 50);
        $requests = $query->paginate($perPage);

        // Check if seller has already bid on each request
        $sellerBidRequestIds = CustomOrderBid::where('seller_id', $user->id)
            ->whereIn('custom_order_request_id', $requests->pluck('id'))
            ->pluck('custom_order_request_id')
            ->toArray();

        $data = $requests->map(function ($req) use ($sellerBidRequestIds) {
            return [
                'id' => $req->id,
                'request_number' => $req->request_number,
                'title' => $req->title,
                'category' => $req->category,
                'category_label' => CustomOrderRequest::CATEGORIES[$req->category] ?? $req->category,
                'description' => Str::limit($req->description, 150),
                'budget_min' => $req->budget_min,
                'budget_max' => $req->budget_max,
                'quantity' => $req->quantity,
                'preferred_deadline' => $req->preferred_deadline?->toDateString(),
                'bids_count' => $req->bids_count ?? 0,
                'has_my_bid' => in_array($req->id, $sellerBidRequestIds),
                'buyer' => [
                    'name' => $req->buyer->name ?? 'Anonymous',
                    'avatar' => $req->buyer->avatar ?? null,
                ],
                'reference_image' => $req->reference_images[0] ?? null,
                'created_at' => $req->created_at->toIso8601String(),
                'days_left' => $req->preferred_deadline
                    ? max(0, now()->diffInDays($req->preferred_deadline, false))
                    : null,
            ];
        });

        return response()->json([
            'success' => true,
            'data' => $data,
            'pagination' => [
                'current_page' => $requests->currentPage(),
                'last_page' => $requests->lastPage(),
                'per_page' => $requests->perPage(),
                'total' => $requests->total(),
            ],
        ]);
    }

    /**
     * View a specific request details
     */
    public function show(CustomOrderRequest $customOrder): JsonResponse
    {
        $user = Auth::user();

        if ($user->role !== 'seller') {
            return response()->json([
                'success' => false,
                'message' => 'Access denied.',
            ], 403);
        }

        // Only show public open requests or requests assigned to this seller
        if (! $customOrder->is_public && $customOrder->seller_id !== $user->id) {
            return response()->json([
                'success' => false,
                'message' => 'Request not found.',
            ], 404);
        }

        $customOrder->load('buyer:id,name,avatar');

        // Get seller's bid if exists
        $myBid = $customOrder->bids()->where('seller_id', $user->id)->first();

        return response()->json([
            'success' => true,
            'data' => [
                'id' => $customOrder->id,
                'request_number' => $customOrder->request_number,
                'title' => $customOrder->title,
                'category' => $customOrder->category,
                'category_label' => CustomOrderRequest::CATEGORIES[$customOrder->category] ?? $customOrder->category,
                'description' => $customOrder->description,
                'budget_min' => $customOrder->budget_min,
                'budget_max' => $customOrder->budget_max,
                'quantity' => $customOrder->quantity,
                'preferred_deadline' => $customOrder->preferred_deadline?->toDateString(),
                'special_requirements' => $customOrder->special_requirements,
                'reference_images' => $customOrder->reference_images ?? [],
                'status' => $customOrder->status,
                'is_public' => $customOrder->is_public,
                'buyer' => [
                    'name' => $customOrder->buyer->name ?? 'Anonymous',
                    'avatar' => $customOrder->buyer->avatar ?? null,
                ],
                'can_bid' => $customOrder->canReceiveBidFrom($user->id),
                'my_bid' => $myBid ? [
                    'id' => $myBid->id,
                    'proposed_price' => $myBid->proposed_price,
                    'estimated_days' => $myBid->estimated_days,
                    'message' => $myBid->message,
                    'status' => $myBid->status,
                    'can_withdraw' => $myBid->canBeWithdrawn(),
                    'created_at' => $myBid->created_at->toIso8601String(),
                ] : null,
                'created_at' => $customOrder->created_at->toIso8601String(),
            ],
        ]);
    }

    /**
     * Submit a bid on a request
     */
    public function submitBid(Request $request, CustomOrderRequest $customOrder): JsonResponse
    {
        $user = Auth::user();

        if ($user->role !== 'seller') {
            return response()->json([
                'success' => false,
                'message' => 'Access denied.',
            ], 403);
        }

        if (! $customOrder->canReceiveBidFrom($user->id)) {
            return response()->json([
                'success' => false,
                'message' => 'You cannot bid on this request.',
            ], 422);
        }

        $validated = $request->validate([
            'proposed_price' => 'required|numeric|min:1',
            'estimated_days' => 'required|integer|min:1|max:365',
            'message' => 'required|string|max:1000',
            'additional_notes' => 'nullable|string|max:500',
        ]);

        DB::beginTransaction();
        try {
            $bid = CustomOrderBid::create([
                'custom_order_request_id' => $customOrder->id,
                'seller_id' => $user->id,
                'proposed_price' => $validated['proposed_price'],
                'estimated_days' => $validated['estimated_days'],
                'message' => $validated['message'],
                'additional_notes' => $validated['additional_notes'] ?? null,
                'status' => CustomOrderBid::STATUS_PENDING,
            ]);

            // Notify buyer
            $customOrder->buyer->notify(new NewBidReceived($bid));

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Your bid has been submitted.',
                'data' => [
                    'id' => $bid->id,
                ],
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();

            return response()->json([
                'success' => false,
                'message' => 'Failed to submit bid.',
            ], 500);
        }
    }

    /**
     * Update an existing bid
     */
    public function updateBid(Request $request, CustomOrderBid $bid): JsonResponse
    {
        $user = Auth::user();

        if ($bid->seller_id !== $user->id) {
            return response()->json([
                'success' => false,
                'message' => 'Bid not found.',
            ], 404);
        }

        if ($bid->status !== CustomOrderBid::STATUS_PENDING) {
            return response()->json([
                'success' => false,
                'message' => 'This bid cannot be updated.',
            ], 422);
        }

        $validated = $request->validate([
            'proposed_price' => 'sometimes|numeric|min:1',
            'estimated_days' => 'sometimes|integer|min:1|max:365',
            'message' => 'sometimes|string|max:1000',
            'additional_notes' => 'nullable|string|max:500',
        ]);

        $bid->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Bid updated successfully.',
        ]);
    }

    /**
     * Withdraw a bid
     */
    public function withdrawBid(CustomOrderBid $bid): JsonResponse
    {
        $user = Auth::user();

        if ($bid->seller_id !== $user->id) {
            return response()->json([
                'success' => false,
                'message' => 'Bid not found.',
            ], 404);
        }

        if (! $bid->canBeWithdrawn()) {
            return response()->json([
                'success' => false,
                'message' => 'This bid cannot be withdrawn.',
            ], 422);
        }

        $bid->update([
            'status' => CustomOrderBid::STATUS_WITHDRAWN,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Bid withdrawn.',
        ]);
    }

    /**
     * List seller's bids
     */
    public function myBids(Request $request): JsonResponse
    {
        $user = Auth::user();

        if ($user->role !== 'seller') {
            return response()->json([
                'success' => false,
                'message' => 'Access denied.',
            ], 403);
        }

        $query = CustomOrderBid::where('seller_id', $user->id);

        // Filter by status
        if ($status = $request->input('status')) {
            $query->where('status', $status);
        }

        $query->with(['customOrderRequest:id,request_number,title,category,budget_min,budget_max,status,reference_images'])
            ->orderBy('created_at', 'desc');

        $perPage = min($request->input('per_page', 20), 50);
        $bids = $query->paginate($perPage);

        $data = $bids->map(function ($bid) {
            return [
                'id' => $bid->id,
                'proposed_price' => $bid->proposed_price,
                'estimated_days' => $bid->estimated_days,
                'message' => $bid->message,
                'status' => $bid->status,
                'status_label' => $this->getBidStatusLabel($bid->status),
                'request' => $bid->customOrderRequest ? [
                    'id' => $bid->customOrderRequest->id,
                    'request_number' => $bid->customOrderRequest->request_number,
                    'title' => $bid->customOrderRequest->title,
                    'category' => $bid->customOrderRequest->category,
                    'budget_min' => $bid->customOrderRequest->budget_min,
                    'budget_max' => $bid->customOrderRequest->budget_max,
                    'status' => $bid->customOrderRequest->status,
                    'reference_image' => $bid->customOrderRequest->reference_images[0] ?? null,
                ] : null,
                'can_withdraw' => $bid->canBeWithdrawn(),
                'created_at' => $bid->created_at->toIso8601String(),
            ];
        });

        return response()->json([
            'success' => true,
            'data' => $data,
            'pagination' => [
                'current_page' => $bids->currentPage(),
                'last_page' => $bids->lastPage(),
                'per_page' => $bids->perPage(),
                'total' => $bids->total(),
            ],
        ]);
    }

    /**
     * Get direct requests for this seller
     */
    public function directRequests(Request $request): JsonResponse
    {
        $user = Auth::user();

        if ($user->role !== 'seller') {
            return response()->json([
                'success' => false,
                'message' => 'Access denied.',
            ], 403);
        }

        $query = CustomOrderRequest::where('seller_id', $user->id)
            ->where('is_public', false);

        // Filter by status
        if ($status = $request->input('status')) {
            $query->where('status', $status);
        }

        $query->with('buyer:id,name,avatar')
            ->orderBy('created_at', 'desc');

        $perPage = min($request->input('per_page', 20), 50);
        $requests = $query->paginate($perPage);

        $data = $requests->map(function ($req) {
            return [
                'id' => $req->id,
                'request_number' => $req->request_number,
                'title' => $req->title,
                'category' => $req->category,
                'status' => $req->status,
                'status_label' => $this->getRequestStatusLabel($req->status),
                'budget_min' => $req->budget_min,
                'budget_max' => $req->budget_max,
                'quantity' => $req->quantity,
                'preferred_deadline' => $req->preferred_deadline?->toDateString(),
                'buyer' => [
                    'name' => $req->buyer->name ?? 'Anonymous',
                    'avatar' => $req->buyer->avatar ?? null,
                ],
                'reference_image' => $req->reference_images[0] ?? null,
                'quoted_price' => $req->quoted_price,
                'can_quote' => $req->canBeQuoted(),
                'can_start_work' => $req->canStartWork(),
                'can_send_for_checkout' => $req->canBeSentForCheckout(),
                'created_at' => $req->created_at->toIso8601String(),
            ];
        });

        return response()->json([
            'success' => true,
            'data' => $data,
            'pagination' => [
                'current_page' => $requests->currentPage(),
                'last_page' => $requests->lastPage(),
                'per_page' => $requests->perPage(),
                'total' => $requests->total(),
            ],
        ]);
    }

    /**
     * Submit a quote for a direct request
     */
    public function submitQuote(Request $request, CustomOrderRequest $customOrder): JsonResponse
    {
        $user = Auth::user();

        if ($customOrder->seller_id !== $user->id) {
            return response()->json([
                'success' => false,
                'message' => 'Request not found.',
            ], 404);
        }

        if (! $customOrder->canBeQuoted()) {
            return response()->json([
                'success' => false,
                'message' => 'This request cannot be quoted.',
            ], 422);
        }

        $validated = $request->validate([
            'quoted_price' => 'required|numeric|min:1',
            'estimated_days' => 'required|integer|min:1|max:365',
            'seller_notes' => 'nullable|string|max:1000',
        ]);

        $customOrder->update([
            'status' => CustomOrderRequest::STATUS_QUOTED,
            'quoted_price' => $validated['quoted_price'],
            'estimated_days' => $validated['estimated_days'],
            'seller_notes' => $validated['seller_notes'] ?? null,
            'quoted_at' => now(),
        ]);

        // Notify buyer
        // $customOrder->buyer->notify(new CustomOrderQuoteReceived($customOrder));

        return response()->json([
            'success' => true,
            'message' => 'Quote submitted successfully.',
        ]);
    }

    /**
     * Start work on an accepted request
     */
    public function startWork(CustomOrderRequest $customOrder): JsonResponse
    {
        $user = Auth::user();

        if ($customOrder->seller_id !== $user->id) {
            return response()->json([
                'success' => false,
                'message' => 'Request not found.',
            ], 404);
        }

        if (! $customOrder->canStartWork()) {
            return response()->json([
                'success' => false,
                'message' => 'Work cannot be started on this request.',
            ], 422);
        }

        $customOrder->update([
            'status' => CustomOrderRequest::STATUS_IN_PROGRESS,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Work started. The buyer has been notified.',
        ]);
    }

    /**
     * Mark request as ready for checkout
     */
    public function sendForCheckout(CustomOrderRequest $customOrder): JsonResponse
    {
        $user = Auth::user();

        if ($customOrder->seller_id !== $user->id) {
            return response()->json([
                'success' => false,
                'message' => 'Request not found.',
            ], 404);
        }

        if (! $customOrder->canBeSentForCheckout()) {
            return response()->json([
                'success' => false,
                'message' => 'This request cannot be sent for checkout.',
            ], 422);
        }

        $customOrder->update([
            'status' => CustomOrderRequest::STATUS_READY_FOR_CHECKOUT,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Request marked as ready for checkout.',
        ]);
    }

    private function getBidStatusLabel(string $status): string
    {
        return match ($status) {
            CustomOrderBid::STATUS_PENDING => 'Pending Review',
            CustomOrderBid::STATUS_ACCEPTED => 'Accepted',
            CustomOrderBid::STATUS_REJECTED => 'Not Selected',
            CustomOrderBid::STATUS_WITHDRAWN => 'Withdrawn',
            default => ucfirst($status),
        };
    }

    private function getRequestStatusLabel(string $status): string
    {
        return match ($status) {
            CustomOrderRequest::STATUS_PENDING => 'Awaiting Quote',
            CustomOrderRequest::STATUS_QUOTED => 'Quote Sent',
            CustomOrderRequest::STATUS_ACCEPTED => 'Accepted',
            CustomOrderRequest::STATUS_REJECTED => 'Rejected',
            CustomOrderRequest::STATUS_DECLINED => 'Declined',
            CustomOrderRequest::STATUS_IN_PROGRESS => 'In Progress',
            CustomOrderRequest::STATUS_READY_FOR_CHECKOUT => 'Ready for Checkout',
            CustomOrderRequest::STATUS_COMPLETED => 'Completed',
            CustomOrderRequest::STATUS_CANCELLED => 'Cancelled',
            default => ucfirst(str_replace('_', ' ', $status)),
        };
    }
}
