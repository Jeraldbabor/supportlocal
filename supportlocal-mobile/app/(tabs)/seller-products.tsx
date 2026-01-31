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
  TextInput,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { Colors, Spacing, BorderRadius } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useSellerStore } from '@/store/sellerStore';
import type { SellerProduct } from '@/types';

const STATUS_FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'active', label: 'Active' },
  { key: 'draft', label: 'Draft' },
  { key: 'low_stock', label: 'Low Stock' },
  { key: 'out_of_stock', label: 'Out of Stock' },
];

export default function SellerProductsScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { products, productsLoading, productsPagination, fetchProducts, toggleProductStatus, updateProductInventory } = useSellerStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [refreshing, setRefreshing] = useState(false);

  const loadProducts = useCallback((params: Record<string, unknown> = {}) => {
    const queryParams: Record<string, unknown> = { ...params };
    
    if (searchQuery) {
      queryParams.search = searchQuery;
    }
    
    if (selectedStatus !== 'all') {
      if (selectedStatus === 'low_stock' || selectedStatus === 'out_of_stock') {
        queryParams.stock_status = selectedStatus;
      } else {
        queryParams.status = selectedStatus;
      }
    }
    
    fetchProducts(queryParams);
  }, [fetchProducts, searchQuery, selectedStatus]);

  useEffect(() => {
    loadProducts();
  }, [selectedStatus]);

  const handleSearch = () => {
    loadProducts();
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadProducts();
    setRefreshing(false);
  };

  const handleToggleStatus = async (product: SellerProduct) => {
    const newStatus = product.status === 'active' ? 'draft' : 'active';
    Alert.alert(
      'Change Status',
      `Set this product to ${newStatus}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: async () => {
            const success = await toggleProductStatus(product.id);
            if (!success) {
              Alert.alert('Error', 'Failed to update product status');
            }
          },
        },
      ]
    );
  };

  const handleUpdateStock = (product: SellerProduct) => {
    Alert.prompt(
      'Update Stock',
      `Current stock: ${product.quantity}\nEnter new quantity:`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Update',
          onPress: async (value) => {
            const quantity = parseInt(value || '0', 10);
            if (isNaN(quantity) || quantity < 0) {
              Alert.alert('Error', 'Please enter a valid quantity');
              return;
            }
            const success = await updateProductInventory(product.id, quantity);
            if (!success) {
              Alert.alert('Error', 'Failed to update stock');
            }
          },
        },
      ],
      'plain-text',
      String(product.quantity)
    );
  };

  const formatCurrency = (amount: number) => {
    return `₱${amount.toLocaleString('en-PH', { minimumFractionDigits: 2 })}`;
  };

  const getStockStatus = (product: SellerProduct) => {
    if (product.quantity === 0) {
      return { label: 'Out of Stock', color: '#dc2626', bg: '#fee2e2' };
    }
    if (product.quantity <= (product.low_stock_threshold || 5)) {
      return { label: 'Low Stock', color: '#d97706', bg: '#fef3c7' };
    }
    return { label: 'In Stock', color: '#16a34a', bg: '#dcfce7' };
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
    searchButton: {
      padding: Spacing.xs,
    },
    filterContainer: {
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
      fontSize: 14,
      fontWeight: '500',
    },
    statsRow: {
      flexDirection: 'row',
      padding: Spacing.md,
      backgroundColor: colors.backgroundSecondary,
      gap: Spacing.md,
    },
    statItem: {
      flex: 1,
      alignItems: 'center',
    },
    statValue: {
      fontSize: 20,
      fontWeight: 'bold',
      color: colors.text,
    },
    statLabel: {
      fontSize: 12,
      color: colors.textSecondary,
      marginTop: 2,
    },
    productCard: {
      flexDirection: 'row',
      backgroundColor: colors.card,
      marginHorizontal: Spacing.md,
      marginVertical: Spacing.xs,
      borderRadius: BorderRadius.lg,
      padding: Spacing.md,
      borderWidth: 1,
      borderColor: colors.border,
    },
    productImage: {
      width: 80,
      height: 80,
      borderRadius: BorderRadius.md,
      backgroundColor: colors.backgroundSecondary,
    },
    productInfo: {
      flex: 1,
      marginLeft: Spacing.md,
    },
    productName: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 4,
    },
    productPrice: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.primary,
      marginBottom: 4,
    },
    productMeta: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.sm,
    },
    stockBadge: {
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: BorderRadius.sm,
    },
    stockText: {
      fontSize: 12,
      fontWeight: '500',
    },
    statusBadge: {
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: BorderRadius.sm,
    },
    statusText: {
      fontSize: 12,
      fontWeight: '500',
      textTransform: 'capitalize',
    },
    productActions: {
      justifyContent: 'center',
      gap: Spacing.xs,
    },
    actionButton: {
      padding: Spacing.xs,
      borderRadius: BorderRadius.md,
      backgroundColor: colors.backgroundSecondary,
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
  });

  const renderProduct = ({ item }: { item: SellerProduct }) => {
    const stockStatus = getStockStatus(item);
    
    return (
      <TouchableOpacity
        style={styles.productCard}
        onPress={() => router.push(`/seller-product/${item.id}`)}
      >
        {item.images && item.images.length > 0 ? (
          <Image source={{ uri: item.images[0] }} style={styles.productImage} />
        ) : (
          <View style={styles.productImage} />
        )}
        <View style={styles.productInfo}>
          <Text style={styles.productName} numberOfLines={2}>{item.name}</Text>
          <Text style={styles.productPrice}>{formatCurrency(item.price)}</Text>
          <View style={styles.productMeta}>
            <View style={[styles.stockBadge, { backgroundColor: stockStatus.bg }]}>
              <Text style={[styles.stockText, { color: stockStatus.color }]}>
                {item.quantity} in stock
              </Text>
            </View>
            <View
              style={[
                styles.statusBadge,
                {
                  backgroundColor: item.status === 'active' ? '#dcfce7' : '#f3f4f6',
                },
              ]}
            >
              <Text
                style={[
                  styles.statusText,
                  { color: item.status === 'active' ? '#16a34a' : '#6b7280' },
                ]}
              >
                {item.status}
              </Text>
            </View>
          </View>
        </View>
        <View style={styles.productActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleToggleStatus(item)}
          >
            <Ionicons
              name={item.status === 'active' ? 'eye-off-outline' : 'eye-outline'}
              size={20}
              color={colors.textSecondary}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleUpdateStock(item)}
          >
            <Ionicons name="cube-outline" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  if (productsLoading && products.length === 0) {
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
        <Text style={styles.title}>My Products</Text>
        
        {/* Search */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color={colors.textSecondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search products..."
            placeholderTextColor={colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => { setSearchQuery(''); loadProducts({ search: '' }); }}>
              <Ionicons name="close-circle" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>
        
        {/* Filters */}
        <FlatList
          data={STATUS_FILTERS}
          horizontal
          showsHorizontalScrollIndicator={false}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.filterChip,
                {
                  backgroundColor: selectedStatus === item.key ? colors.primary : 'transparent',
                  borderColor: selectedStatus === item.key ? colors.primary : colors.border,
                },
              ]}
              onPress={() => setSelectedStatus(item.key)}
            >
              <Text
                style={[
                  styles.filterChipText,
                  { color: selectedStatus === item.key ? '#fff' : colors.text },
                ]}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          )}
          keyExtractor={(item) => item.key}
          contentContainerStyle={styles.filterContainer}
        />
      </View>

      {/* Products List */}
      <FlatList
        data={products}
        renderItem={renderProduct}
        keyExtractor={(item) => item.id.toString()}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="cube-outline" size={64} color={colors.textSecondary} />
            <Text style={styles.emptyText}>
              No products found.{'\n'}Add your first product to get started!
            </Text>
          </View>
        }
        contentContainerStyle={products.length === 0 ? { flex: 1 } : { paddingVertical: Spacing.sm }}
      />

      {/* Add Product FAB */}
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => router.push('/seller-product/new')}
      >
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}
