// Components
import PasswordResetLinkController from '@/actions/App/Http/Controllers/Auth/PasswordResetLinkController';
import { login } from '@/routes';
import { Form, Head } from '@inertiajs/react';
import { LoaderCircle, Mail } from 'lucide-react';

import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AuthLayout from '@/layouts/auth-layout';

interface ForgotPasswordProps {
    status?: string;
    sellerCount?: number;
    featuredArtisans?: Array<{
        id: number;
        name: string;
        avatar_url: string;
    }>;
}

export default function ForgotPassword({ status, sellerCount, featuredArtisans }: ForgotPasswordProps) {
    return (
        <AuthLayout 
            title="Forgot password?" 
            description="Enter your email and we'll send you a link to reset your password"
            sellerCount={sellerCount}
            featuredArtisans={featuredArtisans}
        >
            <Head title="Forgot password" />

            {status && (
                <div className="mb-6 rounded-xl border-2 border-green-300 bg-gradient-to-r from-green-50 to-emerald-50 p-4 text-center text-sm font-medium text-green-900 shadow-sm duration-300 animate-in fade-in slide-in-from-top-2 dark:border-green-700 dark:from-green-900/20 dark:to-emerald-900/20 dark:text-green-400">
                    {status}
                </div>
            )}

            <Form
                action={PasswordResetLinkController.store().url}
                method={PasswordResetLinkController.store().method}
                className="space-y-4"
            >
                {({ processing, errors }) => (
                    <>
                        <div className="group space-y-2">
                            <Label htmlFor="email" className="flex items-center gap-2 text-xs font-semibold text-gray-700 dark:text-gray-300">
                                Email address
                            </Label>
                            <div className="relative">
                                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                    <Mail className="h-4 w-4 text-gray-400 transition-colors duration-200 group-focus-within:text-amber-600" />
                                </div>
                                <Input
                                    id="email"
                                    type="email"
                                    name="email"
                                    required
                                    autoFocus
                                    autoComplete="email"
                                    placeholder="Enter your email"
                                    className="h-10 rounded-lg border-2 border-gray-200 pl-9 text-sm transition-all duration-200 hover:border-gray-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 dark:border-gray-700 dark:hover:border-gray-600 dark:focus:border-amber-500 dark:focus:ring-amber-900/50"
                                />
                            </div>
                            <InputError message={errors.email} />
                        </div>

                        <div className="space-y-3 pt-2">
                            <Button
                                type="submit"
                                className="h-10 w-full rounded-lg bg-gradient-to-r from-amber-600 via-amber-700 to-orange-600 text-sm font-bold text-white shadow-lg transition-all duration-300 hover:scale-[1.02] hover:from-amber-700 hover:via-amber-800 hover:to-orange-700 hover:shadow-2xl active:scale-[0.98]"
                                disabled={processing}
                                data-test="email-password-reset-link-button"
                            >
                                {processing ? (
                                    <>
                                        <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                                        Sending...
                                    </>
                                ) : (
                                    'Send Reset Link'
                                )}
                            </Button>
                        </div>

                        <div className="pt-2 text-center text-sm text-gray-600 dark:text-gray-400">
                            <span>Remember your password? </span>
                            <TextLink
                                href="/login"
                                className="font-medium text-amber-700 transition-colors hover:text-amber-800 hover:underline dark:text-amber-400 dark:hover:text-amber-300"
                            >
                                Back to login
                            </TextLink>
                        </div>
                    </>
                )}
            </Form>
        </AuthLayout>
    );
}
