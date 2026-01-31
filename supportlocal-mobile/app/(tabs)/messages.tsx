import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
  ActivityIndicator,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';

import { Colors, Spacing, BorderRadius } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAuthStore } from '@/store/authStore';
import { apiClient } from '@/services/api';
import { ENDPOINTS } from '@/constants/api';

interface Conversation {
  id: number;
  other_user: {
    id: number;
    name: string;
    avatar: string | null;
  };
  last_message: {
    content: string;
    type: string;
    is_mine: boolean;
    created_at: string;
  } | null;
  unread_count: number;
  updated_at: string;
}

export default function MessagesScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { isAuthenticated } = useAuthStore();

  const [refreshing, setRefreshing] = useState(false);

  const { data: conversations, isLoading, refetch } = useQuery({
    queryKey: ['conversations'],
    queryFn: async () => {
      const response = await apiClient.get<{
        success: boolean;
        data: Conversation[];
      }>(ENDPOINTS.CHAT.CONVERSATIONS);
      return response.data || [];
    },
    enabled: isAuthenticated,
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffDays === 0) {
      return date.toLocaleTimeString('en-PH', { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return date.toLocaleDateString('en-PH', { weekday: 'short' });
    } else {
      return date.toLocaleDateString('en-PH', { month: 'short', day: 'numeric' });
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      padding: Spacing.md,
      paddingTop: Spacing.lg,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      color: colors.text,
    },
    conversationCard: {
      flexDirection: 'row',
      padding: Spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      alignItems: 'center',
    },
    unreadCard: {
      backgroundColor: colors.accentLight,
    },
    avatar: {
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: colors.backgroundSecondary,
    },
    content: {
      flex: 1,
      marginLeft: Spacing.md,
    },
    topRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 4,
    },
    name: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
      flex: 1,
    },
    time: {
      fontSize: 12,
      color: colors.textSecondary,
    },
    bottomRow: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    lastMessage: {
      flex: 1,
      fontSize: 14,
      color: colors.textSecondary,
    },
    unreadMessage: {
      color: colors.text,
      fontWeight: '500',
    },
    unreadBadge: {
      backgroundColor: colors.primary,
      borderRadius: 10,
      minWidth: 20,
      height: 20,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 6,
      marginLeft: Spacing.sm,
    },
    unreadCount: {
      color: '#fff',
      fontSize: 11,
      fontWeight: 'bold',
    },
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: Spacing.xl,
    },
    emptyText: {
      fontSize: 16,
      color: colors.textSecondary,
      textAlign: 'center',
      marginTop: Spacing.md,
    },
    browseButton: {
      marginTop: Spacing.lg,
      backgroundColor: colors.primary,
      paddingHorizontal: Spacing.xl,
      paddingVertical: Spacing.md,
      borderRadius: BorderRadius.lg,
    },
    browseButtonText: {
      color: '#fff',
      fontSize: 16,
      fontWeight: '600',
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    guestContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: Spacing.xl,
    },
    guestText: {
      fontSize: 16,
      color: colors.textSecondary,
      textAlign: 'center',
      marginTop: Spacing.md,
      marginBottom: Spacing.lg,
    },
    loginButton: {
      backgroundColor: colors.primary,
      paddingHorizontal: Spacing.xl,
      paddingVertical: Spacing.md,
      borderRadius: BorderRadius.lg,
    },
    loginButtonText: {
      color: '#fff',
      fontSize: 16,
      fontWeight: '600',
    },
  });

  if (!isAuthenticated) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Messages</Text>
        </View>
        <View style={styles.guestContainer}>
          <Ionicons name="chatbubbles-outline" size={64} color={colors.textSecondary} />
          <Text style={styles.guestText}>
            Sign in to message sellers{'\n'}and get updates on your orders
          </Text>
          <TouchableOpacity style={styles.loginButton} onPress={() => router.push('/(auth)/login')}>
            <Text style={styles.loginButtonText}>Sign In</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (isLoading && !conversations) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Messages</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  const renderConversation = ({ item }: { item: Conversation }) => {
    const hasUnread = item.unread_count > 0;

    return (
      <TouchableOpacity
        style={[styles.conversationCard, hasUnread && styles.unreadCard]}
        onPress={() => router.push(`/chat/${item.id}`)}
      >
        <Image
          source={{ uri: item.other_user.avatar || 'https://via.placeholder.com/56' }}
          style={styles.avatar}
        />
        <View style={styles.content}>
          <View style={styles.topRow}>
            <Text style={styles.name} numberOfLines={1}>{item.other_user.name}</Text>
            {item.last_message && (
              <Text style={styles.time}>{formatTime(item.last_message.created_at)}</Text>
            )}
          </View>
          <View style={styles.bottomRow}>
            <Text
              style={[styles.lastMessage, hasUnread && styles.unreadMessage]}
              numberOfLines={1}
            >
              {item.last_message ? (
                item.last_message.type === 'image' ? (
                  `${item.last_message.is_mine ? 'You sent' : 'Sent'} a photo`
                ) : (
                  `${item.last_message.is_mine ? 'You: ' : ''}${item.last_message.content}`
                )
              ) : (
                'Start a conversation'
              )}
            </Text>
            {hasUnread && (
              <View style={styles.unreadBadge}>
                <Text style={styles.unreadCount}>
                  {item.unread_count > 99 ? '99+' : item.unread_count}
                </Text>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Messages</Text>
      </View>

      {/* Conversations List */}
      <FlatList
        data={conversations || []}
        renderItem={renderConversation}
        keyExtractor={(item) => item.id.toString()}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="chatbubbles-outline" size={64} color={colors.textSecondary} />
            <Text style={styles.emptyText}>
              No conversations yet.{'\n'}Message a seller to get started!
            </Text>
            <TouchableOpacity style={styles.browseButton} onPress={() => router.push('/products')}>
              <Text style={styles.browseButtonText}>Browse Products</Text>
            </TouchableOpacity>
          </View>
        }
        contentContainerStyle={(conversations || []).length === 0 ? { flex: 1 } : undefined}
      />
    </SafeAreaView>
  );
}
