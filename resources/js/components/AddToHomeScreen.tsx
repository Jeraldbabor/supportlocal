import { Download, Share, X } from 'lucide-react';
import { useEffect, useState } from 'react';

interface BeforeInstallPromptEvent extends Event {
    prompt: () => Promise<void>;
    userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

declare global {
    interface WindowEventMap {
        beforeinstallprompt: BeforeInstallPromptEvent;
    }
}

export default function AddToHomeScreen() {
    const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
    const [showBanner, setShowBanner] = useState(false);
    const [isIOS, setIsIOS] = useState(false);
    const [showIOSInstructions, setShowIOSInstructions] = useState(false);
    const [isStandalone, setIsStandalone] = useState(false);

    useEffect(() => {
        // Check if already installed / running in standalone mode
        const standalone =
            window.matchMedia('(display-mode: standalone)').matches || (window.navigator as { standalone?: boolean }).standalone === true;

        setIsStandalone(standalone);

        if (standalone) return; // Don't show if already installed

        // Check if user dismissed the banner before (respect for 7 days)
        const dismissed = localStorage.getItem('a2hs-dismissed');
        if (dismissed) {
            const dismissedAt = parseInt(dismissed, 10);
            const sevenDays = 7 * 24 * 60 * 60 * 1000;
            if (Date.now() - dismissedAt < sevenDays) return;
        }

        // Detect iOS
        const userAgent = window.navigator.userAgent.toLowerCase();
        const isIOSDevice = /iphone|ipad|ipod/.test(userAgent);
        const isSafari = /safari/.test(userAgent) && !/chrome/.test(userAgent);
        setIsIOS(isIOSDevice);

        // For iOS Safari, show custom instructions after a delay
        if (isIOSDevice && isSafari) {
            const timer = setTimeout(() => setShowBanner(true), 3000);
            return () => clearTimeout(timer);
        }

        // For Android / Chrome - listen for beforeinstallprompt
        const handler = (e: BeforeInstallPromptEvent) => {
            e.preventDefault();
            setDeferredPrompt(e);
            // Show banner after a short delay so the page loads first
            setTimeout(() => setShowBanner(true), 3000);
        };

        window.addEventListener('beforeinstallprompt', handler);

        // Also check if installed via appinstalled event
        const appInstalledHandler = () => {
            setShowBanner(false);
            setDeferredPrompt(null);
        };
        window.addEventListener('appinstalled', appInstalledHandler);

        return () => {
            window.removeEventListener('beforeinstallprompt', handler);
            window.removeEventListener('appinstalled', appInstalledHandler);
        };
    }, []);

    const handleInstall = async () => {
        if (!deferredPrompt) return;

        await deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;

        if (outcome === 'accepted') {
            setShowBanner(false);
        }

        setDeferredPrompt(null);
    };

    const handleDismiss = () => {
        setShowBanner(false);
        setShowIOSInstructions(false);
        localStorage.setItem('a2hs-dismissed', Date.now().toString());
    };

    // Don't render anything if already standalone or banner not shown
    if (isStandalone || !showBanner) return null;

    // iOS-specific instructions modal
    if (isIOS && showIOSInstructions) {
        return (
            <>
                {/* Overlay */}
                <div className="fixed inset-0 z-[9998] bg-black/50" onClick={handleDismiss} />
                {/* Instructions Dialog */}
                <div className="fixed inset-x-4 bottom-4 z-[9999] rounded-2xl bg-white p-5 shadow-2xl sm:inset-x-auto sm:bottom-6 sm:left-1/2 sm:max-w-sm sm:-translate-x-1/2">
                    <button
                        onClick={handleDismiss}
                        className="absolute top-3 right-3 rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                        aria-label="Close"
                    >
                        <X className="h-5 w-5" />
                    </button>
                    <h3 className="mb-3 text-lg font-semibold text-gray-900">Install Support Local</h3>
                    <div className="space-y-3 text-sm text-gray-600">
                        <div className="flex items-start gap-3">
                            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-orange-100 text-xs font-bold text-orange-600">
                                1
                            </span>
                            <p>
                                Tap the <Share className="inline h-4 w-4 text-blue-500" /> <strong>Share</strong> button in your browser toolbar
                            </p>
                        </div>
                        <div className="flex items-start gap-3">
                            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-orange-100 text-xs font-bold text-orange-600">
                                2
                            </span>
                            <p>
                                Scroll down and tap <strong>"Add to Home Screen"</strong>
                            </p>
                        </div>
                        <div className="flex items-start gap-3">
                            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-orange-100 text-xs font-bold text-orange-600">
                                3
                            </span>
                            <p>
                                Tap <strong>"Add"</strong> to confirm
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={handleDismiss}
                        className="mt-4 w-full rounded-lg bg-gray-100 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-200"
                    >
                        Got it
                    </button>
                </div>
            </>
        );
    }

    return (
        <>
            {/* Bottom banner prompt */}
            <div className="animate-slide-up safe-bottom fixed inset-x-0 bottom-0 z-[9999]">
                <div className="mx-3 mb-3 rounded-2xl bg-white p-4 shadow-2xl ring-1 ring-gray-200 sm:mx-auto sm:max-w-md">
                    <div className="flex items-start gap-3">
                        {/* App icon */}
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-orange-500 shadow-md">
                            <Download className="h-6 w-6 text-white" />
                        </div>

                        <div className="min-w-0 flex-1">
                            <div className="flex items-start justify-between">
                                <div>
                                    <h3 className="text-sm font-semibold text-gray-900">Install Support Local</h3>
                                    <p className="mt-0.5 text-xs text-gray-500">Add to your home screen for quick access</p>
                                </div>
                                <button
                                    onClick={handleDismiss}
                                    className="-mt-1 -mr-1 rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                                    aria-label="Dismiss"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            </div>

                            <div className="mt-3 flex gap-2">
                                {isIOS ? (
                                    <button
                                        onClick={() => setShowIOSInstructions(true)}
                                        className="flex-1 rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-orange-600 active:bg-orange-700"
                                    >
                                        Show me how
                                    </button>
                                ) : (
                                    <button
                                        onClick={handleInstall}
                                        className="flex-1 rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-orange-600 active:bg-orange-700"
                                    >
                                        Install
                                    </button>
                                )}
                                <button
                                    onClick={handleDismiss}
                                    className="rounded-lg px-4 py-2 text-sm font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                                >
                                    Not now
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
