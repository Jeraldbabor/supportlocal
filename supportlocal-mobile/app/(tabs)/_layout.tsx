import { Tabs } from 'expo-router';
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useCartStore } from '@/store/cartStore';
import { useAuthStore } from '@/store/authStore';
import { useSellerStore } from '@/store/sellerStore';

function CartBadge({ color }: { color: string }) {
  const cart = useCartStore((state) => state.cart);
  const count = cart?.items_count ?? 0;

  return (
    <View>
      <IconSymbol size={28} name="cart.fill" color={color} />
      {count > 0 && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{count > 99 ? '99+' : count}</Text>
        </View>
      )}
    </View>
  );
}

function SellerOrdersBadge({ color }: { color: string }) {
  const orderStats = useSellerStore((state) => state.orderStats);
  const pendingCount = orderStats?.pending ?? 0;

  return (
    <View>
      <IconSymbol size={28} name="list.bullet.rectangle.fill" color={color} />
      {pendingCount > 0 && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{pendingCount > 99 ? '99+' : pendingCount}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    position: 'absolute',
    right: -8,
    top: -4,
    backgroundColor: '#dc2626',
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
});

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const user = useAuthStore((state) => state.user);
  const isSeller = user?.role === 'seller';

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.tint,
        tabBarInactiveTintColor: colors.tabIconDefault,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarStyle: {
          backgroundColor: colors.background,
          borderTopColor: colors.border,
        },
      }}>
      {/* Home tab - always visible */}
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,
        }}
      />
      
      {/* Seller Dashboard - only for sellers */}
      <Tabs.Screen
        name="seller-dashboard"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="square.grid.2x2.fill" color={color} />,
          href: isSeller ? '/seller-dashboard' : null,
        }}
      />
      
      {/* Seller Products - only for sellers */}
      <Tabs.Screen
        name="seller-products"
        options={{
          title: 'My Products',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="square.grid.2x2.fill" color={color} />,
          href: isSeller ? '/seller-products' : null,
        }}
      />
      
      {/* Seller Orders - only for sellers */}
      <Tabs.Screen
        name="seller-orders"
        options={{
          title: 'Orders',
          tabBarIcon: ({ color }) => <SellerOrdersBadge color={color} />,
          href: isSeller ? '/seller-orders' : null,
        }}
      />
      
      {/* Browse Products - only for buyers */}
      <Tabs.Screen
        name="products"
        options={{
          title: 'Products',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="square.grid.2x2.fill" color={color} />,
          href: !isSeller ? '/products' : null,
        }}
      />
      
      {/* Cart - only for buyers */}
      <Tabs.Screen
        name="cart"
        options={{
          title: 'Cart',
          tabBarIcon: ({ color }) => <CartBadge color={color} />,
          href: !isSeller ? '/cart' : null,
        }}
      />
      
      {/* Buyer Orders - only for buyers */}
      <Tabs.Screen
        name="orders"
        options={{
          title: 'Orders',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="list.bullet.rectangle.fill" color={color} />,
          href: !isSeller ? '/orders' : null,
        }}
      />
      
      {/* Custom Orders - only for buyers (bidding feature) */}
      <Tabs.Screen
        name="custom-orders"
        options={{
          title: 'Custom',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="star.fill" color={color} />,
          href: !isSeller ? '/custom-orders' : null,
        }}
      />
      
      {/* Marketplace - only for sellers (bidding feature) */}
      <Tabs.Screen
        name="marketplace"
        options={{
          title: 'Marketplace',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="star.fill" color={color} />,
          href: isSeller ? '/marketplace' : null,
        }}
      />
      
      {/* Messages - always visible for authenticated users */}
      <Tabs.Screen
        name="messages"
        options={{
          title: 'Messages',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="envelope.fill" color={color} />,
        }}
      />
      
      {/* Wishlist - only for buyers */}
      <Tabs.Screen
        name="wishlist"
        options={{
          title: 'Wishlist',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="heart.fill" color={color} />,
          href: !isSeller ? '/wishlist' : null,
        }}
      />
      
      {/* Profile - always visible */}
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="person.fill" color={color} />,
        }}
      />
      
      {/* Hide explore tab */}
      <Tabs.Screen
        name="explore"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}
