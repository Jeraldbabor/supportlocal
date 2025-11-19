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
                <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                    <UserInfo user={user} showEmail={true} />
                </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
                <DropdownMenuItem asChild>
                    <Link className="block w-full" href={getProfileUrl()} as="button" onClick={cleanup}>
                        <UserIcon className="mr-2" />
                        Profile
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                    <Link className="block w-full" href={getSettingsUrl()} as="button" onClick={cleanup}>
                        <Settings className="mr-2" />
                        Settings
                    </Link>
                </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
                <Link className="block w-full" href="/logout" as="button" method="post" onClick={handleLogout} data-test="logout-button">
                    <LogOut className="mr-2" />
                    Log out
                </Link>
            </DropdownMenuItem>
        </>
    );
}
