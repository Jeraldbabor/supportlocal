import React from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';

interface AnalyticsSettings {
    tracking_enabled: boolean;
    public_stats: boolean;
    data_retention_days: number;
}

interface Props {
    analyticsSettings: AnalyticsSettings;
}

export default function Analytics({ analyticsSettings }: Props) {
    return (
        <AppLayout>
            <Head title="Analytics Settings" />
            
            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">
                            <h2 className="text-2xl font-bold mb-6">Analytics Settings</h2>
                            <p>Manage your analytics preferences here.</p>
                            <pre>{JSON.stringify(analyticsSettings, null, 2)}</pre>
                            {/* TODO: Implement analytics settings form */}
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}