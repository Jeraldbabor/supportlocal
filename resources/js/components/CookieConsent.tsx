import { Link } from '@inertiajs/react';
import { Settings, X } from 'lucide-react';
import React, { useEffect, useState } from 'react';

type ConsentPreferences = {
    necessary: boolean;
    analytics: boolean;
    marketing: boolean;
    preferences: boolean;
};

const defaultPreferences: ConsentPreferences = {
    necessary: true, // Always required
    analytics: false,
    marketing: false,
    preferences: false,
};

export default function CookieConsent() {
    const [isVisible, setIsVisible] = useState(false);
    const [showPreferences, setShowPreferences] = useState(false);
    const [preferences, setPreferences] = useState<ConsentPreferences>(defaultPreferences);

    useEffect(() => {
        // Check if user has already made a choice
        const consent = localStorage.getItem('cookie_consent');
        if (!consent) {
            // Show banner after a short delay for better UX
            const timer = setTimeout(() => setIsVisible(true), 1000);
            return () => clearTimeout(timer);
        }
    }, []);

    const saveConsent = (type: 'all' | 'none' | 'custom') => {
        let finalPreferences: ConsentPreferences;

        switch (type) {
            case 'all':
                finalPreferences = {
                    necessary: true,
                    analytics: true,
                    marketing: true,
                    preferences: true,
                };
                break;
            case 'none':
                finalPreferences = {
                    necessary: true, // Always required
                    analytics: false,
                    marketing: false,
                    preferences: false,
                };
                break;
            case 'custom':
                finalPreferences = preferences;
                break;
        }

        localStorage.setItem('cookie_consent', JSON.stringify(finalPreferences));
        localStorage.setItem('cookie_consent_date', new Date().toISOString());
        setIsVisible(false);
        setShowPreferences(false);
    };

    const handlePreferenceChange = (key: keyof ConsentPreferences) => {
        if (key === 'necessary') return; // Can't disable necessary cookies
        setPreferences((prev) => ({
            ...prev,
            [key]: !prev[key],
        }));
    };

    if (!isVisible) return null;

    return (
        <>
            {/* Cookie Banner */}
            <div
                className={`fixed right-0 bottom-0 left-0 z-[9999] transform transition-transform duration-500 ${
                    showPreferences ? 'translate-y-full' : 'translate-y-0'
                }`}
            >
                <div className="border-t border-gray-700 bg-gray-900/95 px-4 py-4 shadow-2xl backdrop-blur-sm sm:px-6 md:px-8">
                    <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 md:flex-row">
                        {/* Text Content */}
                        <div className="flex-1 text-center md:text-left">
                            <p className="text-sm leading-relaxed text-gray-300">
                                <span className="font-medium text-white">Welcome!</span> We respect your privacy and your right to control how we
                                collect, use, and share your personal data. Please read our{' '}
                                <Link href="/privacy-policy" className="font-medium text-orange-400 underline transition-colors hover:text-orange-300">
                                    Privacy Policy
                                </Link>{' '}
                                to learn about our privacy practices.
                            </p>
                        </div>

                        {/* Buttons */}
                        <div className="flex flex-shrink-0 flex-wrap items-center justify-center gap-2 sm:gap-3">
                            <button
                                onClick={() => setShowPreferences(true)}
                                className="flex items-center gap-2 rounded-lg border border-gray-600 bg-gray-800 px-4 py-2.5 text-sm font-medium text-white transition-all duration-200 hover:border-gray-500 hover:bg-gray-700 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:ring-offset-gray-900 focus:outline-none"
                            >
                                <Settings className="h-4 w-4" />
                                View preferences
                            </button>
                            <button
                                onClick={() => saveConsent('none')}
                                className="rounded-lg border border-gray-600 bg-transparent px-4 py-2.5 text-sm font-medium text-gray-300 transition-all duration-200 hover:border-gray-500 hover:bg-gray-800 hover:text-white focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:ring-offset-gray-900 focus:outline-none"
                            >
                                Reject all
                            </button>
                            <button
                                onClick={() => saveConsent('all')}
                                className="rounded-lg border border-gray-700 bg-gray-700 px-4 py-2.5 text-sm font-medium text-white transition-all duration-200 hover:bg-gray-600 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:ring-offset-gray-900 focus:outline-none"
                            >
                                Accept all
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Preferences Modal */}
            {showPreferences && (
                <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
                    <div className="w-full max-w-lg animate-in fade-in zoom-in-95 duration-200">
                        <div className="rounded-2xl border border-gray-700 bg-gray-900 shadow-2xl">
                            {/* Header */}
                            <div className="flex items-center justify-between border-b border-gray-700 px-6 py-4">
                                <h2 className="text-lg font-semibold text-white">Cookie Preferences</h2>
                                <button
                                    onClick={() => setShowPreferences(false)}
                                    className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-800 hover:text-white"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>

                            {/* Content */}
                            <div className="max-h-[60vh] overflow-y-auto px-6 py-4">
                                <p className="mb-6 text-sm leading-relaxed text-gray-400">
                                    We use cookies to enhance your browsing experience, serve personalized content, and analyze our traffic. You can
                                    customize your preferences below.
                                </p>

                                <div className="space-y-4">
                                    {/* Necessary Cookies */}
                                    <div className="rounded-lg bg-gray-800/50 p-4">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h3 className="font-medium text-white">Necessary Cookies</h3>
                                                <p className="mt-1 text-sm text-gray-400">
                                                    Required for the website to function properly. Cannot be disabled.
                                                </p>
                                            </div>
                                            <div className="flex h-6 w-11 cursor-not-allowed items-center rounded-full bg-orange-600 p-0.5">
                                                <div className="h-5 w-5 translate-x-5 transform rounded-full bg-white shadow-sm"></div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Analytics Cookies */}
                                    <div className="rounded-lg bg-gray-800/50 p-4">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h3 className="font-medium text-white">Analytics Cookies</h3>
                                                <p className="mt-1 text-sm text-gray-400">
                                                    Help us understand how visitors interact with our website.
                                                </p>
                                            </div>
                                            <button
                                                onClick={() => handlePreferenceChange('analytics')}
                                                className={`flex h-6 w-11 items-center rounded-full p-0.5 transition-colors ${
                                                    preferences.analytics ? 'bg-orange-600' : 'bg-gray-600'
                                                }`}
                                            >
                                                <div
                                                    className={`h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform ${
                                                        preferences.analytics ? 'translate-x-5' : 'translate-x-0'
                                                    }`}
                                                ></div>
                                            </button>
                                        </div>
                                    </div>

                                    {/* Marketing Cookies */}
                                    <div className="rounded-lg bg-gray-800/50 p-4">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h3 className="font-medium text-white">Marketing Cookies</h3>
                                                <p className="mt-1 text-sm text-gray-400">
                                                    Used to deliver personalized advertisements to you.
                                                </p>
                                            </div>
                                            <button
                                                onClick={() => handlePreferenceChange('marketing')}
                                                className={`flex h-6 w-11 items-center rounded-full p-0.5 transition-colors ${
                                                    preferences.marketing ? 'bg-orange-600' : 'bg-gray-600'
                                                }`}
                                            >
                                                <div
                                                    className={`h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform ${
                                                        preferences.marketing ? 'translate-x-5' : 'translate-x-0'
                                                    }`}
                                                ></div>
                                            </button>
                                        </div>
                                    </div>

                                    {/* Preference Cookies */}
                                    <div className="rounded-lg bg-gray-800/50 p-4">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h3 className="font-medium text-white">Preference Cookies</h3>
                                                <p className="mt-1 text-sm text-gray-400">
                                                    Remember your settings and preferences for a better experience.
                                                </p>
                                            </div>
                                            <button
                                                onClick={() => handlePreferenceChange('preferences')}
                                                className={`flex h-6 w-11 items-center rounded-full p-0.5 transition-colors ${
                                                    preferences.preferences ? 'bg-orange-600' : 'bg-gray-600'
                                                }`}
                                            >
                                                <div
                                                    className={`h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform ${
                                                        preferences.preferences ? 'translate-x-5' : 'translate-x-0'
                                                    }`}
                                                ></div>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="flex flex-wrap items-center justify-end gap-3 border-t border-gray-700 px-6 py-4">
                                <button
                                    onClick={() => saveConsent('none')}
                                    className="rounded-lg border border-gray-600 bg-transparent px-4 py-2 text-sm font-medium text-gray-300 transition-all duration-200 hover:border-gray-500 hover:bg-gray-800 hover:text-white focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:ring-offset-gray-900 focus:outline-none"
                                >
                                    Reject all
                                </button>
                                <button
                                    onClick={() => saveConsent('custom')}
                                    className="rounded-lg border border-orange-500 bg-orange-600 px-4 py-2 text-sm font-medium text-white transition-all duration-200 hover:bg-orange-500 focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:ring-offset-gray-900 focus:outline-none"
                                >
                                    Save preferences
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
