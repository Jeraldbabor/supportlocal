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
import { LoaderCircle, Mail, Lock, Eye, EyeOff } from 'lucide-react';
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
        <AuthLayout title="Welcome back" description="Sign in to your account to continue" sellerCount={sellerCount} featuredArtisans={featuredArtisans}>
            <Head title="Log in" />

            {status && (
                <div className="mb-6 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-300 p-4 text-center text-sm font-medium text-amber-900 dark:from-amber-900/20 dark:to-orange-900/20 dark:border-amber-700 dark:text-amber-400 shadow-sm animate-in fade-in slide-in-from-top-2 duration-300">
                    {status}
                </div>
            )}

            <Form action={AuthenticatedSessionController.store.form().action} method={AuthenticatedSessionController.store.form().method} resetOnSuccess={['password']} className="space-y-4">
                {({ processing, errors }) => (
                    <>
                        <div className="space-y-3">
                            <div className="space-y-2 group">
                                <Label htmlFor="email" className="text-xs font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                    Email address
                                </Label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Mail className="h-4 w-4 text-gray-400 group-focus-within:text-amber-600 transition-colors duration-200" />
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
                                        className="pl-9 h-10 text-sm border-2 border-gray-200 dark:border-gray-700 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 dark:focus:border-amber-500 dark:focus:ring-amber-900/50 transition-all duration-200 rounded-lg hover:border-gray-300 dark:hover:border-gray-600"
                                    />
                                </div>
                                <InputError message={errors.email} />
                            </div>

                            <div className="space-y-2 group">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="password" className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                                        Password
                                    </Label>
                                    {canResetPassword && (
                                        <TextLink 
                                            href={passwordRequestRoute()} 
                                            className="text-xs font-medium text-amber-700 hover:text-amber-800 dark:text-amber-400 dark:hover:text-amber-300 transition-colors hover:underline" 
                                            tabIndex={5}
                                        >
                                            Forgot password?
                                        </TextLink>
                                    )}
                                </div>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Lock className="h-4 w-4 text-gray-400 group-focus-within:text-amber-600 transition-colors duration-200" />
                                    </div>
                                    <Input
                                        id="password"
                                        type={showPassword ? "text" : "password"}
                                        name="password"
                                        required
                                        tabIndex={2}
                                        autoComplete="current-password"
                                        placeholder="Enter your password"
                                        className="pl-9 pr-9 h-10 text-sm border-2 border-gray-200 dark:border-gray-700 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 dark:focus:border-amber-500 dark:focus:ring-amber-900/50 transition-all duration-200 rounded-lg hover:border-gray-300 dark:hover:border-gray-600"
                                    />
                                    <button
                                        type="button"
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center hover:scale-110 transition-transform duration-200"
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
                                <div className="flex items-center space-x-2 group">
                                    <Checkbox id="remember" name="remember" tabIndex={3} className="data-[state=checked]:bg-amber-600 data-[state=checked]:border-amber-600 transition-all duration-200 hover:border-amber-400 h-4 w-4" />
                                    <Label htmlFor="remember" className="text-xs text-gray-600 dark:text-gray-400 cursor-pointer group-hover:text-gray-900 dark:group-hover:text-gray-200 transition-colors">
                                        Remember me for 30 days
                                    </Label>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-3 pt-1">
                            <Button 
                                type="submit" 
                                className="w-full h-10 text-sm font-bold bg-gradient-to-r from-amber-600 via-amber-700 to-orange-600 hover:from-amber-700 hover:via-amber-800 hover:to-orange-700 text-white shadow-lg hover:shadow-2xl transition-all duration-300 rounded-lg hover:scale-[1.02] active:scale-[0.98]" 
                                tabIndex={4} 
                                disabled={processing} 
                                data-test="login-button"
                            >
                                {processing ? (
                                    <>
                                        <LoaderCircle className="h-4 w-4 animate-spin mr-2" />
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
                                    <span className="px-3 bg-white dark:bg-gray-900 text-gray-500 dark:text-gray-400 font-medium">
                                        Don't have an account?
                                    </span>
                                </div>
                            </div>

                            <div className="text-center">
                                <TextLink 
                                    href={register().url} 
                                    tabIndex={6}
                                    className="inline-flex items-center justify-center w-full h-10 px-4 py-2 text-sm font-semibold text-amber-700 bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-200 rounded-lg hover:from-amber-100 hover:to-orange-100 hover:border-amber-300 dark:from-amber-900/20 dark:to-orange-900/20 dark:border-amber-700 dark:text-amber-400 dark:hover:from-amber-900/30 dark:hover:to-orange-900/30 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] shadow-sm hover:shadow-md"
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
