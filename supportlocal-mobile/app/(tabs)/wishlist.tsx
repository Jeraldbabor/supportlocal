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
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { Colors, Spacing, BorderRadius } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAuthStore } from '@/store/authStore';
import { useWishlistStore } from '@/store/wishlistStore';
import { useCartStore } from '@/store/cartStore';

export default function WishlistScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { isAuthenticated } = useAuthStore();
  
  const { wishlist, isLoading, fetchWishlist, removeFromWishlist, clearWishlist } = useWishlistStore();
  const { addToCart } = useCartStore();
  
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchWishlist();
    setRefreshing(false);
  };

  const formatCurrency = (amount: number) => {
    return `₱${amount.toLocaleString('en-PH', { minimumFractionDigits: 0 })}`;
  };

  const handleRemove = async (productId: number) => {
    await removeFromWishlist(productId);
  };

  const handleAddToCart = async (productId: number) => {
    await addToCart(productId, 1);
    Alert.alert('Success', 'Added to cart!');
  };

  const handleClearWishlist = () => {
    Alert.alert(
      'Clear Wishlist',
      'Are you sure you want to remove all items from your wishlist?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Clear', style: 'destructive', onPress: () => clearWishlist() },
      ]
    );
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
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
    clearButton: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: Spacing.sm,
    },
    clearText: {
      fontSize: 14,
      color: colors.error,
      marginLeft: 4,
    },
    itemCard: {
      flexDirection: 'row',
      backgroundColor: colors.card,
      marginHorizontal: Spacing.md,
      marginVertical: Spacing.xs,
      borderRadius: BorderRadius.lg,
      padding: Spacing.md,
      borderWidth: 1,
      borderColor: colors.border,
    },
    itemImage: {
      width: 80,
      height: 80,
      borderRadius: BorderRadius.md,
      backgroundColor: colors.backgroundSecondary,
    },
    itemInfo: {
      flex: 1,
      marginLeft: Spacing.md,
      justifyContent: 'space-between',
    },
    itemName: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 4,
    },
    itemSeller: {
      fontSize: 13,
      color: colors.textSecondary,
      marginBottom: 4,
    },
    itemPrice: {
      fontSize: 16,
      fontWeight: '700',
      color: colors.primary,
    },
    originalPrice: {
      fontSize: 12,
      color: colors.textSecondary,
      textDecorationLine: 'line-through',
      marginLeft: 8,
    },
    priceRow: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    actions: {
      justifyContent: 'space-between',
      alignItems: 'flex-end',
    },
    removeButton: {
      padding: Spacing.xs,
    },
    addToCartButton: {
      backgroundColor: colors.primary,
      paddingHorizontal: Spacing.md,
      paddingVertical: Spacing.xs,
      borderRadius: BorderRadius.md,
      flexDirection: 'row',
      alignItems: 'center',
    },
    addToCartText: {
      color: '#fff',
      fontSize: 12,
      fontWeight: '600',
      marginLeft: 4,
    },
    outOfStock: {
      backgroundColor: colors.backgroundSecondary,
      paddingHorizontal: Spacing.md,
      paddingVertical: Spacing.xs,
      borderRadius: BorderRadius.md,
    },
    outOfStockText: {
      color: colors.textSecondary,
      fontSize: 12,
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
        <View style={styles.guestContainer}>
          <Ionicons name="heart-outline" size={64} color={colors.textSecondary} />
          <Text style={styles.guestText}>
            Sign in to save your favorite items{'\n'}and access them anytime
          </Text>
          <TouchableOpacity style={styles.loginButton} onPress={() => router.push('/(auth)/login')}>
            <Text style={styles.loginButtonText}>Sign In</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const items = wishlist?.items ?? [];

  const renderItem = ({ item }: { item: typeof items[0] }) => {
    const product = item.product;
    if (!product) return null;

    const inStock = product.quantity > 0;

    return (
      <TouchableOpacity
        style={styles.itemCard}
        onPress={() => router.push(`/product/${product.id}`)}
      >
        <Image
          source={{ uri: product.primary_image || product.images?.[0] }}
          style={styles.itemImage}
        />
        <View style={styles.itemInfo}>
          <View>
            <Text style={styles.itemName} numberOfLines={2}>{product.name}</Text>
            <Text style={styles.itemSeller}>{product.seller?.business_name || product.seller?.name}</Text>
          </View>
          <View style={styles.priceRow}>
            <Text style={styles.itemPrice}>{formatCurrency(product.price)}</Text>
            {product.compare_at_price && product.compare_at_price > product.price && (
              <Text style={styles.originalPrice}>{formatCurrency(product.compare_at_price)}</Text>
            )}
          </View>
        </View>
        <View style={styles.actions}>
          <TouchableOpacity style={styles.removeButton} onPress={() => handleRemove(product.id)}>
            <Ionicons name="close-circle" size={24} color={colors.textSecondary} />
          </TouchableOpacity>
          {inStock ? (
            <TouchableOpacity style={styles.addToCartButton} onPress={() => handleAddToCart(product.id)}>
              <Ionicons name="cart" size={16} color="#fff" />
              <Text style={styles.addToCartText}>Add</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.outOfStock}>
              <Text style={styles.outOfStockText}>Out of Stock</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  if (isLoading && items.length === 0) {
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
        <Text style={styles.title}>Wishlist ({items.length})</Text>
        {items.length > 0 && (
          <TouchableOpacity style={styles.clearButton} onPress={handleClearWishlist}>
            <Ionicons name="trash-outline" size={18} color={colors.error} />
            <Text style={styles.clearText}>Clear</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Items List */}
      <FlatList
        data={items}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="heart-outline" size={64} color={colors.textSecondary} />
            <Text style={styles.emptyText}>
              Your wishlist is empty.{'\n'}Save items you love for later!
            </Text>
            <TouchableOpacity style={styles.browseButton} onPress={() => router.push('/products')}>
              <Text style={styles.browseButtonText}>Browse Products</Text>
            </TouchableOpacity>
          </View>
        }
        contentContainerStyle={items.length === 0 ? { flex: 1 } : { paddingVertical: Spacing.sm }}
      />
    </SafeAreaView>
  );
}
