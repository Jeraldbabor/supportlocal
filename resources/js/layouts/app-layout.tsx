import { NotificationsProvider } from '@/contexts/NotificationsContext';
import AppLayoutTemplate from '@/layouts/app/app-sidebar-layout';
import { type BreadcrumbItem } from '@/types';
import { usePage } from '@inertiajs/react';
import { type ReactNode } from 'react';

interface AppLayoutProps {
    children: ReactNode;
    breadcrumbs?: BreadcrumbItem[];
}

function AppLayoutContent({ children, breadcrumbs, ...props }: AppLayoutProps) {
    return (
        <AppLayoutTemplate breadcrumbs={breadcrumbs} {...props}>
            {children}
        </AppLayoutTemplate>
    );
}

export default function AppLayout({ children, breadcrumbs, ...props }: AppLayoutProps) {
    const { props: pageProps } = usePage<{ unreadNotificationsCount?: number; auth: { user: { id: number; role: string } } }>();
    const unreadNotificationsCount = pageProps.unreadNotificationsCount || 0;
    const userRole = pageProps.auth?.user?.role || 'buyer';
    const userId = pageProps.auth?.user?.id;

    return (
        <NotificationsProvider initialUnreadCount={unreadNotificationsCount} userRole={userRole} userId={userId}>
            <AppLayoutContent breadcrumbs={breadcrumbs} {...props}>
                {children}
            </AppLayoutContent>
        </NotificationsProvider>
    );
}
