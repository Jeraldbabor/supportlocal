import { useState } from 'react';

interface NewsletterSubscriptionProps {
    className?: string;
}

export default function NewsletterSubscription({ className = '' }: NewsletterSubscriptionProps) {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    const handleSubscribe = async (e: React.FormEvent) => {
        e.preventDefault();

        // Basic email validation
        if (!email || !email.includes('@')) {
            setMessage({ type: 'error', text: 'Please enter a valid email address.' });
            return;
        }

        setIsLoading(true);
        setMessage(null);

        try {
            const response = await fetch('/api/newsletter/subscribe', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify({ email }),
            });

            const data = await response.json();

            if (response.ok) {
                setMessage({ type: 'success', text: data.message || 'Successfully subscribed!' });
                setEmail('');
            } else {
                setMessage({ type: 'error', text: data.message || 'Failed to subscribe. Please try again.' });
            }
        } catch {
            setMessage({ type: 'error', text: 'An error occurred. Please try again later.' });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <section className={`bg-white py-8 sm:py-12 ${className}`}>
            <div className="mx-auto max-w-4xl px-3 sm:px-4 lg:px-8">
                <div className="rounded-xl border border-gray-200 bg-gradient-to-br from-amber-50 to-orange-50 p-6 shadow-sm sm:rounded-2xl sm:p-8 md:p-12">
                    <div className="text-center">
                        <h2 className="mb-2 text-xl font-bold text-gray-900 sm:text-2xl lg:text-3xl">Stay Updated</h2>
                        <p className="mb-4 text-xs text-gray-600 sm:mb-6 sm:text-sm lg:text-base">
                            Get the latest updates on new products and exclusive deals
                        </p>
                        <form onSubmit={handleSubscribe} className="mx-auto max-w-md">
                            <div className="flex flex-col gap-2 sm:gap-3">
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="Enter your email"
                                    disabled={isLoading}
                                    style={{ colorScheme: 'light', color: '#111827', backgroundColor: '#ffffff' }}
                                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 sm:px-4 sm:py-3"
                                />
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full rounded-lg bg-amber-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-amber-700 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto sm:px-6 sm:py-3"
                                >
                                    {isLoading ? 'Subscribing...' : 'Subscribe'}
                                </button>
                            </div>
                            {message && (
                                <p
                                    className={`mt-2 text-xs sm:text-sm ${
                                        message.type === 'success' ? 'text-green-600' : 'text-red-600'
                                    }`}
                                >
                                    {message.text}
                                </p>
                            )}
                            <p className="mt-2 text-[10px] text-gray-500 sm:mt-3 sm:text-xs">
                                We respect your privacy. Unsubscribe at any time.
                            </p>
                        </form>
                    </div>
                </div>
            </div>
        </section>
    );
}
