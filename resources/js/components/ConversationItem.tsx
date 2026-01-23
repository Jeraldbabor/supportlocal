import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatDistanceToNow } from 'date-fns';

interface ConversationItemProps {
    conversation: {
        id: number;
        other_user: {
            id: number;
            name: string;
            profile_picture?: string;
            avatar_url?: string;
        };
        product?: {
            id: number;
            name: string;
        };
        last_message?: {
            message: string;
            created_at: string;
        };
        unread_count: number;
    };
    isActive: boolean;
    onClick: () => void;
}

export default function ConversationItem({ conversation, isActive, onClick }: ConversationItemProps) {
    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    return (
        <button
            onClick={onClick}
            className={`mb-1.5 w-full rounded-xl p-3 text-left transition-all duration-200 ${
                isActive 
                    ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-md' 
                    : 'bg-white hover:bg-orange-50 hover:shadow-sm border border-transparent hover:border-orange-100 dark:bg-gray-700 dark:hover:bg-gray-600 dark:border-gray-600'
            }`}
        >
            <div className="flex items-start gap-3">
                <div className="relative flex-shrink-0">
                    <Avatar className={`h-11 w-11 ring-2 ${isActive ? 'ring-white/30' : 'ring-gray-100 dark:ring-gray-600'}`}>
                        <AvatarImage src={conversation.other_user.avatar_url} />
                        <AvatarFallback 
                            className={isActive ? 'bg-white/20 text-white' : 'bg-orange-100 font-semibold text-orange-700 dark:bg-orange-900/30 dark:text-orange-300'}
                        >
                            {getInitials(conversation.other_user.name)}
                        </AvatarFallback>
                    </Avatar>
                    {conversation.unread_count > 0 && !isActive && (
                        <span className="absolute -top-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-orange-500 text-[10px] font-bold text-white ring-2 ring-white">
                            {conversation.unread_count > 9 ? '9+' : conversation.unread_count}
                        </span>
                    )}
                </div>
                <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                        <h4 className={`truncate text-sm font-semibold ${isActive ? 'text-white' : 'text-gray-900 dark:text-white'}`}>
                            {conversation.other_user.name}
                        </h4>
                        {conversation.last_message && (
                            <span className={`flex-shrink-0 text-[11px] ${isActive ? 'text-white/70' : 'text-gray-400 dark:text-gray-500'}`}>
                                {formatDistanceToNow(new Date(conversation.last_message.created_at), { addSuffix: false })}
                            </span>
                        )}
                    </div>
                    {conversation.product && (
                        <p className={`mt-0.5 truncate text-xs ${isActive ? 'text-white/70' : 'text-gray-500 dark:text-gray-400'}`}>
                            Re: {conversation.product.name}
                        </p>
                    )}
                    {conversation.last_message && (
                        <p
                            className={`mt-1 truncate text-sm ${
                                isActive 
                                    ? 'text-white/80' 
                                    : conversation.unread_count > 0 
                                        ? 'font-medium text-gray-800 dark:text-gray-200' 
                                        : 'text-gray-500 dark:text-gray-400'
                            }`}
                        >
                            {conversation.last_message.message}
                        </p>
                    )}
                </div>
            </div>
        </button>
    );
}
