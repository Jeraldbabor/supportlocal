import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Dimensions,
} from 'react-native';
import { Image } from 'expo-image';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, router, Stack } from 'expo-router';

import { api } from '@/services/api';
import { ENDPOINTS } from '@/constants/api';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAuthStore } from '@/store/authStore';
import { useCartStore } from '@/store/cartStore';
import { useWishlistStore } from '@/store/wishlistStore';
import type { Product, Rating } from '@/types';

const { width } = Dimensions.get('window');

interface ProductResponse {
  success: boolean;
  product: Product;
}

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const styles = createStyles(colors);

  const [quantity, setQuantity] = useState(1);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const { addToCart, isLoading: cartLoading } = useCartStore();
  const { isInWishlist, toggleWishlist } = useWishlistStore();

  const { data, isLoading, error } = useQuery({
    queryKey: ['product', id],
    queryFn: () => api.get<ProductResponse>(ENDPOINTS.PRODUCTS.DETAIL(parseInt(id))),
    enabled: !!id,
  });

  const product = data?.product;
  const inWishlist = product ? isInWishlist(product.id) : false;

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      router.push('/(auth)/login');
      return;
    }

    if (!product) return;

    const success = await addToCart(product.id, quantity);
    if (success) {
      Alert.alert('Success', 'Added to cart!', [
        { text: 'Continue Shopping', style: 'cancel' },
        { text: 'View Cart', onPress: () => router.push('/(tabs)/cart') },
      ]);
    }
  };

  const handleBuyNow = async () => {
    if (!isAuthenticated) {
      router.push('/(auth)/login');
      return;
    }

    if (!product) return;

    router.push({
      pathname: '/checkout',
      params: {
        buy_now: 'true',
        product_id: product.id.toString(),
        quantity: quantity.toString(),
      },
    });
  };

  const handleWishlistToggle = async () => {
    if (!isAuthenticated) {
      router.push('/(auth)/login');
      return;
    }
    if (product) {
      await toggleWishlist(product.id);
    }
  };

  const handleQuantityChange = (delta: number) => {
    const newQuantity = quantity + delta;
    if (newQuantity >= 1 && newQuantity <= (product?.quantity || 1)) {
      setQuantity(newQuantity);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (error || !product) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={64} color={colors.textSecondary} />
        <Text style={styles.errorText}>Product not found</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const images = product.images && product.images.length > 0
    ? product.images
    : [product.image || 'https://via.placeholder.com/400'];

  const discountPercent = product.compare_price
    ? Math.round(((product.compare_price - product.price) / product.compare_price) * 100)
    : null;

  return (
    <>
      <Stack.Screen
        options={{
          title: '',
          headerRight: () => (
            <TouchableOpacity onPress={handleWishlistToggle} style={{ marginRight: 8 }}>
              <Ionicons
                name={inWishlist ? 'heart' : 'heart-outline'}
                size={24}
                color={inWishlist ? colors.error : colors.text}
              />
            </TouchableOpacity>
          ),
        }}
      />

      <View style={styles.container}>
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Image Gallery */}
          <View style={styles.imageContainer}>
            <ScrollView
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onMomentumScrollEnd={(e) => {
                const index = Math.round(e.nativeEvent.contentOffset.x / width);
                setCurrentImageIndex(index);
              }}
            >
              {images.map((image, index) => (
                <Image
                  key={index}
                  source={{ uri: image }}
                  style={styles.productImage}
                  contentFit="cover"
                />
              ))}
            </ScrollView>

            {/* Image Dots */}
            {images.length > 1 && (
              <View style={styles.dotsContainer}>
                {images.map((_, index) => (
                  <View
                    key={index}
                    style={[
                      styles.dot,
                      currentImageIndex === index && styles.dotActive,
                    ]}
                  />
                ))}
              </View>
            )}

            {/* Discount Badge */}
            {discountPercent && discountPercent > 0 && (
              <View style={styles.discountBadge}>
                <Text style={styles.discountText}>-{discountPercent}%</Text>
              </View>
            )}
          </View>

          {/* Product Info */}
          <View style={styles.infoContainer}>
            {/* Category */}
            {product.category && (
              <Text style={styles.category}>{product.category.name}</Text>
            )}

            {/* Name */}
            <Text style={styles.name}>{product.name}</Text>

            {/* Rating */}
            {product.review_count > 0 && (
              <View style={styles.ratingContainer}>
                <Ionicons name="star" size={16} color="#f59e0b" />
                <Text style={styles.rating}>{product.rating.toFixed(1)}</Text>
                <Text style={styles.reviewCount}>({product.review_count} reviews)</Text>
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

            {/* Stock Status */}
            <View style={styles.stockContainer}>
              <View
                style={[
                  styles.stockBadge,
                  { backgroundColor: product.in_stock ? colors.success + '20' : colors.error + '20' },
                ]}
              >
                <Ionicons
                  name={product.in_stock ? 'checkmark-circle' : 'close-circle'}
                  size={14}
                  color={product.in_stock ? colors.success : colors.error}
                />
                <Text
                  style={[
                    styles.stockText,
                    { color: product.in_stock ? colors.success : colors.error },
                  ]}
                >
                  {product.in_stock ? `In Stock (${product.quantity})` : 'Out of Stock'}
                </Text>
              </View>
            </View>

            {/* Seller */}
            {product.seller && (
              <TouchableOpacity
                style={styles.sellerCard}
                onPress={() => router.push(`/seller/${product.seller!.id}`)}
              >
                <Image
                  source={{ uri: product.seller.avatar_url }}
                  style={styles.sellerAvatar}
                  contentFit="cover"
                />
                <View style={styles.sellerInfo}>
                  <Text style={styles.sellerName}>{product.seller.name}</Text>
                  {product.seller.rating !== undefined && (
                    <View style={styles.sellerRating}>
                      <Ionicons name="star" size={12} color="#f59e0b" />
                      <Text style={styles.sellerRatingText}>
                        {product.seller.rating.toFixed(1)}
                      </Text>
                    </View>
                  )}
                </View>
                <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            )}

            {/* Description */}
            {product.description && (
              <View style={styles.descriptionContainer}>
                <Text style={styles.sectionTitle}>Description</Text>
                <Text style={styles.description}>{product.description}</Text>
              </View>
            )}

            {/* Shipping Info */}
            <View style={styles.shippingContainer}>
              <Ionicons name="car-outline" size={20} color={colors.textSecondary} />
              <Text style={styles.shippingText}>
                {product.free_shipping
                  ? 'Free Shipping'
                  : `Shipping: ₱${product.shipping_cost?.toFixed(2) || '50.00'}`}
              </Text>
            </View>

            {/* Recent Reviews */}
            {product.recent_ratings && product.recent_ratings.length > 0 && (
              <View style={styles.reviewsContainer}>
                <Text style={styles.sectionTitle}>Recent Reviews</Text>
                {product.recent_ratings.slice(0, 3).map((review) => (
                  <View key={review.id} style={styles.reviewItem}>
                    <View style={styles.reviewHeader}>
                      <Text style={styles.reviewerName}>{review.user?.name}</Text>
                      <View style={styles.reviewRating}>
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Ionicons
                            key={i}
                            name={i < review.rating ? 'star' : 'star-outline'}
                            size={12}
                            color="#f59e0b"
                          />
                        ))}
                      </View>
                    </View>
                    {review.review && (
                      <Text style={styles.reviewText}>{review.review}</Text>
                    )}
                  </View>
                ))}
              </View>
            )}

            <View style={{ height: 150 }} />
          </View>
        </ScrollView>

        {/* Bottom Action Bar */}
        <View style={styles.actionBar}>
          {/* Quantity Selector */}
          <View style={styles.quantitySelector}>
            <TouchableOpacity
              style={styles.quantityButton}
              onPress={() => handleQuantityChange(-1)}
              disabled={quantity <= 1}
            >
              <Ionicons name="remove" size={20} color={colors.text} />
            </TouchableOpacity>
            <Text style={styles.quantityText}>{quantity}</Text>
            <TouchableOpacity
              style={styles.quantityButton}
              onPress={() => handleQuantityChange(1)}
              disabled={quantity >= (product.quantity || 1)}
            >
              <Ionicons name="add" size={20} color={colors.text} />
            </TouchableOpacity>
          </View>

          {/* Action Buttons */}
          <TouchableOpacity
            style={[styles.addToCartButton, !product.in_stock && styles.buttonDisabled]}
            onPress={handleAddToCart}
            disabled={!product.in_stock || cartLoading}
          >
            {cartLoading ? (
              <ActivityIndicator size="small" color={colors.primary} />
            ) : (
              <>
                <Ionicons name="cart-outline" size={20} color={colors.primary} />
                <Text style={styles.addToCartText}>Add to Cart</Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.buyNowButton, !product.in_stock && styles.buttonDisabled]}
            onPress={handleBuyNow}
            disabled={!product.in_stock}
          >
            <Text style={styles.buyNowText}>Buy Now</Text>
          </TouchableOpacity>
        </View>
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
    imageContainer: {
      width: width,
      height: width,
      backgroundColor: colors.backgroundSecondary,
    },
    productImage: {
      width: width,
      height: width,
    },
    dotsContainer: {
      position: 'absolute',
      bottom: Spacing.md,
      left: 0,
      right: 0,
      flexDirection: 'row',
      justifyContent: 'center',
      gap: Spacing.xs,
    },
    dot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: 'rgba(255,255,255,0.5)',
    },
    dotActive: {
      backgroundColor: colors.primary,
      width: 20,
    },
    discountBadge: {
      position: 'absolute',
      top: Spacing.md,
      left: Spacing.md,
      backgroundColor: colors.error,
      paddingHorizontal: Spacing.sm,
      paddingVertical: Spacing.xs,
      borderRadius: BorderRadius.sm,
    },
    discountText: {
      color: '#fff',
      fontSize: 12,
      fontWeight: 'bold',
    },
    infoContainer: {
      padding: Spacing.lg,
    },
    category: {
      fontSize: 12,
      color: colors.primary,
      fontWeight: '600',
      marginBottom: Spacing.xs,
    },
    name: {
      fontSize: 22,
      fontWeight: 'bold',
      color: colors.text,
      marginBottom: Spacing.sm,
    },
    ratingContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: Spacing.sm,
    },
    rating: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.text,
      marginLeft: Spacing.xs,
    },
    reviewCount: {
      fontSize: 14,
      color: colors.textSecondary,
      marginLeft: Spacing.xs,
    },
    priceContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.sm,
      marginBottom: Spacing.sm,
    },
    price: {
      fontSize: 28,
      fontWeight: 'bold',
      color: colors.primary,
    },
    comparePrice: {
      fontSize: 18,
      color: colors.textSecondary,
      textDecorationLine: 'line-through',
    },
    stockContainer: {
      marginBottom: Spacing.md,
    },
    stockBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      alignSelf: 'flex-start',
      paddingHorizontal: Spacing.sm,
      paddingVertical: Spacing.xs,
      borderRadius: BorderRadius.sm,
      gap: Spacing.xs,
    },
    stockText: {
      fontSize: 13,
      fontWeight: '600',
    },
    sellerCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.card,
      padding: Spacing.md,
      borderRadius: BorderRadius.lg,
      marginBottom: Spacing.md,
      borderWidth: 1,
      borderColor: colors.border,
    },
    sellerAvatar: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: colors.backgroundSecondary,
    },
    sellerInfo: {
      flex: 1,
      marginLeft: Spacing.md,
    },
    sellerName: {
      fontSize: 15,
      fontWeight: '600',
      color: colors.text,
    },
    sellerRating: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 2,
      marginTop: 2,
    },
    sellerRatingText: {
      fontSize: 12,
      color: colors.textSecondary,
    },
    descriptionContainer: {
      marginBottom: Spacing.md,
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
      marginBottom: Spacing.sm,
    },
    description: {
      fontSize: 14,
      color: colors.textSecondary,
      lineHeight: 22,
    },
    shippingContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.inputBackground,
      padding: Spacing.md,
      borderRadius: BorderRadius.md,
      gap: Spacing.sm,
      marginBottom: Spacing.md,
    },
    shippingText: {
      fontSize: 14,
      color: colors.text,
    },
    reviewsContainer: {
      marginTop: Spacing.md,
    },
    reviewItem: {
      backgroundColor: colors.card,
      padding: Spacing.md,
      borderRadius: BorderRadius.md,
      marginBottom: Spacing.sm,
      borderWidth: 1,
      borderColor: colors.border,
    },
    reviewHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: Spacing.xs,
    },
    reviewerName: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.text,
    },
    reviewRating: {
      flexDirection: 'row',
    },
    reviewText: {
      fontSize: 13,
      color: colors.textSecondary,
      lineHeight: 20,
    },
    actionBar: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.card,
      padding: Spacing.md,
      paddingBottom: Spacing.lg,
      borderTopWidth: 1,
      borderTopColor: colors.border,
      gap: Spacing.sm,
    },
    quantitySelector: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.inputBackground,
      borderRadius: BorderRadius.md,
      borderWidth: 1,
      borderColor: colors.border,
    },
    quantityButton: {
      padding: Spacing.sm,
    },
    quantityText: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
      paddingHorizontal: Spacing.sm,
      minWidth: 30,
      textAlign: 'center',
    },
    addToCartButton: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.primary + '15',
      borderRadius: BorderRadius.md,
      padding: Spacing.md,
      gap: Spacing.xs,
      borderWidth: 1,
      borderColor: colors.primary,
    },
    addToCartText: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.primary,
    },
    buyNowButton: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.primary,
      borderRadius: BorderRadius.md,
      padding: Spacing.md,
    },
    buyNowText: {
      fontSize: 14,
      fontWeight: '600',
      color: '#fff',
    },
    buttonDisabled: {
      opacity: 0.5,
    },
  });
