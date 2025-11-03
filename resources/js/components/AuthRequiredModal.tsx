import { router } from '@inertiajs/react';
import { LogIn, UserPlus, X } from 'lucide-react';

interface AuthRequiredModalProps {
    isOpen: boolean;
    onClose: () => void;
    action: 'cart' | 'buy';
    productName?: string;
}

export default function AuthRequiredModal({ isOpen, onClose, action, productName }: AuthRequiredModalProps) {
    if (!isOpen) return null;

    const handleLogin = () => {
        router.visit('/login');
    };

    const handleRegister = () => {
        router.visit('/register');
    };

    const actionText = action === 'cart' ? 'add this item to your cart' : 'purchase this item';

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity" onClick={onClose} />

            {/* Modal */}
            <div className="relative z-10 w-full max-w-md transform rounded-2xl bg-white p-6 shadow-2xl transition-all">
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 rounded-full p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
                >
                    <X className="h-5 w-5" />
                </button>

                {/* Icon */}
                <div className="mb-4 flex justify-center">
                    <div className="rounded-full bg-primary/10 p-4">
                        <LogIn className="h-10 w-10 text-primary" />
                    </div>
                </div>

                {/* Content */}
                <div className="text-center">
                    <h3 className="mb-2 text-2xl font-bold text-gray-900">Authentication Required</h3>
                    <p className="mb-6 text-gray-600">
                        Please log in or create an account to {actionText}
                        {productName && <span className="mt-2 block font-medium text-gray-800">"{productName}"</span>}
                    </p>

                    {/* Action Buttons */}
                    <div className="space-y-3">
                        {/* Login Button */}
                        <button
                            onClick={handleLogin}
                            className="flex w-full transform items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 text-base font-semibold text-white shadow-md transition-all duration-200 hover:-translate-y-0.5 hover:bg-primary/90 hover:shadow-lg focus:ring-2 focus:ring-primary/50"
                        >
                            <LogIn className="h-5 w-5" />
                            Log In
                        </button>

                        {/* Divider */}
                        <div className="flex items-center">
                            <div className="flex-1 border-t border-gray-300"></div>
                            <span className="px-3 text-sm text-gray-500">or</span>
                            <div className="flex-1 border-t border-gray-300"></div>
                        </div>

                        {/* Register Button */}
                        <button
                            onClick={handleRegister}
                            className="flex w-full transform items-center justify-center gap-2 rounded-lg border-2 border-primary bg-white px-6 py-3 text-base font-semibold text-primary shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-primary/5 hover:shadow-md focus:ring-2 focus:ring-primary/50"
                        >
                            <UserPlus className="h-5 w-5" />
                            Create Account
                        </button>

                        {/* Cancel Button */}
                        <button
                            onClick={onClose}
                            className="mt-3 w-full rounded-lg px-6 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-800"
                        >
                            Continue Browsing
                        </button>
                    </div>
                </div>

                {/* Benefits Section */}
                <div className="mt-6 rounded-lg bg-gray-50 p-4">
                    <p className="mb-2 text-xs font-semibold tracking-wide text-gray-700 uppercase">Why Create an Account?</p>
                    <ul className="space-y-1 text-sm text-gray-600">
                        <li className="flex items-start">
                            <span className="mr-2 text-primary">✓</span>
                            <span>Save items to your cart</span>
                        </li>
                        <li className="flex items-start">
                            <span className="mr-2 text-primary">✓</span>
                            <span>Track your orders</span>
                        </li>
                        <li className="flex items-start">
                            <span className="mr-2 text-primary">✓</span>
                            <span>Faster checkout experience</span>
                        </li>
                        <li className="flex items-start">
                            <span className="mr-2 text-primary">✓</span>
                            <span>Support local artisans</span>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    );
}
