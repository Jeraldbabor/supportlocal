import EmailVerificationNotificationController from '@/actions/App/Http/Controllers/Auth/EmailVerificationNotificationController';
import { Form, Head, Link } from '@inertiajs/react';
import { LoaderCircle, Mail } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import AuthLayout from '@/layouts/auth-layout';

interface VerifyEmailProps {
    status?: string;
    sellerCount?: number;
    featuredArtisans?: Array<{
        id: number;
        name: string;
        avatar_url: string;
    }>;
    cooldownSeconds?: number;
    resendCount?: number;
}

export default function VerifyEmail({ status, sellerCount, featuredArtisans, cooldownSeconds = 0, resendCount = 0 }: VerifyEmailProps) {
    const [countdown, setCountdown] = useState(cooldownSeconds);
    const [localResendCount, setLocalResendCount] = useState(resendCount);

    // Format seconds to readable text
    const formatTime = useCallback((seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        if (mins > 0) {
            return secs > 0 ? `${mins} min ${secs} sec` : `${mins} min`;
        }
        return `${secs} sec`;
    }, []);

    // Countdown timer effect
    useEffect(() => {
        if (countdown <= 0) return;

        const timer = setInterval(() => {
            setCountdown((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [countdown]);

    // Update countdown when props change (after form submission/page load)
    useEffect(() => {
        setCountdown(cooldownSeconds);
        setLocalResendCount(resendCount);
    }, [cooldownSeconds, resendCount]);

    useEffect(() => {
        // Prevent back button navigation
        window.history.pushState(null, '', window.location.href);

        const handlePopState = () => {
            window.history.pushState(null, '', window.location.href);
        };

        window.addEventListener('popstate', handlePopState);

        return () => {
            window.removeEventListener('popstate', handlePopState);
        };
    }, []);

    const isOnCooldown = countdown > 0;
    const attemptsRemaining = 3 - localResendCount;

    return (
        <AuthLayout
            title="Verify your email"
            description="We've sent a verification link to your email. Click it to activate your account."
            sellerCount={sellerCount}
            featuredArtisans={featuredArtisans}
            disableLogoLink={true}
        >
            <Head title="Email verification" />

            {status === 'verification-link-sent' && (
                <div className="mb-6 rounded-xl border-2 border-green-300 bg-gradient-to-r from-green-50 to-emerald-50 p-4 text-center text-sm font-medium text-green-900 shadow-sm duration-300 animate-in fade-in slide-in-from-top-2 dark:border-green-700 dark:from-green-900/20 dark:to-emerald-900/20 dark:text-green-400">
                    A new verification link has been sent to the email address you provided during registration.
                </div>
            )}

            <div className="space-y-4">
                {/* Info message */}
                <div className="rounded-lg border-2 border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50 p-4 dark:border-amber-800 dark:from-amber-900/20 dark:to-orange-900/20">
                    <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0">
                            <Mail className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                        </div>
                        <div className="flex-1">
                            <p className="text-sm font-medium text-amber-900 dark:text-amber-300">Check your inbox</p>
                            <p className="mt-1 text-xs text-amber-700 dark:text-amber-400">
                                We sent you a verification link. If you don't see it, check your spam folder.
                            </p>
                        </div>
                    </div>
                </div>

                <Form
                    action={EmailVerificationNotificationController.store().url}
                    method={EmailVerificationNotificationController.store().method}
                    className="space-y-3"
                >
                    {({ processing }) => (
                        <>
                            <Button
                                type="submit"
                                disabled={processing || isOnCooldown}
                                className="h-10 w-full rounded-lg bg-gradient-to-r from-amber-600 via-amber-700 to-orange-600 text-sm font-bold text-white shadow-lg transition-all duration-300 hover:scale-[1.02] hover:from-amber-700 hover:via-amber-800 hover:to-orange-700 hover:shadow-2xl active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
                            >
                                {processing ? (
                                    <>
                                        <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                                        Sending...
                                    </>
                                ) : (
                                    'Resend Verification Email'
                                )}
                            </Button>

                            {/* Cooldown reminder text */}
                            {isOnCooldown && (
                                <p className="text-center text-sm text-gray-600 dark:text-gray-400">
                                    Please wait {formatTime(countdown)} before resending
                                </p>
                            )}

                            {/* Resend attempts info */}
                            {!isOnCooldown && localResendCount > 0 && attemptsRemaining > 0 && (
                                <p className="text-center text-xs text-gray-500 dark:text-gray-400">
                                    {attemptsRemaining} resend{attemptsRemaining !== 1 ? 's' : ''} remaining before 10-minute cooldown
                                </p>
                            )}

                            <div className="pt-2 text-center">
                                <Link
                                    href="/logout"
                                    method="post"
                                    as="button"
                                    className="text-sm font-medium text-gray-600 transition-colors hover:text-gray-900 hover:underline dark:text-gray-400 dark:hover:text-gray-200"
                                >
                                    Cancel and return to home
                                </Link>
                            </div>
                        </>
                    )}
                </Form>
            </div>
        </AuthLayout>
    );
}
