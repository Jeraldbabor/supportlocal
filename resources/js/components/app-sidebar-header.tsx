import { Breadcrumbs } from '@/components/breadcrumbs';
import { SidebarTrigger } from '@/components/ui/sidebar';
import UserRoleDisplay from '@/components/user-role-display';
import { useNotifications } from '@/contexts/NotificationsContext';
import { type BreadcrumbItem as BreadcrumbItemType } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { Bell } from 'lucide-react';

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
                {showNotifications && (
                    <Link
                        href={getNotificationRoute()}
                        className="group relative rounded-xl p-2.5 text-sidebar-foreground/60 transition-all duration-200 hover:scale-105 hover:bg-sidebar-accent hover:text-sidebar-foreground active:scale-95"
                        title="Notifications"
                    >
                        <Bell className="h-5 w-5 transition-transform duration-200 group-hover:rotate-12" />
                        {unreadCount > 0 && (
                            <span className="absolute -top-0.5 -right-0.5 flex h-5 min-w-[20px] animate-pulse items-center justify-center rounded-full bg-gradient-to-br from-red-500 to-red-600 px-1.5 py-0.5 text-[10px] font-bold text-white shadow-lg ring-2 shadow-red-500/50 ring-background">
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
