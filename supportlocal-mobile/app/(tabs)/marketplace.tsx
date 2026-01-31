import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';

import { Colors, Spacing, BorderRadius } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAuthStore } from '@/store/authStore';
import apiClient from '@/services/api';
import { ENDPOINTS } from '@/constants/api';

interface MarketplaceRequest {
  id: number;
  request_number: string;
  title: string;
  category: string;
  category_label: string;
  description: string;
  budget_min: number;
  budget_max: number;
  quantity: number;
  preferred_deadline: string | null;
  bids_count: number;
  has_my_bid: boolean;
  buyer: {
    name: string;
    avatar: string | null;
  };
  reference_image: string | null;
  created_at: string;
  days_left: number | null;
}

const CATEGORY_FILTERS = [
  { key: 'all', label: 'All Categories' },
  { key: 'clothing', label: 'Clothing' },
  { key: 'accessories', label: 'Accessories' },
  { key: 'home_decor', label: 'Home Decor' },
  { key: 'furniture', label: 'Furniture' },
  { key: 'art', label: 'Art' },
  { key: 'crafts', label: 'Crafts' },
  { key: 'food', label: 'Food' },
  { key: 'gifts', label: 'Gifts' },
];

export default function MarketplaceScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { user } = useAuthStore();

  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['marketplace', selectedCategory, searchQuery],
    queryFn: async () => {
      let url = ENDPOINTS.SELLER.MARKETPLACE.LIST;
      const params = new URLSearchParams();
      
      if (selectedCategory !== 'all') {
        params.append('category', selectedCategory);
      }
      if (searchQuery) {
        params.append('search', searchQuery);
      }
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }
      
      const response = await apiClient.get<{
        success: boolean;
        data: MarketplaceRequest[];
      }>(url);
      return response.data || [];
    },
    enabled: user?.role === 'seller',
  });

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const formatCurrency = (amount: number) => {
    return `₱${amount.toLocaleString('en-PH', { minimumFractionDigits: 0 })}`;
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
      marginBottom: Spacing.xs,
    },
    subtitle: {
      fontSize: 14,
      color: colors.textSecondary,
      marginBottom: Spacing.md,
    },
    searchContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.inputBackground,
      borderRadius: BorderRadius.lg,
      paddingHorizontal: Spacing.md,
      marginBottom: Spacing.md,
    },
    searchInput: {
      flex: 1,
      paddingVertical: Spacing.sm,
      fontSize: 16,
      color: colors.text,
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
      marginBottom: Spacing.sm,
    },
    requestImage: {
      width: 80,
      height: 80,
      borderRadius: BorderRadius.md,
      backgroundColor: colors.backgroundSecondary,
    },
    requestInfo: {
      flex: 1,
      marginLeft: Spacing.md,
    },
    requestTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 4,
    },
    categoryBadge: {
      backgroundColor: colors.backgroundSecondary,
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: BorderRadius.sm,
      alignSelf: 'flex-start',
      marginBottom: 4,
    },
    categoryText: {
      fontSize: 11,
      color: colors.textSecondary,
    },
    budgetText: {
      fontSize: 15,
      fontWeight: '600',
      color: colors.primary,
    },
    requestMeta: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: Spacing.sm,
      paddingTop: Spacing.sm,
      borderTopWidth: 1,
      borderTopColor: colors.border,
      gap: Spacing.md,
    },
    metaItem: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    metaText: {
      fontSize: 12,
      color: colors.textSecondary,
      marginLeft: 4,
    },
    myBidBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#dcfce7',
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: BorderRadius.full,
      marginLeft: 'auto',
    },
    myBidText: {
      fontSize: 12,
      color: '#16a34a',
      fontWeight: '500',
      marginLeft: 4,
    },
    urgentBadge: {
      backgroundColor: '#fee2e2',
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: BorderRadius.full,
    },
    urgentText: {
      fontSize: 11,
      color: '#dc2626',
      fontWeight: '500',
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
    tabsContainer: {
      flexDirection: 'row',
      paddingHorizontal: Spacing.md,
      paddingVertical: Spacing.sm,
      backgroundColor: colors.backgroundSecondary,
      gap: Spacing.sm,
    },
    tabButton: {
      flex: 1,
      paddingVertical: Spacing.sm,
      borderRadius: BorderRadius.md,
      alignItems: 'center',
    },
    tabText: {
      fontSize: 14,
      fontWeight: '500',
    },
  });

  const [activeTab, setActiveTab] = useState<'browse' | 'my-bids'>('browse');

  // Fetch my bids when on my-bids tab
  const { data: myBidsData, refetch: refetchMyBids } = useQuery({
    queryKey: ['my-bids'],
    queryFn: async () => {
      const response = await apiClient.get<{ success: boolean; data: unknown[] }>(
        ENDPOINTS.SELLER.MY_BIDS.LIST
      );
      return response.data || [];
    },
    enabled: user?.role === 'seller' && activeTab === 'my-bids',
  });

  const renderRequest = ({ item }: { item: MarketplaceRequest }) => {
    const isUrgent = item.days_left !== null && item.days_left <= 3;

    return (
      <TouchableOpacity
        style={styles.requestCard}
        onPress={() => router.push(`/marketplace-request/${item.id}` as any)}
      >
        <View style={styles.requestHeader}>
          {item.reference_image ? (
            <Image source={{ uri: item.reference_image }} style={styles.requestImage} />
          ) : (
            <View style={[styles.requestImage, { justifyContent: 'center', alignItems: 'center' }]}>
              <Ionicons name="image-outline" size={24} color={colors.textSecondary} />
            </View>
          )}
          <View style={styles.requestInfo}>
            <Text style={styles.requestTitle} numberOfLines={2}>{item.title}</Text>
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryText}>{item.category_label}</Text>
            </View>
            <Text style={styles.budgetText}>
              {formatCurrency(item.budget_min)} - {formatCurrency(item.budget_max)}
            </Text>
          </View>
          {isUrgent && (
            <View style={styles.urgentBadge}>
              <Text style={styles.urgentText}>Urgent</Text>
            </View>
          )}
        </View>

        <Text numberOfLines={2} style={{ fontSize: 13, color: colors.textSecondary, marginBottom: Spacing.sm }}>
          {item.description}
        </Text>

        <View style={styles.requestMeta}>
          <View style={styles.metaItem}>
            <Ionicons name="cube-outline" size={14} color={colors.textSecondary} />
            <Text style={styles.metaText}>Qty: {item.quantity}</Text>
          </View>
          <View style={styles.metaItem}>
            <Ionicons name="people-outline" size={14} color={colors.textSecondary} />
            <Text style={styles.metaText}>{item.bids_count} bids</Text>
          </View>
          {item.days_left !== null && (
            <View style={styles.metaItem}>
              <Ionicons name="time-outline" size={14} color={isUrgent ? '#dc2626' : colors.textSecondary} />
              <Text style={[styles.metaText, isUrgent && { color: '#dc2626' }]}>
                {item.days_left} days left
              </Text>
            </View>
          )}
          {item.has_my_bid && (
            <View style={styles.myBidBadge}>
              <Ionicons name="checkmark-circle" size={14} color="#16a34a" />
              <Text style={styles.myBidText}>Bid Sent</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  if (user?.role !== 'seller') {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyContainer}>
          <Ionicons name="storefront-outline" size={64} color={colors.textSecondary} />
          <Text style={styles.emptyText}>
            The marketplace is only available{'\n'}for seller accounts.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

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
        <Text style={styles.title}>Marketplace</Text>
        <Text style={styles.subtitle}>
          Browse and bid on custom order requests from buyers
        </Text>

        {/* Search */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color={colors.textSecondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search requests..."
            placeholderTextColor={colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={() => refetch()}
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => { setSearchQuery(''); refetch(); }}>
              <Ionicons name="close-circle" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>

        {/* Category Filters */}
        <FlatList
          data={CATEGORY_FILTERS}
          horizontal
          showsHorizontalScrollIndicator={false}
          renderItem={({ item }) => {
            const isActive = selectedCategory === item.key;
            return (
              <TouchableOpacity
                style={[
                  styles.filterChip,
                  {
                    backgroundColor: isActive ? colors.primary : 'transparent',
                    borderColor: isActive ? colors.primary : colors.border,
                  },
                ]}
                onPress={() => setSelectedCategory(item.key)}
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

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[
            styles.tabButton,
            { backgroundColor: activeTab === 'browse' ? colors.primary : 'transparent' },
          ]}
          onPress={() => setActiveTab('browse')}
        >
          <Text style={[styles.tabText, { color: activeTab === 'browse' ? '#fff' : colors.text }]}>
            Browse Requests
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.tabButton,
            { backgroundColor: activeTab === 'my-bids' ? colors.primary : 'transparent' },
          ]}
          onPress={() => setActiveTab('my-bids')}
        >
          <Text style={[styles.tabText, { color: activeTab === 'my-bids' ? '#fff' : colors.text }]}>
            My Bids
          </Text>
        </TouchableOpacity>
      </View>

      {/* Requests List */}
      {activeTab === 'browse' ? (
        <FlatList
          data={data || []}
          renderItem={renderRequest}
          keyExtractor={(item) => item.id.toString()}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="search-outline" size={64} color={colors.textSecondary} />
              <Text style={styles.emptyText}>
                No open requests found.{'\n'}Check back later for new opportunities!
              </Text>
            </View>
          }
          contentContainerStyle={data?.length === 0 ? { flex: 1 } : { paddingVertical: Spacing.sm }}
        />
      ) : (
        <FlatList
          data={myBidsData || []}
          renderItem={({ item }: { item: unknown }) => {
            const bid = item as {
              id: number;
              proposed_price: number;
              estimated_days: number;
              status: string;
              status_label: string;
              request: {
                id: number;
                title: string;
                category: string;
                budget_min: number;
                budget_max: number;
                reference_image: string | null;
              };
              created_at: string;
            };
            
            return (
              <TouchableOpacity
                style={styles.requestCard}
                onPress={() => router.push(`/marketplace-request/${bid.request?.id}` as any)}
              >
                <View style={styles.requestHeader}>
                  {bid.request?.reference_image ? (
                    <Image source={{ uri: bid.request.reference_image }} style={styles.requestImage} />
                  ) : (
                    <View style={[styles.requestImage, { justifyContent: 'center', alignItems: 'center' }]}>
                      <Ionicons name="image-outline" size={24} color={colors.textSecondary} />
                    </View>
                  )}
                  <View style={styles.requestInfo}>
                    <Text style={styles.requestTitle} numberOfLines={2}>
                      {bid.request?.title || 'Unknown Request'}
                    </Text>
                    <Text style={styles.budgetText}>
                      Your bid: {formatCurrency(bid.proposed_price)}
                    </Text>
                    <Text style={{ fontSize: 12, color: colors.textSecondary, marginTop: 4 }}>
                      {bid.estimated_days} days • {bid.status_label}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            );
          }}
          keyExtractor={(item) => String((item as { id: number }).id)}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => refetchMyBids()} colors={[colors.primary]} />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="document-text-outline" size={64} color={colors.textSecondary} />
              <Text style={styles.emptyText}>
                You haven&apos;t submitted any bids yet.{'\n'}Browse requests and start bidding!
              </Text>
            </View>
          }
          contentContainerStyle={(myBidsData || []).length === 0 ? { flex: 1 } : { paddingVertical: Spacing.sm }}
        />
      )}
    </SafeAreaView>
  );
}
