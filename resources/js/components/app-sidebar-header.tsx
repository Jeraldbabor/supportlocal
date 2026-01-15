import { Breadcrumbs } from '@/components/breadcrumbs';
import NotificationsDropdown from '@/components/NotificationsDropdown';
import { SidebarTrigger } from '@/components/ui/sidebar';
import UserRoleDisplay from '@/components/user-role-display';
import { useNotifications } from '@/contexts/NotificationsContext';
import { type BreadcrumbItem as BreadcrumbItemType } from '@/types';
import { usePage } from '@inertiajs/react';

export function AppSidebarHeader({ breadcrumbs = [] }: { breadcrumbs?: BreadcrumbItemType[] }) {
    const { props } = usePage<{ auth?: { user?: { role?: string } }; unreadNotificationsCount?: number }>();
    const user = props.auth?.user;

    let unreadCount = 0;
    try {
        const notificationsContext = useNotifications();
        unreadCount = notificationsContext.unreadCount;
    } catch {
        unreadCount = props.unreadNotificationsCount || 0;
    }

    const showNotifications = user?.role === 'seller' || user?.role === 'administrator' || user?.role === 'buyer';

    const getNotificationRoute = () => {
        switch (user?.role) {
            case 'seller':
                return '/seller/notifications';
            case 'administrator':
                return '/admin/notifications';
            case 'buyer':
                return '/buyer/notifications';
            default:
                return '/notifications';
        }
    };

    return (
        <header className="flex h-16 shrink-0 items-center gap-3 border-b border-sidebar-border/50 bg-gradient-to-r from-background to-background/95 px-6 backdrop-blur-sm transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 md:px-5">
            <div className="flex flex-1 items-center gap-3">
                <SidebarTrigger className="-ml-1 rounded-md transition-colors duration-200 hover:bg-sidebar-accent/70" />
                <Breadcrumbs breadcrumbs={breadcrumbs} />
            </div>
            <div className="flex items-center gap-3">
                {showNotifications && user?.role && (
                    <NotificationsDropdown userRole={user.role} initialUnreadCount={unreadCount} />
                )}
                <UserRoleDisplay />
            </div>
        </header>
    );
}
