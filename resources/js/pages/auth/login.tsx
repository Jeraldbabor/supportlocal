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
                <div className="mb-6 rounded-lg bg-green-50 border border-green-200 p-4 text-center text-sm font-medium text-green-800 dark:bg-green-900/20 dark:border-green-800 dark:text-green-400">
                    {status}
                </div>
            )}

            <Form {...AuthenticatedSessionController.store.form()} resetOnSuccess={['password']} className="space-y-6">
                {({ processing, errors }) => (
                    <>
                        <div className="space-y-5">
                            <div className="space-y-2">
                                <Label htmlFor="email" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                                    Email address
                                </Label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Mail className="h-5 w-5 text-gray-400" />
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
                                        className="pl-10 h-12 text-base border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-blue-500 dark:focus:border-blue-400 dark:focus:ring-blue-400 transition-all duration-200"
                                    />
                                </div>
                                <InputError message={errors.email} />
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="password" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                                        Password
                                    </Label>
                                    {canResetPassword && (
                                        <TextLink 
                                            href={passwordRequestRoute()} 
                                            className="text-sm font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 transition-colors" 
                                            tabIndex={5}
                                        >
                                            Forgot password?
                                        </TextLink>
                                    )}
                                </div>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Lock className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <Input
                                        id="password"
                                        type={showPassword ? "text" : "password"}
                                        name="password"
                                        required
                                        tabIndex={2}
                                        autoComplete="current-password"
                                        placeholder="Enter your password"
                                        className="pl-10 pr-10 h-12 text-base border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-blue-500 dark:focus:border-blue-400 dark:focus:ring-blue-400 transition-all duration-200"
                                    />
                                    <button
                                        type="button"
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                        onClick={() => setShowPassword(!showPassword)}
                                        tabIndex={-1}
                                    >
                                        {showPassword ? (
                                            <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                                        ) : (
                                            <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                                        )}
                                    </button>
                                </div>
                                <InputError message={errors.password} />
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                    <Checkbox id="remember" name="remember" tabIndex={3} className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600" />
                                    <Label htmlFor="remember" className="text-sm text-gray-600 dark:text-gray-400 cursor-pointer">
                                        Remember me for 30 days
                                    </Label>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <Button 
                                type="submit" 
                                className="w-full h-12 text-base font-semibold bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl transition-all duration-200" 
                                tabIndex={4} 
                                disabled={processing} 
                                data-test="login-button"
                            >
                                {processing ? (
                                    <>
                                        <LoaderCircle className="h-5 w-5 animate-spin mr-2" />
                                        Signing in...
                                    </>
                                ) : (
                                    'Sign in'
                                )}
                            </Button>

                            <div className="relative">
                                <div className="absolute inset-0 flex items-center">
                                    <span className="w-full border-t border-gray-300 dark:border-gray-600" />
                                </div>
                                <div className="relative flex justify-center text-sm">
                                    <span className="px-4 bg-white dark:bg-gray-900 text-gray-500 dark:text-gray-400">
                                        Don't have an account?
                                    </span>
                                </div>
                            </div>

                            <div className="text-center">
                                <TextLink 
                                    href={register()} 
                                    tabIndex={6}
                                    className="inline-flex items-center justify-center w-full h-12 px-4 py-2 text-base font-semibold text-blue-600 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 hover:border-blue-300 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-400 dark:hover:bg-blue-900/30 transition-all duration-200"
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
