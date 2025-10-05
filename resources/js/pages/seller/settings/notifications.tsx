import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';

interface NotificationPreferences {
    email_notifications: boolean;
    push_notifications: boolean;
    marketing_emails: boolean;
}

interface Props {
    preferences: NotificationPreferences;
}

export default function Notifications({ preferences }: Props) {
    return (
        <AppLayout>
            <Head title="Notification Settings" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="bg-white shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">
                            <h2 className="mb-6 text-2xl font-bold">Notification Settings</h2>
                            <p>Manage your notification preferences here.</p>
                            <pre>{JSON.stringify(preferences, null, 2)}</pre>
                            {/* TODO: Implement notification settings form */}
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
