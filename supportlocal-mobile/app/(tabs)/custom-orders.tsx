import React, { useEffect, useState, useCallback } from 'react';
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

interface CustomOrderRequest {
  id: number;
  request_number: string;
  title: string;
  category: string;
  is_public: boolean;
  status: string;
  status_label: string;
  budget_min: number;
  budget_max: number;
  quantity: number;
  preferred_deadline: string | null;
  bids_count: number;
  quoted_price: number | null;
  seller: {
    id: number;
    name: string;
    avatar: string | null;
  } | null;
  accepted_bid: {
    id: number;
    proposed_price: number;
    seller: { id: number; name: string };
  } | null;
  reference_image: string | null;
  created_at: string;
}

const STATUS_FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'open', label: 'Open' },
  { key: 'pending', label: 'Pending' },
  { key: 'quoted', label: 'Quoted' },
  { key: 'accepted', label: 'Accepted' },
  { key: 'in_progress', label: 'In Progress' },
  { key: 'ready_for_checkout', label: 'Ready' },
  { key: 'completed', label: 'Completed' },
];

export default function CustomOrdersScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { user, isAuthenticated } = useAuthStore();

  const [selectedStatus, setSelectedStatus] = useState('all');
  const [refreshing, setRefreshing] = useState(false);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['custom-orders', selectedStatus],
    queryFn: async () => {
      const params = selectedStatus !== 'all' ? `?status=${selectedStatus}` : '';
      const response = await apiClient.get<{
        success: boolean;
        data: CustomOrderRequest[];
      }>(`${ENDPOINTS.CUSTOM_ORDERS.LIST}${params}`);
      return response.data || [];
    },
    enabled: isAuthenticated,
  });

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const formatCurrency = (amount: number) => {
    return `₱${amount.toLocaleString('en-PH', { minimumFractionDigits: 0 })}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return { bg: '#dbeafe', text: '#2563eb' };
      case 'pending':
        return { bg: '#fef3c7', text: '#d97706' };
      case 'quoted':
        return { bg: '#ede9fe', text: '#7c3aed' };
      case 'accepted':
        return { bg: '#dcfce7', text: '#16a34a' };
      case 'in_progress':
        return { bg: '#fef3c7', text: '#d97706' };
      case 'ready_for_checkout':
        return { bg: '#dcfce7', text: '#16a34a' };
      case 'completed':
        return { bg: '#f3f4f6', text: '#6b7280' };
      case 'cancelled':
      case 'rejected':
      case 'declined':
        return { bg: '#fee2e2', text: '#dc2626' };
      default:
        return { bg: colors.backgroundSecondary, text: colors.textSecondary };
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
      marginBottom: Spacing.sm,
    },
    subtitle: {
      fontSize: 14,
      color: colors.textSecondary,
      marginBottom: Spacing.md,
    },
    filterScroll: {
      flexDirection: 'row',
      gap: Spacing.xs,
    },
    filterChip: {
      paddingHorizontal: Spacing.md,
      paddingVertical: Spacing.xs,
      borderRadius: BorderRadius.full,
      borderWidth: 1,
    },
    filterChipText: {
      fontSize: 13,
      fontWeight: '500',
    },
    requestCard: {
      backgroundColor: colors.card,
      marginHorizontal: Spacing.md,
      marginVertical: Spacing.xs,
      borderRadius: BorderRadius.lg,
      padding: Spacing.md,
      borderWidth: 1,
      borderColor: colors.border,
    },
    requestHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: Spacing.sm,
    },
    requestTitle: {
      flex: 1,
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
      marginRight: Spacing.sm,
    },
    statusBadge: {
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: BorderRadius.full,
    },
    statusText: {
      fontSize: 11,
      fontWeight: '500',
    },
    requestContent: {
      flexDirection: 'row',
    },
    requestImage: {
      width: 70,
      height: 70,
      borderRadius: BorderRadius.md,
      backgroundColor: colors.backgroundSecondary,
    },
    requestInfo: {
      flex: 1,
      marginLeft: Spacing.md,
    },
    requestMeta: {
      fontSize: 12,
      color: colors.textSecondary,
      marginBottom: 4,
    },
    budgetText: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.primary,
      marginTop: 4,
    },
    bidsRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: Spacing.sm,
      paddingTop: Spacing.sm,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    bidsText: {
      fontSize: 13,
      color: colors.textSecondary,
      marginLeft: 4,
    },
    typeBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      marginLeft: 'auto',
    },
    typeText: {
      fontSize: 12,
      color: colors.textSecondary,
      marginLeft: 4,
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
    createButton: {
      marginTop: Spacing.lg,
      backgroundColor: colors.primary,
      paddingHorizontal: Spacing.xl,
      paddingVertical: Spacing.md,
      borderRadius: BorderRadius.lg,
    },
    createButtonText: {
      color: '#fff',
      fontSize: 16,
      fontWeight: '600',
    },
    addButton: {
      position: 'absolute',
      bottom: Spacing.lg,
      right: Spacing.lg,
      backgroundColor: colors.primary,
      width: 56,
      height: 56,
      borderRadius: 28,
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 4,
      elevation: 5,
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
        <View style={styles.guestContainer}>
          <Ionicons name="document-text-outline" size={64} color={colors.textSecondary} />
          <Text style={styles.guestText}>
            Sign in to create custom orders{'\n'}and request unique items from artisans
          </Text>
          <TouchableOpacity style={styles.loginButton} onPress={() => router.push('/(auth)/login')}>
            <Text style={styles.loginButtonText}>Sign In</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const renderRequest = ({ item }: { item: CustomOrderRequest }) => {
    const statusColors = getStatusColor(item.status);

    return (
      <TouchableOpacity
        style={styles.requestCard}
        onPress={() => router.push(`/custom-order/${item.id}`)}
      >
        <View style={styles.requestHeader}>
          <Text style={styles.requestTitle} numberOfLines={2}>{item.title}</Text>
          <View style={[styles.statusBadge, { backgroundColor: statusColors.bg }]}>
            <Text style={[styles.statusText, { color: statusColors.text }]}>
              {item.status_label}
            </Text>
          </View>
        </View>

        <View style={styles.requestContent}>
          {item.reference_image ? (
            <Image source={{ uri: item.reference_image }} style={styles.requestImage} />
          ) : (
            <View style={[styles.requestImage, { justifyContent: 'center', alignItems: 'center' }]}>
              <Ionicons name="image-outline" size={24} color={colors.textSecondary} />
            </View>
          )}
          <View style={styles.requestInfo}>
            <Text style={styles.requestMeta}>
              {item.category} • Qty: {item.quantity}
            </Text>
            {item.preferred_deadline && (
              <Text style={styles.requestMeta}>
                Deadline: {new Date(item.preferred_deadline).toLocaleDateString()}
              </Text>
            )}
            <Text style={styles.budgetText}>
              Budget: {formatCurrency(item.budget_min)} - {formatCurrency(item.budget_max)}
            </Text>
            {item.quoted_price && (
              <Text style={[styles.requestMeta, { color: colors.primary, fontWeight: '600' }]}>
                Quoted: {formatCurrency(item.quoted_price)}
              </Text>
            )}
          </View>
        </View>

        <View style={styles.bidsRow}>
          {item.is_public ? (
            <>
              <Ionicons name="people" size={16} color={colors.primary} />
              <Text style={[styles.bidsText, { color: colors.primary }]}>
                {item.bids_count} bid{item.bids_count !== 1 ? 's' : ''} received
              </Text>
            </>
          ) : (
            <>
              <Ionicons name="person" size={16} color={colors.textSecondary} />
              <Text style={styles.bidsText}>
                Direct request to {item.seller?.name || 'seller'}
              </Text>
            </>
          )}
          <View style={styles.typeBadge}>
            <Ionicons
              name={item.is_public ? 'globe-outline' : 'lock-closed-outline'}
              size={14}
              color={colors.textSecondary}
            />
            <Text style={styles.typeText}>{item.is_public ? 'Public' : 'Direct'}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (isLoading && !data) {
    return (
      <SafeAreaView style={styles.container}>
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
        <Text style={styles.title}>Custom Orders</Text>
        <Text style={styles.subtitle}>
          Request unique, handcrafted items from local artisans
        </Text>

        {/* Filters */}
        <FlatList
          data={STATUS_FILTERS}
          horizontal
          showsHorizontalScrollIndicator={false}
          renderItem={({ item }) => {
            const isActive = selectedStatus === item.key;
            return (
              <TouchableOpacity
                style={[
                  styles.filterChip,
                  {
                    backgroundColor: isActive ? colors.primary : 'transparent',
                    borderColor: isActive ? colors.primary : colors.border,
                  },
                ]}
                onPress={() => setSelectedStatus(item.key)}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    { color: isActive ? '#fff' : colors.text },
                  ]}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            );
          }}
          keyExtractor={(item) => item.key}
          contentContainerStyle={styles.filterScroll}
        />
      </View>

      {/* Requests List */}
      <FlatList
        data={data || []}
        renderItem={renderRequest}
        keyExtractor={(item) => item.id.toString()}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="sparkles-outline" size={64} color={colors.textSecondary} />
            <Text style={styles.emptyText}>
              No custom orders yet.{'\n'}Create one to get unique items from artisans!
            </Text>
            <TouchableOpacity
              style={styles.createButton}
              onPress={() => router.push('/create-custom-order')}
            >
              <Text style={styles.createButtonText}>Create Custom Order</Text>
            </TouchableOpacity>
          </View>
        }
        contentContainerStyle={data?.length === 0 ? { flex: 1 } : { paddingVertical: Spacing.sm }}
      />

      {/* Add FAB */}
      {data && data.length > 0 && (
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => router.push('/create-custom-order')}
        >
          <Ionicons name="add" size={28} color="#fff" />
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
}
