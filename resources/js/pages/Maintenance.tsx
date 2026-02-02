import { Head } from '@inertiajs/react';
import { Clock, Construction, Mail } from 'lucide-react';

interface Props {
    siteName: string;
    siteEmail: string;
}

export default function Maintenance({ siteName, siteEmail }: Props) {
    return (
        <>
            <Head title="Under Maintenance" />
            <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 px-4">
                <div className="w-full max-w-md text-center">
                    {/* Icon */}
                    <div className="mb-8 flex justify-center">
                        <div className="rounded-full bg-yellow-500/20 p-6">
                            <Construction className="h-16 w-16 text-yellow-500" />
                        </div>
                    </div>

                    {/* Title */}
                    <h1 className="mb-4 text-4xl font-bold text-white">Under Maintenance</h1>

                    {/* Description */}
                    <p className="mb-8 text-lg text-gray-300">
                        We're currently performing scheduled maintenance on <span className="font-semibold text-white">{siteName}</span>. We'll be
                        back shortly!
                    </p>

                    {/* Info Cards */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-4 rounded-lg bg-gray-800/50 p-4 text-left">
                            <Clock className="h-6 w-6 flex-shrink-0 text-blue-400" />
                            <div>
                                <p className="font-medium text-white">Expected Duration</p>
                                <p className="text-sm text-gray-400">We'll be back as soon as possible</p>
                            </div>
                        </div>

                        {siteEmail && (
                            <div className="flex items-center gap-4 rounded-lg bg-gray-800/50 p-4 text-left">
                                <Mail className="h-6 w-6 flex-shrink-0 text-green-400" />
                                <div>
                                    <p className="font-medium text-white">Need Help?</p>
                                    <a href={`mailto:${siteEmail}`} className="text-sm text-blue-400 hover:underline">
                                        {siteEmail}
                                    </a>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <p className="mt-8 text-sm text-gray-500">Thank you for your patience!</p>
                </div>
            </div>
        </>
    );
}
