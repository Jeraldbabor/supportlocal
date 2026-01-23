import ChatWindow from '@/components/ChatWindow';
import ConversationItem from '@/components/ConversationItem';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { ArrowLeft, MessageSquare, Search } from 'lucide-react';
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
    const [selectedConversationId, setSelectedConversationId] = useState<number | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [showChatOnMobile, setShowChatOnMobile] = useState(false);

    const filteredConversations = conversations.filter(
        (conv) =>
            conv.other_user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            conv.product?.name.toLowerCase().includes(searchQuery.toLowerCase()),
    );

    const handleSelectConversation = (id: number) => {
        setSelectedConversationId(id);
        setShowChatOnMobile(true);
    };

    const handleBackToList = () => {
        setShowChatOnMobile(false);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Messages" />

            <div 
                className="mx-auto h-[calc(100vh-8rem)] max-w-6xl overflow-hidden rounded-xl border border-gray-300 bg-white shadow-sm sm:h-[calc(100vh-10rem)]"
                data-chat-container
            >
                <div className="flex h-full">
                    {/* Conversations List - Hidden on mobile when chat is open */}
                    <div className={`flex h-full w-full flex-col border-r border-gray-300 bg-gray-50 md:w-80 lg:w-96 ${showChatOnMobile ? 'hidden md:flex' : 'flex'}`}>
                        {/* Header */}
                        <div className="flex-shrink-0 border-b border-gray-300 bg-white p-4">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-100">
                                    <MessageSquare className="h-5 w-5 text-orange-600" />
                                </div>
                                <div className="flex-1">
                                    <h2 className="text-lg font-bold text-gray-900">Messages</h2>
                                    {conversations.length > 0 && (
                                        <p className="text-xs text-gray-500">
                                            {conversations.length} conversation{conversations.length !== 1 ? 's' : ''}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Search */}
                            {conversations.length > 0 && (
                                <div className="relative mt-3">
                                    <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Search conversations..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full rounded-lg border border-gray-300 bg-gray-50 py-2.5 pr-4 pl-10 text-sm text-gray-900 placeholder-gray-400 transition-colors focus:border-orange-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-200"
                                    />
                                </div>
                            )}
                        </div>

                        {/* Conversations List */}
                        <div className="flex-1 overflow-y-auto">
                            {filteredConversations.length === 0 ? (
                                <div className="flex h-full items-center justify-center p-6 text-center">
                                    <div className="max-w-[200px]">
                                        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
                                            <MessageSquare className="h-8 w-8 text-gray-400" />
                                        </div>
                                        <p className="font-medium text-gray-900">
                                            {searchQuery ? 'No results found' : 'No conversations yet'}
                                        </p>
                                        <p className="mt-2 text-sm text-gray-500">
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
                                            onClick={() => handleSelectConversation(conversation.id)}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Chat Window - Full width on mobile when open */}
                    <div className={`flex h-full flex-1 flex-col bg-white ${showChatOnMobile ? 'flex' : 'hidden md:flex'}`}>
                        {selectedConversationId ? (
                            <>
                                {/* Mobile back button */}
                                <div className="flex-shrink-0 border-b border-gray-300 bg-white p-2 md:hidden">
                                    <button
                                        onClick={handleBackToList}
                                        className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100"
                                    >
                                        <ArrowLeft className="h-4 w-4" />
                                        Back to conversations
                                    </button>
                                </div>
                                <ChatWindow conversationId={selectedConversationId} currentUserId={auth.user.id} />
                            </>
                        ) : (
                            <div className="flex h-full items-center justify-center bg-gray-50">
                                <div className="max-w-[280px] text-center">
                                    <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-orange-100">
                                        <MessageSquare className="h-10 w-10 text-orange-600" />
                                    </div>
                                    <h3 className="text-xl font-semibold text-gray-900">Select a conversation</h3>
                                    <p className="mt-2 text-gray-500">Choose a conversation from the list to start messaging</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
