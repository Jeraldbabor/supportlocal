import { InertiaLinkProps } from '@inertiajs/react';
import { LucideIcon } from 'lucide-react';

export interface Auth {
    user: User;
}

export interface BreadcrumbItem {
    title: string;
    href: string;
}

export interface NavGroup {
    title: string;
    items: NavItem[];
}

export interface NavItem {
    title: string;
    href: NonNullable<InertiaLinkProps['href']>;
    icon?: LucideIcon | null;
    isActive?: boolean;
}

export interface SharedData {
    name: string;
    quote: { message: string; author: string };
    auth: Auth;
    sidebarOpen: boolean;
    wishlistCount?: number;
    [key: string]: unknown;
}

export interface User {
    id: number;
    name: string;
    email: string;
    role?: string;
    avatar?: string;
    avatar_url?: string; // Added for avatar URL accessor
    profile_picture?: string; // Added for profile picture
    email_verified_at: string | null;
    created_at: string;
    updated_at: string;
    [key: string]: unknown; // This allows for additional properties...
}

export interface Product {
    id: number;
    name: string;
    price: string | number;
    quantity?: number;
    primary_image: string;
    seller: {
        id: number;
        name: string;
    };
}
