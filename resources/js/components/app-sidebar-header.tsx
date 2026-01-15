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

    return (
        <header className="flex h-14 shrink-0 items-center gap-2 border-b border-sidebar-border/50 bg-gradient-to-r from-background to-background/95 px-3 backdrop-blur-sm transition-[width,height] ease-linear sm:h-16 sm:gap-3 sm:px-4 md:px-5 lg:px-6 group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
            <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
                <SidebarTrigger className="-ml-1 flex-shrink-0 rounded-md transition-colors duration-200 hover:bg-sidebar-accent/70" />
                <div className="min-w-0 flex-1">
                    <Breadcrumbs breadcrumbs={breadcrumbs} />
                </div>
            </div>
            <div className="flex flex-shrink-0 items-center gap-2 sm:gap-3">
                {showNotifications && user?.role && <NotificationsDropdown userRole={user.role} initialUnreadCount={unreadCount} />}
                <UserRoleDisplay />
            </div>
        </header>
    );
}
