import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router, Stack } from 'expo-router';

import { api } from '@/services/api';
import { ENDPOINTS } from '@/constants/api';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAuthStore } from '@/store/authStore';
import { useCartStore } from '@/store/cartStore';
import type { Cart, Product } from '@/types';

interface ProductResponse {
  success: boolean;
  product: Product;
}

interface OrderResponse {
  success: boolean;
  message: string;
  order: {
    id: number;
    order_number: string;
  };
}

type PaymentMethod = 'cod' | 'gcash';

export default function CheckoutScreen() {
  const params = useLocalSearchParams<{
    buy_now?: string;
    product_id?: string;
    quantity?: string;
  }>();

  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const styles = createStyles(colors);

  const user = useAuthStore((state) => state.user);
  const { cart, fetchCart } = useCartStore();

  const [isLoading, setIsLoading] = useState(false);
  const [buyNowProduct, setBuyNowProduct] = useState<Product | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cod');

  // Form state
  const [shippingName, setShippingName] = useState(user?.name || '');
  const [shippingPhone, setShippingPhone] = useState(user?.delivery_phone || user?.phone_number || '');
  const [shippingAddress, setShippingAddress] = useState(user?.delivery_address || '');
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [gcashNumber, setGcashNumber] = useState(user?.gcash_number || '');

  const isBuyNow = params.buy_now === 'true';
  const buyNowQuantity = parseInt(params.quantity || '1');

  useEffect(() => {
    if (isBuyNow && params.product_id) {
      // Fetch product for Buy Now
      api.get<ProductResponse>(ENDPOINTS.PRODUCTS.DETAIL(parseInt(params.product_id)))
        .then((data) => {
          if (data.success) {
            setBuyNowProduct(data.product);
          }
        })
        .catch(console.error);
    } else {
      // Fetch cart
      fetchCart();
    }
  }, [isBuyNow, params.product_id, fetchCart]);

  // Calculate totals
  let items: { name: string; image: string | null; price: number; quantity: number; seller_name?: string }[] = [];
  let subtotal = 0;
  let shippingFee = 0;

  if (isBuyNow && buyNowProduct) {
    const itemTotal = buyNowProduct.price * buyNowQuantity;
    subtotal = itemTotal;
    shippingFee = buyNowProduct.free_shipping ? 0 : (buyNowProduct.shipping_cost || 50);
    items = [{
      name: buyNowProduct.name,
      image: buyNowProduct.image,
      price: buyNowProduct.price,
      quantity: buyNowQuantity,
      seller_name: buyNowProduct.seller?.name,
    }];
  } else if (cart) {
    items = cart.items.map(item => ({
      name: item.name,
      image: item.image,
      price: item.price,
      quantity: item.quantity,
      seller_name: item.seller_name,
    }));
    subtotal = cart.subtotal;
    shippingFee = cart.shipping_fee;
  }

  const total = subtotal + shippingFee;

  const validateForm = () => {
    if (!shippingName.trim()) {
      Alert.alert('Error', 'Please enter your name');
      return false;
    }
    if (!shippingPhone.trim()) {
      Alert.alert('Error', 'Please enter your phone number');
      return false;
    }
    if (!shippingAddress.trim()) {
      Alert.alert('Error', 'Please enter your shipping address');
      return false;
    }
    if (paymentMethod === 'gcash' && !gcashNumber.trim()) {
      Alert.alert('Error', 'Please enter your GCash number');
      return false;
    }
    return true;
  };

  const handlePlaceOrder = async () => {
    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const orderData: Record<string, unknown> = {
        payment_method: paymentMethod,
        shipping_name: shippingName.trim(),
        shipping_phone: shippingPhone.trim(),
        shipping_address: shippingAddress.trim(),
        special_instructions: specialInstructions.trim() || null,
        gcash_number: paymentMethod === 'gcash' ? gcashNumber.trim() : null,
      };

      if (isBuyNow && buyNowProduct) {
        orderData.buy_now = true;
        orderData.product_id = buyNowProduct.id;
        orderData.quantity = buyNowQuantity;
      }

      const response = await api.post<OrderResponse>(ENDPOINTS.ORDERS.CREATE, orderData);

      if (response.success) {
        Alert.alert(
          'Order Placed!',
          `Your order ${response.order.order_number} has been placed successfully.${
            paymentMethod === 'gcash' ? '\n\nPlease upload your payment proof in the order details.' : ''
          }`,
          [
            {
              text: 'View Orders',
              onPress: () => router.replace('/(tabs)/orders'),
            },
          ]
        );
      } else {
        Alert.alert('Error', response.message || 'Failed to place order');
      }
    } catch (error) {
      console.error('Order error:', error);
      Alert.alert('Error', 'Failed to place order. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if ((isBuyNow && !buyNowProduct) || (!isBuyNow && !cart)) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!isBuyNow && cart && cart.items.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyContainer}>
          <Ionicons name="cart-outline" size={64} color={colors.textSecondary} />
          <Text style={styles.emptyText}>Your cart is empty</Text>
          <TouchableOpacity
            style={styles.shopButton}
            onPress={() => router.replace('/(tabs)/products')}
          >
            <Text style={styles.shopButtonText}>Start Shopping</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: 'Checkout' }} />

      <SafeAreaView style={styles.container} edges={['bottom']}>
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Order Items */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Order Items</Text>
            {items.map((item, index) => (
              <View key={index} style={styles.orderItem}>
                <Image
                  source={{ uri: item.image || 'https://via.placeholder.com/60' }}
                  style={styles.itemImage}
                  contentFit="cover"
                />
                <View style={styles.itemDetails}>
                  <Text style={styles.itemName} numberOfLines={2}>{item.name}</Text>
                  {item.seller_name && (
                    <Text style={styles.itemSeller}>{item.seller_name}</Text>
                  )}
                  <Text style={styles.itemPrice}>
                    ₱{item.price.toFixed(2)} × {item.quantity}
                  </Text>
                </View>
                <Text style={styles.itemTotal}>
                  ₱{(item.price * item.quantity).toFixed(2)}
                </Text>
              </View>
            ))}
          </View>

          {/* Shipping Information */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Shipping Information</Text>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Full Name</Text>
              <TextInput
                style={styles.input}
                value={shippingName}
                onChangeText={setShippingName}
                placeholder="Enter your full name"
                placeholderTextColor={colors.textSecondary}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Phone Number</Text>
              <TextInput
                style={styles.input}
                value={shippingPhone}
                onChangeText={setShippingPhone}
                placeholder="Enter your phone number"
                placeholderTextColor={colors.textSecondary}
                keyboardType="phone-pad"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Shipping Address</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={shippingAddress}
                onChangeText={setShippingAddress}
                placeholder="Enter your complete address"
                placeholderTextColor={colors.textSecondary}
                multiline
                numberOfLines={3}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Special Instructions (Optional)</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={specialInstructions}
                onChangeText={setSpecialInstructions}
                placeholder="Any special delivery instructions"
                placeholderTextColor={colors.textSecondary}
                multiline
                numberOfLines={2}
              />
            </View>
          </View>

          {/* Payment Method */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Payment Method</Text>

            <TouchableOpacity
              style={[
                styles.paymentOption,
                paymentMethod === 'cod' && styles.paymentOptionActive,
              ]}
              onPress={() => setPaymentMethod('cod')}
            >
              <View style={styles.paymentOptionLeft}>
                <Ionicons name="cash-outline" size={24} color={colors.text} />
                <View>
                  <Text style={styles.paymentOptionTitle}>Cash on Delivery</Text>
                  <Text style={styles.paymentOptionDesc}>Pay when you receive</Text>
                </View>
              </View>
              <View style={[
                styles.radioOuter,
                paymentMethod === 'cod' && styles.radioOuterActive,
              ]}>
                {paymentMethod === 'cod' && <View style={styles.radioInner} />}
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.paymentOption,
                paymentMethod === 'gcash' && styles.paymentOptionActive,
              ]}
              onPress={() => setPaymentMethod('gcash')}
            >
              <View style={styles.paymentOptionLeft}>
                <Ionicons name="phone-portrait-outline" size={24} color={colors.text} />
                <View>
                  <Text style={styles.paymentOptionTitle}>GCash</Text>
                  <Text style={styles.paymentOptionDesc}>Upload payment proof after order</Text>
                </View>
              </View>
              <View style={[
                styles.radioOuter,
                paymentMethod === 'gcash' && styles.radioOuterActive,
              ]}>
                {paymentMethod === 'gcash' && <View style={styles.radioInner} />}
              </View>
            </TouchableOpacity>

            {paymentMethod === 'gcash' && (
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Your GCash Number</Text>
                <TextInput
                  style={styles.input}
                  value={gcashNumber}
                  onChangeText={setGcashNumber}
                  placeholder="09XXXXXXXXX"
                  placeholderTextColor={colors.textSecondary}
                  keyboardType="phone-pad"
                />
              </View>
            )}
          </View>

          {/* Order Summary */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Order Summary</Text>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Subtotal</Text>
              <Text style={styles.summaryValue}>₱{subtotal.toFixed(2)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Shipping</Text>
              <Text style={styles.summaryValue}>₱{shippingFee.toFixed(2)}</Text>
            </View>
            <View style={[styles.summaryRow, styles.totalRow]}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>₱{total.toFixed(2)}</Text>
            </View>
          </View>

          <View style={{ height: Spacing.xl }} />
        </ScrollView>

        {/* Place Order Button */}
        <View style={styles.bottomBar}>
          <View style={styles.totalContainer}>
            <Text style={styles.totalLabelSmall}>Total</Text>
            <Text style={styles.totalValueLarge}>₱{total.toFixed(2)}</Text>
          </View>
          <TouchableOpacity
            style={[styles.placeOrderButton, isLoading && styles.buttonDisabled]}
            onPress={handlePlaceOrder}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.placeOrderText}>Place Order</Text>
            )}
          </TouchableOpacity>
        </View>
      </SafeAreaView>
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
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: Spacing.xl,
    },
    emptyText: {
      fontSize: 18,
      color: colors.textSecondary,
      marginTop: Spacing.md,
    },
    shopButton: {
      backgroundColor: colors.primary,
      paddingHorizontal: Spacing.xl,
      paddingVertical: Spacing.md,
      borderRadius: BorderRadius.md,
      marginTop: Spacing.lg,
    },
    shopButtonText: {
      color: '#fff',
      fontSize: 16,
      fontWeight: '600',
    },
    section: {
      backgroundColor: colors.card,
      marginHorizontal: Spacing.lg,
      marginTop: Spacing.md,
      padding: Spacing.md,
      borderRadius: BorderRadius.lg,
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
      marginBottom: Spacing.md,
    },
    orderItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: Spacing.sm,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    itemImage: {
      width: 50,
      height: 50,
      borderRadius: BorderRadius.sm,
      backgroundColor: colors.backgroundSecondary,
    },
    itemDetails: {
      flex: 1,
      marginLeft: Spacing.md,
    },
    itemName: {
      fontSize: 13,
      fontWeight: '500',
      color: colors.text,
    },
    itemSeller: {
      fontSize: 11,
      color: colors.textSecondary,
    },
    itemPrice: {
      fontSize: 12,
      color: colors.textSecondary,
      marginTop: 2,
    },
    itemTotal: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.text,
    },
    inputContainer: {
      marginBottom: Spacing.md,
    },
    label: {
      fontSize: 14,
      fontWeight: '500',
      color: colors.text,
      marginBottom: Spacing.xs,
    },
    input: {
      backgroundColor: colors.inputBackground,
      borderRadius: BorderRadius.md,
      padding: Spacing.md,
      fontSize: 15,
      color: colors.text,
      borderWidth: 1,
      borderColor: colors.border,
    },
    textArea: {
      minHeight: 80,
      textAlignVertical: 'top',
    },
    paymentOption: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: Spacing.md,
      borderRadius: BorderRadius.md,
      borderWidth: 1,
      borderColor: colors.border,
      marginBottom: Spacing.sm,
    },
    paymentOptionActive: {
      borderColor: colors.primary,
      backgroundColor: colors.primary + '10',
    },
    paymentOptionLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.md,
    },
    paymentOptionTitle: {
      fontSize: 15,
      fontWeight: '600',
      color: colors.text,
    },
    paymentOptionDesc: {
      fontSize: 12,
      color: colors.textSecondary,
    },
    radioOuter: {
      width: 20,
      height: 20,
      borderRadius: 10,
      borderWidth: 2,
      borderColor: colors.border,
      justifyContent: 'center',
      alignItems: 'center',
    },
    radioOuterActive: {
      borderColor: colors.primary,
    },
    radioInner: {
      width: 10,
      height: 10,
      borderRadius: 5,
      backgroundColor: colors.primary,
    },
    summaryRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: Spacing.sm,
    },
    summaryLabel: {
      fontSize: 14,
      color: colors.textSecondary,
    },
    summaryValue: {
      fontSize: 14,
      color: colors.text,
    },
    totalRow: {
      borderTopWidth: 1,
      borderTopColor: colors.border,
      paddingTop: Spacing.sm,
      marginTop: Spacing.xs,
    },
    totalLabel: {
      fontSize: 16,
      fontWeight: 'bold',
      color: colors.text,
    },
    totalValue: {
      fontSize: 18,
      fontWeight: 'bold',
      color: colors.primary,
    },
    bottomBar: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: colors.card,
      padding: Spacing.md,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    totalContainer: {},
    totalLabelSmall: {
      fontSize: 12,
      color: colors.textSecondary,
    },
    totalValueLarge: {
      fontSize: 20,
      fontWeight: 'bold',
      color: colors.primary,
    },
    placeOrderButton: {
      backgroundColor: colors.primary,
      paddingHorizontal: Spacing.xl,
      paddingVertical: Spacing.md,
      borderRadius: BorderRadius.md,
    },
    placeOrderText: {
      color: '#fff',
      fontSize: 16,
      fontWeight: '600',
    },
    buttonDisabled: {
      opacity: 0.7,
    },
  });
