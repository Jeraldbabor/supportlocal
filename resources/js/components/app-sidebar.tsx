import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { dashboard } from '@/routes';
import { type NavItem, type SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { BookOpen, Folder, LayoutGrid, Package, ShoppingBag, Shield, Users, BarChart3, Settings } from 'lucide-react';
import AppLogo from './app-logo';

const footerNavItems: NavItem[] = [
    {
        title: 'Repository',
        href: 'https://github.com/laravel/react-starter-kit',
        icon: Folder,
    },
    {
        title: 'Documentation',
        href: 'https://laravel.com/docs/starter-kits#react',
        icon: BookOpen,
    },
];

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
                {
                    title: 'Settings',
                    href: '/admin/settings',
                    icon: Settings,
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
                {
                    title: 'Wishlist',
                    href: '/buyer/wishlist',
                    icon: BookOpen,
                },
            ];

        default:
            return [
                {
                    title: 'Dashboard',
                    href: dashboard(),
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
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboard()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
