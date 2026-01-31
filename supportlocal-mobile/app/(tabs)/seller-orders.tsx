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
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { Colors, Spacing, BorderRadius } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useSellerStore } from '@/store/sellerStore';
import type { SellerOrder } from '@/types';

const STATUS_FILTERS = [
  { key: 'all', label: 'All', icon: 'list' },
  { key: 'pending', label: 'Pending', icon: 'time' },
  { key: 'confirmed', label: 'Confirmed', icon: 'checkmark-circle' },
  { key: 'shipped', label: 'Shipped', icon: 'airplane' },
  { key: 'completed', label: 'Completed', icon: 'checkmark-done-circle' },
  { key: 'cancelled', label: 'Cancelled', icon: 'close-circle' },
];

export default function SellerOrdersScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const {
    orders,
    ordersLoading,
    orderStats,
    fetchOrders,
    fetchOrderStats,
    confirmOrder,
    rejectOrder,
    shipOrder,
    completeOrder,
    verifyPayment,
  } = useSellerStore();

  const [selectedStatus, setSelectedStatus] = useState('all');
  const [refreshing, setRefreshing] = useState(false);

  const loadOrders = useCallback((params: Record<string, unknown> = {}) => {
    const queryParams: Record<string, unknown> = { ...params };
    
    if (selectedStatus !== 'all') {
      queryParams.status = selectedStatus;
    }
    
    fetchOrders(queryParams);
  }, [fetchOrders, selectedStatus]);

  useEffect(() => {
    loadOrders();
    fetchOrderStats();
  }, [selectedStatus]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadOrders();
    await fetchOrderStats();
    setRefreshing(false);
  };

  const formatCurrency = (amount: number) => {
    return `₱${amount.toLocaleString('en-PH', { minimumFractionDigits: 2 })}`;
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
        return { bg: '#fee2e2', text: '#dc2626' };
      default:
        return { bg: colors.backgroundSecondary, text: colors.textSecondary };
    }
  };

  const handleConfirmOrder = (order: SellerOrder) => {
    Alert.alert(
      'Confirm Order',
      `Confirm order ${order.order_number}? This will reduce product stock.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: async () => {
            const success = await confirmOrder(order.id);
            if (!success) {
              Alert.alert('Error', 'Failed to confirm order. Please check stock availability.');
            }
          },
        },
      ]
    );
  };

  const handleRejectOrder = (order: SellerOrder) => {
    Alert.alert(
      'Reject Order',
      `Are you sure you want to reject order ${order.order_number}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reject',
          style: 'destructive',
          onPress: async () => {
            const success = await rejectOrder(order.id, 'Order rejected by seller');
            if (!success) {
              Alert.alert('Error', 'Failed to reject order');
            }
          },
        },
      ]
    );
  };

  const handleShipOrder = (order: SellerOrder) => {
    Alert.alert(
      'Ship Order',
      `Mark order ${order.order_number} as shipped?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Ship',
          onPress: async () => {
            const success = await shipOrder(order.id);
            if (!success) {
              Alert.alert('Error', 'Failed to update order status');
            }
          },
        },
      ]
    );
  };

  const handleCompleteOrder = (order: SellerOrder) => {
    Alert.alert(
      'Complete Order',
      `Mark order ${order.order_number} as completed?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Complete',
          onPress: async () => {
            const success = await completeOrder(order.id);
            if (!success) {
              Alert.alert('Error', 'Failed to complete order');
            }
          },
        },
      ]
    );
  };

  const handleVerifyPayment = (order: SellerOrder) => {
    Alert.alert(
      'Verify Payment',
      `Verify payment for order ${order.order_number}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Verify',
          onPress: async () => {
            const success = await verifyPayment(order.id);
            if (!success) {
              Alert.alert('Error', 'Failed to verify payment');
            }
          },
        },
      ]
    );
  };

  const getOrderActions = (order: SellerOrder) => {
    const actions: { label: string; icon: string; color: string; onPress: () => void }[] = [];
    
    if (order.payment_method === 'gcash' && order.has_payment_proof && order.payment_status === 'pending') {
      actions.push({
        label: 'Verify Payment',
        icon: 'checkmark-circle',
        color: '#16a34a',
        onPress: () => handleVerifyPayment(order),
      });
    }
    
    switch (order.status) {
      case 'pending':
        actions.push({
          label: 'Confirm',
          icon: 'checkmark',
          color: '#16a34a',
          onPress: () => handleConfirmOrder(order),
        });
        actions.push({
          label: 'Reject',
          icon: 'close',
          color: '#dc2626',
          onPress: () => handleRejectOrder(order),
        });
        break;
      case 'confirmed':
        actions.push({
          label: 'Ship',
          icon: 'airplane',
          color: '#7c3aed',
          onPress: () => handleShipOrder(order),
        });
        break;
      case 'shipped':
        actions.push({
          label: 'Complete',
          icon: 'checkmark-done',
          color: '#16a34a',
          onPress: () => handleCompleteOrder(order),
        });
        break;
    }
    
    return actions;
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
    statsRow: {
      flexDirection: 'row',
      marginBottom: Spacing.md,
      gap: Spacing.sm,
    },
    statCard: {
      flex: 1,
      backgroundColor: colors.backgroundSecondary,
      borderRadius: BorderRadius.md,
      padding: Spacing.sm,
      alignItems: 'center',
    },
    statValue: {
      fontSize: 18,
      fontWeight: 'bold',
      color: colors.text,
    },
    statLabel: {
      fontSize: 10,
      color: colors.textSecondary,
      marginTop: 2,
    },
    filterScroll: {
      flexDirection: 'row',
      gap: Spacing.xs,
    },
    filterChip: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: Spacing.md,
      paddingVertical: Spacing.xs,
      borderRadius: BorderRadius.full,
      borderWidth: 1,
      gap: 4,
    },
    filterChipText: {
      fontSize: 14,
      fontWeight: '500',
    },
    orderCard: {
      backgroundColor: colors.card,
      marginHorizontal: Spacing.md,
      marginVertical: Spacing.xs,
      borderRadius: BorderRadius.lg,
      padding: Spacing.md,
      borderWidth: 1,
      borderColor: colors.border,
    },
    orderHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: Spacing.sm,
    },
    orderNumber: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.text,
    },
    statusBadge: {
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: BorderRadius.full,
    },
    statusText: {
      fontSize: 12,
      fontWeight: '500',
      textTransform: 'capitalize',
    },
    orderContent: {
      flexDirection: 'row',
      marginBottom: Spacing.sm,
    },
    orderImage: {
      width: 60,
      height: 60,
      borderRadius: BorderRadius.md,
      backgroundColor: colors.backgroundSecondary,
    },
    orderInfo: {
      flex: 1,
      marginLeft: Spacing.md,
    },
    productName: {
      fontSize: 14,
      color: colors.text,
      marginBottom: 4,
    },
    customerName: {
      fontSize: 12,
      color: colors.textSecondary,
      marginBottom: 2,
    },
    orderDate: {
      fontSize: 12,
      color: colors.textSecondary,
    },
    orderFooter: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingTop: Spacing.sm,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    orderTotal: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.primary,
    },
    paymentBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    paymentText: {
      fontSize: 12,
      color: colors.textSecondary,
      textTransform: 'uppercase',
    },
    actionsContainer: {
      flexDirection: 'row',
      gap: Spacing.sm,
      marginTop: Spacing.sm,
      paddingTop: Spacing.sm,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    actionButton: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: Spacing.sm,
      borderRadius: BorderRadius.md,
      gap: 4,
    },
    actionText: {
      fontSize: 14,
      fontWeight: '600',
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
  });

  const renderOrder = ({ item }: { item: SellerOrder }) => {
    const statusColors = getStatusColor(item.status);
    const actions = getOrderActions(item);
    
    return (
      <TouchableOpacity
        style={styles.orderCard}
        onPress={() => router.push(`/seller-order/${item.id}`)}
      >
        <View style={styles.orderHeader}>
          <Text style={styles.orderNumber}>{item.order_number}</Text>
          <View style={[styles.statusBadge, { backgroundColor: statusColors.bg }]}>
            <Text style={[styles.statusText, { color: statusColors.text }]}>{item.status}</Text>
          </View>
        </View>
        
        <View style={styles.orderContent}>
          {item.first_item?.image ? (
            <Image source={{ uri: item.first_item.image }} style={styles.orderImage} />
          ) : (
            <View style={styles.orderImage} />
          )}
          <View style={styles.orderInfo}>
            <Text style={styles.productName} numberOfLines={1}>
              {item.first_item?.name || 'Unknown Product'}
              {item.items_count > 1 && ` +${item.items_count - 1} more`}
            </Text>
            <Text style={styles.customerName}>
              {item.customer?.name || 'Guest'}
            </Text>
            <Text style={styles.orderDate}>
              {new Date(item.created_at).toLocaleDateString('en-PH', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </Text>
          </View>
        </View>
        
        <View style={styles.orderFooter}>
          <Text style={styles.orderTotal}>{formatCurrency(item.seller_total)}</Text>
          <View style={styles.paymentBadge}>
            {item.payment_method === 'gcash' && item.has_payment_proof && item.payment_status === 'pending' && (
              <Ionicons name="alert-circle" size={16} color="#d97706" />
            )}
            <Text style={styles.paymentText}>{item.payment_method}</Text>
            {item.payment_status === 'paid' && (
              <Ionicons name="checkmark-circle" size={16} color="#16a34a" />
            )}
          </View>
        </View>
        
        {actions.length > 0 && (
          <View style={styles.actionsContainer}>
            {actions.map((action, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.actionButton,
                  { backgroundColor: `${action.color}15` },
                ]}
                onPress={(e) => {
                  e.stopPropagation();
                  action.onPress();
                }}
              >
                <Ionicons name={action.icon as keyof typeof Ionicons.glyphMap} size={16} color={action.color} />
                <Text style={[styles.actionText, { color: action.color }]}>{action.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </TouchableOpacity>
    );
  };

  if (ordersLoading && orders.length === 0) {
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
        <Text style={styles.title}>Orders</Text>
        
        {/* Quick Stats */}
        {orderStats && (
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Text style={[styles.statValue, { color: '#d97706' }]}>{orderStats.pending}</Text>
              <Text style={styles.statLabel}>Pending</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={[styles.statValue, { color: '#2563eb' }]}>{orderStats.confirmed}</Text>
              <Text style={styles.statLabel}>Confirmed</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={[styles.statValue, { color: '#7c3aed' }]}>{orderStats.shipped}</Text>
              <Text style={styles.statLabel}>Shipped</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={[styles.statValue, { color: '#16a34a' }]}>{orderStats.completed}</Text>
              <Text style={styles.statLabel}>Completed</Text>
            </View>
          </View>
        )}
        
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
                <Ionicons
                  name={item.icon as keyof typeof Ionicons.glyphMap}
                  size={14}
                  color={isActive ? '#fff' : colors.textSecondary}
                />
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

      {/* Orders List */}
      <FlatList
        data={orders}
        renderItem={renderOrder}
        keyExtractor={(item) => item.id.toString()}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="receipt-outline" size={64} color={colors.textSecondary} />
            <Text style={styles.emptyText}>
              No orders found.{'\n'}Orders will appear here when customers make purchases.
            </Text>
          </View>
        }
        contentContainerStyle={orders.length === 0 ? { flex: 1 } : { paddingVertical: Spacing.sm }}
      />
    </SafeAreaView>
  );
}
