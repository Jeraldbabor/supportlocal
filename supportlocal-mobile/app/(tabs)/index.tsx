import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { Image } from 'expo-image';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';

import { ProductCard } from '@/components/products/ProductCard';
import { api } from '@/services/api';
import { ENDPOINTS } from '@/constants/api';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAuthStore } from '@/store/authStore';
import type { Product, Category } from '@/types';

interface ProductsResponse {
  success: boolean;
  products: Product[];
}

interface CategoriesResponse {
  success: boolean;
  categories: Category[];
}

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const styles = createStyles(colors);

  const user = useAuthStore((state) => state.user);
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  // Fetch featured products
  const { data: featuredData, refetch: refetchFeatured } = useQuery({
    queryKey: ['products', 'featured'],
    queryFn: () => api.get<ProductsResponse>(ENDPOINTS.PRODUCTS.FEATURED, { limit: 8 }),
  });

  // Fetch top-rated products
  const { data: topRatedData, refetch: refetchTopRated } = useQuery({
    queryKey: ['products', 'top-rated'],
    queryFn: () => api.get<ProductsResponse>(ENDPOINTS.PRODUCTS.TOP_RATED, { limit: 10 }),
  });

  // Fetch trending products
  const { data: trendingData, refetch: refetchTrending } = useQuery({
    queryKey: ['products', 'trending'],
    queryFn: () => api.get<ProductsResponse>(ENDPOINTS.PRODUCTS.TRENDING, { limit: 10 }),
  });

  // Fetch categories
  const { data: categoriesData, refetch: refetchCategories } = useQuery({
    queryKey: ['categories'],
    queryFn: () => api.get<CategoriesResponse>(ENDPOINTS.CATEGORIES.LIST),
  });

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([
      refetchFeatured(),
      refetchTopRated(),
      refetchTrending(),
      refetchCategories(),
    ]);
    setRefreshing(false);
  };

  const handleSearch = () => {
    if (searchQuery.trim()) {
      router.push(`/(tabs)/products?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const renderProductRow = (products: Product[] | undefined, title: string) => {
    if (!products || products.length === 0) return null;

    return (
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{title}</Text>
          <TouchableOpacity onPress={() => router.push('/(tabs)/products')}>
            <Text style={styles.seeAll}>See All</Text>
          </TouchableOpacity>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.horizontalList}
        >
          {products.map((product) => (
            <View key={product.id} style={styles.productCardWrapper}>
              <ProductCard product={product} />
            </View>
          ))}
        </ScrollView>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>
              {user ? `Hello, ${user.name.split(' ')[0]}!` : 'Welcome!'}
            </Text>
            <Text style={styles.subGreeting}>Support Local Artisans</Text>
          </View>
          <TouchableOpacity
            style={styles.notificationButton}
            onPress={() => user ? router.push('/(tabs)/profile') : router.push('/(auth)/login')}
          >
            <Ionicons name="person-circle-outline" size={32} color={colors.primary} />
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Ionicons name="search" size={20} color={colors.textSecondary} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search products, sellers..."
              placeholderTextColor={colors.textSecondary}
              value={searchQuery}
              onChangeText={setSearchQuery}
              onSubmitEditing={handleSearch}
              returnKeyType="search"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Categories */}
        {categoriesData?.categories && categoriesData.categories.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { paddingHorizontal: Spacing.lg }]}>Categories</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoriesContainer}
            >
              {categoriesData.categories.slice(0, 8).map((category) => (
                <TouchableOpacity
                  key={category.id}
                  style={styles.categoryChip}
                  onPress={() => router.push(`/(tabs)/products?category_id=${category.id}`)}
                >
                  <Text style={styles.categoryText}>{category.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Featured Products */}
        {renderProductRow(featuredData?.products, 'New Arrivals')}

        {/* Top Rated */}
        {renderProductRow(topRatedData?.products, 'Top Rated')}

        {/* Trending */}
        {renderProductRow(trendingData?.products, 'Trending Now')}

        {/* Bottom Padding */}
        <View style={{ height: Spacing.xl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (colors: typeof Colors.light) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: Spacing.lg,
      paddingVertical: Spacing.md,
    },
    greeting: {
      fontSize: 24,
      fontWeight: 'bold',
      color: colors.text,
    },
    subGreeting: {
      fontSize: 14,
      color: colors.textSecondary,
      marginTop: 2,
    },
    notificationButton: {
      padding: Spacing.xs,
    },
    searchContainer: {
      paddingHorizontal: Spacing.lg,
      marginBottom: Spacing.md,
    },
    searchBar: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.inputBackground,
      borderRadius: BorderRadius.lg,
      paddingHorizontal: Spacing.md,
      paddingVertical: Spacing.sm,
      borderWidth: 1,
      borderColor: colors.border,
    },
    searchInput: {
      flex: 1,
      fontSize: 16,
      color: colors.text,
      marginLeft: Spacing.sm,
      paddingVertical: Spacing.xs,
    },
    section: {
      marginTop: Spacing.md,
    },
    sectionHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: Spacing.lg,
      marginBottom: Spacing.sm,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: colors.text,
      marginBottom: Spacing.sm,
    },
    seeAll: {
      fontSize: 14,
      color: colors.primary,
      fontWeight: '600',
    },
    horizontalList: {
      paddingLeft: Spacing.lg,
      paddingRight: Spacing.sm,
    },
    productCardWrapper: {
      marginRight: Spacing.md,
      width: 160,
    },
    categoriesContainer: {
      paddingHorizontal: Spacing.lg,
    },
    categoryChip: {
      backgroundColor: colors.primary + '15',
      paddingHorizontal: Spacing.md,
      paddingVertical: Spacing.sm,
      borderRadius: BorderRadius.full,
      marginRight: Spacing.sm,
    },
    categoryText: {
      color: colors.primary,
      fontSize: 14,
      fontWeight: '500',
    },
  });
