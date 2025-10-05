import { Breadcrumbs } from '@/components/breadcrumbs';
import { SidebarTrigger } from '@/components/ui/sidebar';
import UserRoleDisplay from '@/components/user-role-display';
import { type BreadcrumbItem as BreadcrumbItemType } from '@/types';
import { Bell } from 'lucide-react';
import { Link, usePage } from '@inertiajs/react';
import { useNotifications } from '@/contexts/NotificationsContext';

export function AppSidebarHeader({ breadcrumbs = [] }: { breadcrumbs?: BreadcrumbItemType[] }) {
    const { props } = usePage<any>();
    const user = props.auth?.user;
    
    // Add defensive handling for notifications context
    let unreadCount = 0;
    try {
        const notificationsContext = useNotifications();
        unreadCount = notificationsContext.unreadCount;
    } catch (error) {
        // Fallback to props if context is not available
        unreadCount = props.unreadNotificationsCount || 0;
    }

    // Only show notifications for sellers and admins  
    const showNotifications = user?.role === 'seller' || user?.role === 'admin';

    return (
        <header className="flex h-16 shrink-0 items-center gap-2 border-b border-sidebar-border/50 px-6 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 md:px-4">
            <div className="flex flex-1 items-center gap-2">
                <SidebarTrigger className="-ml-1" />
                <Breadcrumbs breadcrumbs={breadcrumbs} />
            </div>
            <div className="flex items-center gap-4">
                {showNotifications && (
                    <Link
                        href="/seller/notifications"
                        className="relative p-2 text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent rounded-lg transition-colors"
                        title="Notifications"
                    >
                        <Bell className="h-5 w-5" />
                        {unreadCount > 0 && (
                            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-medium px-1.5 py-0.5 rounded-full min-w-[20px] h-5 flex items-center justify-center">
                                {unreadCount > 99 ? '99+' : unreadCount}
                            </span>
                        )}
                    </Link>
                )}
                <UserRoleDisplay />
            </div>
        </header>
    );
}
