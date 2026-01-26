import { Breadcrumbs } from '@/components/breadcrumbs';
import NotificationsDropdown from '@/components/NotificationsDropdown';
import { SidebarTrigger } from '@/components/ui/sidebar';
import UserRoleDisplay from '@/components/user-role-display';
import { type BreadcrumbItem as BreadcrumbItemType } from '@/types';
import { usePage } from '@inertiajs/react';

export function AppSidebarHeader({ breadcrumbs = [] }: { breadcrumbs?: BreadcrumbItemType[] }) {
    const { props } = usePage<{ auth?: { user?: { role?: string } } }>();
    const user = props.auth?.user;

    const showNotifications = user?.role === 'seller' || user?.role === 'administrator' || user?.role === 'buyer';

    return (
        <header
            className="flex h-14 shrink-0 items-center gap-2 border-b border-gray-200 bg-white px-3 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 sm:h-16 sm:gap-3 sm:px-4 md:px-5 lg:px-6"
            style={{ colorScheme: 'light' }}
        >
            <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
                <SidebarTrigger className="-ml-1 flex-shrink-0 rounded-md text-gray-600 transition-colors duration-200 hover:bg-gray-100 hover:text-gray-900" />
                <div className="min-w-0 flex-1">
                    <Breadcrumbs breadcrumbs={breadcrumbs} />
                </div>
            </div>
            <div className="flex flex-shrink-0 items-center gap-2 sm:gap-3">
                {showNotifications && user?.role && <NotificationsDropdown userRole={user.role as 'buyer' | 'seller' | 'administrator'} />}
                <UserRoleDisplay />
            </div>
        </header>
    );
}
