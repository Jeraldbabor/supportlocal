import { DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { UserInfo } from '@/components/user-info';
import { useMobileNavigation } from '@/hooks/use-mobile-navigation';
import { type User } from '@/types';
import { Link, router } from '@inertiajs/react';
import { LogOut, Settings, User as UserIcon } from 'lucide-react';

interface UserMenuContentProps {
    user: User;
}

export function UserMenuContent({ user }: UserMenuContentProps) {
    const cleanup = useMobileNavigation();

    const handleLogout = () => {
        cleanup();
        router.flushAll();
    };

    // Get role-specific profile and settings URLs
    const getProfileUrl = () => {
        switch (user.role) {
            case 'seller':
                return '/seller/profile';
            case 'buyer':
                return '/buyer/profile';
            case 'administrator':
                return '/profile';
            default:
                return '/profile';
        }
    };

    const getSettingsUrl = () => {
        switch (user.role) {
            case 'seller':
                return '/seller/settings';
            case 'buyer':
                return '/buyer/profile'; // Buyers use same page for profile/settings
            case 'administrator':
                return '/admin/settings';
            default:
                return '/profile';
        }
    };

    return (
        <>
            <DropdownMenuLabel className="p-0 font-normal">
                <div className="flex items-center gap-3 px-3 py-3 text-left">
                    <UserInfo user={user} showEmail={true} />
                </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="my-1" />
            <DropdownMenuGroup>
                <DropdownMenuItem asChild className="cursor-pointer">
                    <Link
                        className="flex items-center gap-3 px-3 py-2.5 transition-colors duration-150"
                        href={getProfileUrl()}
                        as="button"
                        onClick={cleanup}
                    >
                        <UserIcon className="h-4 w-4" />
                        <span className="font-medium">Profile</span>
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="cursor-pointer">
                    <Link
                        className="flex items-center gap-3 px-3 py-2.5 transition-colors duration-150"
                        href={getSettingsUrl()}
                        as="button"
                        onClick={cleanup}
                    >
                        <Settings className="h-4 w-4" />
                        <span className="font-medium">Settings</span>
                    </Link>
                </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator className="my-1" />
            <DropdownMenuItem asChild className="cursor-pointer text-destructive focus:text-destructive">
                <Link
                    className="flex items-center gap-3 px-3 py-2.5 transition-colors duration-150"
                    href="/logout"
                    as="button"
                    method="post"
                    onClick={handleLogout}
                    data-test="logout-button"
                >
                    <LogOut className="h-4 w-4" />
                    <span className="font-medium">Log out</span>
                </Link>
            </DropdownMenuItem>
        </>
    );
}
