import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';

import { Colors, Spacing, BorderRadius } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAuthStore } from '@/store/authStore';

type IconName = React.ComponentProps<typeof Ionicons>['name'];

interface MenuItem {
  icon: IconName;
  label: string;
  onPress: () => void;
  showArrow?: boolean;
  color?: string;
}

export default function ProfileScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const styles = createStyles(colors);

  const { user, isAuthenticated, logout } = useAuthStore();

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await logout();
            router.replace('/(tabs)');
          },
        },
      ]
    );
  };

  const menuItems: MenuItem[] = [
    {
      icon: 'heart-outline',
      label: 'Wishlist',
      onPress: () => router.push('/wishlist'),
      showArrow: true,
    },
    {
      icon: 'location-outline',
      label: 'Delivery Address',
      onPress: () => router.push('/address'),
      showArrow: true,
    },
    {
      icon: 'notifications-outline',
      label: 'Notifications',
      onPress: () => router.push('/notifications'),
      showArrow: true,
    },
    {
      icon: 'shield-checkmark-outline',
      label: 'Security',
      onPress: () => router.push('/security'),
      showArrow: true,
    },
    {
      icon: 'help-circle-outline',
      label: 'Help & Support',
      onPress: () => router.push('/support'),
      showArrow: true,
    },
    {
      icon: 'document-text-outline',
      label: 'Terms & Privacy',
      onPress: () => router.push('/terms'),
      showArrow: true,
    },
  ];

  if (!isAuthenticated) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <Text style={styles.title}>Profile</Text>
        </View>
        <View style={styles.guestContainer}>
          <View style={styles.guestAvatar}>
            <Ionicons name="person-outline" size={60} color={colors.textSecondary} />
          </View>
          <Text style={styles.guestTitle}>Welcome to SupportLocal</Text>
          <Text style={styles.guestSubtitle}>
            Sign in to access your profile and orders
          </Text>
          <TouchableOpacity
            style={styles.signInButton}
            onPress={() => router.push('/(auth)/login')}
          >
            <Text style={styles.signInButtonText}>Sign In</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.registerButton}
            onPress={() => router.push('/(auth)/register')}
          >
            <Text style={styles.registerButtonText}>Create Account</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Profile</Text>
        </View>

        {/* User Info Card */}
        <TouchableOpacity style={styles.userCard} onPress={() => router.push('/edit-profile')}>
          <Image
            source={{ uri: user?.avatar_url }}
            style={styles.avatar}
            contentFit="cover"
          />
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{user?.name}</Text>
            <Text style={styles.userEmail}>{user?.email}</Text>
            <View style={styles.roleBadge}>
              <Text style={styles.roleText}>{user?.role_display}</Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={24} color={colors.textSecondary} />
        </TouchableOpacity>

        {/* Profile Completion */}
        {user?.profile_completion && !user.profile_completion.is_complete && (
          <TouchableOpacity
            style={styles.completionCard}
            onPress={() => router.push('/edit-profile')}
          >
            <View style={styles.completionHeader}>
              <Ionicons name="alert-circle" size={24} color={colors.warning} />
              <Text style={styles.completionTitle}>Complete Your Profile</Text>
            </View>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${user.profile_completion.percentage}%` },
                ]}
              />
            </View>
            <Text style={styles.completionText}>
              {user.profile_completion.percentage}% complete
            </Text>
          </TouchableOpacity>
        )}

        {/* Quick Stats */}
        <View style={styles.statsContainer}>
          <TouchableOpacity
            style={styles.statItem}
            onPress={() => router.push('/(tabs)/orders')}
          >
            <Text style={styles.statValue}>-</Text>
            <Text style={styles.statLabel}>Orders</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.statItem}
            onPress={() => router.push('/wishlist')}
          >
            <Text style={styles.statValue}>-</Text>
            <Text style={styles.statLabel}>Wishlist</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.statItem}
            onPress={() => router.push('/(tabs)/cart')}
          >
            <Text style={styles.statValue}>-</Text>
            <Text style={styles.statLabel}>Cart</Text>
          </TouchableOpacity>
        </View>

        {/* Menu Items */}
        <View style={styles.menuContainer}>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.menuItem}
              onPress={item.onPress}
            >
              <View style={styles.menuItemLeft}>
                <Ionicons
                  name={item.icon}
                  size={22}
                  color={item.color || colors.text}
                />
                <Text style={[styles.menuItemLabel, item.color && { color: item.color }]}>
                  {item.label}
                </Text>
              </View>
              {item.showArrow && (
                <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={22} color={colors.error} />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>

        {/* App Version */}
        <Text style={styles.versionText}>SupportLocal v1.0.0</Text>

        <View style={{ height: Spacing.xxl }} />
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
      paddingHorizontal: Spacing.lg,
      paddingVertical: Spacing.md,
    },
    title: {
      fontSize: 28,
      fontWeight: 'bold',
      color: colors.text,
    },
    guestContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: Spacing.xl,
    },
    guestAvatar: {
      width: 120,
      height: 120,
      borderRadius: 60,
      backgroundColor: colors.inputBackground,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: Spacing.lg,
    },
    guestTitle: {
      fontSize: 22,
      fontWeight: 'bold',
      color: colors.text,
      marginBottom: Spacing.sm,
    },
    guestSubtitle: {
      fontSize: 14,
      color: colors.textSecondary,
      textAlign: 'center',
      marginBottom: Spacing.xl,
    },
    signInButton: {
      backgroundColor: colors.primary,
      paddingHorizontal: Spacing.xxl,
      paddingVertical: Spacing.md,
      borderRadius: BorderRadius.md,
      width: '100%',
      alignItems: 'center',
      marginBottom: Spacing.md,
    },
    signInButtonText: {
      color: '#fff',
      fontSize: 16,
      fontWeight: '600',
    },
    registerButton: {
      backgroundColor: 'transparent',
      paddingHorizontal: Spacing.xxl,
      paddingVertical: Spacing.md,
      borderRadius: BorderRadius.md,
      borderWidth: 1,
      borderColor: colors.primary,
      width: '100%',
      alignItems: 'center',
    },
    registerButtonText: {
      color: colors.primary,
      fontSize: 16,
      fontWeight: '600',
    },
    userCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.card,
      marginHorizontal: Spacing.lg,
      padding: Spacing.md,
      borderRadius: BorderRadius.lg,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      elevation: 2,
    },
    avatar: {
      width: 64,
      height: 64,
      borderRadius: 32,
      backgroundColor: colors.backgroundSecondary,
    },
    userInfo: {
      flex: 1,
      marginLeft: Spacing.md,
    },
    userName: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.text,
    },
    userEmail: {
      fontSize: 13,
      color: colors.textSecondary,
      marginTop: 2,
    },
    roleBadge: {
      backgroundColor: colors.primary + '20',
      paddingHorizontal: Spacing.sm,
      paddingVertical: 2,
      borderRadius: BorderRadius.sm,
      alignSelf: 'flex-start',
      marginTop: Spacing.xs,
    },
    roleText: {
      fontSize: 11,
      color: colors.primary,
      fontWeight: '600',
    },
    completionCard: {
      backgroundColor: colors.warning + '15',
      marginHorizontal: Spacing.lg,
      marginTop: Spacing.md,
      padding: Spacing.md,
      borderRadius: BorderRadius.lg,
      borderWidth: 1,
      borderColor: colors.warning + '30',
    },
    completionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.sm,
      marginBottom: Spacing.sm,
    },
    completionTitle: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.text,
    },
    progressBar: {
      height: 6,
      backgroundColor: colors.border,
      borderRadius: 3,
      overflow: 'hidden',
    },
    progressFill: {
      height: '100%',
      backgroundColor: colors.warning,
      borderRadius: 3,
    },
    completionText: {
      fontSize: 12,
      color: colors.textSecondary,
      marginTop: Spacing.xs,
    },
    statsContainer: {
      flexDirection: 'row',
      marginHorizontal: Spacing.lg,
      marginTop: Spacing.lg,
      backgroundColor: colors.card,
      borderRadius: BorderRadius.lg,
      padding: Spacing.md,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      elevation: 2,
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
    menuContainer: {
      backgroundColor: colors.card,
      marginHorizontal: Spacing.lg,
      marginTop: Spacing.lg,
      borderRadius: BorderRadius.lg,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      elevation: 2,
    },
    menuItem: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: Spacing.md,
      paddingVertical: Spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    menuItemLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.md,
    },
    menuItemLabel: {
      fontSize: 15,
      color: colors.text,
    },
    logoutButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: Spacing.sm,
      marginHorizontal: Spacing.lg,
      marginTop: Spacing.lg,
      padding: Spacing.md,
      backgroundColor: colors.error + '10',
      borderRadius: BorderRadius.lg,
      borderWidth: 1,
      borderColor: colors.error + '30',
    },
    logoutText: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.error,
    },
    versionText: {
      textAlign: 'center',
      fontSize: 12,
      color: colors.textSecondary,
      marginTop: Spacing.lg,
    },
  });
