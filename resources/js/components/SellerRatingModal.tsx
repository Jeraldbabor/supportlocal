import { User } from '@/types';
import { router } from '@inertiajs/react';
import axios from 'axios';
import { Star, X } from 'lucide-react';
import React, { useEffect, useState } from 'react';

interface RatingModalProps {
    isOpen: boolean;
    onClose: () => void;
    seller: {
        id: number;
        name: string;
        business_name?: string | null;
    };
    existingRating?: {
        id: number;
        rating: number;
        review: string | null;
    } | null;
    onSuccess: () => void;
}

export default function SellerRatingModal({ isOpen, onClose, seller, existingRating, onSuccess }: RatingModalProps) {
    const [rating, setRating] = useState(existingRating?.rating || 0);
    const [hoveredRating, setHoveredRating] = useState(0);
    const [review, setReview] = useState(existingRating?.review || '');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (existingRating) {
            setRating(existingRating.rating);
            setReview(existingRating.review || '');
        } else {
            setRating(0);
            setReview('');
        }
        setError('');
    }, [existingRating, isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (rating === 0) {
            setError('Please select a rating');
            return;
        }

        setIsSubmitting(true);

        try {
            if (existingRating) {
                // Update existing rating
                await axios.put(`/buyer/seller/${seller.id}/ratings/${existingRating.id}`, {
                    rating,
                    review: review.trim() || null,
                });
            } else {
                // Create new rating
                await axios.post(`/buyer/seller/${seller.id}/ratings`, {
                    rating,
                    review: review.trim() || null,
                });
            }

            onSuccess();
            onClose();
        } catch (err: any) {
            if (err.response?.data?.message) {
                setError(err.response.data.message);
            } else {
                setError('Failed to submit rating. Please try again.');
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
            <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
                <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-xl font-bold text-gray-900">
                        {existingRating ? 'Edit Your Rating' : 'Rate Seller'}
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <X className="h-6 w-6" />
                    </button>
                </div>

                <div className="mb-4">
                    <p className="text-sm text-gray-600">
                        Rating for <span className="font-semibold">{seller.business_name || seller.name}</span>
                    </p>
                </div>

                <form onSubmit={handleSubmit}>
                    {/* Star Rating */}
                    <div className="mb-6">
                        <label className="mb-2 block text-sm font-medium text-gray-700">Your Rating *</label>
                        <div className="flex gap-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    type="button"
                                    onMouseEnter={() => setHoveredRating(star)}
                                    onMouseLeave={() => setHoveredRating(0)}
                                    onClick={() => setRating(star)}
                                    className="transition-transform hover:scale-110"
                                >
                                    <Star
                                        className={`h-10 w-10 ${
                                            star <= (hoveredRating || rating) ? 'fill-current text-yellow-400' : 'text-gray-300'
                                        }`}
                                    />
                                </button>
                            ))}
                        </div>
                        {rating > 0 && (
                            <p className="mt-2 text-sm text-gray-600">
                                {rating === 1 && 'Poor'}
                                {rating === 2 && 'Fair'}
                                {rating === 3 && 'Good'}
                                {rating === 4 && 'Very Good'}
                                {rating === 5 && 'Excellent'}
                            </p>
                        )}
                    </div>

                    {/* Review Text */}
                    <div className="mb-6">
                        <label htmlFor="review" className="mb-2 block text-sm font-medium text-gray-700">
                            Your Review (Optional)
                        </label>
                        <textarea
                            id="review"
                            value={review}
                            onChange={(e) => setReview(e.target.value)}
                            rows={4}
                            maxLength={1000}
                            placeholder="Share your experience with this seller..."
                            className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-primary focus:ring-primary"
                        />
                        <p className="mt-1 text-xs text-gray-500">{review.length}/1000 characters</p>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">
                            {error}
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isSubmitting}
                            className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting || rating === 0}
                            className="flex-1 rounded-lg bg-gradient-to-r from-amber-600 to-orange-600 px-4 py-2 text-white hover:from-amber-700 hover:to-orange-700 disabled:opacity-50"
                        >
                            {isSubmitting ? 'Submitting...' : existingRating ? 'Update Rating' : 'Submit Rating'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
