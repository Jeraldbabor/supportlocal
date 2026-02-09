<?php

namespace App\Http\Controllers\Seller;

use App\Http\Controllers\Controller;
use App\Models\CustomOrderBid;
use App\Models\CustomOrderRequest;
use App\Notifications\NewBidReceived;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class MarketplaceController extends Controller
{
    /**
     * Display the marketplace with open custom order requests
     */
    public function index(Request $request)
    {
        $user = Auth::user();
        $query = CustomOrderRequest::openForBids()
            ->with('buyer')
            ->withCount('bids');

        // Filter by category
        if ($request->filled('category')) {
            $query->where('category', $request->category);
        }

        // Filter by budget range
        if ($request->filled('min_budget')) {
            $query->where('budget_max', '>=', $request->min_budget);
        }
        if ($request->filled('max_budget')) {
            $query->where('budget_min', '<=', $request->max_budget);
        }

        // Search
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%");
            });
        }

        // Sort
        $sortBy = $request->get('sort', 'newest');
        switch ($sortBy) {
            case 'deadline':
                $query->orderBy('preferred_deadline', 'asc');
                break;
            case 'budget_high':
                $query->orderByRaw('COALESCE(budget_max, budget_min, 0) DESC');
                break;
            case 'budget_low':
                $query->orderByRaw('COALESCE(budget_min, budget_max, 0) ASC');
                break;
            case 'fewest_bids':
                $query->orderBy('bids_count', 'asc');
                break;
            default:
                $query->orderBy('created_at', 'desc');
        }

        $requests = $query->paginate(12)->through(function ($request) use ($user) {
            $buyer = $request->buyer;
            $myBid = $request->bids()->where('seller_id', $user->id)->first();

            return [
                'id' => $request->id,
                'request_number' => $request->request_number,
                'title' => $request->title,
                'description' => $request->description,
                'category' => $request->category,
                'category_label' => $request->category_label,
                'budget_min' => $request->budget_min,
                'budget_max' => $request->budget_max,
                'formatted_budget' => $request->formatted_budget,
                'quantity' => $request->quantity,
                'preferred_deadline' => $request->preferred_deadline,
                'reference_image_urls' => $request->reference_image_urls,
                'status' => $request->status,
                'status_label' => $request->status_label,
                'status_color' => $request->status_color,
                'bids_count' => $request->bids_count,
                'created_at' => $request->created_at,
                'buyer' => $buyer ? [
                    'id' => $buyer->id,
                    'name' => $buyer->name,
                    'avatar_url' => $buyer->avatar_url,
                ] : null,
                'my_bid' => $myBid ? [
                    'id' => $myBid->id,
                    'proposed_price' => $myBid->proposed_price,
                    'estimated_days' => $myBid->estimated_days,
                    'status' => $myBid->status,
                    'status_label' => $myBid->status_label,
                ] : null,
                'can_bid' => $request->canReceiveBidFrom($user->id),
            ];
        });

        // Get my active bids
        $myBids = CustomOrderBid::where('seller_id', $user->id)
            ->with(['customOrderRequest.buyer'])
            ->orderBy('created_at', 'desc')
            ->take(5)
            ->get()
            ->map(function ($bid) {
                $request = $bid->customOrderRequest;
                $buyer = $request?->buyer;

                return [
                    'id' => $bid->id,
                    'proposed_price' => $bid->proposed_price,
                    'estimated_days' => $bid->estimated_days,
                    'status' => $bid->status,
                    'status_label' => $bid->status_label,
                    'status_color' => $bid->status_color,
                    'created_at' => $bid->created_at,
                    'request' => $request ? [
                        'id' => $request->id,
                        'title' => $request->title,
                        'status' => $request->status,
                        'buyer' => $buyer ? [
                            'name' => $buyer->name,
                        ] : null,
                    ] : null,
                ];
            });

        // Stats
        $stats = [
            'total_bids' => CustomOrderBid::where('seller_id', $user->id)->count(),
            'pending_bids' => CustomOrderBid::where('seller_id', $user->id)->where('status', 'pending')->count(),
            'accepted_bids' => CustomOrderBid::where('seller_id', $user->id)->where('status', 'accepted')->count(),
            'open_requests' => CustomOrderRequest::openForBids()->count(),
        ];

        return Inertia::render('seller/Marketplace/Index', [
            'requests' => $requests,
            'myBids' => $myBids,
            'stats' => $stats,
            'categories' => CustomOrderRequest::$categories,
            'filters' => [
                'search' => $request->search,
                'category' => $request->category,
                'min_budget' => $request->min_budget,
                'max_budget' => $request->max_budget,
                'sort' => $request->get('sort', 'newest'),
            ],
        ]);
    }

    /**
     * Show a specific request to potentially bid on
     */
    public function show(CustomOrderRequest $customOrderRequest)
    {
        $user = Auth::user();

        // Must be a public request (but can be any status for viewing purposes)
        // Sellers can view details even if the request is no longer accepting bids
        if (! $customOrderRequest->is_public) {
            return redirect()->route('seller.marketplace.index')
                ->with('error', 'This is a private custom order request.');
        }


        $customOrderRequest->load('buyer');
        $buyer = $customOrderRequest->buyer;

        // Get my bid if exists
        $myBid = $customOrderRequest->bids()
            ->where('seller_id', $user->id)
            ->first();

        return Inertia::render('seller/Marketplace/Show', [
            'request' => [
                'id' => $customOrderRequest->id,
                'request_number' => $customOrderRequest->request_number,
                'title' => $customOrderRequest->title,
                'description' => $customOrderRequest->description,
                'category' => $customOrderRequest->category,
                'category_label' => $customOrderRequest->category_label,
                'budget_min' => $customOrderRequest->budget_min,
                'budget_max' => $customOrderRequest->budget_max,
                'formatted_budget' => $customOrderRequest->formatted_budget,
                'quantity' => $customOrderRequest->quantity,
                'preferred_deadline' => $customOrderRequest->preferred_deadline,
                'special_requirements' => $customOrderRequest->special_requirements,
                'reference_image_urls' => $customOrderRequest->reference_image_urls,
                'status' => $customOrderRequest->status,
                'status_label' => $customOrderRequest->status_label,
                'status_color' => $customOrderRequest->status_color,
                'bids_count' => $customOrderRequest->bids_count,
                'created_at' => $customOrderRequest->created_at,
                'buyer' => $buyer ? [
                    'id' => $buyer->id,
                    'name' => $buyer->name,
                    'avatar_url' => $buyer->avatar_url,
                    'address' => $buyer->address,
                ] : null,
            ],
            'myBid' => $myBid ? [
                'id' => $myBid->id,
                'proposed_price' => $myBid->proposed_price,
                'estimated_days' => $myBid->estimated_days,
                'message' => $myBid->message,
                'additional_notes' => $myBid->additional_notes,
                'status' => $myBid->status,
                'status_label' => $myBid->status_label,
                'status_color' => $myBid->status_color,
                'created_at' => $myBid->created_at,
            ] : null,
            'canBid' => $customOrderRequest->canReceiveBidFrom($user->id),
        ]);
    }

    /**
     * Submit a bid on a request
     */
    public function submitBid(Request $request, CustomOrderRequest $customOrderRequest)
    {
        $user = Auth::user();

        // Validate
        if (! $customOrderRequest->canReceiveBidFrom($user->id)) {
            return back()->with('error', 'You cannot bid on this request.');
        }

        $validated = $request->validate([
            'proposed_price' => 'required|numeric|min:1',
            'estimated_days' => 'required|integer|min:1|max:365',
            'message' => 'required|string|min:20|max:2000',
            'additional_notes' => 'nullable|string|max:1000',
        ]);

        $bid = CustomOrderBid::create([
            'custom_order_request_id' => $customOrderRequest->id,
            'seller_id' => $user->id,
            'proposed_price' => $validated['proposed_price'],
            'estimated_days' => $validated['estimated_days'],
            'message' => $validated['message'],
            'additional_notes' => $validated['additional_notes'] ?? null,
            'status' => CustomOrderBid::STATUS_PENDING,
        ]);

        // Notify the buyer
        $customOrderRequest->buyer->notify(new NewBidReceived($bid));

        return redirect()->route('seller.marketplace.show', $customOrderRequest)
            ->with('success', 'Your bid has been submitted successfully!');
    }

    /**
     * Update an existing bid
     */
    public function updateBid(Request $request, CustomOrderBid $bid)
    {
        $user = Auth::user();

        // Must own the bid
        if ($bid->seller_id !== $user->id) {
            abort(403);
        }

        // Must be pending
        if ($bid->status !== CustomOrderBid::STATUS_PENDING) {
            return back()->with('error', 'You can only update pending bids.');
        }

        $validated = $request->validate([
            'proposed_price' => 'required|numeric|min:1',
            'estimated_days' => 'required|integer|min:1|max:365',
            'message' => 'required|string|min:20|max:2000',
            'additional_notes' => 'nullable|string|max:1000',
        ]);

        $bid->update($validated);

        return back()->with('success', 'Your bid has been updated!');
    }

    /**
     * Withdraw a bid
     */
    public function withdrawBid(CustomOrderBid $bid)
    {
        $user = Auth::user();

        // Must own the bid
        if ($bid->seller_id !== $user->id) {
            abort(403);
        }

        if (! $bid->canBeWithdrawn()) {
            return back()->with('error', 'This bid cannot be withdrawn.');
        }

        $bid->update([
            'status' => CustomOrderBid::STATUS_WITHDRAWN,
        ]);

        return redirect()->route('seller.marketplace.index')
            ->with('success', 'Your bid has been withdrawn.');
    }

    /**
     * View all my bids
     */
    public function myBids(Request $request)
    {
        $user = Auth::user();

        $query = CustomOrderBid::where('seller_id', $user->id)
            ->with(['customOrderRequest.buyer']);

        // Filter by status
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        $bids = $query->orderBy('created_at', 'desc')
            ->paginate(10)
            ->through(function ($bid) {
                $request = $bid->customOrderRequest;
                $buyer = $request?->buyer;

                return [
                    'id' => $bid->id,
                    'proposed_price' => $bid->proposed_price,
                    'estimated_days' => $bid->estimated_days,
                    'message' => $bid->message,
                    'status' => $bid->status,
                    'status_label' => $bid->status_label,
                    'status_color' => $bid->status_color,
                    'created_at' => $bid->created_at,
                    'request' => $request ? [
                        'id' => $request->id,
                        'request_number' => $request->request_number,
                        'title' => $request->title,
                        'category_label' => $request->category_label,
                        'formatted_budget' => $request->formatted_budget,
                        'status' => $request->status,
                        'status_label' => $request->status_label,
                        'buyer' => $buyer ? [
                            'id' => $buyer->id,
                            'name' => $buyer->name,
                            'avatar_url' => $buyer->avatar_url,
                        ] : null,
                    ] : null,
                    'can_withdraw' => $bid->canBeWithdrawn(),
                ];
            });

        $stats = [
            'total' => CustomOrderBid::where('seller_id', $user->id)->count(),
            'pending' => CustomOrderBid::where('seller_id', $user->id)->where('status', 'pending')->count(),
            'accepted' => CustomOrderBid::where('seller_id', $user->id)->where('status', 'accepted')->count(),
            'rejected' => CustomOrderBid::where('seller_id', $user->id)->where('status', 'rejected')->count(),
        ];

        return Inertia::render('seller/Marketplace/MyBids', [
            'bids' => $bids,
            'stats' => $stats,
            'filters' => [
                'status' => $request->status,
            ],
        ]);
    }
}
