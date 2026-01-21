import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { router } from '@inertiajs/react';
import { formatDistanceToNow } from 'date-fns';
import { Image, Send, Trash2, X } from 'lucide-react';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import Swal from 'sweetalert2';

interface Message {
    id: number;
    conversation_id: number;
    sender_id: number;
    message: string;
    image?: string;
    image_url?: string;
    is_read: boolean;
    created_at: string;
    sender: {
        id: number;
        name: string;
        profile_picture?: string;
        avatar_url?: string;
    };
}

interface Conversation {
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
}

interface ChatWindowProps {
    conversationId: number;
    currentUserId: number;
}

export default function ChatWindow({ conversationId, currentUserId }: ChatWindowProps) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [selectedImage, setSelectedImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [conversation, setConversation] = useState<Conversation | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isOtherUserTyping, setIsOtherUserTyping] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const markAsRead = useCallback(async () => {
        try {
            await fetch(`/chat/conversation/${conversationId}/read`, {
                method: 'POST',
                headers: {
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
            });
        } catch (error) {
            console.error('Failed to mark as read:', error);
        }
    }, [conversationId]);

    const loadMessages = useCallback(async () => {
        try {
            const response = await fetch(`/chat/conversation/${conversationId}/messages`);
            const data = await response.json();
            setMessages(data.messages);
            setConversation(data.conversation);
        } catch (error) {
            console.error('Failed to load messages:', error);
        }
    }, [conversationId]);

    const subscribeToChannel = useCallback(() => {
        if (!window.Echo) return;

        window.Echo.private(`conversation.${conversationId}`)
            .listen('.message.sent', (e: { message: Message }) => {
                setMessages((prev) => {
                    const exists = prev.some((msg) => msg.id === e.message.id);
                    return exists ? prev : [...prev, e.message];
                });

                if (e.message.sender_id !== currentUserId) {
                    markAsRead();
                }
            })
            .listen('.user.typing', (e: { userId: number; userName: string; isTyping: boolean }) => {
                if (e.userId !== currentUserId) {
                    setIsOtherUserTyping(e.isTyping);
                }
            });
    }, [conversationId, currentUserId, markAsRead]);

    useEffect(() => {
        if (conversationId) {
            loadMessages();
            subscribeToChannel();
        }

        return () => {
            if (conversationId && window.Echo) {
                window.Echo.leave(`conversation.${conversationId}`);
            }
        };
    }, [conversationId, loadMessages, subscribeToChannel]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                alert('Image size must be less than 5MB');
                return;
            }

            const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif'];
            if (!validTypes.includes(file.type)) {
                alert('Only JPEG, PNG, JPG, and GIF images are allowed');
                return;
            }

            setSelectedImage(file);

            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const clearImageSelection = () => {
        setSelectedImage(null);
        setImagePreview(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const sendMessage = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!newMessage.trim() && !selectedImage) return;

        setIsLoading(true);
        try {
            const formData = new FormData();
            formData.append('message', newMessage);
            if (selectedImage) {
                formData.append('image', selectedImage);
            }

            const response = await fetch(`/chat/conversation/${conversationId}/message`, {
                method: 'POST',
                headers: {
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: formData,
            });

            if (response.ok) {
                const data = await response.json();
                setMessages((prev) => [...prev, data.message]);
                setNewMessage('');
                clearImageSelection();
            }
        } catch (error) {
            console.error('Failed to send message:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleTyping = () => {
        fetch(`/chat/conversation/${conversationId}/typing/start`, {
            method: 'POST',
            headers: {
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
            },
        });

        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }

        typingTimeoutRef.current = setTimeout(() => {
            fetch(`/chat/conversation/${conversationId}/typing/stop`, {
                method: 'POST',
                headers: {
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
            });
        }, 2000);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setNewMessage(e.target.value);
        handleTyping();
    };

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    const handleDeleteConversation = async () => {
        const result = await Swal.fire({
            title: 'Delete Conversation?',
            text: 'This will permanently delete all messages in this conversation.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Yes, delete it',
            cancelButtonText: 'Cancel',
        });

        if (result.isConfirmed) {
            router.delete(`/chat/conversations/${conversationId}`, {
                onSuccess: () => {
                    Swal.fire({
                        title: 'Deleted!',
                        text: 'Conversation has been deleted.',
                        icon: 'success',
                        timer: 2000,
                        showConfirmButton: false,
                    });
                },
                onError: () => {
                    Swal.fire({
                        title: 'Error!',
                        text: 'Failed to delete conversation.',
                        icon: 'error',
                    });
                },
            });
        }
    };

    if (!conversation) {
        return (
            <div className="flex h-full items-center justify-center bg-gray-50">
                <div className="flex flex-col items-center gap-3">
                    <div className="h-8 w-8 animate-spin rounded-full border-2 border-orange-500 border-t-transparent"></div>
                    <p className="font-medium text-gray-500">Loading conversation...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-full flex-col overflow-hidden bg-white">
            {/* Chat Header */}
            <div className="flex-shrink-0 border-b border-gray-200 bg-white px-4 py-3">
                <div className="flex items-center justify-between gap-3">
                    <div className="flex min-w-0 flex-1 items-center gap-3">
                        <div className="relative flex-shrink-0">
                            <Avatar className="h-10 w-10 ring-2 ring-orange-100 sm:h-11 sm:w-11">
                                <AvatarImage src={conversation.other_user.avatar_url} />
                                <AvatarFallback className="bg-orange-100 text-sm font-semibold text-orange-700">
                                    {getInitials(conversation.other_user.name)}
                                </AvatarFallback>
                            </Avatar>
                            <span className="absolute right-0 bottom-0 h-3 w-3 rounded-full border-2 border-white bg-green-500"></span>
                        </div>
                        <div className="min-w-0 flex-1">
                            <h3 className="truncate text-sm font-semibold text-gray-900 sm:text-base">
                                {conversation.other_user.name}
                            </h3>
                            {conversation.product ? (
                                <p className="truncate text-xs text-gray-500">
                                    Re: {conversation.product.name}
                                </p>
                            ) : (
                                <p className="text-xs font-medium text-green-600">Online</p>
                            )}
                        </div>
                    </div>
                    <button
                        onClick={handleDeleteConversation}
                        className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-red-50 hover:text-red-500"
                        title="Delete conversation"
                    >
                        <Trash2 className="h-5 w-5" />
                    </button>
                </div>
            </div>

            {/* Messages */}
            <div className="min-h-0 flex-1 overflow-y-auto bg-gray-50 px-3 py-4 sm:px-4 sm:py-6">
                <div className="mx-auto max-w-2xl space-y-4">
                    {messages.length === 0 && (
                        <div className="py-12 text-center">
                            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
                                <Send className="h-8 w-8 text-gray-400" />
                            </div>
                            <p className="text-gray-500">No messages yet. Start the conversation!</p>
                        </div>
                    )}
                    {messages.map((message, index) => {
                        const isOwnMessage = message.sender_id === currentUserId;
                        const showAvatar = index === 0 || messages[index - 1]?.sender_id !== message.sender_id;

                        return (
                            <div key={message.id} className={`flex gap-2 sm:gap-3 ${isOwnMessage ? 'flex-row-reverse' : 'flex-row'}`}>
                                {showAvatar ? (
                                    <Avatar className="h-8 w-8 flex-shrink-0 sm:h-9 sm:w-9">
                                        <AvatarImage src={message.sender.avatar_url} />
                                        <AvatarFallback
                                            className={`text-xs font-medium ${isOwnMessage ? 'bg-orange-100 text-orange-700' : 'bg-gray-200 text-gray-600'}`}
                                        >
                                            {getInitials(message.sender.name)}
                                        </AvatarFallback>
                                    </Avatar>
                                ) : (
                                    <div className="w-8 flex-shrink-0 sm:w-9"></div>
                                )}
                                <div className={`flex max-w-[75%] flex-col sm:max-w-[70%] ${isOwnMessage ? 'items-end' : 'items-start'}`}>
                                    <div
                                        className={`rounded-2xl px-3 py-2 shadow-sm sm:px-4 sm:py-2.5 ${
                                            isOwnMessage
                                                ? 'rounded-tr-md bg-orange-500 text-white'
                                                : 'rounded-tl-md border border-gray-200 bg-white text-gray-900'
                                        }`}
                                    >
                                        {message.image_url && (
                                            <div className="mb-2">
                                                <a href={message.image_url} target="_blank" rel="noopener noreferrer" className="block">
                                                    <img
                                                        src={message.image_url}
                                                        alt="Uploaded image"
                                                        className="max-h-48 max-w-full cursor-pointer rounded-lg object-cover transition-opacity hover:opacity-90 sm:max-h-64"
                                                    />
                                                </a>
                                            </div>
                                        )}
                                        {message.message && (
                                            <p className="text-sm leading-relaxed break-words whitespace-pre-wrap">{message.message}</p>
                                        )}
                                    </div>
                                    <span className={`mt-1 px-1 text-[10px] text-gray-400 sm:text-[11px] ${isOwnMessage ? 'text-right' : 'text-left'}`}>
                                        {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                    {isOtherUserTyping && (
                        <div className="flex gap-2 sm:gap-3">
                            <Avatar className="h-8 w-8 sm:h-9 sm:w-9">
                                <AvatarImage src={conversation.other_user.avatar_url} />
                                <AvatarFallback className="bg-gray-200 text-xs text-gray-600">
                                    {getInitials(conversation.other_user.name)}
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex items-center rounded-2xl rounded-tl-md border border-gray-200 bg-white px-4 py-2.5 shadow-sm">
                                <div className="flex gap-1">
                                    <span className="inline-block h-2 w-2 animate-bounce rounded-full bg-gray-400" style={{ animationDelay: '0ms' }}></span>
                                    <span className="inline-block h-2 w-2 animate-bounce rounded-full bg-gray-400" style={{ animationDelay: '150ms' }}></span>
                                    <span className="inline-block h-2 w-2 animate-bounce rounded-full bg-gray-400" style={{ animationDelay: '300ms' }}></span>
                                </div>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>
            </div>

            {/* Message Input */}
            <form onSubmit={sendMessage} className="flex-shrink-0 border-t border-gray-200 bg-white p-3 sm:p-4">
                <div className="mx-auto max-w-2xl">
                    {/* Image Preview */}
                    {imagePreview && (
                        <div className="relative mb-3 inline-block">
                            <div className="relative overflow-hidden rounded-lg border-2 border-orange-200">
                                <img src={imagePreview} alt="Preview" className="max-h-24 max-w-xs object-cover sm:max-h-32" />
                                <button
                                    type="button"
                                    onClick={clearImageSelection}
                                    className="absolute top-1 right-1 rounded-full bg-red-500 p-1 text-white shadow-lg transition-colors hover:bg-red-600 sm:top-2 sm:right-2 sm:p-1.5"
                                >
                                    <X className="h-3 w-3 sm:h-4 sm:w-4" />
                                </button>
                            </div>
                        </div>
                    )}

                    <div className="flex items-center gap-2 sm:gap-3">
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/jpeg,image/png,image/jpg,image/gif"
                            onChange={handleImageSelect}
                            className="hidden"
                        />
                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={isLoading}
                            className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-500 transition-colors hover:bg-gray-50 hover:text-gray-700 disabled:opacity-50 sm:h-11 sm:w-11"
                            title="Upload image"
                        >
                            <Image className="h-5 w-5" />
                        </button>
                        <input
                            type="text"
                            value={newMessage}
                            onChange={handleInputChange}
                            placeholder="Type your message..."
                            disabled={isLoading}
                            className="min-w-0 flex-1 rounded-full border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 transition-colors focus:border-orange-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-100 sm:px-5 sm:py-3"
                        />
                        <button
                            type="submit"
                            disabled={isLoading || (!newMessage.trim() && !selectedImage)}
                            className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-orange-500 text-white shadow-md transition-all hover:bg-orange-600 hover:shadow-lg disabled:opacity-50 sm:h-11 sm:w-11"
                        >
                            <Send className="h-5 w-5" />
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
}
