<?php

namespace App\Http\Controllers;

use App\Models\SellerApplication;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rules\File;
use Inertia\Inertia;
use Inertia\Response;

class SellerApplicationController extends Controller
{
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
            ] : null,
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
                'application' => 'You have already submitted a seller application.'
            ]);
        }

        // Check if user is already a seller
        if ($user->isSeller()) {
            return redirect()->back()->withErrors([
                'application' => 'You are already a seller.'
            ]);
        }

        $request->validate([
            'business_description' => 'required|string|min:50|max:2000',
            'business_type' => 'nullable|string|max:255',
            'id_document_type' => 'required|string|in:' . implode(',', array_keys(SellerApplication::ID_TYPES)),
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
        SellerApplication::create([
            'user_id' => $user->id,
            'business_description' => $request->business_description,
            'business_type' => $request->business_type,
            'id_document_type' => $request->id_document_type,
            'id_document_path' => $idDocumentPath,
            'additional_documents_path' => $additionalDocumentPaths,
            'status' => SellerApplication::STATUS_PENDING,
        ]);

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

        return Inertia::render('admin/seller-applications/show', [
            'application' => $application,
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

        $application->approve(Auth::user(), $request->admin_notes);

        return redirect()->back()->with('success', 
            'Application approved successfully! The user has been granted seller privileges.');
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
        if (!Auth::user()->isAdministrator()) {
            abort(403);
        }

        $path = null;
        $filename = null;

        if ($type === 'id_document') {
            $path = $application->id_document_path;
            $filename = 'id_document_' . $application->user->name . '_' . $application->id;
        } elseif ($type === 'additional_documents' && is_array($application->additional_documents_path)) {
            // For simplicity, we'll download the first additional document
            // In a real app, you might want to specify which document to download
            $path = $application->additional_documents_path[0] ?? null;
            $filename = 'additional_document_' . $application->user->name . '_' . $application->id;
        }

        if (!$path || !Storage::disk('private')->exists($path)) {
            abort(404);
        }

        return Storage::disk('private')->download($path, $filename);
    }
}
