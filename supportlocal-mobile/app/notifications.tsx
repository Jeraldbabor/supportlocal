import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { Colors, Spacing, BorderRadius } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAuthStore } from '@/store/authStore';
import apiClient from '@/services/api';
import { ENDPOINTS } from '@/constants/api';

interface Notification {
  id: string;
  type: string;
  data: {
    title?: string;
    message?: string;
    order_id?: number;
    product_id?: number;
    custom_order_id?: number;
    [key: string]: unknown;
  };
  read_at: string | null;
  created_at: string;
}

export default function NotificationsScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { isAuthenticated } = useAuthStore();
  const queryClient = useQueryClient();

  const [refreshing, setRefreshing] = useState(false);

  const { data: notifications, isLoading, refetch } = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const response = await apiClient.get<{
        success: boolean;
        data: Notification[];
      }>(ENDPOINTS.NOTIFICATIONS.LIST);
      return response.data || [];
    },
    enabled: isAuthenticated,
  });

  const markReadMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiClient.post(ENDPOINTS.NOTIFICATIONS.MARK_READ(id));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const markAllReadMutation = useMutation({
    mutationFn: async () => {
      await apiClient.post(ENDPOINTS.NOTIFICATIONS.MARK_ALL_READ);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const getNotificationIcon = (type: string) => {
    if (type.includes('Order')) return 'receipt';
    if (type.includes('Product')) return 'cube';
    if (type.includes('Bid') || type.includes('CustomOrder')) return 'pricetag';
    if (type.includes('Payment')) return 'card';
    if (type.includes('Rating')) return 'star';
    if (type.includes('Message')) return 'chatbubble';
    return 'notifications';
  };

  const getNotificationColor = (type: string) => {
    if (type.includes('Order')) return '#3b82f6';
    if (type.includes('Product')) return '#10b981';
    if (type.includes('Bid') || type.includes('CustomOrder')) return '#8b5cf6';
    if (type.includes('Payment')) return '#f59e0b';
    if (type.includes('Rating')) return '#ec4899';
    return colors.primary;
  };

  const handleNotificationPress = (notification: Notification) => {
    // Mark as read
    if (!notification.read_at) {
      markReadMutation.mutate(notification.id);
    }

    // Navigate based on type
    if (notification.data.order_id) {
      router.push(`/order/${notification.data.order_id}`);
    } else if (notification.data.product_id) {
      router.push(`/product/${notification.data.product_id}`);
    } else if (notification.data.custom_order_id) {
      router.push(`/custom-order/${notification.data.custom_order_id}`);
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const unreadCount = notifications?.filter(n => !n.read_at).length || 0;

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
    },
    backButton: {
      padding: Spacing.xs,
      marginRight: Spacing.sm,
    },
    headerTitle: {
      flex: 1,
      fontSize: 18,
      fontWeight: '600',
      color: colors.text,
    },
    markAllButton: {
      padding: Spacing.sm,
    },
    markAllText: {
      fontSize: 14,
      color: colors.primary,
      fontWeight: '500',
    },
    notificationCard: {
      flexDirection: 'row',
      padding: Spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    unread: {
      backgroundColor: colors.accentLight,
    },
    iconContainer: {
      width: 44,
      height: 44,
      borderRadius: 22,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: Spacing.md,
    },
    content: {
      flex: 1,
    },
    title: {
      fontSize: 15,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 4,
    },
    message: {
      fontSize: 14,
      color: colors.textSecondary,
      lineHeight: 20,
    },
    time: {
      fontSize: 12,
      color: colors.textSecondary,
      marginTop: 4,
    },
    unreadDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: colors.primary,
      marginLeft: Spacing.sm,
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
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Notifications</Text>
        </View>
        <View style={styles.guestContainer}>
          <Ionicons name="notifications-outline" size={64} color={colors.textSecondary} />
          <Text style={styles.guestText}>Sign in to see your notifications</Text>
          <TouchableOpacity style={styles.loginButton} onPress={() => router.push('/(auth)/login')}>
            <Text style={styles.loginButtonText}>Sign In</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Notifications</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          Notifications {unreadCount > 0 && `(${unreadCount})`}
        </Text>
        {unreadCount > 0 && (
          <TouchableOpacity
            style={styles.markAllButton}
            onPress={() => markAllReadMutation.mutate()}
          >
            <Text style={styles.markAllText}>Mark all read</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Notifications List */}
      <FlatList
        data={notifications || []}
        renderItem={({ item }) => {
          const iconColor = getNotificationColor(item.type);
          const isUnread = !item.read_at;

          return (
            <TouchableOpacity
              style={[styles.notificationCard, isUnread && styles.unread]}
              onPress={() => handleNotificationPress(item)}
            >
              <View style={[styles.iconContainer, { backgroundColor: `${iconColor}20` }]}>
                <Ionicons
                  name={getNotificationIcon(item.type) as keyof typeof Ionicons.glyphMap}
                  size={22}
                  color={iconColor}
                />
              </View>
              <View style={styles.content}>
                <Text style={styles.title}>
                  {item.data.title || 'Notification'}
                </Text>
                <Text style={styles.message} numberOfLines={2}>
                  {item.data.message || 'You have a new notification'}
                </Text>
                <Text style={styles.time}>{formatTime(item.created_at)}</Text>
              </View>
              {isUnread && <View style={styles.unreadDot} />}
            </TouchableOpacity>
          );
        }}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="notifications-off-outline" size={64} color={colors.textSecondary} />
            <Text style={styles.emptyText}>No notifications yet</Text>
          </View>
        }
        contentContainerStyle={(notifications || []).length === 0 ? { flex: 1 } : undefined}
      />
    </SafeAreaView>
  );
}
