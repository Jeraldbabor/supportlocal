import React, { useState, useEffect, useRef, useCallback } from 'react';
import { MessageSquare, Trash2, X, Search } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { formatDistanceToNow } from 'date-fns';
import BuyerChatModal from '@/components/BuyerChatModal';
import Swal from 'sweetalert2';
import Echo from '@/lib/echo';
import { createPortal } from 'react-dom';

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

  const totalUnread = conversations.reduce((sum, conv) => sum + conv.unread_count, 0);

  // Request notification permission on mount
  useEffect(() => {
    if ('Notification' in window) {
      if (Notification.permission === 'granted') {
        setHasNotificationPermission(true);
      } else if (Notification.permission !== 'denied') {
        Notification.requestPermission().then(permission => {
          if (permission === 'granted') {
            setHasNotificationPermission(true);
          }
        });
      }
    }

    // Create audio element for notification sound
    audioRef.current = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjWH0fPTgjMGHm7A7+OZTA4NVqzn77BdGAw+ltryy3cmBSl+zPLaizsIGGS56+ihUBELTKXi8bllHAU5j9X00H8yBih4yPDajzsKF2O46+mjUhILTKTi8r1hHAU4jtT0z4ExBSh4yPDajzsKGGS56+ihUBILTKPi8r1hHAU4jtT0z4ExBSh4yO/ajzsKGGS56+mjUhILTKTi8r1hHAU4jtT0z4ExBSh4yPDajzsKGGS56+mjUhILTKTi8r1hHAU4jtT0z4ExBSh4yPDajzsKGGS56+mjUhILTKTi8r1hHAU4jtT0z4ExBSh4yPDajzsKGGS56+mjUhILTKTi8r1hHAU4jtT0z4ExBSh4yPDajzsKGGS56+mjUhILTKTi8r1hHAU4jtT0z4ExBSh4yPDajzsKGGS56+mjUhILTKTi8r1hHAU4jtT0z4ExBSh4yPDajzsKGGS56+mjUhILTKTi8r1hHAU4jtT0z4ExBSh4yPDajzsKGGS56+mjUhILTKTi8r1hHAU4jtT0z4ExBSh4yPDajzsKGGS56+mjUhILTKTi8r1hHAU4jtT0z4ExBSh4yPDajzsKGGS56+mjUhILTKTi8r1hHAU4jtT0z4ExBSh4yPDajzsKGGS56+mjUhILTKTi8r1hHAU4jtT0z4ExBSh4yPDajzsKGGS56+mjUhILTKTi8r1hHAU4jtT0z4ExBSh4yPDajzsKGGS56+mjUhILTKTi8r1hHAU4jtT0z4ExBSh4yPDajzsKGGS56+mjUhILTKTi8r1hHAU4jtT0z4ExBSh4yPDajzsKGGS56+mjUhIL');
  }, []);

  const scrollToTop = useCallback(() => {
    if (conversationsListRef.current) {
      conversationsListRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, []);

  const loadConversations = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/chat/conversations');
      if (response.ok) {
        const data = await response.json();
        console.log('Loaded conversations:', data);
        setConversations(data || []);
        // Scroll to top when conversations are loaded
        setTimeout(() => scrollToTop(), 100);
      } else {
        console.error('Failed to load conversations:', response.status);
      }
    } catch (error) {
      console.error('Failed to load conversations:', error);
    } finally {
      setIsLoading(false);
    }
  }, [scrollToTop]);

  const showNewMessageNotification = useCallback((data: { message: { conversation_id: number; message: string; id: number }; sender: { name: string; avatar_url?: string } }) => {
    const { message, sender } = data;
    
    // Play notification sound
    if (audioRef.current) {
      audioRef.current.play().catch(err => console.log('Audio play failed:', err));
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
  }, [hasNotificationPermission]);

  // Listen for new messages across all conversations
  useEffect(() => {
    if (!currentUserId) return;

    console.log('Setting up message listener for user:', currentUserId);

    // Subscribe to user's private channel for new messages
    const channel = Echo.private(`App.Models.User.${currentUserId}`);
    
    channel.listen('MessageSent', (data: { message: { conversation_id: number; message: string; id: number }; sender: { name: string; avatar_url?: string } }) => {
      console.log('New message received:', data);
      
      // Only show notification if not viewing this conversation
      if (!showChatModal || selectedConversationId !== data.message.conversation_id) {
        showNewMessageNotification(data);
      }
      
      // Update conversations list
      console.log('Reloading conversations...');
      loadConversations();
    });

    return () => {
      channel.stopListening('MessageSent');
    };
  }, [currentUserId, showChatModal, selectedConversationId, loadConversations, showNewMessageNotification]);

  // Load conversations on mount
  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  useEffect(() => {
    if (isOpen) {
      loadConversations();
    }
  }, [isOpen, loadConversations]);

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
      text: "This will remove the conversation from your list.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, delete it',
      cancelButtonText: 'Cancel'
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
          setConversations(prev => prev.filter(c => c.id !== convId));
          
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
            showConfirmButton: false
          });
          
          // Reload conversations to get updated list
          loadConversations();
        }
      } catch (error) {
        console.error('Failed to delete conversation:', error);
        await Swal.fire({
          title: 'Error!',
          text: 'Failed to delete conversation.',
          icon: 'error'
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
      <div className="p-2.5 sm:p-3 border-b border-gray-100 bg-gray-50 rounded-t-lg">
        <h3 className="font-semibold text-sm sm:text-base text-gray-900 flex items-center gap-1.5 sm:gap-2">
          <MessageSquare className="h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0" />
          <span>Messages</span>
        </h3>
      </div>

      <div ref={conversationsListRef} className="max-h-[60vh] sm:max-h-96 overflow-y-auto scroll-smooth">
        {isLoading ? (
          <div className="p-6 sm:p-8 text-center text-gray-500">
            <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-xs sm:text-sm">Loading...</p>
          </div>
        ) : conversations.length === 0 ? (
          <div className="p-6 sm:p-8 text-center text-gray-500">
            <MessageSquare className="h-10 w-10 sm:h-12 sm:w-12 mx-auto mb-2 text-gray-300" />
            <p className="text-xs sm:text-sm">No messages yet</p>
            <p className="text-[10px] sm:text-xs text-gray-400 mt-1">Start chatting with sellers!</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {conversations.map((conversation) => (
              <div
                key={conversation.id}
                className="p-2.5 sm:p-3 hover:bg-gray-50 transition-colors flex items-start gap-2 sm:gap-3"
              >
                <button
                  onClick={() => handleConversationClick(conversation.id)}
                  className="flex items-start gap-2 sm:gap-3 flex-1 min-w-0 text-left"
                >
                  <Avatar className="h-9 w-9 sm:h-10 sm:w-10 flex-shrink-0">
                    <AvatarImage src={conversation.other_user.avatar_url} />
                    <AvatarFallback className="bg-primary/10 text-primary text-[10px] sm:text-xs">
                      {getInitials(conversation.other_user.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-1.5 sm:gap-2">
                      <p className="font-semibold text-xs sm:text-sm text-gray-900 truncate">
                        {conversation.other_user.name}
                      </p>
                      {conversation.unread_count > 0 && (
                        <span className="bg-primary text-white text-[10px] sm:text-xs rounded-full px-1.5 sm:px-2 py-0.5 flex-shrink-0">
                          {conversation.unread_count}
                        </span>
                      )}
                    </div>
                    {conversation.product && (
                      <p className="text-[10px] sm:text-xs text-gray-500 truncate mt-0.5">
                        {conversation.product.name}
                      </p>
                    )}
                    {conversation.last_message && (
                      <p className="text-[10px] sm:text-xs text-gray-600 truncate mt-1 line-clamp-1">
                        {conversation.last_message.message}
                      </p>
                    )}
                    {conversation.last_message && (
                      <p className="text-[9px] sm:text-xs text-gray-400 mt-0.5 sm:mt-1">
                        {formatDistanceToNow(new Date(conversation.last_message.created_at), { addSuffix: true })}
                      </p>
                    )}
                  </div>
                </button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => handleDeleteConversation(conversation.id, e)}
                  className="h-7 w-7 sm:h-8 sm:w-8 flex-shrink-0 text-gray-400 hover:text-destructive"
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
        <div className="p-2 sm:p-2.5 border-t border-gray-100 bg-gray-50 rounded-b-lg">
          <button
            onClick={() => {
              setShowAllMessagesModal(true);
              setIsOpen(false);
            }}
            className="block w-full text-center text-xs sm:text-sm text-primary hover:text-primary/80 font-medium py-1.5 sm:py-2 rounded hover:bg-white transition-colors"
          >
            View all messages
          </button>
        </div>
      )}
    </>
  );

  return (
    <>
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="group relative rounded-lg sm:rounded-xl p-1.5 sm:p-2 text-gray-600 transition-all duration-300 hover:bg-primary/5 hover:text-primary hover:shadow-sm focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 focus:outline-none"
          aria-label={`Messages ${totalUnread > 0 ? `(${totalUnread} unread)` : ''}`}
        >
          <MessageSquare className="h-4 w-4 sm:h-5 sm:w-5 transition-transform duration-300 group-hover:scale-110" />
          {totalUnread > 0 && (
            <span className="absolute -top-0.5 -right-0.5 sm:-top-1 sm:-right-1 flex h-4 w-4 sm:h-5 sm:w-5 animate-pulse items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-blue-600 text-[10px] sm:text-xs font-medium text-white shadow-sm">
              {totalUnread > 9 ? '9+' : totalUnread}
            </span>
          )}
          <span className="absolute inset-0 rounded-lg sm:rounded-xl opacity-0 ring-primary/50 transition-all duration-300 group-hover:opacity-100 group-hover:ring-2 group-hover:ring-offset-2"></span>
        </button>

        {/* Dropdown */}
        {isOpen && (
          <>
            {/* Mobile backdrop */}
            <div 
              className="fixed inset-0 bg-black/20 z-[9998] sm:hidden" 
              onClick={() => setIsOpen(false)}
            />
            {/* Dropdown - Fixed on mobile, absolute on desktop */}
            <div className="fixed sm:absolute right-2 sm:right-0 top-[4.5rem] sm:top-auto sm:mt-2 w-[calc(100vw-1rem)] sm:w-80 max-w-sm rounded-lg bg-white shadow-xl border border-gray-200 z-[9999] sm:z-50">
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
      {showAllMessagesModal && createPortal(
        <div className="fixed inset-0 z-[10000] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl h-[90vh] max-h-[900px] flex flex-col overflow-hidden">
            {/* Header */}
            <div className="border-b border-gray-200 p-6 flex-shrink-0 bg-gradient-to-r from-primary/5 to-primary/10">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                    <MessageSquare className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Messages</h2>
                    {conversations.length > 0 && (
                      <p className="text-sm text-gray-600 mt-1">
                        {conversations.length} conversation{conversations.length !== 1 ? 's' : ''}
                      </p>
                    )}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowAllMessagesModal(false)}
                  className="h-10 w-10 rounded-full hover:bg-gray-100"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
              
              {/* Search */}
              {conversations.length > 0 && (
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <Input
                    placeholder="Search conversations..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-white border-gray-300 focus:border-primary focus:ring-primary"
                  />
                </div>
              )}
            </div>
            
            {/* Conversations List */}
            <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
              {isLoading ? (
                <div className="flex h-full items-center justify-center">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-4 text-sm text-gray-500">Loading conversations...</p>
                  </div>
                </div>
              ) : (() => {
                const filteredConversations = conversations.filter((conv) =>
                  conv.other_user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  conv.product?.name.toLowerCase().includes(searchQuery.toLowerCase())
                );

                return filteredConversations.length === 0 ? (
                  <div className="flex h-full items-center justify-center">
                    <div className="text-center max-w-md">
                      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
                        <MessageSquare className="h-8 w-8 text-gray-400" />
                      </div>
                      <p className="font-medium text-gray-900">
                        {searchQuery ? 'No results found' : 'No conversations yet'}
                      </p>
                      <p className="mt-2 text-sm text-gray-500">
                        {searchQuery ? 'Try a different search term' : 'Start chatting with sellers or buyers to see your conversations here'}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {filteredConversations.map((conversation) => (
                      <div
                        key={conversation.id}
                        className="bg-white rounded-lg border border-gray-200 hover:border-primary/50 hover:shadow-md transition-all p-4 cursor-pointer"
                        onClick={() => handleConversationClick(conversation.id)}
                      >
                        <div className="flex items-start gap-3">
                          <Avatar className="h-12 w-12 flex-shrink-0">
                            <AvatarImage src={conversation.other_user.avatar_url} />
                            <AvatarFallback className="bg-primary/10 text-primary text-sm font-semibold">
                              {getInitials(conversation.other_user.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <p className="font-semibold text-gray-900 truncate">
                                    {conversation.other_user.name}
                                  </p>
                                  {conversation.unread_count > 0 && (
                                    <span className="bg-primary text-white text-xs rounded-full px-2 py-0.5 flex-shrink-0">
                                      {conversation.unread_count}
                                    </span>
                                  )}
                                </div>
                                {conversation.product && (
                                  <p className="text-xs text-gray-500 truncate mt-0.5">
                                    Re: {conversation.product.name}
                                  </p>
                                )}
                                {conversation.last_message && (
                                  <p className="text-sm text-gray-600 truncate mt-1">
                                    {conversation.last_message.message}
                                  </p>
                                )}
                              </div>
                              {conversation.last_message && (
                                <span className="text-xs text-gray-400 flex-shrink-0">
                                  {formatDistanceToNow(new Date(conversation.last_message.created_at), { addSuffix: true })}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
