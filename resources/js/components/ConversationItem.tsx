import React from 'react';
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
      className={`w-full rounded-xl p-4 text-left transition-all duration-200 mb-1 ${
        isActive 
          ? 'bg-blue-500 text-white shadow-md scale-[1.02]' 
          : 'bg-background hover:bg-muted/80 hover:shadow-sm'
      }`}
    >
      <div className="flex items-start gap-3">
        <div className="relative">
          <Avatar className={`h-12 w-12 ring-2 ring-offset-2 ${isActive ? 'ring-white/30 ring-offset-blue-500' : 'ring-border/50 ring-offset-background'}`}>
            <AvatarImage src={conversation.other_user.avatar_url} />
            <AvatarFallback className={isActive ? 'bg-white/20 text-white' : 'bg-primary/10 text-primary font-semibold'}>
              {getInitials(conversation.other_user.name)}
            </AvatarFallback>
          </Avatar>
          {conversation.unread_count > 0 && !isActive && (
            <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-blue-500 text-[10px] font-bold text-white ring-2 ring-background">
              {conversation.unread_count > 9 ? '9+' : conversation.unread_count}
            </span>
          )}
        </div>
        <div className="flex-1 overflow-hidden">
          <div className="flex items-center justify-between gap-2">
            <h4 className={`font-semibold truncate ${isActive ? 'text-white' : 'text-foreground'}`}>
              {conversation.other_user.name}
            </h4>
            {conversation.last_message && (
              <span className={`text-xs flex-shrink-0 ${isActive ? 'text-white/70' : 'text-muted-foreground'}`}>
                {formatDistanceToNow(new Date(conversation.last_message.created_at), { addSuffix: false })}
              </span>
            )}
          </div>
          {conversation.product && (
            <p className={`text-xs truncate mt-0.5 ${isActive ? 'text-white/70' : 'text-muted-foreground'}`}>
              Re: {conversation.product.name}
            </p>
          )}
          {conversation.last_message && (
            <p className={`truncate text-sm mt-1.5 ${
              isActive 
                ? 'text-white/80' 
                : conversation.unread_count > 0 
                  ? 'text-foreground font-medium' 
                  : 'text-muted-foreground'
            }`}>
              {conversation.last_message.message}
            </p>
          )}
        </div>
      </div>
    </button>
  );
}
