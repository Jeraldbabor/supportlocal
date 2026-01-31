import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { Colors, Spacing, BorderRadius } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useWishlistStore } from '@/store/wishlistStore';
import { useAuthStore } from '@/store/authStore';
import type { Product } from '@/types';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - Spacing.lg * 3) / 2;

interface ProductCardProps {
  product: Product;
  onPress?: () => void;
}

export function ProductCard({ product, onPress }: ProductCardProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const styles = createStyles(colors);

  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const { isInWishlist, toggleWishlist } = useWishlistStore();
  const inWishlist = isInWishlist(product.id);

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      router.push(`/product/${product.id}`);
    }
  };

  const handleWishlistToggle = async () => {
    if (!isAuthenticated) {
      router.push('/(auth)/login');
      return;
    }
    await toggleWishlist(product.id);
  };

  const discountPercent = product.compare_price
    ? Math.round(((product.compare_price - product.price) / product.compare_price) * 100)
    : null;

  return (
    <TouchableOpacity style={styles.container} onPress={handlePress} activeOpacity={0.8}>
      {/* Image */}
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: product.image || 'https://via.placeholder.com/200' }}
          style={styles.image}
          contentFit="cover"
          transition={200}
        />
        
        {/* Wishlist Button */}
        <TouchableOpacity
          style={styles.wishlistButton}
          onPress={handleWishlistToggle}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons
            name={inWishlist ? 'heart' : 'heart-outline'}
            size={20}
            color={inWishlist ? colors.error : colors.text}
          />
        </TouchableOpacity>

        {/* Discount Badge */}
        {discountPercent && discountPercent > 0 && (
          <View style={styles.discountBadge}>
            <Text style={styles.discountText}>-{discountPercent}%</Text>
          </View>
        )}

        {/* Out of Stock Overlay */}
        {!product.in_stock && (
          <View style={styles.outOfStockOverlay}>
            <Text style={styles.outOfStockText}>Out of Stock</Text>
          </View>
        )}
      </View>

      {/* Details */}
      <View style={styles.details}>
        <Text style={styles.name} numberOfLines={2}>
          {product.name}
        </Text>

        {/* Seller */}
        {product.seller && (
          <Text style={styles.seller} numberOfLines={1}>
            by {product.seller.name}
          </Text>
        )}

        {/* Rating */}
        {product.review_count > 0 && (
          <View style={styles.ratingContainer}>
            <Ionicons name="star" size={12} color="#f59e0b" />
            <Text style={styles.rating}>{product.rating.toFixed(1)}</Text>
            <Text style={styles.reviewCount}>({product.review_count})</Text>
          </View>
        )}

        {/* Price */}
        <View style={styles.priceContainer}>
          <Text style={styles.price}>{product.formatted_price}</Text>
          {product.compare_price && (
            <Text style={styles.comparePrice}>
              ₱{product.compare_price.toFixed(2)}
            </Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const createStyles = (colors: typeof Colors.light) =>
  StyleSheet.create({
    container: {
      width: CARD_WIDTH,
      backgroundColor: colors.card,
      borderRadius: BorderRadius.lg,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
      marginBottom: Spacing.md,
    },
    imageContainer: {
      width: '100%',
      height: CARD_WIDTH,
      borderTopLeftRadius: BorderRadius.lg,
      borderTopRightRadius: BorderRadius.lg,
      overflow: 'hidden',
      backgroundColor: colors.backgroundSecondary,
    },
    image: {
      width: '100%',
      height: '100%',
    },
    wishlistButton: {
      position: 'absolute',
      top: Spacing.sm,
      right: Spacing.sm,
      backgroundColor: colors.card,
      borderRadius: BorderRadius.full,
      padding: Spacing.xs,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.2,
      shadowRadius: 2,
      elevation: 2,
    },
    discountBadge: {
      position: 'absolute',
      top: Spacing.sm,
      left: Spacing.sm,
      backgroundColor: colors.error,
      borderRadius: BorderRadius.sm,
      paddingHorizontal: Spacing.xs,
      paddingVertical: 2,
    },
    discountText: {
      color: '#fff',
      fontSize: 10,
      fontWeight: 'bold',
    },
    outOfStockOverlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    outOfStockText: {
      color: '#fff',
      fontSize: 12,
      fontWeight: 'bold',
    },
    details: {
      padding: Spacing.sm,
    },
    name: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 2,
      lineHeight: 18,
    },
    seller: {
      fontSize: 11,
      color: colors.textSecondary,
      marginBottom: 4,
    },
    ratingContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 4,
    },
    rating: {
      fontSize: 12,
      fontWeight: '600',
      color: colors.text,
      marginLeft: 2,
    },
    reviewCount: {
      fontSize: 11,
      color: colors.textSecondary,
      marginLeft: 2,
    },
    priceContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.xs,
    },
    price: {
      fontSize: 16,
      fontWeight: 'bold',
      color: colors.primary,
    },
    comparePrice: {
      fontSize: 12,
      color: colors.textSecondary,
      textDecorationLine: 'line-through',
    },
  });

export default ProductCard;
