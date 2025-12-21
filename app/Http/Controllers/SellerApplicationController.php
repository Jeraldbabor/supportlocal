<?php

namespace App\Http\Controllers;

use App\Models\SellerApplication;
use App\Models\User;
use App\Notifications\NewSellerApplicationSubmitted;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rules\File;
use Inertia\Inertia;
use Inertia\Response;

class SellerApplicationController extends Controller
{
    /**
     * Show the pre-application confirmation message.
     */
    public function showPreApplicationMessage(): Response|RedirectResponse
    {
        $user = Auth::user();

        // Check if user already has an application
        $existingApplication = SellerApplication::where('user_id', $user->id)->first();

        // If they already have an application, redirect to the main application page
        if ($existingApplication) {
            return redirect()->route('seller.application.create');
        }

        return Inertia::render('buyer/seller-application-confirmation', [
            'user' => [
                'name' => $user->name,
                'email' => $user->email,
            ],
        ]);
    }

    /**
     * Show the seller application form.
     */
    public function create(): Response
    {
        $user = Auth::user();

        // Check if user already has an application
        $existingApplication = SellerApplication::where('user_id', $user->id)->first();

        return Inertia::render('buyer/seller-application', [
            'idTypes' => SellerApplication::ID_TYPES,
            'hasExistingApplication' => $existingApplication !== null,
            'existingApplication' => $existingApplication ? [
                'status' => $existingApplication->status,
                'created_at' => $existingApplication->created_at->toISOString(),
                'admin_notes' => $existingApplication->admin_notes,
                'reviewed_at' => $existingApplication->reviewed_at?->toISOString(),
            ] : null,
            'userProfile' => [
                'name' => $user->name,
                'email' => $user->email,
                'phone_number' => $user->phone_number,
                'address' => $user->address,
                'profile_picture' => $user->profile_picture,
                'avatar_url' => $user->avatar_url,
                'profile_completeness' => $user->profile_completeness,
                'missing_fields' => $user->getMissingSellerProfileFields(),
                'has_complete_profile' => $user->hasCompleteProfileForSeller(),
            ],
        ]);
    }

    /**
     * Store a new seller application.
     */
    public function store(Request $request): RedirectResponse
    {
        $user = Auth::user();

        // Check if user already has an application
        if (SellerApplication::where('user_id', $user->id)->exists()) {
            return redirect()->back()->withErrors([
                'application' => 'You have already submitted a seller application.',
            ]);
        }

        // Check if user is already a seller
        if ($user->isSeller()) {
            return redirect()->back()->withErrors([
                'application' => 'You are already a seller.',
            ]);
        }

        $request->validate([
            'business_description' => 'required|string|min:50|max:2000',
            'business_type' => 'nullable|string|max:255',
            'id_document_type' => 'required|string|in:'.implode(',', array_keys(SellerApplication::ID_TYPES)),
            'id_document' => [
                'required',
                File::types(['jpg', 'jpeg', 'png', 'pdf'])
                    ->max(10 * 1024), // 10MB
            ],
            'additional_documents.*' => [
                'nullable',
                File::types(['jpg', 'jpeg', 'png', 'pdf'])
                    ->max(5 * 1024), // 5MB per file
            ],
        ]);

        // Store the ID document
        $idDocumentPath = $request->file('id_document')->store('seller-applications/id-documents', 'private');

        // Store additional documents if any
        $additionalDocumentPaths = [];
        if ($request->hasFile('additional_documents')) {
            foreach ($request->file('additional_documents') as $file) {
                $additionalDocumentPaths[] = $file->store('seller-applications/additional-documents', 'private');
            }
        }

        // Create the application
        $application = SellerApplication::create([
            'user_id' => $user->id,
            'business_description' => $request->business_description,
            'business_type' => $request->business_type,
            'id_document_type' => $request->id_document_type,
            'id_document_path' => $idDocumentPath,
            'additional_documents_path' => $additionalDocumentPaths,
            'status' => SellerApplication::STATUS_PENDING,
        ]);

        // Notify all administrators about the new application
        $admins = User::where('role', User::ROLE_ADMINISTRATOR)->get();
        Notification::send($admins, new NewSellerApplicationSubmitted($application));

        return redirect()->route('seller.application.create')->with('success',
            'Your seller application has been submitted successfully! We will review it within 3-5 business days.');
    }

