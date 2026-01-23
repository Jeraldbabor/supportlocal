import BuyerChatModal from '@/components/BuyerChatModal';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Echo from '@/lib/echo';
import { router } from '@inertiajs/react';
import { formatDistanceToNow } from 'date-fns';
import { MessageSquare, Search, Trash2, X } from 'lucide-react';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import Swal from 'sweetalert2';

interface ConversationItem {
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
        image?: string;
    };
    last_message?: {
        message: string;
        created_at: string;
    };
    unread_count: number;
}

interface MessagesDropdownProps {
    currentUserId: number;
}

export default function MessagesDropdown({ currentUserId }: MessagesDropdownProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [conversations, setConversations] = useState<ConversationItem[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedConversationId, setSelectedConversationId] = useState<number | null>(null);
    const [showChatModal, setShowChatModal] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);
    const [showAllMessagesModal, setShowAllMessagesModal] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const dropdownRef = useRef<HTMLDivElement>(null);
    const conversationsListRef = useRef<HTMLDivElement>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const [hasNotificationPermission, setHasNotificationPermission] = useState(false);
    // Track navigation to force re-subscription of Echo channels
    const [navigationCount, setNavigationCount] = useState(0);

    const totalUnread = conversations.reduce((sum, conv) => sum + conv.unread_count, 0);

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

    // Request notification permission on mount
    useEffect(() => {
        if ('Notification' in window) {
            if (Notification.permission === 'granted') {
                setHasNotificationPermission(true);
            } else if (Notification.permission !== 'denied') {
                Notification.requestPermission().then((permission) => {
                    if (permission === 'granted') {
                        setHasNotificationPermission(true);
                    }
                });
            }
        }

        // Create audio element for notification sound
        audioRef.current = new Audio(
            'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjWH0fPTgjMGHm7A7+OZTA4NVqzn77BdGAw+ltryy3cmBSl+zPLaizsIGGS56+ihUBELTKXi8bllHAU5j9X00H8yBih4yPDajzsKF2O46+mjUhILTKTi8r1hHAU4jtT0z4ExBSh4yPDajzsKGGS56+ihUBILTKPi8r1hHAU4jtT0z4ExBSh4yO/ajzsKGGS56+mjUhILTKTi8r1hHAU4jtT0z4ExBSh4yPDajzsKGGS56+mjUhILTKTi8r1hHAU4jtT0z4ExBSh4yPDajzsKGGS56+mjUhILTKTi8r1hHAU4jtT0z4ExBSh4yPDajzsKGGS56+mjUhILTKTi8r1hHAU4jtT0z4ExBSh4yPDajzsKGGS56+mjUhILTKTi8r1hHAU4jtT0z4ExBSh4yPDajzsKGGS56+mjUhILTKTi8r1hHAU4jtT0z4ExBSh4yPDajzsKGGS56+mjUhILTKTi8r1hHAU4jtT0z4ExBSh4yPDajzsKGGS56+mjUhILTKTi8r1hHAU4jtT0z4ExBSh4yPDajzsKGGS56+mjUhILTKTi8r1hHAU4jtT0z4ExBSh4yPDajzsKGGS56+mjUhILTKTi8r1hHAU4jtT0z4ExBSh4yPDajzsKGGS56+mjUhILTKTi8r1hHAU4jtT0z4ExBSh4yPDajzsKGGS56+mjUhILTKTi8r1hHAU4jtT0z4ExBSh4yPDajzsKGGS56+mjUhILTKTi8r1hHAU4jtT0z4ExBSh4yPDajzsKGGS56+mjUhILTKTi8r1hHAU4jtT0z4ExBSh4yPDajzsKGGS56+mjUhIL',
        );
    }, []);

    const scrollToTop = useCallback(() => {
        if (conversationsListRef.current) {
            conversationsListRef.current.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }, []);

    const loadConversations = useCallback(
        async (force = false) => {
            // Prevent duplicate calls if already loading
            if (isLoading && !force) return;

            setIsLoading(true);
            try {
                const response = await fetch('/api/chat/conversations');
                if (response.ok) {
                    const data = await response.json();
                    setConversations(data || []);
                    // Scroll to top when conversations are loaded
                    setTimeout(() => scrollToTop(), 100);
                }
            } catch (error) {
                console.error('Failed to load conversations:', error);
            } finally {
                setIsLoading(false);
            }
        },
        [scrollToTop, isLoading],
    );

    const showNewMessageNotification = useCallback(
        (data: { message: { conversation_id: number; message: string; id: number }; sender: { name: string; avatar_url?: string } }) => {
            const { message, sender } = data;

            // Play notification sound
            if (audioRef.current) {
                audioRef.current.play().catch((err) => console.log('Audio play failed:', err));
            }

            // Show browser notification
            if (hasNotificationPermission && document.hidden) {
                new Notification(`New message from ${sender.name}`, {
                    body: message.message.substring(0, 100),
                    icon: sender.avatar_url || '/images/default-avatar.png',
                    tag: `message-${message.id}`,
                });
            }

            // Show toast notification
            const Toast = Swal.mixin({
                toast: true,
                position: 'top-end',
                showConfirmButton: false,
                timer: 3000,
                timerProgressBar: true,
                didOpen: (toast) => {
                    toast.addEventListener('mouseenter', Swal.stopTimer);
                    toast.addEventListener('mouseleave', Swal.resumeTimer);
                },
            });

            Toast.fire({
                icon: 'info',
                title: `New message from ${sender.name}`,
                text: message.message.substring(0, 50) + (message.message.length > 50 ? '...' : ''),
            });
        },
        [hasNotificationPermission],
    );

    // Listen for new messages across all conversations
    // Re-subscribe after navigation to ensure fresh CSRF token authentication
    useEffect(() => {
        if (!currentUserId || !Echo) return;

        // Subscribe to user's private channel for new messages
        const channel = Echo.private(`App.Models.User.${currentUserId}`);
        let reloadTimeout: NodeJS.Timeout | null = null;

        channel.listen(
            'MessageSent',
            (data: { message: { conversation_id: number; message: string; id: number }; sender: { name: string; avatar_url?: string } }) => {
                // Only show notification if not viewing this conversation
                if (!showChatModal || selectedConversationId !== data.message.conversation_id) {
                    showNewMessageNotification(data);
                }

                // Debounce reload to prevent multiple rapid calls
                if (reloadTimeout) clearTimeout(reloadTimeout);
                reloadTimeout = setTimeout(() => {
                    loadConversations(true);
                }, 500);
            },
        );

        return () => {
            channel.stopListening('MessageSent');
            Echo.leave(`private-App.Models.User.${currentUserId}`);
            if (reloadTimeout) clearTimeout(reloadTimeout);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentUserId, showChatModal, selectedConversationId, showNewMessageNotification, navigationCount]);

    // Load conversations on mount only (removed duplicate effect)
    useEffect(() => {
        loadConversations(true);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Refresh when dropdown opens
    useEffect(() => {
        if (isOpen) {
            loadConversations(true);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen]);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleConversationClick = (conversationId: number) => {
        setSelectedConversationId(conversationId);
        setShowChatModal(true);
        setIsOpen(false);
        setShowAllMessagesModal(false);
    };

    const handleDeleteConversation = async (convId: number, e: React.MouseEvent) => {
        e.stopPropagation();

        const result = await Swal.fire({
            title: 'Delete Conversation?',
            text: 'This will remove the conversation from your list.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Yes, delete it',
            cancelButtonText: 'Cancel',
        });

        if (result.isConfirmed) {
            try {
                const response = await fetch(`/chat/conversations/${convId}`, {
                    method: 'DELETE',
                    headers: {
                        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                    },
                });

                if (response.ok) {
                    setConversations((prev) => prev.filter((c) => c.id !== convId));

                    // If deleting active conversation, close modal
                    if (convId === selectedConversationId) {
                        setShowChatModal(false);
                        setSelectedConversationId(null);
                    }

                    await Swal.fire({
                        title: 'Deleted!',
                        text: 'Conversation has been deleted.',
                        icon: 'success',
                        timer: 1500,
                        showConfirmButton: false,
                    });

                    // Reload conversations to get updated list
                    loadConversations();
                }
            } catch (error) {
                console.error('Failed to delete conversation:', error);
                await Swal.fire({
                    title: 'Error!',
                    text: 'Failed to delete conversation.',
                    icon: 'error',
                });
            }
        }
    };

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    // Render dropdown content (reusable for both mobile and desktop)
    const renderDropdownContent = () => (
        <>
            <div className="rounded-t-lg border-b border-gray-300 bg-gray-50 p-2.5 sm:p-3">
                <h3 className="flex items-center gap-1.5 text-sm font-semibold text-gray-900 sm:gap-2 sm:text-base">
                    <MessageSquare className="h-3.5 w-3.5 flex-shrink-0 sm:h-4 sm:w-4" />
                    <span>Messages</span>
                </h3>
            </div>

            <div ref={conversationsListRef} className="max-h-[60vh] overflow-y-auto scroll-smooth sm:max-h-96 custom-scrollbar">
                {isLoading ? (
                    <div className="p-6 text-center text-gray-500 sm:p-8">
                        <div className="mx-auto h-6 w-6 animate-spin rounded-full border-b-2 border-primary sm:h-8 sm:w-8"></div>
                        <p className="mt-2 text-xs sm:text-sm">Loading...</p>
                    </div>
                ) : conversations.length === 0 ? (
                    <div className="p-6 text-center text-gray-500 sm:p-8">
                        <MessageSquare className="mx-auto mb-2 h-10 w-10 text-gray-300 sm:h-12 sm:w-12" />
                        <p className="text-xs sm:text-sm">No messages yet</p>
                        <p className="mt-1 text-[10px] text-gray-400 sm:text-xs">Start chatting with sellers!</p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-300">
                        {conversations.map((conversation) => (
                            <div key={conversation.id} className="flex items-start gap-2 p-2.5 transition-colors hover:bg-gray-50 sm:gap-3 sm:p-3">
                                <button
                                    onClick={() => handleConversationClick(conversation.id)}
                                    className="flex min-w-0 flex-1 items-start gap-2 text-left sm:gap-3"
                                >
                                    <Avatar className="h-9 w-9 flex-shrink-0 sm:h-10 sm:w-10">
                                        <AvatarImage src={conversation.other_user.avatar_url} />
                                        <AvatarFallback className="bg-primary/10 text-[10px] text-primary sm:text-xs">
                                            {getInitials(conversation.other_user.name)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-start justify-between gap-1.5 sm:gap-2">
                                            <p className="truncate text-xs font-semibold text-gray-900 sm:text-sm">{conversation.other_user.name}</p>
                                            {conversation.unread_count > 0 && (
                                                <span className="flex-shrink-0 rounded-full bg-primary px-1.5 py-0.5 text-[10px] text-white sm:px-2 sm:text-xs">
                                                    {conversation.unread_count}
                                                </span>
                                            )}
                                        </div>
                                        {conversation.product && (
                                            <p className="mt-0.5 truncate text-[10px] text-gray-500 sm:text-xs">{conversation.product.name}</p>
                                        )}
                                        {conversation.last_message && (
                                            <p className="mt-1 line-clamp-1 truncate text-[10px] text-gray-600 sm:text-xs">
                                                {conversation.last_message.message}
                                            </p>
                                        )}
                                        {conversation.last_message && (
                                            <p className="mt-0.5 text-[9px] text-gray-400 sm:mt-1 sm:text-xs">
                                                {formatDistanceToNow(new Date(conversation.last_message.created_at), { addSuffix: true })}
                                            </p>
                                        )}
                                    </div>
                                </button>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={(e) => handleDeleteConversation(conversation.id, e)}
                                    className="h-7 w-7 flex-shrink-0 text-gray-400 hover:text-destructive sm:h-8 sm:w-8"
                                    title="Delete conversation"
                                >
                                    <Trash2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                                </Button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {conversations.length > 0 && (
                <div className="rounded-b-lg border-t border-gray-300 bg-gray-50 p-2 sm:p-2.5">
                    <button
                        onClick={() => {
                            setShowAllMessagesModal(true);
                            setIsOpen(false);
                        }}
                        className="block w-full rounded py-1.5 text-center text-xs font-medium text-orange-500 sm:py-2 sm:text-sm"
                    >
                        View all messages
                    </button>
                </div>
            )}
        </>
    );

    return (
        <>
            <div className="relative" ref={dropdownRef} data-chat-container>
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="group relative rounded-lg p-1.5 transition-all duration-300 hover:bg-orange-50 hover:shadow-sm focus:ring-2 focus:ring-orange-500/50 focus:ring-offset-2 focus:outline-none sm:rounded-xl sm:p-2"
                    aria-label={`Messages ${totalUnread > 0 ? `(${totalUnread} unread)` : ''}`}
                >
                    <MessageSquare className="h-4 w-4 transition-transform duration-300 group-hover:scale-110 sm:h-5 sm:w-5" style={{ color: '#4b5563' }} />
                    {totalUnread > 0 && (
                        <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 animate-pulse items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-blue-600 text-[10px] font-medium text-white shadow-sm sm:-top-1 sm:-right-1 sm:h-5 sm:w-5 sm:text-xs">
                            {totalUnread > 9 ? '9+' : totalUnread}
                        </span>
                    )}
                </button>

                {/* Dropdown */}
                {isOpen && (
                    <>
                        {/* Mobile backdrop */}
                        <div className="fixed inset-0 z-[9998] bg-black/20 sm:hidden" onClick={() => setIsOpen(false)} />
                        {/* Dropdown - Fixed on mobile, absolute on desktop */}
                        <div className="fixed top-[4.5rem] right-2 z-[9999] w-[calc(100vw-1rem)] max-w-sm rounded-lg border border-gray-300 bg-white shadow-xl sm:absolute sm:top-auto sm:right-0 sm:z-50 sm:mt-2 sm:w-80" data-chat-container>
                            {renderDropdownContent()}
                        </div>
                    </>
                )}
            </div>

            {/* Chat Modal */}
            {showChatModal && selectedConversationId && (
                <BuyerChatModal
                    conversationId={selectedConversationId}
                    currentUserId={currentUserId}
                    onClose={() => {
                        setShowChatModal(false);
                        setSelectedConversationId(null);
                    }}
                    isMinimized={isMinimized}
                    onToggleMinimize={() => setIsMinimized(!isMinimized)}
                />
            )}

            {/* All Messages Modal */}
            {showAllMessagesModal &&
                createPortal(
                    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
                        <div className="flex h-[90vh] max-h-[900px] w-full max-w-6xl flex-col overflow-hidden rounded-xl bg-white dark:bg-gray-800 shadow-2xl" data-chat-container>
                            {/* Header */}
                            <div className="flex-shrink-0 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-primary/5 to-primary/10 dark:from-primary/20 dark:to-primary/30 p-6">
                                <div className="mb-4 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                                            <MessageSquare className="h-6 w-6 text-primary" />
                                        </div>
                                        <div>
                                            <h2 className="text-2xl font-bold text-gray-900">Messages</h2>
                                            {conversations.length > 0 && (
                                                <p className="mt-1 text-sm text-gray-600">
                                                    {conversations.length} conversation{conversations.length !== 1 ? 's' : ''}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => setShowAllMessagesModal(false)}
                                        className="h-10 w-10 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                                    >
                                        <X className="h-5 w-5" />
                                    </Button>
                                </div>

                                {/* Search */}
                                {conversations.length > 0 && (
                                    <div className="relative">
                                        <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
                                        <Input
                                            placeholder="Search conversations..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 pl-10 focus:border-primary dark:focus:border-orange-500 focus:ring-primary dark:focus:ring-orange-500"
                                        />
                                    </div>
                                )}
                            </div>

                            {/* Conversations List */}
                            <div className="flex-1 overflow-y-auto bg-gray-50 p-4 custom-scrollbar">
                                {isLoading ? (
                                    <div className="flex h-full items-center justify-center">
                                        <div className="text-center">
                                            <div className="mx-auto h-12 w-12 animate-spin rounded-full border-b-2 border-primary"></div>
                                            <p className="mt-4 text-sm text-gray-500">Loading conversations...</p>
                                        </div>
                                    </div>
                                ) : (
                                    (() => {
                                        const filteredConversations = conversations.filter(
                                            (conv) =>
                                                conv.other_user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                                conv.product?.name.toLowerCase().includes(searchQuery.toLowerCase()),
                                        );

                                        return filteredConversations.length === 0 ? (
                                            <div className="flex h-full items-center justify-center">
                                                <div className="max-w-md text-center">
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
                                            <div className="space-y-2">
                                                {filteredConversations.map((conversation) => (
                                                    <div
                                                        key={conversation.id}
                                                        className="cursor-pointer rounded-lg border border-gray-300 bg-white p-4 transition-all hover:border-orange-400 hover:shadow-md"
                                                        onClick={() => handleConversationClick(conversation.id)}
                                                    >
                                                        <div className="flex items-start gap-3">
                                                            <Avatar className="h-12 w-12 flex-shrink-0">
                                                                <AvatarImage src={conversation.other_user.avatar_url} />
                                                                <AvatarFallback className="bg-primary/10 text-sm font-semibold text-primary">
                                                                    {getInitials(conversation.other_user.name)}
                                                                </AvatarFallback>
                                                            </Avatar>
                                                            <div className="min-w-0 flex-1">
                                                                <div className="flex items-start justify-between gap-2">
                                                                    <div className="min-w-0 flex-1">
                                                                        <div className="flex items-center gap-2">
                                                                            <p className="truncate font-semibold text-gray-900">
                                                                                {conversation.other_user.name}
                                                                            </p>
                                                                            {conversation.unread_count > 0 && (
                                                                                <span className="flex-shrink-0 rounded-full bg-primary px-2 py-0.5 text-xs text-white">
                                                                                    {conversation.unread_count}
                                                                                </span>
                                                                            )}
                                                                        </div>
                                                                        {conversation.product && (
                                                                            <p className="mt-0.5 truncate text-xs text-gray-500">
                                                                                Re: {conversation.product.name}
                                                                            </p>
                                                                        )}
                                                                        {conversation.last_message && (
                                                                            <p className="mt-1 truncate text-sm text-gray-600">
                                                                                {conversation.last_message.message}
                                                                            </p>
                                                                        )}
                                                                    </div>
                                                                    {conversation.last_message && (
                                                                        <span className="flex-shrink-0 text-xs text-gray-400">
                                                                            {formatDistanceToNow(new Date(conversation.last_message.created_at), {
                                                                                addSuffix: true,
                                                                            })}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        );
                                    })()
                                )}
                            </div>
                        </div>
                    </div>,
                    document.body,
                )}
        </>
    );
}
