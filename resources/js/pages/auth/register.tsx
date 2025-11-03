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
    
    // Get guest cart from localStorage
    const guestCart = typeof window !== 'undefined' ? localStorage.getItem('guest_cart') : null;

    // Get form props from the controller action
    const { form: _form, ...formProps } = RegisteredUserController.store.form();

    return (
        <AuthLayout title="Create your account" description="Join us today and start your journey" sellerCount={sellerCount} featuredArtisans={featuredArtisans}>
            <Head title="Register" />
            <Form
                {...formProps}
                className="space-y-2.5"
            >
                {({ processing, errors }) => (
                    <>
                        {/* Hidden field for guest cart */}
                        {guestCart && (
                            <input type="hidden" name="guest_cart" value={guestCart} />
                        )}
                        
                        <div className="space-y-2">
                            <div className="space-y-1 group">
                                <Label htmlFor="name" className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                                    Full name
                                </Label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <User className="h-4 w-4 text-gray-400 group-focus-within:text-amber-600 transition-colors duration-200" />
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
                                        className="pl-9 h-9 text-sm border-2 border-gray-200 dark:border-gray-700 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 dark:focus:border-amber-500 dark:focus:ring-amber-900/50 transition-all duration-200 rounded-lg hover:border-gray-300 dark:hover:border-gray-600"
                                    />
                                </div>
                                <InputError message={errors.name} />
                            </div>

                            <div className="space-y-1 group">
                                <Label htmlFor="email" className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                                    Email address
                                </Label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Mail className="h-4 w-4 text-gray-400 group-focus-within:text-amber-600 transition-colors duration-200" />
                                    </div>
                                    <Input
                                        id="email"
                                        type="email"
                                        required
                                        tabIndex={2}
                                        autoComplete="email"
                                        name="email"
                                        placeholder="Enter your email"
                                        className="pl-9 h-9 text-sm border-2 border-gray-200 dark:border-gray-700 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 dark:focus:border-amber-500 dark:focus:ring-amber-900/50 transition-all duration-200 rounded-lg hover:border-gray-300 dark:hover:border-gray-600"
                                    />
                                </div>
                                <InputError message={errors.email} />
                            </div>

                            <div className="space-y-1 group">
                                <Label htmlFor="password" className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                                    Password
                                </Label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Lock className="h-4 w-4 text-gray-400 group-focus-within:text-amber-600 transition-colors duration-200" />
                                    </div>
                                    <Input
                                        id="password"
                                        type={showPassword ? "text" : "password"}
                                        required
                                        tabIndex={3}
                                        autoComplete="new-password"
                                        name="password"
                                        placeholder="Create a password"
                                        className="pl-9 pr-9 h-9 text-sm border-2 border-gray-200 dark:border-gray-700 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 dark:focus:border-amber-500 dark:focus:ring-amber-900/50 transition-all duration-200 rounded-lg hover:border-gray-300 dark:hover:border-gray-600"
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

                            <div className="space-y-1 group">
                                <Label htmlFor="password_confirmation" className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                                    Confirm password
                                </Label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Shield className="h-4 w-4 text-gray-400 group-focus-within:text-amber-600 transition-colors duration-200" />
                                    </div>
                                    <Input
                                        id="password_confirmation"
                                        type={showConfirmPassword ? "text" : "password"}
                                        required
                                        tabIndex={4}
                                        autoComplete="new-password"
                                        name="password_confirmation"
                                        placeholder="Confirm your password"
                                        className="pl-9 pr-9 h-9 text-sm border-2 border-gray-200 dark:border-gray-700 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 dark:focus:border-amber-500 dark:focus:ring-amber-900/50 transition-all duration-200 rounded-lg hover:border-gray-300 dark:hover:border-gray-600"
                                    />
                                    <button
                                        type="button"
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center hover:scale-110 transition-transform duration-200"
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
                                className="w-full h-9 text-sm font-bold bg-gradient-to-r from-amber-600 via-amber-700 to-orange-600 hover:from-amber-700 hover:via-amber-800 hover:to-orange-700 text-white shadow-lg hover:shadow-2xl transition-all duration-300 rounded-lg hover:scale-[1.02] active:scale-[0.98]" 
                                tabIndex={5} 
                                data-test="register-user-button"
                            >
                                {processing ? (
                                    <>
                                        <LoaderCircle className="h-4 w-4 animate-spin mr-2" />
                                        Creating...
                                    </>
                                ) : (
                                    'Create account'
                                )}
                            </Button>

                            <div className="text-[9px] leading-tight text-gray-500 dark:text-gray-400 text-center px-2 py-1 bg-gray-50 dark:bg-gray-800/50 rounded-md border border-gray-200 dark:border-gray-700">
                                By creating an account, you agree to our{' '}
                                <a href="#" className="text-amber-700 hover:text-amber-800 dark:text-amber-400 dark:hover:text-amber-300 underline font-medium transition-colors">
                                    Terms
                                </a>{' '}
                                and{' '}
                                <a href="#" className="text-amber-700 hover:text-amber-800 dark:text-amber-400 dark:hover:text-amber-300 underline font-medium transition-colors">
                                    Privacy Policy
                                </a>
                            </div>

                            <div className="relative py-1.5">
                                <div className="absolute inset-0 flex items-center">
                                    <span className="w-full border-t-2 border-gray-200 dark:border-gray-700" />
                                </div>
                                <div className="relative flex justify-center text-xs">
                                    <span className="px-2 bg-white dark:bg-gray-900 text-gray-500 dark:text-gray-400 font-medium">
                                        Already have an account?
                                    </span>
                                </div>
                            </div>

                            <div className="text-center">
                                <TextLink 
                                    href={login.url()} 
                                    tabIndex={6}
                                    className="inline-flex items-center justify-center w-full h-9 px-4 py-2 text-sm font-semibold text-amber-700 bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-200 rounded-lg hover:from-amber-100 hover:to-orange-100 hover:border-amber-300 dark:from-amber-900/20 dark:to-orange-900/20 dark:border-amber-700 dark:text-amber-400 dark:hover:from-amber-900/30 dark:hover:to-orange-900/30 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] shadow-sm hover:shadow-md"
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
