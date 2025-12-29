import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Send, X, Minimize2, Image } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatDistanceToNow } from 'date-fns';

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

interface BuyerChatModalProps {
  conversationId: number;
  currentUserId: number;
  onClose: () => void;
  isMinimized: boolean;
  onToggleMinimize: () => void;
}

export default function BuyerChatModal({ 
  conversationId, 
  currentUserId, 
  onClose,
  isMinimized,
  onToggleMinimize 
}: BuyerChatModalProps) {
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
  }, [conversationId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadMessages = async () => {
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
  };

  const subscribeToChannel = () => {
    if (!window.Echo) return;

    window.Echo.private(`conversation.${conversationId}`)
      .listen('.message.sent', (e: { message: Message }) => {
        setMessages((prev) => {
          const exists = prev.some(msg => msg.id === e.message.id);
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
  };

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

  const markAsRead = async () => {
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
    <div className="fixed bottom-4 right-4 z-[9999] flex flex-col bg-white rounded-lg shadow-2xl border border-gray-200 w-[380px] max-w-[calc(100vw-2rem)] max-h-[420px]">
      {/* Chat Header */}
      <div className="bg-primary text-primary-foreground rounded-t-lg px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <Avatar className="h-10 w-10 border-2 border-white">
            <AvatarImage src={conversation.other_user.avatar_url} />
            <AvatarFallback className="bg-white text-primary font-semibold">
              {getInitials(conversation.other_user.name)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm leading-tight truncate">
              {conversation.other_user.name}
            </h3>
            {conversation.product && (
              <p className="text-xs opacity-90 truncate">
                {conversation.product.name}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleMinimize}
            className="h-8 w-8 text-white hover:bg-white/20"
          >
            <Minimize2 className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8 text-white hover:bg-white/20"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Chat Body - Only show when not minimized */}
      {!isMinimized && (
        <>
          {/* Messages */}
          <div className="overflow-y-auto p-4 space-y-3 bg-gray-50 flex-1 min-h-0 scroll-smooth">
            {messages.map((message) => {
              const isOwnMessage = message.sender_id === currentUserId;
              
              return (
                <div
                  key={message.id}
                  className={`flex gap-2 ${isOwnMessage ? 'flex-row-reverse' : 'flex-row'}`}
                >
                  <Avatar className="h-7 w-7">
                    <AvatarImage src={message.sender.avatar_url} />
                    <AvatarFallback className="text-xs">{getInitials(message.sender.name)}</AvatarFallback>
                  </Avatar>
                  <div className={`flex flex-col ${isOwnMessage ? 'items-end' : 'items-start'} max-w-[70%]`}>
                    <div
                      className={`rounded-2xl px-3 py-2 ${
                        isOwnMessage
                          ? 'bg-primary text-primary-foreground rounded-br-sm'
                          : 'bg-white border border-gray-200 rounded-bl-sm'
                      }`}
                    >
                      {message.image && (
                        <div className="mb-2">
                          <a
                            href={`/storage/${message.image}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block"
                          >
                            <img
                              src={`/storage/${message.image}`}
                              alt="Uploaded image"
                              className="rounded-lg max-w-xs max-h-48 object-cover cursor-pointer hover:opacity-90 transition-opacity"
                            />
                          </a>
                        </div>
                      )}
                      {message.message && (
                        <p className="text-sm break-words">{message.message}</p>
                      )}
                    </div>
                    <span className="mt-1 text-xs text-muted-foreground">
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
                  <AvatarFallback className="text-xs">{getInitials(conversation.other_user.name)}</AvatarFallback>
                </Avatar>
                <div className="flex items-center bg-white border border-gray-200 rounded-2xl rounded-bl-sm px-3 py-2">
                  <div className="flex gap-1">
                    <span className="animate-bounce inline-block w-1.5 h-1.5 bg-gray-400 rounded-full" style={{ animationDelay: '0ms' }}></span>
                    <span className="animate-bounce inline-block w-1.5 h-1.5 bg-gray-400 rounded-full" style={{ animationDelay: '150ms' }}></span>
                    <span className="animate-bounce inline-block w-1.5 h-1.5 bg-gray-400 rounded-full" style={{ animationDelay: '300ms' }}></span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input */}
          <form onSubmit={sendMessage} className="border-t bg-white rounded-b-lg p-3">
            {/* Image Preview */}
            {imagePreview && (
              <div className="mb-2 relative inline-block">
                <div className="relative rounded-lg overflow-hidden border-2 border-primary/20">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="max-h-24 max-w-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={clearImageSelection}
                    className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-lg"
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
                className="rounded-full h-10 w-10 flex-shrink-0"
                title="Upload image"
              >
                <Image className="h-4 w-4" />
              </Button>
              <Input
                value={newMessage}
                onChange={handleInputChange}
                placeholder="Type a message..."
                disabled={isLoading}
                className="flex-1 rounded-full"
              />
              <Button 
                type="submit" 
                size="icon" 
                disabled={isLoading || (!newMessage.trim() && !selectedImage)}
                className="rounded-full h-10 w-10 flex-shrink-0"
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