    /**
     * Show all applications for admin review.
     */
    public function index(): Response
    {
        $applications = SellerApplication::with(['user', 'reviewer'])
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return Inertia::render('admin/seller-applications/index', [
            'applications' => $applications,
        ]);
    }

    /**
     * Show a specific application for admin review.
     */
    public function show(SellerApplication $application): Response
    {
        $application->load(['user', 'reviewer']);

        // Include buyer's current profile information for admin review
        $buyerProfile = [
            'name' => $application->user->name,
            'email' => $application->user->email,
            'phone_number' => $application->user->phone_number,
            'address' => $application->user->address,
            'date_of_birth' => $application->user->date_of_birth,
            'profile_picture' => $application->user->profile_picture,
            'avatar_url' => $application->user->avatar_url,
            'delivery_address' => $application->user->delivery_address,
            'delivery_phone' => $application->user->delivery_phone,
            'delivery_notes' => $application->user->delivery_notes,
            'gcash_number' => $application->user->gcash_number,
            'gcash_name' => $application->user->gcash_name,
            'profile_completeness' => $application->user->profile_completeness,
            'missing_fields' => $application->user->getMissingSellerProfileFields(),
            'has_complete_profile' => $application->user->hasCompleteProfileForSeller(),
        ];

        return Inertia::render('admin/seller-applications/show', [
            'application' => $application,
            'buyerProfile' => $buyerProfile,
        ]);
    }

    /**
     * Approve a seller application.
     */
    public function approve(Request $request, SellerApplication $application): RedirectResponse
    {
        $request->validate([
            'admin_notes' => 'nullable|string|max:1000',
        ]);

        // Store the buyer's profile information before approval for logging
        $buyerProfile = [
            'name' => $application->user->name,
            'email' => $application->user->email,
            'profile_picture' => $application->user->profile_picture,
            'phone_number' => $application->user->phone_number,
            'address' => $application->user->address,
        ];

        try {
            $application->approve(Auth::user(), $request->admin_notes);

            return redirect()->back()->with('success',
                'Application approved successfully! The user has been granted seller privileges and their buyer profile information has been preserved.');
        } catch (\Exception $e) {
            return redirect()->back()->withErrors([
                'approval' => $e->getMessage(),
            ]);
        }
    }

    /**
     * Reject a seller application.
     */
    public function reject(Request $request, SellerApplication $application): RedirectResponse
    {
        $request->validate([
            'admin_notes' => 'required|string|max:1000',
        ]);

        $application->reject(Auth::user(), $request->admin_notes);

        return redirect()->back()->with('success',
            'Application rejected. The user has been notified.');
    }

    /**
     * Download a document from an application.
     */
    public function downloadDocument(SellerApplication $application, string $type): \Symfony\Component\HttpFoundation\StreamedResponse
    {
        // Ensure the user is an admin
        if (! Auth::user()->isAdministrator()) {
            abort(403);
        }

        // Load the user relationship to avoid PHPStan issues
        $application->load('user');

        /** @var \App\Models\User $user */
        $user = $application->user;

        $path = null;
        $filename = null;

        if ($type === 'id_document') {
            $path = $application->id_document_path;
            $filename = 'id_document_'.$user->name.'_'.$application->id;
        } elseif ($type === 'additional_documents' && is_array($application->additional_documents_path)) {
            // For simplicity, we'll download the first additional document
            // In a real app, you might want to specify which document to download
            $path = $application->additional_documents_path[0] ?? null;
            $filename = 'additional_document_'.$user->name.'_'.$application->id;
        }

        if (! $path || ! Storage::disk('private')->exists($path)) {
            abort(404);
        }

        return Storage::disk('private')->download($path, $filename);
    }
}
