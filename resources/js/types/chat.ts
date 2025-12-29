// Chat-related TypeScript interfaces and types

export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  profile_picture?: string;
  avatar_url?: string;
}

export interface Message {
  id: number;
  conversation_id: number;
  sender_id: number;
  message: string;
  is_read: boolean;
  read_at: string | null;
  created_at: string;
  updated_at: string;
  sender: User;
}

export interface Product {
  id: number;
  name: string;
  description?: string;
  price: number;
  image?: string;
}

export interface Conversation {
  id: number;
  buyer_id: number;
  seller_id: number;
  product_id?: number;
  last_message_at: string;
  created_at: string;
  updated_at: string;
  buyer: User;
  seller: User;
  product?: Product;
  last_message?: Message;
  unread_count?: number;
  other_user?: User;
}

export interface ConversationListItem {
  id: number;
  other_user: User;
  product?: Product;
  last_message?: {
    message: string;
    created_at: string;
  };
  last_message_at: string;
  unread_count: number;
}

export interface ChatPageProps {
  auth: {
    user: User;
  };
  conversations: ConversationListItem[];
}

export interface MessageSentEvent {
  message: Message;
}
