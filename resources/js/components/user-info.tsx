import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useInitials } from '@/hooks/use-initials';
import { type User } from '@/types';

export function UserInfo({ user, showEmail = false }: { user: User; showEmail?: boolean }) {
    const getInitials = useInitials();

    // Use avatar_url from backend accessor (includes default avatars)
    const avatarSrc = (user as User & { avatar_url?: string }).avatar_url || user.avatar;

    return (
        <>
            <Avatar className="h-9 w-9 overflow-hidden rounded-full ring-2 ring-sidebar-border/50 ring-offset-2 ring-offset-sidebar transition-all duration-200 group-hover:ring-primary/30">
                <AvatarImage src={avatarSrc} alt={user.name} className="object-cover" />
                <AvatarFallback className="rounded-full bg-gradient-to-br from-primary/80 to-primary text-primary-foreground font-semibold text-sm">
                    {getInitials(user.name)}
                </AvatarFallback>
            </Avatar>
            <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">{user.name}</span>
                {showEmail && <span className="truncate text-xs text-muted-foreground/80">{user.email}</span>}
            </div>
        </>
    );
}
