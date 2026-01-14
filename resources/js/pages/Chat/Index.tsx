import ChatWindow from '@/components/ChatWindow';
import ConversationItem from '@/components/ConversationItem';
import { Input } from '@/components/ui/input';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { MessageSquare, Search } from 'lucide-react';
import { useState } from 'react';

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
    const [selectedConversationId, setSelectedConversationId] = useState<number | null>(conversations.length > 0 ? conversations[0].id : null);
    const [searchQuery, setSearchQuery] = useState('');

    const filteredConversations = conversations.filter(
        (conv) =>
            conv.other_user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            conv.product?.name.toLowerCase().includes(searchQuery.toLowerCase()),
    );

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Messages" />

            <div className="flex h-[calc(100vh-10rem)] flex-col overflow-hidden rounded-xl border border-border/50 bg-card shadow-lg">
                <div className="grid flex-1 grid-cols-1 overflow-hidden md:grid-cols-[380px_1fr]">
                    {/* Conversations List */}
                    <div className="flex flex-col overflow-hidden border-r border-border/50 bg-muted/30">
                        {/* Header */}
                        <div className="flex-shrink-0 border-b border-border/50 bg-background/50 p-5 backdrop-blur-sm">
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
                                    <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                    <Input
                                        placeholder="Search conversations..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="border-border/50 bg-background/80 pl-10 focus:border-primary/50"
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
                                        <p className="font-medium text-foreground">{searchQuery ? 'No results found' : 'No conversations yet'}</p>
                                        <p className="mt-2 text-sm text-muted-foreground">
                                            {searchQuery
                                                ? 'Try a different search term'
                                                : 'Start chatting with sellers or buyers to see your conversations here'}
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
                    <div className="flex flex-col overflow-hidden bg-background">
                        {selectedConversationId ? (
                            <ChatWindow conversationId={selectedConversationId} currentUserId={auth.user.id} />
                        ) : (
                            <div className="flex h-full items-center justify-center bg-gradient-to-br from-muted/30 to-muted/10">
                                <div className="max-w-[280px] text-center">
                                    <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
                                        <MessageSquare className="h-10 w-10 text-primary" />
                                    </div>
                                    <h3 className="text-xl font-semibold text-foreground">Select a conversation</h3>
                                    <p className="mt-2 text-muted-foreground">Choose a conversation from the list to start messaging</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
