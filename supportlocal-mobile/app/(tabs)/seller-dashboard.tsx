import React, { useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
  ActivityIndicator,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { Colors, Spacing, BorderRadius } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAuthStore } from '@/store/authStore';
import { useSellerStore } from '@/store/sellerStore';

export default function SellerDashboardScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const user = useAuthStore((state) => state.user);
  const { dashboard, dashboardLoading, fetchDashboard, fetchQuickStats, quickStats, fetchOrderStats } = useSellerStore();

  const loadData = useCallback(() => {
    fetchDashboard();
    fetchQuickStats();
    fetchOrderStats();
  }, [fetchDashboard, fetchQuickStats, fetchOrderStats]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const formatCurrency = (amount: number) => {
    return `₱${amount.toLocaleString('en-PH', { minimumFractionDigits: 2 })}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return '#f59e0b';
      case 'confirmed':
        return '#3b82f6';
      case 'shipped':
        return '#8b5cf6';
      case 'completed':
        return '#10b981';
      case 'cancelled':
        return '#ef4444';
      default:
        return colors.textSecondary;
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      padding: Spacing.md,
      paddingTop: Spacing.lg,
    },
    greeting: {
      fontSize: 14,
      color: colors.textSecondary,
    },
    storeName: {
      fontSize: 24,
      fontWeight: 'bold',
      color: colors.text,
      marginTop: 4,
    },
    quickStatsRow: {
      flexDirection: 'row',
      paddingHorizontal: Spacing.md,
      marginBottom: Spacing.md,
      gap: Spacing.sm,
    },
    quickStatCard: {
      flex: 1,
      backgroundColor: colors.card,
      borderRadius: BorderRadius.lg,
      padding: Spacing.md,
      borderWidth: 1,
      borderColor: colors.border,
    },
    quickStatValue: {
      fontSize: 20,
      fontWeight: 'bold',
      color: colors.primary,
    },
    quickStatLabel: {
      fontSize: 12,
      color: colors.textSecondary,
      marginTop: 4,
    },
    section: {
      padding: Spacing.md,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.text,
      marginBottom: Spacing.md,
    },
    statsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: Spacing.sm,
    },
    statCard: {
      width: '48%',
      backgroundColor: colors.card,
      borderRadius: BorderRadius.lg,
      padding: Spacing.md,
      borderWidth: 1,
      borderColor: colors.border,
    },
    statHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    statValue: {
      fontSize: 24,
      fontWeight: 'bold',
      color: colors.text,
    },
    statLabel: {
      fontSize: 12,
      color: colors.textSecondary,
      marginTop: 4,
    },
    growthBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: BorderRadius.full,
    },
    growthText: {
      fontSize: 12,
      fontWeight: '600',
      marginLeft: 2,
    },
    pendingActionsCard: {
      backgroundColor: '#fef3c7',
      borderRadius: BorderRadius.lg,
      padding: Spacing.md,
      marginHorizontal: Spacing.md,
      marginBottom: Spacing.md,
    },
    pendingActionItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: Spacing.xs,
    },
    pendingActionText: {
      flex: 1,
      fontSize: 14,
      color: '#92400e',
      marginLeft: Spacing.sm,
    },
    recentOrderCard: {
      backgroundColor: colors.card,
      borderRadius: BorderRadius.lg,
      padding: Spacing.md,
      marginBottom: Spacing.sm,
      borderWidth: 1,
      borderColor: colors.border,
    },
    orderHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
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
      color: '#fff',
      textTransform: 'capitalize',
    },
    orderDetails: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: Spacing.sm,
    },
    orderImage: {
      width: 40,
      height: 40,
      borderRadius: BorderRadius.md,
      backgroundColor: colors.backgroundSecondary,
    },
    orderInfo: {
      flex: 1,
      marginLeft: Spacing.sm,
    },
    orderProductName: {
      fontSize: 14,
      color: colors.text,
    },
    orderMeta: {
      fontSize: 12,
      color: colors.textSecondary,
      marginTop: 2,
    },
    orderTotal: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.primary,
    },
    viewAllButton: {
      alignItems: 'center',
      paddingVertical: Spacing.md,
    },
    viewAllText: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.primary,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    emptyText: {
      textAlign: 'center',
      color: colors.textSecondary,
      fontSize: 14,
      padding: Spacing.lg,
    },
  });

  if (dashboardLoading && !dashboard) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.emptyText, { marginTop: Spacing.md }]}>Loading dashboard...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={dashboardLoading} onRefresh={loadData} colors={[colors.primary]} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.greeting}>Welcome back,</Text>
          <Text style={styles.storeName}>{user?.name || 'Seller'}</Text>
        </View>

        {/* Quick Stats */}
        {quickStats && (
          <View style={styles.quickStatsRow}>
            <View style={styles.quickStatCard}>
              <Text style={styles.quickStatValue}>{quickStats.today_orders}</Text>
              <Text style={styles.quickStatLabel}>Today's Orders</Text>
            </View>
            <View style={styles.quickStatCard}>
              <Text style={styles.quickStatValue}>{formatCurrency(quickStats.today_revenue)}</Text>
              <Text style={styles.quickStatLabel}>Today's Revenue</Text>
            </View>
            <View style={styles.quickStatCard}>
              <Text style={styles.quickStatValue}>{quickStats.pending_orders}</Text>
              <Text style={styles.quickStatLabel}>Pending</Text>
            </View>
          </View>
        )}

        {/* Pending Actions */}
        {dashboard?.pending_actions && dashboard.pending_actions.length > 0 && (
          <View style={styles.pendingActionsCard}>
            <Text style={[styles.sectionTitle, { color: '#92400e', marginBottom: Spacing.sm }]}>
              Action Required
            </Text>
            {dashboard.pending_actions.map((action, index) => (
              <TouchableOpacity
                key={index}
                style={styles.pendingActionItem}
                onPress={() => {
                  if (action.type === 'pending_orders' || action.type === 'unverified_payments') {
                    router.push('/seller-orders');
                  } else if (action.type === 'low_stock' || action.type === 'out_of_stock') {
                    router.push('/seller-products');
                  }
                }}
              >
                <Ionicons
                  name={action.priority === 'high' ? 'alert-circle' : 'information-circle'}
                  size={20}
                  color={action.priority === 'high' ? '#dc2626' : '#d97706'}
                />
                <Text style={styles.pendingActionText}>{action.message}</Text>
                <Ionicons name="chevron-forward" size={16} color="#92400e" />
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Stats Grid */}
        {dashboard && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Performance (Last {dashboard.period.days} days)</Text>
            <View style={styles.statsGrid}>
              <View style={styles.statCard}>
                <View style={styles.statHeader}>
                  <Text style={styles.statValue}>{dashboard.order_stats.total}</Text>
                  {dashboard.order_stats.growth !== 0 && (
                    <View
                      style={[
                        styles.growthBadge,
                        { backgroundColor: dashboard.order_stats.growth > 0 ? '#dcfce7' : '#fee2e2' },
                      ]}
                    >
                      <Ionicons
                        name={dashboard.order_stats.growth > 0 ? 'arrow-up' : 'arrow-down'}
                        size={12}
                        color={dashboard.order_stats.growth > 0 ? '#16a34a' : '#dc2626'}
                      />
                      <Text
                        style={[
                          styles.growthText,
                          { color: dashboard.order_stats.growth > 0 ? '#16a34a' : '#dc2626' },
                        ]}
                      >
                        {Math.abs(dashboard.order_stats.growth)}%
                      </Text>
                    </View>
                  )}
                </View>
                <Text style={styles.statLabel}>Total Orders</Text>
              </View>

              <View style={styles.statCard}>
                <View style={styles.statHeader}>
                  <Text style={styles.statValue}>{formatCurrency(dashboard.revenue_stats.net)}</Text>
                </View>
                <Text style={styles.statLabel}>Net Revenue</Text>
              </View>

              <View style={styles.statCard}>
                <Text style={styles.statValue}>{dashboard.product_stats.active}</Text>
                <Text style={styles.statLabel}>Active Products</Text>
              </View>

              <View style={styles.statCard}>
                <Text style={styles.statValue}>{dashboard.customer_stats.period}</Text>
                <Text style={styles.statLabel}>Customers</Text>
              </View>
            </View>
          </View>
        )}

        {/* Recent Orders */}
        {dashboard?.recent_orders && dashboard.recent_orders.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recent Orders</Text>
            {dashboard.recent_orders.map((order) => (
              <TouchableOpacity
                key={order.id}
                style={styles.recentOrderCard}
                onPress={() => router.push(`/seller-order/${order.id}`)}
              >
                <View style={styles.orderHeader}>
                  <Text style={styles.orderNumber}>{order.order_number}</Text>
                  <View style={[styles.statusBadge, { backgroundColor: getStatusColor(order.status) }]}>
                    <Text style={styles.statusText}>{order.status}</Text>
                  </View>
                </View>
                <View style={styles.orderDetails}>
                  {order.first_item?.image ? (
                    <Image source={{ uri: order.first_item.image }} style={styles.orderImage} />
                  ) : (
                    <View style={styles.orderImage} />
                  )}
                  <View style={styles.orderInfo}>
                    <Text style={styles.orderProductName} numberOfLines={1}>
                      {order.first_item?.name || 'Unknown Product'}
                      {order.items_count > 1 && ` +${order.items_count - 1} more`}
                    </Text>
                    <Text style={styles.orderMeta}>
                      {order.customer?.name || 'Guest'} • {new Date(order.created_at).toLocaleDateString()}
                    </Text>
                  </View>
                  <Text style={styles.orderTotal}>{formatCurrency(order.total)}</Text>
                </View>
              </TouchableOpacity>
            ))}
            <TouchableOpacity style={styles.viewAllButton} onPress={() => router.push('/seller-orders')}>
              <Text style={styles.viewAllText}>View All Orders →</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
