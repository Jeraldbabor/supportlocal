import AuthenticatedSessionController from '@/actions/App/Http/Controllers/Auth/AuthenticatedSessionController';
import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AuthLayout from '@/layouts/auth-layout';
import { register } from '@/routes';
import { Form, Head } from '@inertiajs/react';
import { Eye, EyeOff, LoaderCircle, Lock, Mail } from 'lucide-react';
import { useState } from 'react';

// Simple password reset route helper
const passwordRequestRoute = () => '/forgot-password';

interface LoginProps {
    status?: string;
    canResetPassword: boolean;
    sellerCount?: number;
    featuredArtisans?: Array<{
        id: number;
        name: string;
        avatar_url: string;
    }>;
}

export default function Login({ status, canResetPassword, sellerCount, featuredArtisans }: LoginProps) {
    const [showPassword, setShowPassword] = useState(false);

    return (
        <AuthLayout
            title="Welcome back"
            description="Sign in to your account to continue"
            sellerCount={sellerCount}
            featuredArtisans={featuredArtisans}
        >
            <Head title="Log in" />

            {status && (
                <div className="mb-6 rounded-xl border-2 border-amber-300 bg-gradient-to-r from-amber-50 to-orange-50 p-4 text-center text-sm font-medium text-amber-900 shadow-sm duration-300 animate-in fade-in slide-in-from-top-2 dark:border-amber-700 dark:from-amber-900/20 dark:to-orange-900/20 dark:text-amber-400">
                    {status}
                </div>
            )}

            <Form
                action={AuthenticatedSessionController.store.form().action}
                method={AuthenticatedSessionController.store.form().method}
                resetOnSuccess={['password']}
                className="space-y-4"
            >
                {({ processing, errors }) => (
                    <>
                        <div className="space-y-3">
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
                                        tabIndex={1}
                                        autoComplete="email"
                                        placeholder="Enter your email"
                                        className="h-10 rounded-lg border-2 border-gray-200 pl-9 text-sm transition-all duration-200 hover:border-gray-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 dark:border-gray-700 dark:hover:border-gray-600 dark:focus:border-amber-500 dark:focus:ring-amber-900/50"
                                    />
                                </div>
                                <InputError message={errors.email} />
                            </div>

                            <div className="group space-y-2">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="password" className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                                        Password
                                    </Label>
                                    {canResetPassword && (
                                        <TextLink
                                            href={passwordRequestRoute()}
                                            className="text-xs font-medium text-amber-700 transition-colors hover:text-amber-800 hover:underline dark:text-amber-400 dark:hover:text-amber-300"
                                            tabIndex={5}
                                        >
                                            Forgot password?
                                        </TextLink>
                                    )}
                                </div>
                                <div className="relative">
                                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                        <Lock className="h-4 w-4 text-gray-400 transition-colors duration-200 group-focus-within:text-amber-600" />
                                    </div>
                                    <Input
                                        id="password"
                                        type={showPassword ? 'text' : 'password'}
                                        name="password"
                                        required
                                        tabIndex={2}
                                        autoComplete="current-password"
                                        placeholder="Enter your password"
                                        className="h-10 rounded-lg border-2 border-gray-200 pr-9 pl-9 text-sm transition-all duration-200 hover:border-gray-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 dark:border-gray-700 dark:hover:border-gray-600 dark:focus:border-amber-500 dark:focus:ring-amber-900/50"
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

                            <div className="flex items-center justify-between pt-0.5">
                                <div className="group flex items-center space-x-2">
                                    <Checkbox
                                        id="remember"
                                        name="remember"
                                        tabIndex={3}
                                        className="h-4 w-4 transition-all duration-200 hover:border-amber-400 data-[state=checked]:border-amber-600 data-[state=checked]:bg-amber-600"
                                    />
                                    <Label
                                        htmlFor="remember"
                                        className="cursor-pointer text-xs text-gray-600 transition-colors group-hover:text-gray-900 dark:text-gray-400 dark:group-hover:text-gray-200"
                                    >
                                        Remember me for 30 days
                                    </Label>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-3 pt-1">
                            <Button
                                type="submit"
                                className="h-10 w-full rounded-lg bg-gradient-to-r from-amber-600 via-amber-700 to-orange-600 text-sm font-bold text-white shadow-lg transition-all duration-300 hover:scale-[1.02] hover:from-amber-700 hover:via-amber-800 hover:to-orange-700 hover:shadow-2xl active:scale-[0.98]"
                                tabIndex={4}
                                disabled={processing}
                                data-test="login-button"
                            >
                                {processing ? (
                                    <>
                                        <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                                        Signing in...
                                    </>
                                ) : (
                                    'Sign in'
                                )}
                            </Button>

                            <div className="relative py-2">
                                <div className="absolute inset-0 flex items-center">
                                    <span className="w-full border-t-2 border-gray-200 dark:border-gray-700" />
                                </div>
                                <div className="relative flex justify-center text-xs">
                                    <span className="bg-white px-3 font-medium text-gray-500 dark:bg-gray-900 dark:text-gray-400">
                                        Don't have an account?
                                    </span>
                                </div>
                            </div>

                            <div className="text-center">
                                <TextLink
                                    href={register().url}
                                    tabIndex={6}
                                    className="inline-flex h-10 w-full items-center justify-center rounded-lg border-2 border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50 px-4 py-2 text-sm font-semibold text-amber-700 shadow-sm transition-all duration-300 hover:scale-[1.02] hover:border-amber-300 hover:from-amber-100 hover:to-orange-100 hover:shadow-md active:scale-[0.98] dark:border-amber-700 dark:from-amber-900/20 dark:to-orange-900/20 dark:text-amber-400 dark:hover:from-amber-900/30 dark:hover:to-orange-900/30"
                                >
                                    Create an account
                                </TextLink>
                            </div>
                        </div>
                    </>
                )}
            </Form>
        </AuthLayout>
    );
}
