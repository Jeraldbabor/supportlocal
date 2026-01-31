import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  Alert,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as ImagePicker from 'expo-image-picker';

import { Colors, Spacing, BorderRadius } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { apiClient } from '@/services/api';
import { ENDPOINTS } from '@/constants/api';

interface OrderItem {
  id: number;
  product_id: number;
  product_name: string;
  product_image: string;
  quantity: number;
  price: number;
  subtotal: number;
}

interface Order {
  id: number;
  order_number: string;
  status: string;
  status_label: string;
  payment_method: string;
  payment_status: string;
  subtotal: number;
  shipping_fee: number;
  total: number;
  delivery_address: string;
  notes: string | null;
  tracking_number: string | null;
  shipping_provider: string | null;
  rejection_reason: string | null;
  payment_proof_url: string | null;
  seller: {
    id: number;
    name: string;
    business_name: string;
    avatar: string | null;
    phone_number: string | null;
  };
  items: OrderItem[];
  created_at: string;
  updated_at: string;
}

export default function OrderDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const queryClient = useQueryClient();

  const [uploading, setUploading] = useState(false);

  const { data: order, isLoading } = useQuery({
    queryKey: ['order', id],
    queryFn: async () => {
      const response = await apiClient.get<{ success: boolean; data: Order }>(
        ENDPOINTS.ORDERS.DETAIL(Number(id))
      );
      return response.data;
    },
  });

  const cancelMutation = useMutation({
    mutationFn: async () => {
      await apiClient.post(ENDPOINTS.ORDERS.CANCEL(Number(id)));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['order', id] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      Alert.alert('Success', 'Order cancelled successfully');
    },
    onError: (error: Error) => {
      Alert.alert('Error', error.message || 'Failed to cancel order');
    },
  });

  const handleCancel = () => {
    Alert.alert(
      'Cancel Order',
      'Are you sure you want to cancel this order?',
      [
        { text: 'No', style: 'cancel' },
        { text: 'Yes, Cancel', style: 'destructive', onPress: () => cancelMutation.mutate() },
      ]
    );
  };

  const handleUploadPaymentProof = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setUploading(true);
      try {
        const formData = new FormData();
        const uri = result.assets[0].uri;
        const filename = uri.split('/').pop() || 'payment_proof.jpg';
        
        formData.append('payment_proof', {
          uri,
          type: 'image/jpeg',
          name: filename,
        } as unknown as Blob);

        await apiClient.post(ENDPOINTS.ORDERS.PAYMENT_PROOF(Number(id)), formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });

        queryClient.invalidateQueries({ queryKey: ['order', id] });
        Alert.alert('Success', 'Payment proof uploaded successfully');
      } catch (error) {
        Alert.alert('Error', 'Failed to upload payment proof');
      } finally {
        setUploading(false);
      }
    }
  };

  const formatCurrency = (amount: number) => {
    return `₱${amount.toLocaleString('en-PH', { minimumFractionDigits: 2 })}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-PH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return { bg: '#fef3c7', text: '#d97706' };
      case 'confirmed':
        return { bg: '#dbeafe', text: '#2563eb' };
      case 'shipped':
        return { bg: '#ede9fe', text: '#7c3aed' };
      case 'completed':
        return { bg: '#dcfce7', text: '#16a34a' };
      case 'cancelled':
      case 'rejected':
        return { bg: '#fee2e2', text: '#dc2626' };
      default:
        return { bg: colors.backgroundSecondary, text: colors.textSecondary };
    }
  };

  const canCancel = order?.status === 'pending';
  const needsPaymentProof = order?.payment_method === 'gcash' && 
    order?.payment_status === 'pending' && 
    !order?.payment_proof_url;

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
    content: {
      padding: Spacing.md,
    },
    section: {
      backgroundColor: colors.card,
      borderRadius: BorderRadius.lg,
      padding: Spacing.md,
      marginBottom: Spacing.md,
      borderWidth: 1,
      borderColor: colors.border,
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
      marginBottom: Spacing.sm,
    },
    statusRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: Spacing.md,
    },
    orderNumber: {
      fontSize: 14,
      color: colors.textSecondary,
    },
    statusBadge: {
      paddingHorizontal: 12,
      paddingVertical: 4,
      borderRadius: BorderRadius.full,
    },
    statusText: {
      fontSize: 13,
      fontWeight: '600',
    },
    infoRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingVertical: Spacing.xs,
    },
    infoLabel: {
      fontSize: 14,
      color: colors.textSecondary,
    },
    infoValue: {
      fontSize: 14,
      color: colors.text,
      fontWeight: '500',
    },
    sellerCard: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    sellerAvatar: {
      width: 48,
      height: 48,
      borderRadius: 24,
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
    sellerBusiness: {
      fontSize: 13,
      color: colors.textSecondary,
    },
    contactButton: {
      padding: Spacing.sm,
    },
    itemCard: {
      flexDirection: 'row',
      paddingVertical: Spacing.sm,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    itemImage: {
      width: 60,
      height: 60,
      borderRadius: BorderRadius.sm,
      backgroundColor: colors.backgroundSecondary,
    },
    itemInfo: {
      flex: 1,
      marginLeft: Spacing.md,
    },
    itemName: {
      fontSize: 14,
      fontWeight: '500',
      color: colors.text,
      marginBottom: 4,
    },
    itemMeta: {
      fontSize: 13,
      color: colors.textSecondary,
    },
    itemPrice: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.text,
      textAlign: 'right',
    },
    totalRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingVertical: Spacing.xs,
    },
    totalLabel: {
      fontSize: 14,
      color: colors.textSecondary,
    },
    totalValue: {
      fontSize: 14,
      color: colors.text,
    },
    grandTotal: {
      fontSize: 18,
      fontWeight: 'bold',
      color: colors.primary,
    },
    grandTotalLabel: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
    },
    divider: {
      height: 1,
      backgroundColor: colors.border,
      marginVertical: Spacing.sm,
    },
    addressText: {
      fontSize: 14,
      color: colors.text,
      lineHeight: 20,
    },
    trackingInfo: {
      backgroundColor: colors.backgroundSecondary,
      padding: Spacing.md,
      borderRadius: BorderRadius.md,
      marginTop: Spacing.sm,
    },
    trackingLabel: {
      fontSize: 12,
      color: colors.textSecondary,
      marginBottom: 4,
    },
    trackingNumber: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.primary,
    },
    actionButton: {
      backgroundColor: colors.primary,
      paddingVertical: Spacing.md,
      borderRadius: BorderRadius.lg,
      alignItems: 'center',
      marginTop: Spacing.sm,
    },
    actionButtonText: {
      color: '#fff',
      fontSize: 16,
      fontWeight: '600',
    },
    cancelButton: {
      backgroundColor: 'transparent',
      borderWidth: 1,
      borderColor: colors.error,
    },
    cancelButtonText: {
      color: colors.error,
    },
    warningBox: {
      backgroundColor: '#fef3c7',
      padding: Spacing.md,
      borderRadius: BorderRadius.md,
      flexDirection: 'row',
      alignItems: 'center',
    },
    warningText: {
      flex: 1,
      marginLeft: Spacing.sm,
      fontSize: 13,
      color: '#92400e',
    },
    rejectionBox: {
      backgroundColor: '#fee2e2',
      padding: Spacing.md,
      borderRadius: BorderRadius.md,
      marginTop: Spacing.sm,
    },
    rejectionLabel: {
      fontSize: 12,
      color: '#991b1b',
      fontWeight: '600',
    },
    rejectionText: {
      fontSize: 13,
      color: '#991b1b',
      marginTop: 4,
    },
    paymentProof: {
      width: '100%',
      height: 200,
      borderRadius: BorderRadius.md,
      marginTop: Spacing.sm,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
  });

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (!order) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Order Not Found</Text>
        </View>
      </SafeAreaView>
    );
  }

  const statusColors = getStatusColor(order.status);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Order Details</Text>
      </View>

      <ScrollView style={styles.content}>
        {/* Status */}
        <View style={styles.section}>
          <View style={styles.statusRow}>
            <Text style={styles.orderNumber}>{order.order_number}</Text>
            <View style={[styles.statusBadge, { backgroundColor: statusColors.bg }]}>
              <Text style={[styles.statusText, { color: statusColors.text }]}>
                {order.status_label}
              </Text>
            </View>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Date</Text>
            <Text style={styles.infoValue}>{formatDate(order.created_at)}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Payment</Text>
            <Text style={styles.infoValue}>
              {order.payment_method === 'cod' ? 'Cash on Delivery' : 'GCash'}
            </Text>
          </View>

          {order.rejection_reason && (
            <View style={styles.rejectionBox}>
              <Text style={styles.rejectionLabel}>Rejection Reason</Text>
              <Text style={styles.rejectionText}>{order.rejection_reason}</Text>
            </View>
          )}

          {order.tracking_number && (
            <View style={styles.trackingInfo}>
              <Text style={styles.trackingLabel}>
                {order.shipping_provider || 'Tracking Number'}
              </Text>
              <Text style={styles.trackingNumber}>{order.tracking_number}</Text>
            </View>
          )}
        </View>

        {/* Payment Proof Warning */}
        {needsPaymentProof && (
          <View style={[styles.section, { backgroundColor: '#fef3c7' }]}>
            <View style={styles.warningBox}>
              <Ionicons name="warning" size={24} color="#d97706" />
              <Text style={styles.warningText}>
                Please upload your GCash payment proof to process your order.
              </Text>
            </View>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleUploadPaymentProof}
              disabled={uploading}
            >
              {uploading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.actionButtonText}>Upload Payment Proof</Text>
              )}
            </TouchableOpacity>
          </View>
        )}

        {/* Payment Proof Image */}
        {order.payment_proof_url && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Payment Proof</Text>
            <Image source={{ uri: order.payment_proof_url }} style={styles.paymentProof} />
          </View>
        )}

        {/* Seller */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Seller</Text>
          <TouchableOpacity
            style={styles.sellerCard}
            onPress={() => router.push(`/seller/${order.seller.id}`)}
          >
            <Image
              source={{ uri: order.seller.avatar || 'https://via.placeholder.com/48' }}
              style={styles.sellerAvatar}
            />
            <View style={styles.sellerInfo}>
              <Text style={styles.sellerName}>{order.seller.business_name || order.seller.name}</Text>
              <Text style={styles.sellerBusiness}>{order.seller.name}</Text>
            </View>
            {order.seller.phone_number && (
              <TouchableOpacity
                style={styles.contactButton}
                onPress={() => Linking.openURL(`tel:${order.seller.phone_number}`)}
              >
                <Ionicons name="call" size={22} color={colors.primary} />
              </TouchableOpacity>
            )}
          </TouchableOpacity>
        </View>

        {/* Items */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Items ({order.items.length})</Text>
          {order.items.map((item, index) => (
            <View
              key={item.id}
              style={[
                styles.itemCard,
                index === order.items.length - 1 && { borderBottomWidth: 0 },
              ]}
            >
              <Image source={{ uri: item.product_image }} style={styles.itemImage} />
              <View style={styles.itemInfo}>
                <Text style={styles.itemName} numberOfLines={2}>{item.product_name}</Text>
                <Text style={styles.itemMeta}>
                  {formatCurrency(item.price)} × {item.quantity}
                </Text>
              </View>
              <Text style={styles.itemPrice}>{formatCurrency(item.subtotal)}</Text>
            </View>
          ))}

          <View style={styles.divider} />

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Subtotal</Text>
            <Text style={styles.totalValue}>{formatCurrency(order.subtotal)}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Shipping</Text>
            <Text style={styles.totalValue}>{formatCurrency(order.shipping_fee)}</Text>
          </View>
          <View style={[styles.totalRow, { marginTop: Spacing.sm }]}>
            <Text style={styles.grandTotalLabel}>Total</Text>
            <Text style={styles.grandTotal}>{formatCurrency(order.total)}</Text>
          </View>
        </View>

        {/* Delivery Address */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Delivery Address</Text>
          <Text style={styles.addressText}>{order.delivery_address}</Text>
          {order.notes && (
            <>
              <View style={styles.divider} />
              <Text style={styles.infoLabel}>Notes</Text>
              <Text style={styles.addressText}>{order.notes}</Text>
            </>
          )}
        </View>

        {/* Actions */}
        {canCancel && (
          <TouchableOpacity
            style={[styles.actionButton, styles.cancelButton]}
            onPress={handleCancel}
            disabled={cancelMutation.isPending}
          >
            {cancelMutation.isPending ? (
              <ActivityIndicator color={colors.error} />
            ) : (
              <Text style={[styles.actionButtonText, styles.cancelButtonText]}>Cancel Order</Text>
            )}
          </TouchableOpacity>
        )}

        <View style={{ height: Spacing.xl }} />
      </ScrollView>
    </SafeAreaView>
  );
}
