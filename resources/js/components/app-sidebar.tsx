import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import Echo from '@/lib/echo';
import { type NavItem, type SharedData } from '@/types';
import { router, usePage } from '@inertiajs/react';
import {
    BarChart3,
    FileEdit,
    FileSearch,
    FileText,
    FolderTree,
    Gavel,
    LayoutGrid,
    Mail,
    MessageSquare,
    Package,
    PenTool,
    ShoppingBag,
    Star,
    Users,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import AppLogo from './app-logo';

// Interface for badge counts
interface BadgeCounts {
    marketplace?: number;
    bidNotifications?: number;
    bidReceived?: number;
    contactMessages?: number;
}

// Function to get role-specific navigation items
function getRoleNavItems(userRole?: string, badges?: BadgeCounts): NavItem[] {
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
                    title: 'Custom Orders',
                    href: '/seller/custom-orders',
                    icon: PenTool,
                },
                {
                    title: 'Marketplace',
                    href: '/seller/marketplace',
                    icon: Gavel,
                    badge: (badges?.marketplace || 0) + (badges?.bidNotifications || 0) || undefined,
                },
                {
                    title: 'Seller Ratings',
                    href: '/seller/seller-ratings',
                    icon: Star,
                },
                {
                    title: 'Product Reviews',
                    href: '/seller/ratings',
                    icon: MessageSquare,
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
                    title: 'Analytics',
                    href: '/admin/analytics',
                    icon: BarChart3,
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
                    icon: FileSearch,
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
                    badge: badges?.contactMessages,
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
                {
                    title: 'My Custom Orders',
                    href: '/buyer/custom-orders',
                    icon: PenTool,
                    badge: badges?.bidReceived,
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
    const { auth, newContactMessagesCount, unreadMarketplaceCount, unreadBidNotificationsCount, unreadBidReceivedCount } = usePage<
        SharedData & {
            newContactMessagesCount?: number;
            unreadMarketplaceCount?: number;
            unreadBidNotificationsCount?: number;
            unreadBidReceivedCount?: number;
        }
    >().props;
    const user = auth.user;
    const [unreadMessagesCount, setUnreadMessagesCount] = useState(0);
    // Track navigation to force re-subscription of Echo channels
    const [navigationCount, setNavigationCount] = useState(0);

    // Get role-specific navigation items with badge counts
    const badges: BadgeCounts = {
        marketplace: unreadMarketplaceCount,
        bidNotifications: unreadBidNotificationsCount,
        bidReceived: unreadBidReceivedCount,
        contactMessages: newContactMessagesCount,
    };
    const mainNavItems = getRoleNavItems(user?.role, badges);

    // Listen for Inertia navigation to trigger re-subscription
    useEffect(() => {
        const handleNavigate = () => {
            setNavigationCount((prev) => prev + 1);
        };

        const removeListener = router.on('navigate', handleNavigate);
        return () => {
            removeListener();
        };
    }, []);

    // Load unread messages count
    // Re-subscribe after navigation to ensure fresh CSRF token authentication
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
        if (Echo) {
            const channel = Echo.private(`App.Models.User.${user.id}`);
            channel.listen('MessageSent', () => {
                loadUnreadCount();
            });

            return () => {
                channel.stopListening('MessageSent');
                Echo?.leave(`private-App.Models.User.${user.id}`);
            };
        }
    }, [user?.id, navigationCount]);

    return (
        <Sidebar collapsible="icon" variant="inset" className="border-r border-gray-200">
            <SidebarHeader className="border-b border-gray-200 py-4">
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

            <SidebarContent className="bg-gradient-to-b from-slate-50/50 to-slate-50 py-4">
                <NavMain items={mainNavItems} unreadMessagesCount={unreadMessagesCount} />
            </SidebarContent>

            <SidebarFooter className="border-t border-gray-200 py-3">
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
