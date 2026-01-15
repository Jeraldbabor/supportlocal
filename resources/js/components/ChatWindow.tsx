import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
                // Only add the message if it doesn't already exist (to prevent duplicates from own messages)
                setMessages((prev) => {
                    const exists = prev.some((msg) => msg.id === e.message.id);
                    return exists ? prev : [...prev, e.message];
                });

                // Mark as read if the message is not from current user
                if (e.message.sender_id !== currentUserId) {
                    markAsRead();
                }
            })
            .listen('.user.typing', (e: { userId: number; userName: string; isTyping: boolean }) => {
                // Only show typing indicator for other users
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
            // Validate file size (5MB max)
            if (file.size > 5 * 1024 * 1024) {
                alert('Image size must be less than 5MB');
                return;
            }

            // Validate file type
            const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif'];
            if (!validTypes.includes(file.type)) {
                alert('Only JPEG, PNG, JPG, and GIF images are allowed');
                return;
            }

            setSelectedImage(file);

            // Create preview
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
        // Send typing start event
        fetch(`/chat/conversation/${conversationId}/typing/start`, {
            method: 'POST',
            headers: {
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
            },
        });

        // Clear existing timeout
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }

        // Set timeout to send stop typing event after 2 seconds of inactivity
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
            <div className="flex h-full items-center justify-center bg-gradient-to-br from-muted/30 to-muted/10">
                <div className="flex flex-col items-center gap-3">
                    <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                    <p className="font-medium text-muted-foreground">Loading conversation...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-full flex-col overflow-hidden">
            {/* Chat Header */}
            <div className="flex-shrink-0 border-b border-border/50 bg-background/95 backdrop-blur-sm">
                <div className="flex items-center justify-between gap-4 p-4">
                    <div className="flex min-w-0 flex-1 items-center gap-4">
                        <div className="relative">
                            <Avatar className="h-12 w-12 ring-2 ring-primary/20 ring-offset-2 ring-offset-background">
                                <AvatarImage src={conversation.other_user.avatar_url} />
                                <AvatarFallback className="bg-primary/10 text-lg font-semibold text-primary">
                                    {getInitials(conversation.other_user.name)}
                                </AvatarFallback>
                            </Avatar>
                            <span className="absolute right-0 bottom-0 h-3 w-3 rounded-full bg-green-500 ring-2 ring-background"></span>
                        </div>
                        <div className="min-w-0 flex-1">
                            <h3 className="truncate text-lg leading-tight font-semibold text-foreground">{conversation.other_user.name}</h3>
                            {conversation.product ? (
                                <p className="mt-0.5 flex items-center gap-1 truncate text-sm text-muted-foreground">
                                    <span className="inline-block h-1.5 w-1.5 rounded-full bg-primary/50"></span>
                                    {conversation.product.name}
                                </p>
                            ) : (
                                <p className="mt-0.5 text-sm font-medium text-green-600">Online</p>
                            )}
                        </div>
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleDeleteConversation}
                        className="h-10 w-10 flex-shrink-0 rounded-full text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                        title="Delete conversation"
                    >
                        <Trash2 className="h-5 w-5" />
                    </Button>
                </div>
            </div>

            {/* Messages */}
            <div className="min-h-0 flex-1 overflow-y-auto bg-gradient-to-b from-muted/20 to-background p-6">
                <div className="mx-auto max-w-4xl space-y-6">
                    {messages.length === 0 && (
                        <div className="py-12 text-center">
                            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                                <Send className="h-8 w-8 text-primary" />
                            </div>
                            <p className="text-muted-foreground">No messages yet. Start the conversation!</p>
                        </div>
                    )}
                    {messages.map((message, index) => {
                        const isOwnMessage = message.sender_id === currentUserId;
                        const showAvatar = index === 0 || messages[index - 1]?.sender_id !== message.sender_id;

                        return (
                            <div key={message.id} className={`flex gap-3 ${isOwnMessage ? 'flex-row-reverse' : 'flex-row'}`}>
                                {showAvatar ? (
                                    <Avatar className="h-9 w-9 flex-shrink-0 ring-1 ring-border/50">
                                        <AvatarImage src={message.sender.avatar_url} />
                                        <AvatarFallback
                                            className={`text-xs font-medium ${isOwnMessage ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}
                                        >
                                            {getInitials(message.sender.name)}
                                        </AvatarFallback>
                                    </Avatar>
                                ) : (
                                    <div className="w-9 flex-shrink-0"></div>
                                )}
                                <div className={`flex max-w-[70%] flex-col ${isOwnMessage ? 'items-end' : 'items-start'}`}>
                                    <div
                                        className={`rounded-2xl px-4 py-3 shadow-sm ${
                                            isOwnMessage
                                                ? 'rounded-tr-md bg-primary text-primary-foreground'
                                                : 'rounded-tl-md border border-border/50 bg-card text-card-foreground'
                                        }`}
                                    >
                                        {message.image && (
                                            <div className="mb-2">
                                                <a href={`/storage/${message.image}`} target="_blank" rel="noopener noreferrer" className="block">
                                                    <img
                                                        src={`/storage/${message.image}`}
                                                        alt="Uploaded image"
                                                        className="max-h-64 max-w-xs cursor-pointer rounded-lg object-cover transition-opacity hover:opacity-90"
                                                    />
                                                </a>
                                            </div>
                                        )}
                                        {message.message && (
                                            <p className="text-sm leading-relaxed break-words whitespace-pre-wrap">{message.message}</p>
                                        )}
                                    </div>
                                    <span className={`mt-1.5 px-1 text-[11px] text-muted-foreground ${isOwnMessage ? 'text-right' : 'text-left'}`}>
                                        {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                    {isOtherUserTyping && (
                        <div className="flex gap-3">
                            <Avatar className="h-9 w-9 ring-1 ring-border/50">
                                <AvatarImage src={conversation.other_user.avatar_url} />
                                <AvatarFallback className="bg-muted text-xs text-muted-foreground">
                                    {getInitials(conversation.other_user.name)}
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex items-center rounded-2xl rounded-tl-md border border-border/50 bg-card px-4 py-3 shadow-sm">
                                <div className="flex gap-1.5">
                                    <span
                                        className="inline-block h-2 w-2 animate-bounce rounded-full bg-muted-foreground/60"
                                        style={{ animationDelay: '0ms' }}
                                    ></span>
                                    <span
                                        className="inline-block h-2 w-2 animate-bounce rounded-full bg-muted-foreground/60"
                                        style={{ animationDelay: '150ms' }}
                                    ></span>
                                    <span
                                        className="inline-block h-2 w-2 animate-bounce rounded-full bg-muted-foreground/60"
                                        style={{ animationDelay: '300ms' }}
                                    ></span>
                                </div>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>
            </div>

            {/* Message Input */}
            <form onSubmit={sendMessage} className="flex-shrink-0 border-t border-border/50 bg-background/95 p-4 backdrop-blur-sm">
                <div className="mx-auto max-w-4xl">
                    {/* Image Preview */}
                    {imagePreview && (
                        <div className="relative mb-3 inline-block">
                            <div className="relative overflow-hidden rounded-lg border-2 border-primary/20">
                                <img src={imagePreview} alt="Preview" className="max-h-32 max-w-xs object-cover" />
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

                    <div className="flex gap-3">
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
                            className="h-12 w-12 flex-shrink-0 rounded-full"
                            title="Upload image"
                        >
                            <Image className="h-5 w-5" />
                        </Button>
                        <Input
                            value={newMessage}
                            onChange={handleInputChange}
                            placeholder="Type your message..."
                            disabled={isLoading}
                            className="flex-1 rounded-full border-border/50 bg-muted/50 px-5 py-6 transition-colors focus:border-primary/50 focus:bg-background"
                        />
                        <Button
                            type="submit"
                            size="icon"
                            disabled={isLoading || (!newMessage.trim() && !selectedImage)}
                            className="h-12 w-12 rounded-full shadow-md transition-all hover:shadow-lg disabled:opacity-50"
                        >
                            <Send className="h-5 w-5" />
                        </Button>
                    </div>
                </div>
            </form>
        </div>
    );
}
