import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  TextInput,
  Alert,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { Colors, Spacing, BorderRadius } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import apiClient from '@/services/api';
import { ENDPOINTS } from '@/constants/api';

interface MarketplaceRequest {
  id: number;
  request_number: string;
  title: string;
  category: string;
  category_label: string;
  description: string;
  budget_min: number;
  budget_max: number;
  quantity: number;
  preferred_deadline: string | null;
  special_requirements: string | null;
  reference_images: string[];
  status: string;
  is_public: boolean;
  buyer: {
    name: string;
    avatar: string | null;
  };
  can_bid: boolean;
  my_bid: {
    id: number;
    proposed_price: number;
    estimated_days: number;
    message: string;
    status: string;
    can_withdraw: boolean;
    created_at: string;
  } | null;
  created_at: string;
}

export default function MarketplaceRequestDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const queryClient = useQueryClient();

  const [showBidModal, setShowBidModal] = useState(false);
  const [proposedPrice, setProposedPrice] = useState('');
  const [estimatedDays, setEstimatedDays] = useState('');
  const [message, setMessage] = useState('');
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);

  const { data: request, isLoading } = useQuery({
    queryKey: ['marketplace-request', id],
    queryFn: async () => {
      const response = await apiClient.get<{ success: boolean; data: MarketplaceRequest }>(
        ENDPOINTS.SELLER.MARKETPLACE.DETAIL(Number(id))
      );
      return response.data;
    },
  });

  const submitBidMutation = useMutation({
    mutationFn: async () => {
      await apiClient.post(ENDPOINTS.SELLER.MARKETPLACE.SUBMIT_BID(Number(id)), {
        proposed_price: Number(proposedPrice),
        estimated_days: Number(estimatedDays),
        message,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['marketplace-request', id] });
      queryClient.invalidateQueries({ queryKey: ['marketplace'] });
      setShowBidModal(false);
      Alert.alert('Success', 'Your bid has been submitted!');
    },
    onError: (error: Error) => {
      Alert.alert('Error', error.message || 'Failed to submit bid');
    },
  });

  const withdrawBidMutation = useMutation({
    mutationFn: async () => {
      await apiClient.post(ENDPOINTS.SELLER.MY_BIDS.WITHDRAW(request!.my_bid!.id));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['marketplace-request', id] });
      queryClient.invalidateQueries({ queryKey: ['marketplace'] });
      Alert.alert('Success', 'Your bid has been withdrawn.');
    },
    onError: (error: Error) => {
      Alert.alert('Error', error.message || 'Failed to withdraw bid');
    },
  });

  const handleSubmitBid = () => {
    if (!proposedPrice || Number(proposedPrice) <= 0) {
      Alert.alert('Error', 'Please enter a valid price');
      return;
    }
    if (!estimatedDays || Number(estimatedDays) <= 0) {
      Alert.alert('Error', 'Please enter estimated days');
      return;
    }
    if (!message.trim()) {
      Alert.alert('Error', 'Please enter a message for the buyer');
      return;
    }
    submitBidMutation.mutate();
  };

  const handleWithdrawBid = () => {
    Alert.alert(
      'Withdraw Bid',
      'Are you sure you want to withdraw your bid?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Withdraw', style: 'destructive', onPress: () => withdrawBidMutation.mutate() },
      ]
    );
  };

  const formatCurrency = (amount: number) => {
    return `₱${amount.toLocaleString('en-PH', { minimumFractionDigits: 0 })}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-PH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getBidStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return { bg: '#fef3c7', text: '#d97706' };
      case 'accepted':
        return { bg: '#dcfce7', text: '#16a34a' };
      case 'rejected':
        return { bg: '#fee2e2', text: '#dc2626' };
      default:
        return { bg: colors.backgroundSecondary, text: colors.textSecondary };
    }
  };

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
    title: {
      fontSize: 20,
      fontWeight: 'bold',
      color: colors.text,
      marginBottom: Spacing.sm,
    },
    categoryBadge: {
      backgroundColor: colors.backgroundSecondary,
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: BorderRadius.full,
      alignSelf: 'flex-start',
      marginBottom: Spacing.md,
    },
    categoryText: {
      fontSize: 13,
      color: colors.textSecondary,
    },
    description: {
      fontSize: 15,
      color: colors.text,
      lineHeight: 22,
    },
    infoRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: Spacing.xs,
    },
    infoIcon: {
      width: 32,
    },
    infoLabel: {
      flex: 1,
      fontSize: 14,
      color: colors.textSecondary,
    },
    infoValue: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.text,
    },
    budgetText: {
      fontSize: 18,
      fontWeight: 'bold',
      color: colors.primary,
    },
    buyerCard: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    buyerAvatar: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: colors.backgroundSecondary,
    },
    buyerName: {
      marginLeft: Spacing.md,
      fontSize: 15,
      fontWeight: '600',
      color: colors.text,
    },
    imagesScroll: {
      flexDirection: 'row',
      gap: Spacing.sm,
    },
    referenceImage: {
      width: 120,
      height: 120,
      borderRadius: BorderRadius.md,
    },
    requirements: {
      fontSize: 14,
      color: colors.text,
      lineHeight: 20,
      fontStyle: 'italic',
    },
    myBidCard: {
      backgroundColor: colors.accentLight,
    },
    bidHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: Spacing.sm,
    },
    bidStatus: {
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: BorderRadius.full,
    },
    bidStatusText: {
      fontSize: 12,
      fontWeight: '600',
    },
    bidPrice: {
      fontSize: 24,
      fontWeight: 'bold',
      color: colors.primary,
    },
    bidMeta: {
      fontSize: 13,
      color: colors.textSecondary,
      marginTop: 4,
    },
    bidMessage: {
      fontSize: 14,
      color: colors.text,
      marginTop: Spacing.sm,
      lineHeight: 20,
    },
    withdrawButton: {
      marginTop: Spacing.md,
      padding: Spacing.sm,
      borderRadius: BorderRadius.md,
      borderWidth: 1,
      borderColor: colors.error,
      alignItems: 'center',
    },
    withdrawButtonText: {
      color: colors.error,
      fontWeight: '600',
    },
    submitBidButton: {
      backgroundColor: colors.primary,
      paddingVertical: Spacing.md,
      borderRadius: BorderRadius.lg,
      alignItems: 'center',
      margin: Spacing.md,
    },
    submitBidButtonText: {
      color: '#fff',
      fontSize: 16,
      fontWeight: '600',
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'flex-end',
    },
    modalContent: {
      backgroundColor: colors.card,
      borderTopLeftRadius: BorderRadius.xl,
      borderTopRightRadius: BorderRadius.xl,
      padding: Spacing.lg,
      maxHeight: '80%',
    },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: Spacing.lg,
    },
    modalTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: colors.text,
    },
    inputLabel: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.text,
      marginBottom: Spacing.xs,
      marginTop: Spacing.md,
    },
    input: {
      backgroundColor: colors.inputBackground,
      borderRadius: BorderRadius.md,
      padding: Spacing.md,
      fontSize: 16,
      color: colors.text,
      borderWidth: 1,
      borderColor: colors.border,
    },
    textArea: {
      height: 100,
      textAlignVertical: 'top',
    },
    row: {
      flexDirection: 'row',
      gap: Spacing.md,
    },
    halfInput: {
      flex: 1,
    },
    budgetHint: {
      fontSize: 12,
      color: colors.textSecondary,
      marginTop: 4,
    },
    modalSubmitButton: {
      backgroundColor: colors.primary,
      paddingVertical: Spacing.md,
      borderRadius: BorderRadius.lg,
      alignItems: 'center',
      marginTop: Spacing.lg,
    },
    imageModal: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.9)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    fullImage: {
      width: '100%',
      height: '80%',
    },
    closeImageButton: {
      position: 'absolute',
      top: 50,
      right: 20,
      padding: Spacing.md,
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

  if (!request) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Request Not Found</Text>
        </View>
      </SafeAreaView>
    );
  }

  const bidStatusColors = request.my_bid ? getBidStatusColor(request.my_bid.status) : null;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{request.request_number}</Text>
      </View>

      <ScrollView>
        <View style={styles.content}>
          {/* Main Info */}
          <View style={styles.section}>
            <Text style={styles.title}>{request.title}</Text>
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryText}>{request.category_label}</Text>
            </View>
            <Text style={styles.description}>{request.description}</Text>
          </View>

          {/* Budget & Details */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Budget & Requirements</Text>
            <View style={styles.infoRow}>
              <Ionicons name="cash-outline" size={20} color={colors.primary} style={styles.infoIcon} />
              <Text style={styles.infoLabel}>Budget Range</Text>
              <Text style={styles.budgetText}>
                {formatCurrency(request.budget_min)} - {formatCurrency(request.budget_max)}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Ionicons name="cube-outline" size={20} color={colors.textSecondary} style={styles.infoIcon} />
              <Text style={styles.infoLabel}>Quantity</Text>
              <Text style={styles.infoValue}>{request.quantity} item(s)</Text>
            </View>
            {request.preferred_deadline && (
              <View style={styles.infoRow}>
                <Ionicons name="calendar-outline" size={20} color={colors.textSecondary} style={styles.infoIcon} />
                <Text style={styles.infoLabel}>Preferred Deadline</Text>
                <Text style={styles.infoValue}>{formatDate(request.preferred_deadline)}</Text>
              </View>
            )}
            <View style={styles.infoRow}>
              <Ionicons name="time-outline" size={20} color={colors.textSecondary} style={styles.infoIcon} />
              <Text style={styles.infoLabel}>Posted</Text>
              <Text style={styles.infoValue}>{formatDate(request.created_at)}</Text>
            </View>
          </View>

          {/* Special Requirements */}
          {request.special_requirements && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Special Requirements</Text>
              <Text style={styles.requirements}>{request.special_requirements}</Text>
            </View>
          )}

          {/* Reference Images */}
          {request.reference_images && request.reference_images.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Reference Images</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.imagesScroll}>
                  {request.reference_images.map((image, index) => (
                    <TouchableOpacity key={index} onPress={() => setSelectedImageIndex(index)}>
                      <Image source={{ uri: image }} style={styles.referenceImage} />
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </View>
          )}

          {/* Buyer */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Requested By</Text>
            <View style={styles.buyerCard}>
              <Image
                source={{ uri: request.buyer.avatar || 'https://via.placeholder.com/48' }}
                style={styles.buyerAvatar}
              />
              <Text style={styles.buyerName}>{request.buyer.name}</Text>
            </View>
          </View>

          {/* My Bid */}
          {request.my_bid && (
            <View style={[styles.section, styles.myBidCard]}>
              <View style={styles.bidHeader}>
                <Text style={styles.sectionTitle}>Your Bid</Text>
                <View style={[styles.bidStatus, { backgroundColor: bidStatusColors?.bg }]}>
                  <Text style={[styles.bidStatusText, { color: bidStatusColors?.text }]}>
                    {request.my_bid.status.toUpperCase()}
                  </Text>
                </View>
              </View>
              <Text style={styles.bidPrice}>{formatCurrency(request.my_bid.proposed_price)}</Text>
              <Text style={styles.bidMeta}>
                Estimated: {request.my_bid.estimated_days} day(s) • Submitted {formatDate(request.my_bid.created_at)}
              </Text>
              <Text style={styles.bidMessage}>{request.my_bid.message}</Text>
              
              {request.my_bid.can_withdraw && (
                <TouchableOpacity
                  style={styles.withdrawButton}
                  onPress={handleWithdrawBid}
                  disabled={withdrawBidMutation.isPending}
                >
                  {withdrawBidMutation.isPending ? (
                    <ActivityIndicator color={colors.error} />
                  ) : (
                    <Text style={styles.withdrawButtonText}>Withdraw Bid</Text>
                  )}
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Submit Bid Button */}
      {request.can_bid && !request.my_bid && (
        <TouchableOpacity style={styles.submitBidButton} onPress={() => setShowBidModal(true)}>
          <Text style={styles.submitBidButtonText}>Submit Your Bid</Text>
        </TouchableOpacity>
      )}

      {/* Bid Modal */}
      <Modal visible={showBidModal} animationType="slide" transparent>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Submit Your Bid</Text>
              <TouchableOpacity onPress={() => setShowBidModal(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView>
              <View style={styles.row}>
                <View style={styles.halfInput}>
                  <Text style={styles.inputLabel}>Your Price (₱)</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="0.00"
                    placeholderTextColor={colors.textSecondary}
                    value={proposedPrice}
                    onChangeText={setProposedPrice}
                    keyboardType="numeric"
                  />
                  <Text style={styles.budgetHint}>
                    Budget: {formatCurrency(request.budget_min)} - {formatCurrency(request.budget_max)}
                  </Text>
                </View>
                <View style={styles.halfInput}>
                  <Text style={styles.inputLabel}>Est. Days</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Days to complete"
                    placeholderTextColor={colors.textSecondary}
                    value={estimatedDays}
                    onChangeText={setEstimatedDays}
                    keyboardType="numeric"
                  />
                </View>
              </View>

              <Text style={styles.inputLabel}>Your Message</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Introduce yourself and explain why you're the best fit for this project..."
                placeholderTextColor={colors.textSecondary}
                value={message}
                onChangeText={setMessage}
                multiline
                maxLength={1000}
              />

              <TouchableOpacity
                style={styles.modalSubmitButton}
                onPress={handleSubmitBid}
                disabled={submitBidMutation.isPending}
              >
                {submitBidMutation.isPending ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.submitBidButtonText}>Submit Bid</Text>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Image Viewer Modal */}
      <Modal visible={selectedImageIndex !== null} transparent animationType="fade">
        <View style={styles.imageModal}>
          <TouchableOpacity
            style={styles.closeImageButton}
            onPress={() => setSelectedImageIndex(null)}
          >
            <Ionicons name="close" size={32} color="#fff" />
          </TouchableOpacity>
          {selectedImageIndex !== null && request.reference_images[selectedImageIndex] && (
            <Image
              source={{ uri: request.reference_images[selectedImageIndex] }}
              style={styles.fullImage}
              resizeMode="contain"
            />
          )}
        </View>
      </Modal>
    </SafeAreaView>
  );
}
