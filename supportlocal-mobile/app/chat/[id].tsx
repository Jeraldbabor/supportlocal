import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as ImagePicker from 'expo-image-picker';

import { Colors, Spacing, BorderRadius } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import apiClient from '@/services/api';
import { ENDPOINTS } from '@/constants/api';

interface Message {
  id: number;
  content: string;
  type: string;
  attachment_url: string | null;
  is_mine: boolean;
  sender: {
    id: number;
    name: string;
    avatar: string | null;
  };
  read_at: string | null;
  created_at: string;
}

interface ConversationData {
  conversation: {
    id: number;
    other_user: {
      id: number;
      name: string;
      avatar: string | null;
    };
  };
  messages: Message[];
}

export default function ChatScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const queryClient = useQueryClient();
  const flatListRef = useRef<FlatList>(null);

  const [messageText, setMessageText] = useState('');
  const [sending, setSending] = useState(false);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['chat-messages', id],
    queryFn: async () => {
      const response = await apiClient.get<{
        success: boolean;
        data: ConversationData;
      }>(ENDPOINTS.CHAT.MESSAGES(Number(id)));
      return response.data;
    },
    refetchInterval: 5000, // Poll every 5 seconds for new messages
  });

  const sendMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      return await apiClient.post(ENDPOINTS.CHAT.SEND_MESSAGE(Number(id)), formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    },
    onSuccess: () => {
      setMessageText('');
      queryClient.invalidateQueries({ queryKey: ['chat-messages', id] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
  });

  const handleSend = async () => {
    if (!messageText.trim() && !sending) return;
    
    setSending(true);
    const formData = new FormData();
    formData.append('content', messageText.trim());
    
    try {
      await sendMutation.mutateAsync(formData);
    } finally {
      setSending(false);
    }
  };

  const handleSendImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setSending(true);
      const formData = new FormData();
      const uri = result.assets[0].uri;
      const filename = uri.split('/').pop() || 'image.jpg';
      
      formData.append('content', '');
      formData.append('attachment', {
        uri,
        type: 'image/jpeg',
        name: filename,
      } as unknown as Blob);

      try {
        await sendMutation.mutateAsync(formData);
      } finally {
        setSending(false);
      }
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-PH', { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-PH', { 
        weekday: 'long',
        month: 'long', 
        day: 'numeric',
        year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined,
      });
    }
  };

  const shouldShowDate = (currentMsg: Message, prevMsg: Message | null) => {
    if (!prevMsg) return true;
    const currentDate = new Date(currentMsg.created_at).toDateString();
    const prevDate = new Date(prevMsg.created_at).toDateString();
    return currentDate !== prevDate;
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: Spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      backgroundColor: colors.card,
    },
    backButton: {
      padding: Spacing.xs,
      marginRight: Spacing.sm,
    },
    headerAvatar: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: colors.backgroundSecondary,
    },
    headerInfo: {
      flex: 1,
      marginLeft: Spacing.sm,
    },
    headerName: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
    },
    headerStatus: {
      fontSize: 12,
      color: colors.textSecondary,
    },
    messagesList: {
      flex: 1,
      padding: Spacing.md,
    },
    dateSeparator: {
      alignItems: 'center',
      marginVertical: Spacing.md,
    },
    dateText: {
      fontSize: 12,
      color: colors.textSecondary,
      backgroundColor: colors.backgroundSecondary,
      paddingHorizontal: Spacing.md,
      paddingVertical: Spacing.xs,
      borderRadius: BorderRadius.full,
    },
    messageRow: {
      flexDirection: 'row',
      marginBottom: Spacing.sm,
    },
    myMessageRow: {
      justifyContent: 'flex-end',
    },
    otherMessageRow: {
      justifyContent: 'flex-start',
    },
    messageAvatar: {
      width: 32,
      height: 32,
      borderRadius: 16,
      marginRight: Spacing.sm,
      backgroundColor: colors.backgroundSecondary,
    },
    messageBubble: {
      maxWidth: '75%',
      padding: Spacing.md,
      borderRadius: BorderRadius.lg,
    },
    myBubble: {
      backgroundColor: colors.primary,
      borderBottomRightRadius: 4,
    },
    otherBubble: {
      backgroundColor: colors.backgroundSecondary,
      borderBottomLeftRadius: 4,
    },
    messageText: {
      fontSize: 15,
      lineHeight: 20,
    },
    myMessageText: {
      color: '#fff',
    },
    otherMessageText: {
      color: colors.text,
    },
    messageImage: {
      width: 200,
      height: 200,
      borderRadius: BorderRadius.md,
    },
    messageTime: {
      fontSize: 11,
      marginTop: 4,
    },
    myMessageTime: {
      color: 'rgba(255,255,255,0.7)',
      textAlign: 'right',
    },
    otherMessageTime: {
      color: colors.textSecondary,
    },
    inputContainer: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      padding: Spacing.md,
      borderTopWidth: 1,
      borderTopColor: colors.border,
      backgroundColor: colors.card,
    },
    attachButton: {
      padding: Spacing.sm,
      marginRight: Spacing.xs,
    },
    textInputWrapper: {
      flex: 1,
      backgroundColor: colors.inputBackground,
      borderRadius: BorderRadius.lg,
      paddingHorizontal: Spacing.md,
      paddingVertical: Spacing.sm,
      maxHeight: 100,
    },
    textInput: {
      fontSize: 16,
      color: colors.text,
      maxHeight: 80,
    },
    sendButton: {
      padding: Spacing.sm,
      marginLeft: Spacing.xs,
    },
    sendButtonDisabled: {
      opacity: 0.5,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: Spacing.xl,
    },
    emptyText: {
      fontSize: 14,
      color: colors.textSecondary,
      textAlign: 'center',
    },
  });

  if (isLoading && !data) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  const otherUser = data?.conversation?.other_user;
  const messages = data?.messages || [];

  const renderMessage = ({ item, index }: { item: Message; index: number }) => {
    const prevMessage = index > 0 ? messages[index - 1] : null;
    const showDate = shouldShowDate(item, prevMessage);

    return (
      <View>
        {showDate && (
          <View style={styles.dateSeparator}>
            <Text style={styles.dateText}>{formatDate(item.created_at)}</Text>
          </View>
        )}
        <View style={[styles.messageRow, item.is_mine ? styles.myMessageRow : styles.otherMessageRow]}>
          {!item.is_mine && (
            <Image
              source={{ uri: item.sender.avatar || 'https://via.placeholder.com/32' }}
              style={styles.messageAvatar}
            />
          )}
          <View style={[styles.messageBubble, item.is_mine ? styles.myBubble : styles.otherBubble]}>
            {item.type === 'image' && item.attachment_url ? (
              <Image source={{ uri: item.attachment_url }} style={styles.messageImage} />
            ) : (
              <Text style={[styles.messageText, item.is_mine ? styles.myMessageText : styles.otherMessageText]}>
                {item.content}
              </Text>
            )}
            <Text style={[styles.messageTime, item.is_mine ? styles.myMessageTime : styles.otherMessageTime]}>
              {formatTime(item.created_at)}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => {
            if (otherUser) {
              router.push(`/seller/${otherUser.id}`);
            }
          }}
          style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}
        >
          <Image
            source={{ uri: otherUser?.avatar || 'https://via.placeholder.com/40' }}
            style={styles.headerAvatar}
          />
          <View style={styles.headerInfo}>
            <Text style={styles.headerName}>{otherUser?.name || 'Chat'}</Text>
            <Text style={styles.headerStatus}>Tap to view profile</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Messages */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
        keyboardVerticalOffset={0}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={[
            styles.messagesList,
            messages.length === 0 && { flex: 1 },
          ]}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="chatbubble-outline" size={48} color={colors.textSecondary} />
              <Text style={styles.emptyText}>
                No messages yet.{'\n'}Send a message to start the conversation!
              </Text>
            </View>
          }
          onContentSizeChange={() => {
            if (messages.length > 0) {
              flatListRef.current?.scrollToEnd({ animated: false });
            }
          }}
        />

        {/* Input */}
        <View style={styles.inputContainer}>
          <TouchableOpacity style={styles.attachButton} onPress={handleSendImage}>
            <Ionicons name="image-outline" size={24} color={colors.primary} />
          </TouchableOpacity>
          <View style={styles.textInputWrapper}>
            <TextInput
              style={styles.textInput}
              placeholder="Type a message..."
              placeholderTextColor={colors.textSecondary}
              value={messageText}
              onChangeText={setMessageText}
              multiline
              maxLength={2000}
            />
          </View>
          <TouchableOpacity
            style={[styles.sendButton, (!messageText.trim() || sending) && styles.sendButtonDisabled]}
            onPress={handleSend}
            disabled={!messageText.trim() || sending}
          >
            {sending ? (
              <ActivityIndicator size="small" color={colors.primary} />
            ) : (
              <Ionicons
                name="send"
                size={24}
                color={messageText.trim() ? colors.primary : colors.textSecondary}
              />
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
