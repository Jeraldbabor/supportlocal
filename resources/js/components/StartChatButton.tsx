import React, { useState } from 'react';
import { router, usePage } from '@inertiajs/react';
import { MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import BuyerChatModal from '@/components/BuyerChatModal';

interface StartChatButtonProps {
  userId: number;
  productId?: number;
  className?: string;
  variant?: 'default' | 'outline' | 'ghost';
  children?: React.ReactNode;
}

export default function StartChatButton({
  userId,
  productId,
  className = '',
  variant = 'default',
  children,
}: StartChatButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [showChatModal, setShowChatModal] = useState(false);
  const [conversationId, setConversationId] = useState<number | null>(null);
  const [isMinimized, setIsMinimized] = useState(false);
  const { auth } = usePage().props as { auth: { user?: { id: number; seller_status?: string } } };
  const currentUserId = auth?.user?.id;

  const handleStartChat = async () => {
    setIsLoading(true);
    
    try {
      const response = await fetch('/chat/conversation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
        },
        body: JSON.stringify({
          other_user_id: userId,
          product_id: productId,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        
        // Check if user is a seller (has seller_status === 'approved')
        const isSeller = auth?.user?.seller_status === 'approved';
        
        if (isSeller) {
          // Sellers use the full page chat interface
          router.visit('/chat', {
            data: { conversation_id: data.conversation_id },
          });
        } else {
          // Buyers get the modal chat interface
          setConversationId(data.conversation_id);
          setShowChatModal(true);
        }
      }
    } catch (error) {
      console.error('Failed to start chat:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Button
        onClick={handleStartChat}
        disabled={isLoading}
        variant={variant}
        className={className}
      >
        {children || (
          <>
            <MessageSquare className="mr-2 h-4 w-4" />
            {isLoading ? 'Starting...' : 'Chat'}
          </>
        )}
      </Button>

      {showChatModal && conversationId && (
        <BuyerChatModal 
          conversationId={conversationId}
          currentUserId={currentUserId}
          onClose={() => setShowChatModal(false)}
          isMinimized={isMinimized}
          onToggleMinimize={() => setIsMinimized(!isMinimized)}
        />
      )}
    </>
  );
}
