import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Image } from 'expo-image';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, router, Stack } from 'expo-router';

import { ProductCard } from '@/components/products/ProductCard';
import { api } from '@/services/api';
import { ENDPOINTS } from '@/constants/api';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import type { Seller, Product, Pagination } from '@/types';

interface SellerResponse {
  success: boolean;
  seller: Seller;
}

interface ProductsResponse {
  success: boolean;
  products: Product[];
  pagination: Pagination;
}

export default function SellerDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const styles = createStyles(colors);

  const { data: sellerData, isLoading: sellerLoading } = useQuery({
    queryKey: ['seller', id],
    queryFn: () => api.get<SellerResponse>(ENDPOINTS.SELLERS.DETAIL(parseInt(id))),
    enabled: !!id,
  });

  const {
    data: productsData,
    isLoading: productsLoading,
    refetch,
  } = useQuery({
    queryKey: ['seller-products', id],
    queryFn: () => api.get<ProductsResponse>(ENDPOINTS.SELLERS.PRODUCTS(parseInt(id)), { per_page: 20 }),
    enabled: !!id,
  });

  const seller = sellerData?.seller;

  const renderProduct = ({ item }: { item: Product }) => (
    <View style={styles.productItem}>
      <ProductCard product={item} />
    </View>
  );

  const renderHeader = () => {
    if (!seller) return null;

    return (
      <View style={styles.headerContainer}>
        {/* Seller Info */}
        <View style={styles.sellerCard}>
          <Image
            source={{ uri: seller.avatar_url }}
            style={styles.avatar}
            contentFit="cover"
          />
          <Text style={styles.sellerName}>{seller.name}</Text>

          {/* Rating */}
          <View style={styles.ratingContainer}>
            <Ionicons name="star" size={16} color="#f59e0b" />
            <Text style={styles.rating}>{seller.rating.toFixed(1)}</Text>
            <Text style={styles.reviewCount}>({seller.review_count} reviews)</Text>
          </View>

          {/* Stats */}
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{seller.products_count}</Text>
              <Text style={styles.statLabel}>Products</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{seller.review_count}</Text>
              <Text style={styles.statLabel}>Reviews</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <View style={[
                styles.onlineIndicator,
                { backgroundColor: seller.is_online ? colors.success : colors.textSecondary }
              ]} />
              <Text style={styles.statLabel}>
                {seller.is_online ? 'Online' : 'Offline'}
              </Text>
            </View>
          </View>

          {/* Member Since */}
          {seller.member_since && (
            <Text style={styles.memberSince}>
              Member since {seller.member_since}
            </Text>
          )}
        </View>

        {/* Products Header */}
        <View style={styles.productsHeader}>
          <Text style={styles.productsTitle}>Products</Text>
          <Text style={styles.productsCount}>
            {productsData?.pagination.total || 0} items
          </Text>
        </View>
      </View>
    );
  };

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="cube-outline" size={64} color={colors.textSecondary} />
      <Text style={styles.emptyTitle}>No products yet</Text>
      <Text style={styles.emptySubtitle}>
        This seller hasn&apos;t listed any products
      </Text>
    </View>
  );

  if (sellerLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!seller) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={64} color={colors.textSecondary} />
        <Text style={styles.errorText}>Seller not found</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: seller.name }} />

      <View style={styles.container}>
        <FlatList
          data={productsData?.products || []}
          renderItem={renderProduct}
          keyExtractor={(item) => item.id.toString()}
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.listContent}
          ListHeaderComponent={renderHeader}
          ListEmptyComponent={productsLoading ? null : renderEmpty}
          refreshControl={
            <RefreshControl
              refreshing={false}
              onRefresh={() => refetch()}
              tintColor={colors.primary}
            />
          }
          showsVerticalScrollIndicator={false}
        />
      </View>
    </>
  );
}

const createStyles = (colors: typeof Colors.light) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: colors.background,
    },
    errorContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: colors.background,
      padding: Spacing.xl,
    },
    errorText: {
      fontSize: 18,
      color: colors.textSecondary,
      marginTop: Spacing.md,
    },
    backButton: {
      marginTop: Spacing.lg,
      padding: Spacing.md,
    },
    backButtonText: {
      color: colors.primary,
      fontSize: 16,
      fontWeight: '600',
    },
    headerContainer: {
      paddingBottom: Spacing.md,
    },
    sellerCard: {
      backgroundColor: colors.card,
      marginHorizontal: Spacing.lg,
      marginTop: Spacing.md,
      padding: Spacing.lg,
      borderRadius: BorderRadius.lg,
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      elevation: 2,
    },
    avatar: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: colors.backgroundSecondary,
      marginBottom: Spacing.md,
    },
    sellerName: {
      fontSize: 22,
      fontWeight: 'bold',
      color: colors.text,
      marginBottom: Spacing.xs,
    },
    ratingContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: Spacing.md,
    },
    rating: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
      marginLeft: Spacing.xs,
    },
    reviewCount: {
      fontSize: 14,
      color: colors.textSecondary,
      marginLeft: Spacing.xs,
    },
    statsRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginVertical: Spacing.md,
    },
    statItem: {
      alignItems: 'center',
      paddingHorizontal: Spacing.lg,
    },
    statDivider: {
      width: 1,
      height: 30,
      backgroundColor: colors.border,
    },
    statValue: {
      fontSize: 18,
      fontWeight: 'bold',
      color: colors.text,
    },
    statLabel: {
      fontSize: 12,
      color: colors.textSecondary,
      marginTop: 2,
    },
    onlineIndicator: {
      width: 10,
      height: 10,
      borderRadius: 5,
      marginBottom: 4,
    },
    memberSince: {
      fontSize: 13,
      color: colors.textSecondary,
    },
    productsHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: Spacing.lg,
      marginTop: Spacing.lg,
      marginBottom: Spacing.sm,
    },
    productsTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.text,
    },
    productsCount: {
      fontSize: 14,
      color: colors.textSecondary,
    },
    listContent: {
      paddingBottom: Spacing.xl,
    },
    row: {
      paddingHorizontal: Spacing.lg,
      justifyContent: 'space-between',
    },
    productItem: {
      marginBottom: Spacing.md,
    },
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingVertical: Spacing.xxl,
    },
    emptyTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.text,
      marginTop: Spacing.md,
    },
    emptySubtitle: {
      fontSize: 14,
      color: colors.textSecondary,
      marginTop: Spacing.xs,
    },
  });
