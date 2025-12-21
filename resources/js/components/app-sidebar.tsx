import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { type NavItem, type SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { BarChart3, LayoutGrid, Package, ShoppingBag, Users } from 'lucide-react';
import AppLogo from './app-logo';

// Function to get role-specific navigation items
function getRoleNavItems(userRole?: string): NavItem[] {
    switch (userRole) {
        case 'seller':
            return [
                {
                    title: 'Dashboard',
                    href: '/seller/dashboard',
                    icon: LayoutGrid,
                },
                {
                    title: 'My Products',
                    href: '/seller/products',
                    icon: Package,
                },
                {
                    title: 'Orders',
                    href: '/seller/orders',
                    icon: ShoppingBag,
                },
                {
                    title: 'Customers',
                    href: '/seller/customers',
                    icon: Users,
                },
                {
                    title: 'Analytics',
                    href: '/seller/analytics',
                    icon: BarChart3,
                },
            ];

        case 'administrator':
            return [
                {
                    title: 'Dashboard',
                    href: '/admin/dashboard',
                    icon: LayoutGrid,
                },
                {
                    title: 'Manage Users',
                    href: '/admin/users',
                    icon: Users,
                },
                {
                    title: 'System Reports',
                    href: '/admin/reports',
                    icon: BarChart3,
                },
            ];

        case 'buyer':
            return [
                {
                    title: 'Dashboard',
                    href: '/buyer/dashboard',
                    icon: LayoutGrid,
                },
                {
                    title: 'Browse Products',
                    href: '/products',
                    icon: Package,
                },
                {
                    title: 'My Orders',
                    href: '/buyer/orders',
                    icon: ShoppingBag,
                },
            ];

        default:
            return [
                {
                    title: 'Dashboard',
                    href: '/',
                    icon: LayoutGrid,
                },
            ];
    }
}

export function AppSidebar() {
    // Get user data from the page props - this ensures session is maintained
    const { auth } = usePage<SharedData>().props;
    const user = auth.user;

    // Get role-specific navigation items
    const mainNavItems = getRoleNavItems(user?.role);

    return (
        <Sidebar collapsible="icon" variant="inset" className="border-r border-sidebar-border/50">
            <SidebarHeader className="border-b border-sidebar-border/50 py-4">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild className="px-3 transition-colors duration-200 hover:bg-sidebar-accent/50">
                            <Link href="/" prefetch className="flex items-center gap-3">
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent className="bg-gradient-to-b from-sidebar/50 to-sidebar py-4">
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter className="border-t border-sidebar-border/50 py-3">
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
