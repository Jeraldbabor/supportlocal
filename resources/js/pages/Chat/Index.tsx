import React, { useState } from 'react';
import { Head } from '@inertiajs/react';
import { MessageSquare, Search } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import ChatWindow from '@/components/ChatWindow';
import ConversationItem from '@/components/ConversationItem';
import { type BreadcrumbItem } from '@/types';
import { Input } from '@/components/ui/input';

const breadcrumbs: BreadcrumbItem[] = [
  {
    title: 'Messages',
    href: '/chat',
  },
];

interface User {
  id: number;
  name: string;
  email: string;
  profile_picture?: string;
}

interface Conversation {
  id: number;
  other_user: {
    id: number;
    name: string;
    profile_picture?: string;
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
}

interface ChatIndexProps {
  auth: {
    user: User;
  };
  conversations: Conversation[];
}

export default function ChatIndex({ auth, conversations }: ChatIndexProps) {
  const [selectedConversationId, setSelectedConversationId] = useState<number | null>(
    conversations.length > 0 ? conversations[0].id : null
  );
  const [searchQuery, setSearchQuery] = useState('');

  const filteredConversations = conversations.filter((conv) =>
    conv.other_user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.product?.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Messages" />
      
      <div className="flex flex-col h-[calc(100vh-10rem)] overflow-hidden rounded-xl border border-border/50 bg-card shadow-lg">
        <div className="grid flex-1 grid-cols-1 md:grid-cols-[380px_1fr] overflow-hidden">
          {/* Conversations List */}
          <div className="flex flex-col border-r border-border/50 bg-muted/30 overflow-hidden">
            {/* Header */}
            <div className="border-b border-border/50 p-5 flex-shrink-0 bg-background/50 backdrop-blur-sm">
              <h2 className="flex items-center gap-3 text-xl font-bold text-foreground">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                  <MessageSquare className="h-5 w-5 text-primary" />
                </div>
                Messages
                {conversations.length > 0 && (
                  <span className="ml-auto text-sm font-normal text-muted-foreground">
                    {conversations.length} conversation{conversations.length !== 1 ? 's' : ''}
                  </span>
                )}
              </h2>
              
              {/* Search */}
              {conversations.length > 0 && (
                <div className="relative mt-4">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search conversations..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-background/80 border-border/50 focus:border-primary/50"
                  />
                </div>
              )}
            </div>
            
            {/* Conversations List */}
            <div className="flex-1 overflow-y-auto">
              {filteredConversations.length === 0 ? (
                <div className="flex h-full items-center justify-center p-8 text-center">
                  <div className="max-w-[200px]">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                      <MessageSquare className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <p className="font-medium text-foreground">
                      {searchQuery ? 'No results found' : 'No conversations yet'}
                    </p>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {searchQuery ? 'Try a different search term' : 'Start chatting with sellers or buyers to see your conversations here'}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="p-2">
                  {filteredConversations.map((conversation) => (
                    <ConversationItem
                      key={conversation.id}
                      conversation={conversation}
                      isActive={selectedConversationId === conversation.id}
                      onClick={() => setSelectedConversationId(conversation.id)}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Chat Window */}
          <div className="flex flex-col bg-background overflow-hidden">
            {selectedConversationId ? (
              <ChatWindow
                conversationId={selectedConversationId}
                currentUserId={auth.user.id}
              />
            ) : (
              <div className="flex h-full items-center justify-center bg-gradient-to-br from-muted/30 to-muted/10">
                <div className="text-center max-w-[280px]">
                  <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
                    <MessageSquare className="h-10 w-10 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground">Select a conversation</h3>
                  <p className="mt-2 text-muted-foreground">
                    Choose a conversation from the list to start messaging
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
