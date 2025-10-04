import React from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';

interface User {
    id: number;
    name: string;
    email: string;
    phone_number?: string;
    address?: string;
}

interface Props {
    user: User;
}

export default function Account({ user }: Props) {
    return (
        <AppLayout>
            <Head title="Account Settings" />
            
            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">
                            <h2 className="text-2xl font-bold mb-6">Account Settings</h2>
                            <p>Manage your account information here.</p>
                            <pre>{JSON.stringify(user, null, 2)}</pre>
                            {/* TODO: Implement account settings form */}
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}