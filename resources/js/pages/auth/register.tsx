import RegisteredUserController from '@/actions/App/Http/Controllers/Auth/RegisteredUserController';
import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { login } from '@/routes';
import { Form, Head } from '@inertiajs/react';
import { Eye, EyeOff, LoaderCircle, Lock, Mail, Shield, User } from 'lucide-react';
import { useState } from 'react';

import AuthLayout from '@/layouts/auth-layout';

interface RegisterProps {
    sellerCount?: number;
    featuredArtisans?: Array<{
        id: number;
        name: string;
        avatar_url: string;
    }>;
}

export default function Register({ sellerCount, featuredArtisans }: RegisterProps) {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // Get guest cart from localStorage
    const guestCart = typeof window !== 'undefined' ? localStorage.getItem('guest_cart') : null;

    // Get form props from the controller action
    const route = RegisteredUserController.store();
    const formProps = { action: route.url, method: route.method };

    return (
        <AuthLayout
            title="Create your account"
            description="Join us today and start your journey"
            sellerCount={sellerCount}
            featuredArtisans={featuredArtisans}
        >
            <Head title="Register" />
            <Form {...formProps} className="space-y-2.5">
                {({ processing, errors }) => (
                    <>
                        {/* Hidden field for guest cart */}
                        {guestCart && <input type="hidden" name="guest_cart" value={guestCart} />}

                        <div className="space-y-2">
                            <div className="group space-y-1">
                                <Label htmlFor="name" className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                                    Full name
                                </Label>
                                <div className="relative">
                                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                        <User className="h-4 w-4 text-gray-400 transition-colors duration-200 group-focus-within:text-amber-600" />
                                    </div>
                                    <Input
                                        id="name"
                                        type="text"
                                        required
                                        autoFocus
                                        tabIndex={1}
                                        autoComplete="name"
                                        name="name"
                                        placeholder="Enter your full name"
                                        className="h-9 rounded-lg border-2 border-gray-200 pl-9 text-sm transition-all duration-200 hover:border-gray-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 dark:border-gray-700 dark:hover:border-gray-600 dark:focus:border-amber-500 dark:focus:ring-amber-900/50"
                                    />
                                </div>
                                <InputError message={errors.name} />
                            </div>

                            <div className="group space-y-1">
                                <Label htmlFor="email" className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                                    Email address
                                </Label>
                                <div className="relative">
                                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                        <Mail className="h-4 w-4 text-gray-400 transition-colors duration-200 group-focus-within:text-amber-600" />
                                    </div>
                                    <Input
                                        id="email"
                                        type="email"
                                        required
                                        tabIndex={2}
                                        autoComplete="email"
                                        name="email"
                                        placeholder="Enter your email"
                                        className="h-9 rounded-lg border-2 border-gray-200 pl-9 text-sm transition-all duration-200 hover:border-gray-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 dark:border-gray-700 dark:hover:border-gray-600 dark:focus:border-amber-500 dark:focus:ring-amber-900/50"
                                    />
                                </div>
                                <InputError message={errors.email} />
                            </div>

                            <div className="group space-y-1">
                                <Label htmlFor="password" className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                                    Password
                                </Label>
                                <div className="relative">
                                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                        <Lock className="h-4 w-4 text-gray-400 transition-colors duration-200 group-focus-within:text-amber-600" />
                                    </div>
                                    <Input
                                        id="password"
                                        type={showPassword ? 'text' : 'password'}
                                        required
                                        tabIndex={3}
                                        autoComplete="new-password"
                                        name="password"
                                        placeholder="Create a password"
                                        className="h-9 rounded-lg border-2 border-gray-200 pr-9 pl-9 text-sm transition-all duration-200 hover:border-gray-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 dark:border-gray-700 dark:hover:border-gray-600 dark:focus:border-amber-500 dark:focus:ring-amber-900/50"
                                    />
                                    <button
                                        type="button"
                                        className="absolute inset-y-0 right-0 flex items-center pr-3 transition-transform duration-200 hover:scale-110"
                                        onClick={() => setShowPassword(!showPassword)}
                                        tabIndex={-1}
                                    >
                                        {showPassword ? (
                                            <EyeOff className="h-4 w-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" />
                                        ) : (
                                            <Eye className="h-4 w-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" />
                                        )}
                                    </button>
                                </div>
                                <InputError message={errors.password} />
                            </div>

                            <div className="group space-y-1">
                                <Label htmlFor="password_confirmation" className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                                    Confirm password
                                </Label>
                                <div className="relative">
                                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                        <Shield className="h-4 w-4 text-gray-400 transition-colors duration-200 group-focus-within:text-amber-600" />
                                    </div>
                                    <Input
                                        id="password_confirmation"
                                        type={showConfirmPassword ? 'text' : 'password'}
                                        required
                                        tabIndex={4}
                                        autoComplete="new-password"
                                        name="password_confirmation"
                                        placeholder="Confirm your password"
                                        className="h-9 rounded-lg border-2 border-gray-200 pr-9 pl-9 text-sm transition-all duration-200 hover:border-gray-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 dark:border-gray-700 dark:hover:border-gray-600 dark:focus:border-amber-500 dark:focus:ring-amber-900/50"
                                    />
                                    <button
                                        type="button"
                                        className="absolute inset-y-0 right-0 flex items-center pr-3 transition-transform duration-200 hover:scale-110"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        tabIndex={-1}
                                    >
                                        {showConfirmPassword ? (
                                            <EyeOff className="h-4 w-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" />
                                        ) : (
                                            <Eye className="h-4 w-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" />
                                        )}
                                    </button>
                                </div>
                                <InputError message={errors.password_confirmation} />
                            </div>
                        </div>

                        <div className="space-y-2 pt-0.5">
                            <Button
                                type="submit"
                                className="h-9 w-full rounded-lg bg-gradient-to-r from-amber-600 via-amber-700 to-orange-600 text-sm font-bold text-white shadow-lg transition-all duration-300 hover:scale-[1.02] hover:from-amber-700 hover:via-amber-800 hover:to-orange-700 hover:shadow-2xl active:scale-[0.98]"
                                tabIndex={5}
                                data-test="register-user-button"
                            >
                                {processing ? (
                                    <>
                                        <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                                        Creating...
                                    </>
                                ) : (
                                    'Create account'
                                )}
                            </Button>

                            <div className="rounded-md border border-gray-200 bg-gray-50 px-2 py-1 text-center text-[9px] leading-tight text-gray-500 dark:border-gray-700 dark:bg-gray-800/50 dark:text-gray-400">
                                By creating an account, you agree to our{' '}
                                <a
                                    href="#"
                                    className="font-medium text-amber-700 underline transition-colors hover:text-amber-800 dark:text-amber-400 dark:hover:text-amber-300"
                                >
                                    Terms
                                </a>{' '}
                                and{' '}
                                <a
                                    href="#"
                                    className="font-medium text-amber-700 underline transition-colors hover:text-amber-800 dark:text-amber-400 dark:hover:text-amber-300"
                                >
                                    Privacy Policy
                                </a>
                            </div>

                            <div className="relative py-1.5">
                                <div className="absolute inset-0 flex items-center">
                                    <span className="w-full border-t-2 border-gray-200 dark:border-gray-700" />
                                </div>
                                <div className="relative flex justify-center text-xs">
                                    <span className="bg-white px-2 font-medium text-gray-500 dark:bg-gray-900 dark:text-gray-400">
                                        Or continue with
                                    </span>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                                <a
                                    href="/auth/google/redirect"
                                    className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border-2 border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-700 shadow-sm transition-all duration-300 hover:scale-[1.02] hover:border-gray-300 hover:bg-gray-50 hover:shadow-md active:scale-[0.98] dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:border-gray-600 dark:hover:bg-gray-700"
                                >
                                    <svg className="h-4 w-4" viewBox="0 0 24 24">
                                        <path
                                            fill="currentColor"
                                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                        />
                                        <path
                                            fill="currentColor"
                                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                        />
                                        <path
                                            fill="currentColor"
                                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                        />
                                        <path
                                            fill="currentColor"
                                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                        />
                                    </svg>
                                    Google
                                </a>
                                <a
                                    href="/auth/facebook/redirect"
                                    className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border-2 border-blue-200 bg-blue-600 px-3 py-2 text-xs font-semibold text-white shadow-sm transition-all duration-300 hover:scale-[1.02] hover:border-blue-300 hover:bg-blue-700 hover:shadow-md active:scale-[0.98] dark:border-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800"
                                >
                                    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                                    </svg>
                                    Facebook
                                </a>
                            </div>

                            <div className="relative py-1.5">
                                <div className="absolute inset-0 flex items-center">
                                    <span className="w-full border-t-2 border-gray-200 dark:border-gray-700" />
                                </div>
                                <div className="relative flex justify-center text-xs">
                                    <span className="bg-white px-2 font-medium text-gray-500 dark:bg-gray-900 dark:text-gray-400">
                                        Already have an account?
                                    </span>
                                </div>
                            </div>

                            <div className="text-center">
                                <TextLink
                                    href={login.url()}
                                    tabIndex={6}
                                    className="inline-flex h-9 w-full items-center justify-center rounded-lg border-2 border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50 px-4 py-2 text-sm font-semibold text-amber-700 shadow-sm transition-all duration-300 hover:scale-[1.02] hover:border-amber-300 hover:from-amber-100 hover:to-orange-100 hover:shadow-md active:scale-[0.98] dark:border-amber-700 dark:from-amber-900/20 dark:to-orange-900/20 dark:text-amber-400 dark:hover:from-amber-900/30 dark:hover:to-orange-900/30"
                                >
                                    Sign in instead
                                </TextLink>
                            </div>
                        </div>
                    </>
                )}
            </Form>
        </AuthLayout>
    );
}
