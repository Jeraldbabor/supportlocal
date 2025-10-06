import RegisteredUserController from '@/actions/App/Http/Controllers/Auth/RegisteredUserController';
import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { login } from '@/routes';
import { Form, Head } from '@inertiajs/react';
import { LoaderCircle, User, Mail, Lock, Eye, EyeOff, Shield } from 'lucide-react';
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

    return (
        <AuthLayout title="Create your account" description="Join us today and start your journey" sellerCount={sellerCount} featuredArtisans={featuredArtisans}>
            <Head title="Register" />
            <Form
                {...RegisteredUserController.store.form()}
                resetOnSuccess={['password', 'password_confirmation']}
                disableWhileProcessing
                className="space-y-6"
            >
                {({ processing, errors }) => (
                    <>
                        <div className="space-y-5">
                            <div className="space-y-2">
                                <Label htmlFor="name" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                                    Full name
                                </Label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <User className="h-5 w-5 text-gray-400" />
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
                                        className="pl-10 h-12 text-base border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-blue-500 dark:focus:border-blue-400 dark:focus:ring-blue-400 transition-all duration-200"
                                    />
                                </div>
                                <InputError message={errors.name} className="mt-2" />
                            </div>

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
                                        required
                                        tabIndex={2}
                                        autoComplete="email"
                                        name="email"
                                        placeholder="Enter your email"
                                        className="pl-10 h-12 text-base border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-blue-500 dark:focus:border-blue-400 dark:focus:ring-blue-400 transition-all duration-200"
                                    />
                                </div>
                                <InputError message={errors.email} />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="password" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                                    Password
                                </Label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Lock className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <Input
                                        id="password"
                                        type={showPassword ? "text" : "password"}
                                        required
                                        tabIndex={3}
                                        autoComplete="new-password"
                                        name="password"
                                        placeholder="Create a password"
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

                            <div className="space-y-2">
                                <Label htmlFor="password_confirmation" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                                    Confirm password
                                </Label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Shield className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <Input
                                        id="password_confirmation"
                                        type={showConfirmPassword ? "text" : "password"}
                                        required
                                        tabIndex={4}
                                        autoComplete="new-password"
                                        name="password_confirmation"
                                        placeholder="Confirm your password"
                                        className="pl-10 pr-10 h-12 text-base border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-blue-500 dark:focus:border-blue-400 dark:focus:ring-blue-400 transition-all duration-200"
                                    />
                                    <button
                                        type="button"
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        tabIndex={-1}
                                    >
                                        {showConfirmPassword ? (
                                            <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                                        ) : (
                                            <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                                        )}
                                    </button>
                                </div>
                                <InputError message={errors.password_confirmation} />
                            </div>
                        </div>

                        <div className="space-y-4">
                            <Button 
                                type="submit" 
                                className="w-full h-12 text-base font-semibold bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-lg hover:shadow-xl transition-all duration-200" 
                                tabIndex={5} 
                                data-test="register-user-button"
                            >
                                {processing ? (
                                    <>
                                        <LoaderCircle className="h-5 w-5 animate-spin mr-2" />
                                        Creating account...
                                    </>
                                ) : (
                                    'Create account'
                                )}
                            </Button>

                            <div className="text-xs text-gray-500 dark:text-gray-400 text-center px-4">
                                By creating an account, you agree to our{' '}
                                <a href="#" className="text-blue-600 hover:text-blue-500 dark:text-blue-400 underline">
                                    Terms of Service
                                </a>{' '}
                                and{' '}
                                <a href="#" className="text-blue-600 hover:text-blue-500 dark:text-blue-400 underline">
                                    Privacy Policy
                                </a>
                            </div>

                            <div className="relative">
                                <div className="absolute inset-0 flex items-center">
                                    <span className="w-full border-t border-gray-300 dark:border-gray-600" />
                                </div>
                                <div className="relative flex justify-center text-sm">
                                    <span className="px-4 bg-white dark:bg-gray-900 text-gray-500 dark:text-gray-400">
                                        Already have an account?
                                    </span>
                                </div>
                            </div>

                            <div className="text-center">
                                <TextLink 
                                    href={login()} 
                                    tabIndex={6}
                                    className="inline-flex items-center justify-center w-full h-12 px-4 py-2 text-base font-semibold text-blue-600 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 hover:border-blue-300 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-400 dark:hover:bg-blue-900/30 transition-all duration-200"
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
