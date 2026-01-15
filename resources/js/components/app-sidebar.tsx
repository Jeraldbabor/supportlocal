import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import Echo from '@/lib/echo';
import { type NavItem, type SharedData } from '@/types';
import { usePage } from '@inertiajs/react';
import {
    BarChart3,
    FileEdit,
    FileSearch,
    FileText,
    FolderTree,
    LayoutGrid,
    Mail,
    MessageSquare,
    Package,
    ShoppingBag,
    Star,
    Users,
} from 'lucide-react';
import { useEffect, useState } from 'react';
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
                    title: 'Messages',
                    href: '/chat',
                    icon: MessageSquare,
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
                    title: 'Seller Ratings',
                    href: '/seller/seller-ratings',
                    icon: Star,
                },
                {
                    title: 'Customers',
                    href: '/seller/customers',
                    icon: Users,
                },
                {
                    title: 'Sales Analytics',
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
                    title: 'Products',
                    href: '/admin/products',
                    icon: Package,
                },
                {
                    title: 'Orders',
                    href: '/admin/orders',
                    icon: ShoppingBag,
                },
                {
                    title: 'Categories',
                    href: '/admin/categories',
                    icon: FolderTree,
                },
                {
                    title: 'Seller Applications',
                    href: '/admin/seller-applications',
                    icon: FileText,
                },
                {
                    title: 'System Reports',
                    href: '/admin/reports',
                    icon: BarChart3,
                },
                {
                    title: 'Logs Monitoring',
                    href: '/admin/logs',
                    icon: FileSearch,
                },
                {
                    title: 'Page Content',
                    href: '/admin/page-content',
                    icon: FileEdit,
                },
                {
                    title: 'Contact Messages',
                    href: '/admin/contact-messages',
                    icon: Mail,
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
                    title: 'Messages',
                    href: '/chat',
                    icon: MessageSquare,
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
    const { auth, newContactMessagesCount } = usePage<SharedData & { newContactMessagesCount?: number }>().props;
    const user = auth.user;
    const [unreadMessagesCount, setUnreadMessagesCount] = useState(0);

    // Get role-specific navigation items
    const mainNavItems = getRoleNavItems(user?.role);

    // Load unread messages count
    useEffect(() => {
        if (!user?.id) return;

        const loadUnreadCount = async () => {
            try {
                const response = await fetch('/api/chat/conversations');
                if (response.ok) {
                    const conversations = await response.json();
                    const totalUnread = conversations.reduce((sum: number, conv: { unread_count?: number }) => sum + (conv.unread_count || 0), 0);
                    setUnreadMessagesCount(totalUnread);
                }
            } catch (error) {
                console.error('Failed to load unread count:', error);
            }
        };

        loadUnreadCount();

        // Listen for new messages
        const channel = Echo.private(`App.Models.User.${user.id}`);
        channel.listen('MessageSent', () => {
            loadUnreadCount();
        });

        return () => {
            channel.stopListening('MessageSent');
        };
    }, [user?.id]);

    return (
        <Sidebar collapsible="icon" variant="inset" className="border-r border-sidebar-border/50">
            <SidebarHeader className="border-b border-sidebar-border/50 py-4">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild className="px-3 transition-colors duration-200">
                            <div className="flex items-center gap-3">
                                <AppLogo />
                            </div>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent className="bg-gradient-to-b from-sidebar/50 to-sidebar py-4">
                <NavMain items={mainNavItems} unreadMessagesCount={unreadMessagesCount} newContactMessagesCount={newContactMessagesCount || 0} />
            </SidebarContent>

            <SidebarFooter className="border-t border-sidebar-border/50 py-3">
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
