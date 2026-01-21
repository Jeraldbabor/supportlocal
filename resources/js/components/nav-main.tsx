import { SidebarGroup, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { type NavItem } from '@/types';
import { Link, usePage } from '@inertiajs/react';

export function NavMain({
    items = [],
    unreadMessagesCount = 0,
    newContactMessagesCount = 0,
}: {
    items: NavItem[];
    unreadMessagesCount?: number;
    newContactMessagesCount?: number;
}) {
    const page = usePage();

    // Function to determine if a nav item is active
    const isItemActive = (item: NavItem): boolean => {
        const currentUrl = page.url;
        const itemHref = typeof item.href === 'string' ? item.href : item.href.url;

        // Handle dashboard route specially - it should be active on role-specific dashboards
        if (item.title === 'Dashboard') {
            return currentUrl === '/' || currentUrl === '/dashboard' || currentUrl.includes('/dashboard') || currentUrl === itemHref;
        }

        // For other routes, check if current URL starts with the item href
        if (itemHref === '/') {
            return currentUrl === '/';
        }

        return currentUrl === itemHref || currentUrl.startsWith(itemHref + '/');
    };

    return (
        <SidebarGroup className="px-3 py-2">
            <SidebarGroupLabel className="px-2 text-xs font-semibold tracking-wider text-gray-500 uppercase">
                Navigation
            </SidebarGroupLabel>
            <SidebarMenu className="mt-2 gap-1">
                {items.map((item) => (
                    <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton
                            asChild
                            isActive={isItemActive(item)}
                            tooltip={{ children: item.title }}
                            className="group relative transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] data-[active=true]:bg-orange-500 data-[active=true]:font-semibold data-[active=true]:text-white data-[active=true]:shadow-md"
                        >
                            <Link href={item.href} prefetch className="flex items-center gap-3 px-3 py-2.5">
                                {item.icon && <item.icon className="h-5 w-5 shrink-0 transition-transform duration-200 group-hover:scale-110" style={{ color: 'inherit' }} />}
                                <span className="truncate font-medium">{item.title}</span>
                                {item.title === 'Messages' && unreadMessagesCount > 0 && (
                                    <span className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-blue-500 text-xs font-semibold text-white group-data-[active=true]:bg-white group-data-[active=true]:text-orange-600">
                                        {unreadMessagesCount > 9 ? '9+' : unreadMessagesCount}
                                    </span>
                                )}
                                {item.title === 'Contact Messages' && newContactMessagesCount > 0 && (
                                    <span className="ml-auto flex h-5 w-5 animate-pulse items-center justify-center rounded-full bg-blue-500 text-xs font-semibold text-white group-data-[active=true]:bg-white group-data-[active=true]:text-orange-600">
                                        {newContactMessagesCount > 9 ? '9+' : newContactMessagesCount}
                                    </span>
                                )}
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                ))}
            </SidebarMenu>
        </SidebarGroup>
    );
}
