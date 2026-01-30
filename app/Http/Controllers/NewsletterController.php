<?php

namespace App\Http\Controllers;

use App\Models\NewsletterSubscriber;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class NewsletterController extends Controller
{
    /**
     * Subscribe to the newsletter.
     */
    public function subscribe(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email|max:255',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Please enter a valid email address.',
            ], 422);
        }

        $email = strtolower(trim($request->email));

        // Check if already subscribed and active
        $existing = NewsletterSubscriber::where('email', $email)->first();

        if ($existing && $existing->is_active) {
            return response()->json([
                'success' => true,
                'message' => 'You are already subscribed to our newsletter!',
            ]);
        }

        // Subscribe (or resubscribe)
        NewsletterSubscriber::subscribe($email);

        return response()->json([
            'success' => true,
            'message' => 'Thank you for subscribing! You\'ll receive updates on new products and exclusive deals.',
        ]);
    }

    /**
     * Unsubscribe from the newsletter.
     */
    public function unsubscribe(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid email address.',
            ], 422);
        }

        $subscriber = NewsletterSubscriber::where('email', strtolower(trim($request->email)))->first();

        if (!$subscriber) {
            return response()->json([
                'success' => false,
                'message' => 'Email not found in our subscriber list.',
            ], 404);
        }

        $subscriber->unsubscribe();

        return response()->json([
            'success' => true,
            'message' => 'You have been successfully unsubscribed.',
        ]);
    }
}
