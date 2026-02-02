import { Head } from '@inertiajs/react';
import { Clock, Mail, Wrench } from 'lucide-react';

interface MaintenanceProps {
    siteName: string;
    siteEmail: string;
}

export default function Maintenance({ siteName, siteEmail }: MaintenanceProps) {
    return (
        <>
            <Head title="Under Maintenance" />

            <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
                {/* Background decorative elements */}
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute -top-40 -left-40 h-80 w-80 rounded-full bg-gradient-to-br from-amber-200/30 to-orange-200/30 blur-3xl" />
                    <div className="absolute -right-40 -bottom-40 h-80 w-80 rounded-full bg-gradient-to-br from-orange-200/30 to-yellow-200/30 blur-3xl" />
                </div>

                <div className="relative z-10 mx-auto max-w-lg px-6 text-center">
                    {/* Icon */}
                    <div className="mx-auto mb-8 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-amber-500 to-orange-500 shadow-lg shadow-amber-500/25">
                        <Wrench className="h-12 w-12 text-white" />
                    </div>

                    {/* Title */}
                    <h1 className="mb-4 text-4xl font-bold text-gray-900 sm:text-5xl">We'll Be Right Back!</h1>

                    {/* Message */}
                    <p className="mb-8 text-lg text-gray-600">
                        <span className="font-semibold text-amber-600">{siteName}</span> is currently undergoing scheduled maintenance. We're working
                        hard to improve your experience and will be back online shortly.
                    </p>

                    {/* Status card */}
                    <div className="mb-8 rounded-2xl border border-amber-100 bg-white/80 p-6 shadow-xl backdrop-blur-sm">
                        <div className="flex items-center justify-center gap-2 text-amber-600">
                            <Clock className="h-5 w-5 animate-pulse" />
                            <span className="font-medium">Maintenance in progress...</span>
                        </div>
                    </div>

                    {/* Contact info */}
                    {siteEmail && (
                        <div className="rounded-xl bg-white/60 p-4 backdrop-blur-sm">
                            <p className="mb-2 text-sm text-gray-500">Need urgent assistance?</p>
                            <a
                                href={`mailto:${siteEmail}`}
                                className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 px-4 py-2 text-sm font-medium text-white transition-all hover:from-amber-600 hover:to-orange-600 hover:shadow-lg"
                            >
                                <Mail className="h-4 w-4" />
                                Contact Us
                            </a>
                        </div>
                    )}

                    {/* Footer */}
                    <p className="mt-8 text-sm text-gray-400">Thank you for your patience!</p>
                </div>
            </div>
        </>
    );
}
