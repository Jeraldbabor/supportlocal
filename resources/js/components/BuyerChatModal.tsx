import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { formatDistanceToNow } from 'date-fns';
import { Image, Minimize2, Send, X } from 'lucide-react';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

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

interface BuyerChatModalProps {
    conversationId: number;
    currentUserId: number;
    onClose: () => void;
    isMinimized: boolean;
    onToggleMinimize: () => void;
}

export default function BuyerChatModal({ conversationId, currentUserId, onClose, isMinimized, onToggleMinimize }: BuyerChatModalProps) {
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
            // Scroll to bottom after loading messages
            setTimeout(() => scrollToBottom(), 100);
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

    if (!conversation) {
        return null;
    }

    const modalContent = (
        <div
            className="fixed right-4 bottom-4 z-[9999] flex max-h-[420px] w-[380px] max-w-[calc(100vw-2rem)] flex-col rounded-lg border border-gray-300 bg-white shadow-2xl"
            data-chat-container
        >
            {/* Chat Header */}
            <div
                className="flex items-center justify-between rounded-t-lg bg-gradient-to-r from-orange-500 to-orange-600 px-4 py-3 text-white shadow-md"
                style={{ background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)', backgroundColor: '#f97316', color: '#ffffff' }}
            >
                <div className="flex min-w-0 flex-1 items-center gap-3">
                    <Avatar className="h-10 w-10 border-2 border-white">
                        <AvatarImage src={conversation.other_user.avatar_url} />
                        <AvatarFallback className="bg-white font-semibold text-orange-500">
                            {getInitials(conversation.other_user.name)}
                        </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                        <h3 className="truncate text-sm leading-tight font-semibold">{conversation.other_user.name}</h3>
                        {conversation.product && <p className="truncate text-xs opacity-90">{conversation.product.name}</p>}
                    </div>
                </div>
                <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" onClick={onToggleMinimize} className="h-8 w-8 text-white hover:bg-white/20">
                        <Minimize2 className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8 text-white hover:bg-white/20">
                        <X className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            {/* Chat Body - Only show when not minimized */}
            {!isMinimized && (
                <>
                    {/* Messages */}
                    <div
                        className="custom-scrollbar min-h-0 flex-1 space-y-3 overflow-y-auto scroll-smooth bg-gradient-to-b from-gray-50 to-white p-4"
                        data-chat-container
                    >
                        {messages.map((message) => {
                            const isOwnMessage = message.sender_id === currentUserId;

                            return (
                                <div key={message.id} className={`flex gap-2 ${isOwnMessage ? 'flex-row-reverse' : 'flex-row'}`}>
                                    <Avatar className="h-7 w-7">
                                        <AvatarImage src={message.sender.avatar_url} />
                                        <AvatarFallback
                                            className={`text-xs ${isOwnMessage ? 'bg-orange-100 text-orange-700' : 'bg-gray-200 text-gray-600'}`}
                                        >
                                            {getInitials(message.sender.name)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className={`flex flex-col ${isOwnMessage ? 'items-end' : 'items-start'} max-w-[70%]`}>
                                        <div
                                            className={`rounded-2xl px-4 py-2.5 ${
                                                isOwnMessage
                                                    ? 'chat-message-sent rounded-br-sm bg-orange-500 text-white'
                                                    : 'chat-message-received rounded-bl-sm border border-gray-300 bg-white'
                                            }`}
                                            style={
                                                isOwnMessage
                                                    ? {
                                                          background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
                                                          backgroundColor: '#f97316',
                                                          color: '#ffffff',
                                                          WebkitTextFillColor: '#ffffff',
                                                      }
                                                    : {}
                                            }
                                        >
                                            {message.image_url && (
                                                <div className="mb-2">
                                                    <a href={message.image_url} target="_blank" rel="noopener noreferrer" className="block">
                                                        <img
                                                            src={message.image_url}
                                                            alt="Uploaded image"
                                                            className="max-h-48 max-w-xs cursor-pointer rounded-lg object-cover transition-opacity hover:opacity-90"
                                                        />
                                                    </a>
                                                </div>
                                            )}
                                            {message.message && (
                                                <p
                                                    className={`text-sm break-words ${isOwnMessage ? 'text-white' : 'text-gray-900'}`}
                                                    style={isOwnMessage ? { color: '#ffffff', WebkitTextFillColor: '#ffffff' } : {}}
                                                >
                                                    {message.message}
                                                </p>
                                            )}
                                        </div>
                                        <span className="mt-1.5 px-2 text-[11px] text-gray-500">
                                            {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                        {isOtherUserTyping && (
                            <div className="flex gap-2">
                                <Avatar className="h-7 w-7">
                                    <AvatarImage src={conversation.other_user.avatar_url} />
                                    <AvatarFallback className="bg-gray-200 text-xs text-gray-600">
                                        {getInitials(conversation.other_user.name)}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="chat-message-received flex items-center rounded-2xl rounded-bl-sm border border-gray-300 bg-white px-3 py-2">
                                    <div className="flex gap-1">
                                        <span
                                            className="inline-block h-1.5 w-1.5 animate-bounce rounded-full bg-gray-400"
                                            style={{ animationDelay: '0ms' }}
                                        ></span>
                                        <span
                                            className="inline-block h-1.5 w-1.5 animate-bounce rounded-full bg-gray-400"
                                            style={{ animationDelay: '150ms' }}
                                        ></span>
                                        <span
                                            className="inline-block h-1.5 w-1.5 animate-bounce rounded-full bg-gray-400"
                                            style={{ animationDelay: '300ms' }}
                                        ></span>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Message Input */}
                    <form onSubmit={sendMessage} className="rounded-b-lg border-t border-gray-300 bg-white p-3">
                        {/* Image Preview */}
                        {imagePreview && (
                            <div className="relative mb-2 inline-block">
                                <div className="relative overflow-hidden rounded-lg border-2 border-primary/20 dark:border-orange-800/30">
                                    <img src={imagePreview} alt="Preview" className="max-h-24 max-w-full object-cover" />
                                    <button
                                        type="button"
                                        onClick={clearImageSelection}
                                        className="absolute top-2 right-2 rounded-full bg-red-500 p-1.5 text-white shadow-lg transition-colors hover:bg-red-600"
                                    >
                                        <X className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        )}

                        <div className="flex gap-2">
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/jpeg,image/png,image/jpg,image/gif"
                                onChange={handleImageSelect}
                                className="hidden"
                            />
                            <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                onClick={() => fileInputRef.current?.click()}
                                disabled={isLoading}
                                className="h-10 w-10 flex-shrink-0 rounded-full border border-gray-300 bg-white hover:bg-gray-50"
                                title="Upload image"
                            >
                                <Image className="h-4 w-4" />
                            </Button>
                            <Input
                                value={newMessage}
                                onChange={handleInputChange}
                                placeholder="Type a message..."
                                disabled={isLoading}
                                className="flex-1 rounded-full border-2 border-gray-300 bg-gray-50 text-gray-900 placeholder-gray-400 focus:border-orange-400 focus:bg-white focus:ring-2 focus:ring-orange-200 focus:outline-none"
                            />
                            <Button
                                type="submit"
                                size="icon"
                                disabled={isLoading || (!newMessage.trim() && !selectedImage)}
                                className="h-10 w-10 flex-shrink-0 rounded-full bg-orange-500 hover:bg-orange-600"
                            >
                                <Send className="h-4 w-4" />
                            </Button>
                        </div>
                    </form>
                </>
            )}
        </div>
    );

    // Render using portal to ensure proper positioning
    return createPortal(modalContent, document.body);
}
