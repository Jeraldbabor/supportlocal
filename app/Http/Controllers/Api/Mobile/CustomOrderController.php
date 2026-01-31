<?php

namespace App\Http\Controllers\Api\Mobile;

use App\Http\Controllers\Controller;
use App\Models\CustomOrderBid;
use App\Models\CustomOrderRequest;
use App\Models\ProductCategory;
use App\Notifications\CustomOrderAccepted;
use App\Notifications\CustomOrderRejected;
use App\Notifications\NewCustomOrderRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class CustomOrderController extends Controller
{
    /**
     * List buyer's custom order requests
     */
    public function index(Request $request): JsonResponse
    {
        $user = Auth::user();

        $query = CustomOrderRequest::where('buyer_id', $user->id);

        // Filter by status
        if ($status = $request->input('status')) {
            $query->where('status', $status);
        }

        // Filter by type (public/direct)
        if ($request->has('is_public')) {
            $query->where('is_public', $request->boolean('is_public'));
        }

        $query->with(['seller:id,name,avatar', 'acceptedBid.seller:id,name,avatar'])
            ->withCount('bids')
            ->orderBy('created_at', 'desc');

        $perPage = min($request->input('per_page', 20), 50);
        $requests = $query->paginate($perPage);

        $data = $requests->map(function ($req) {
            return [
                'id' => $req->id,
                'request_number' => $req->request_number,
                'title' => $req->title,
                'category' => $req->category,
                'is_public' => $req->is_public,
                'status' => $req->status,
                'status_label' => $this->getStatusLabel($req->status),
                'budget_min' => $req->budget_min,
                'budget_max' => $req->budget_max,
                'quantity' => $req->quantity,
                'preferred_deadline' => $req->preferred_deadline?->toDateString(),
                'bids_count' => $req->bids_count ?? 0,
                'quoted_price' => $req->quoted_price,
                'estimated_days' => $req->estimated_days,
                'seller' => $req->seller ? [
                    'id' => $req->seller->id,
                    'name' => $req->seller->name,
                    'avatar' => $req->seller->avatar,
                ] : null,
                'accepted_bid' => $req->acceptedBid ? [
                    'id' => $req->acceptedBid->id,
                    'proposed_price' => $req->acceptedBid->proposed_price,
                    'seller' => [
                        'id' => $req->acceptedBid->seller->id,
                        'name' => $req->acceptedBid->seller->name,
                    ],
                ] : null,
                'reference_image' => $req->reference_images[0] ?? null,
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
     * Get single request details
     */
    public function show(CustomOrderRequest $customOrder): JsonResponse
    {
        $user = Auth::user();

        if ($customOrder->buyer_id !== $user->id) {
            return response()->json([
                'success' => false,
                'message' => 'Request not found.',
            ], 404);
        }

        $customOrder->load([
            'seller:id,name,avatar,email,phone_number',
            'bids' => function ($q) {
                $q->orderBy('created_at', 'desc');
            },
            'bids.seller:id,name,avatar',
            'acceptedBid.seller:id,name,avatar',
        ]);

        return response()->json([
            'success' => true,
            'data' => [
                'id' => $customOrder->id,
                'request_number' => $customOrder->request_number,
                'title' => $customOrder->title,
                'category' => $customOrder->category,
                'description' => $customOrder->description,
                'is_public' => $customOrder->is_public,
                'status' => $customOrder->status,
                'status_label' => $this->getStatusLabel($customOrder->status),
                'budget_min' => $customOrder->budget_min,
                'budget_max' => $customOrder->budget_max,
                'quantity' => $customOrder->quantity,
                'preferred_deadline' => $customOrder->preferred_deadline?->toDateString(),
                'special_requirements' => $customOrder->special_requirements,
                'reference_images' => $customOrder->reference_images ?? [],
                'quoted_price' => $customOrder->quoted_price,
                'estimated_days' => $customOrder->estimated_days,
                'seller_notes' => $customOrder->seller_notes,
                'quoted_at' => $customOrder->quoted_at?->toIso8601String(),
                'rejection_reason' => $customOrder->rejection_reason,
                'seller' => $customOrder->seller ? [
                    'id' => $customOrder->seller->id,
                    'name' => $customOrder->seller->name,
                    'avatar' => $customOrder->seller->avatar,
                ] : null,
                'bids' => $customOrder->bids->map(fn($bid) => [
                    'id' => $bid->id,
                    'proposed_price' => $bid->proposed_price,
                    'estimated_days' => $bid->estimated_days,
                    'message' => $bid->message,
                    'status' => $bid->status,
                    'seller' => [
                        'id' => $bid->seller->id,
                        'name' => $bid->seller->name,
                        'avatar' => $bid->seller->avatar,
                    ],
                    'created_at' => $bid->created_at->toIso8601String(),
                ]),
                'accepted_bid' => $customOrder->acceptedBid ? [
                    'id' => $customOrder->acceptedBid->id,
                    'proposed_price' => $customOrder->acceptedBid->proposed_price,
                    'estimated_days' => $customOrder->acceptedBid->estimated_days,
                    'message' => $customOrder->acceptedBid->message,
                    'seller' => [
                        'id' => $customOrder->acceptedBid->seller->id,
                        'name' => $customOrder->acceptedBid->seller->name,
                        'avatar' => $customOrder->acceptedBid->seller->avatar,
                    ],
                ] : null,
                'can_cancel' => $customOrder->canBeCancelled(),
                'can_checkout' => $customOrder->canBeCheckedOut(),
                'created_at' => $customOrder->created_at->toIso8601String(),
                'updated_at' => $customOrder->updated_at->toIso8601String(),
            ],
        ]);
    }

    /**
     * Create a new custom order request
     */
    public function store(Request $request): JsonResponse
    {
        $user = Auth::user();

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'category' => 'required|string|in:' . implode(',', array_keys(CustomOrderRequest::CATEGORIES)),
            'description' => 'required|string|max:2000',
            'budget_min' => 'required|numeric|min:1',
            'budget_max' => 'required|numeric|gte:budget_min',
            'quantity' => 'required|integer|min:1',
            'preferred_deadline' => 'nullable|date|after:today',
            'special_requirements' => 'nullable|string|max:1000',
            'is_public' => 'required|boolean',
            'seller_id' => 'nullable|required_if:is_public,false|exists:users,id',
            'reference_images' => 'nullable|array|max:5',
            'reference_images.*' => 'image|mimes:jpeg,png,jpg,gif,webp|max:5120',
        ]);

        // If direct request, verify seller exists and is a seller
        if (!$validated['is_public'] && $validated['seller_id']) {
            $seller = \App\Models\User::find($validated['seller_id']);
            if (!$seller || $seller->role !== 'seller') {
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid seller selected.',
                ], 422);
            }
        }

        DB::beginTransaction();
        try {
            // Handle image uploads
            $imagePaths = [];
            if ($request->hasFile('reference_images')) {
                foreach ($request->file('reference_images') as $image) {
                    $path = $image->store('custom-orders', 'public');
                    $imagePaths[] = Storage::url($path);
                }
            }

            $customOrder = CustomOrderRequest::create([
                'request_number' => 'COR-' . strtoupper(Str::random(8)),
                'buyer_id' => $user->id,
                'seller_id' => $validated['is_public'] ? null : $validated['seller_id'],
                'is_public' => $validated['is_public'],
                'title' => $validated['title'],
                'category' => $validated['category'],
                'description' => $validated['description'],
                'budget_min' => $validated['budget_min'],
                'budget_max' => $validated['budget_max'],
                'quantity' => $validated['quantity'],
                'preferred_deadline' => $validated['preferred_deadline'] ?? null,
                'special_requirements' => $validated['special_requirements'] ?? null,
                'reference_images' => $imagePaths,
                'status' => $validated['is_public'] ? CustomOrderRequest::STATUS_OPEN : CustomOrderRequest::STATUS_PENDING,
            ]);

            // Notify seller if direct request
            if (!$validated['is_public'] && $customOrder->seller) {
                $customOrder->seller->notify(new NewCustomOrderRequest($customOrder));
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => $validated['is_public']
                    ? 'Your request has been posted to the marketplace.'
                    : 'Your request has been sent to the seller.',
                'data' => [
                    'id' => $customOrder->id,
                    'request_number' => $customOrder->request_number,
                ],
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to create request.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Accept a bid (for public requests)
     */
    public function acceptBid(CustomOrderRequest $customOrder, CustomOrderBid $bid): JsonResponse
    {
        $user = Auth::user();

        if ($customOrder->buyer_id !== $user->id) {
            return response()->json([
                'success' => false,
                'message' => 'Request not found.',
            ], 404);
        }

        if ($bid->custom_order_request_id !== $customOrder->id) {
            return response()->json([
                'success' => false,
                'message' => 'Bid not found.',
            ], 404);
        }

        if (!$bid->canBeAccepted()) {
            return response()->json([
                'success' => false,
                'message' => 'This bid cannot be accepted.',
            ], 422);
        }

        DB::beginTransaction();
        try {
            // Accept the bid
            $bid->update([
                'status' => CustomOrderBid::STATUS_ACCEPTED,
                'accepted_at' => now(),
            ]);

            // Update the request
            $customOrder->update([
                'status' => CustomOrderRequest::STATUS_ACCEPTED,
                'seller_id' => $bid->seller_id,
                'accepted_bid_id' => $bid->id,
                'quoted_price' => $bid->proposed_price,
                'estimated_days' => $bid->estimated_days,
                'accepted_at' => now(),
            ]);

            // Reject other pending bids
            $customOrder->bids()
                ->where('id', '!=', $bid->id)
                ->where('status', CustomOrderBid::STATUS_PENDING)
                ->update([
                    'status' => CustomOrderBid::STATUS_REJECTED,
                    'rejected_at' => now(),
                    'rejection_reason' => 'Another bid was accepted',
                ]);

            // Notify seller
            $bid->seller->notify(new CustomOrderAccepted($customOrder));

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Bid accepted successfully.',
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to accept bid.',
            ], 500);
        }
    }

    /**
     * Accept a quote (for direct requests)
     */
    public function acceptQuote(CustomOrderRequest $customOrder): JsonResponse
    {
        $user = Auth::user();

        if ($customOrder->buyer_id !== $user->id) {
            return response()->json([
                'success' => false,
                'message' => 'Request not found.',
            ], 404);
        }

        if (!$customOrder->canBeAccepted()) {
            return response()->json([
                'success' => false,
                'message' => 'This quote cannot be accepted.',
            ], 422);
        }

        $customOrder->update([
            'status' => CustomOrderRequest::STATUS_ACCEPTED,
            'accepted_at' => now(),
        ]);

        // Notify seller
        if ($customOrder->seller) {
            $customOrder->seller->notify(new CustomOrderAccepted($customOrder));
        }

        return response()->json([
            'success' => true,
            'message' => 'Quote accepted successfully.',
        ]);
    }

    /**
     * Decline a quote (for direct requests)
     */
    public function declineQuote(Request $request, CustomOrderRequest $customOrder): JsonResponse
    {
        $user = Auth::user();

        if ($customOrder->buyer_id !== $user->id) {
            return response()->json([
                'success' => false,
                'message' => 'Request not found.',
            ], 404);
        }

        if (!$customOrder->canBeDeclined()) {
            return response()->json([
                'success' => false,
                'message' => 'This quote cannot be declined.',
            ], 422);
        }

        $validated = $request->validate([
            'reason' => 'nullable|string|max:500',
        ]);

        $customOrder->update([
            'status' => CustomOrderRequest::STATUS_DECLINED,
            'rejection_reason' => $validated['reason'] ?? 'Declined by buyer',
            'rejected_at' => now(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Quote declined.',
        ]);
    }

    /**
     * Cancel a request
     */
    public function cancel(CustomOrderRequest $customOrder): JsonResponse
    {
        $user = Auth::user();

        if ($customOrder->buyer_id !== $user->id) {
            return response()->json([
                'success' => false,
                'message' => 'Request not found.',
            ], 404);
        }

        if (!$customOrder->canBeCancelled()) {
            return response()->json([
                'success' => false,
                'message' => 'This request cannot be cancelled.',
            ], 422);
        }

        $customOrder->update([
            'status' => CustomOrderRequest::STATUS_CANCELLED,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Request cancelled.',
        ]);
    }

    /**
     * Get available categories
     */
    public function categories(): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => collect(CustomOrderRequest::CATEGORIES)->map(fn($label, $key) => [
                'key' => $key,
                'label' => $label,
            ])->values(),
        ]);
    }

    private function getStatusLabel(string $status): string
    {
        return match ($status) {
            CustomOrderRequest::STATUS_OPEN => 'Open for Bids',
            CustomOrderRequest::STATUS_PENDING => 'Awaiting Quote',
            CustomOrderRequest::STATUS_QUOTED => 'Quote Received',
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
