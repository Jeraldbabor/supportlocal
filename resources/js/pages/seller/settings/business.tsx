import React from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';

interface Business {
    id: number;
    name: string;
    type: string;
    description: string;
}

interface Props {
    business: Business;
    businessTypes: string[];
}

export default function Business({ business, businessTypes }: Props) {
    return (
        <AppLayout>
            <Head title="Business Settings" />
            
            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">
                            <h2 className="text-2xl font-bold mb-6">Business Settings</h2>
                            <p>Manage your business information here.</p>
                            <pre>{JSON.stringify({ business, businessTypes }, null, 2)}</pre>
                            {/* TODO: Implement business settings form */}
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}