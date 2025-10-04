import { SidebarGroup, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { type NavItem } from '@/types';
import { Link, usePage } from '@inertiajs/react';

export function NavMain({ items = [] }: { items: NavItem[] }) {
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
        <SidebarGroup className="px-2 py-0">
            <SidebarGroupLabel>Platform</SidebarGroupLabel>
            <SidebarMenu>
                {items.map((item) => (
                    <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton asChild isActive={isItemActive(item)} tooltip={{ children: item.title }}>
                            <Link href={item.href} prefetch>
                                {item.icon && <item.icon />}
                                <span>{item.title}</span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                ))}
            </SidebarMenu>
        </SidebarGroup>
    );
}
