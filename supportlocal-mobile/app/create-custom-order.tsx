import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Image,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useQuery, useMutation } from '@tanstack/react-query';
import * as ImagePicker from 'expo-image-picker';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';

import { Colors, Spacing, BorderRadius } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import apiClient from '@/services/api';
import { ENDPOINTS } from '@/constants/api';

interface Category {
  key: string;
  label: string;
}

export default function CreateCustomOrderScreen() {
  const { sellerId, sellerName } = useLocalSearchParams<{ sellerId?: string; sellerName?: string }>();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [budgetMin, setBudgetMin] = useState('');
  const [budgetMax, setBudgetMax] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [deadline, setDeadline] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [specialRequirements, setSpecialRequirements] = useState('');
  const [isPublic, setIsPublic] = useState(!sellerId);
  const [images, setImages] = useState<string[]>([]);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);

  const { data: categories } = useQuery({
    queryKey: ['custom-order-categories'],
    queryFn: async () => {
      const response = await apiClient.get<{ success: boolean; data: Category[] }>(
        ENDPOINTS.CUSTOM_ORDERS.CATEGORIES
      );
      return response.data || [];
    },
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('category', category);
      formData.append('description', description);
      formData.append('budget_min', budgetMin);
      formData.append('budget_max', budgetMax);
      formData.append('quantity', quantity);
      formData.append('is_public', isPublic ? '1' : '0');
      
      if (deadline) {
        formData.append('preferred_deadline', deadline.toISOString().split('T')[0]);
      }
      if (specialRequirements) {
        formData.append('special_requirements', specialRequirements);
      }
      if (!isPublic && sellerId) {
        formData.append('seller_id', sellerId);
      }

      images.forEach((uri, index) => {
        const filename = uri.split('/').pop() || `image_${index}.jpg`;
        formData.append('reference_images[]', {
          uri,
          type: 'image/jpeg',
          name: filename,
        } as unknown as Blob);
      });

      return await apiClient.uploadFile(ENDPOINTS.CUSTOM_ORDERS.CREATE, formData, 'POST');
    },
    onSuccess: () => {
      Alert.alert(
        'Success',
        isPublic 
          ? 'Your request has been posted to the marketplace!'
          : 'Your request has been sent to the seller!',
        [{ text: 'OK', onPress: () => router.back() }]
      );
    },
    onError: (error: Error) => {
      Alert.alert('Error', error.message || 'Failed to create request');
    },
  });

  const handleAddImage = async () => {
    if (images.length >= 5) {
      Alert.alert('Limit Reached', 'You can only add up to 5 images.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setImages([...images, result.assets[0].uri]);
    }
  };

  const handleRemoveImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a title');
      return;
    }
    if (!category) {
      Alert.alert('Error', 'Please select a category');
      return;
    }
    if (!description.trim()) {
      Alert.alert('Error', 'Please enter a description');
      return;
    }
    if (!budgetMin || !budgetMax) {
      Alert.alert('Error', 'Please enter your budget range');
      return;
    }
    if (Number(budgetMin) > Number(budgetMax)) {
      Alert.alert('Error', 'Minimum budget cannot be greater than maximum');
      return;
    }

    createMutation.mutate();
  };

  const selectedCategory = categories?.find((c: Category) => c.key === category);

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
      marginBottom: Spacing.lg,
    },
    label: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.text,
      marginBottom: Spacing.xs,
    },
    required: {
      color: colors.error,
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
    budgetInput: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    currencyPrefix: {
      fontSize: 16,
      color: colors.textSecondary,
      marginRight: 4,
    },
    pickerButton: {
      backgroundColor: colors.inputBackground,
      borderRadius: BorderRadius.md,
      padding: Spacing.md,
      borderWidth: 1,
      borderColor: colors.border,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    pickerButtonText: {
      fontSize: 16,
      color: colors.text,
    },
    placeholderText: {
      color: colors.textSecondary,
    },
    typeSelector: {
      flexDirection: 'row',
      gap: Spacing.sm,
    },
    typeOption: {
      flex: 1,
      padding: Spacing.md,
      borderRadius: BorderRadius.md,
      borderWidth: 2,
      alignItems: 'center',
    },
    typeOptionText: {
      fontSize: 14,
      fontWeight: '600',
      marginTop: Spacing.xs,
    },
    typeDescription: {
      fontSize: 12,
      textAlign: 'center',
      marginTop: 4,
    },
    directSellerInfo: {
      backgroundColor: colors.backgroundSecondary,
      padding: Spacing.md,
      borderRadius: BorderRadius.md,
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: Spacing.sm,
    },
    directSellerText: {
      flex: 1,
      marginLeft: Spacing.sm,
      fontSize: 14,
      color: colors.text,
    },
    imagesContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: Spacing.sm,
    },
    imageWrapper: {
      position: 'relative',
    },
    image: {
      width: 80,
      height: 80,
      borderRadius: BorderRadius.md,
    },
    removeImageButton: {
      position: 'absolute',
      top: -8,
      right: -8,
      backgroundColor: colors.error,
      borderRadius: 12,
      width: 24,
      height: 24,
      justifyContent: 'center',
      alignItems: 'center',
    },
    addImageButton: {
      width: 80,
      height: 80,
      borderRadius: BorderRadius.md,
      borderWidth: 2,
      borderStyle: 'dashed',
      borderColor: colors.border,
      justifyContent: 'center',
      alignItems: 'center',
    },
    addImageText: {
      fontSize: 10,
      color: colors.textSecondary,
      marginTop: 4,
    },
    submitButton: {
      backgroundColor: colors.primary,
      paddingVertical: Spacing.md,
      borderRadius: BorderRadius.lg,
      alignItems: 'center',
      marginTop: Spacing.lg,
      marginBottom: Spacing.xl,
    },
    submitButtonText: {
      color: '#fff',
      fontSize: 16,
      fontWeight: '600',
    },
    modalOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'flex-end',
    },
    modalContent: {
      backgroundColor: colors.card,
      borderTopLeftRadius: BorderRadius.xl,
      borderTopRightRadius: BorderRadius.xl,
      maxHeight: '60%',
    },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: Spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    modalTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.text,
    },
    categoryItem: {
      padding: Spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    categoryItemText: {
      fontSize: 16,
      color: colors.text,
    },
    categoryItemSelected: {
      backgroundColor: colors.backgroundSecondary,
    },
  });

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Create Custom Order</Text>
        </View>

        <ScrollView style={styles.content}>
          {/* Request Type */}
          <View style={styles.section}>
            <Text style={styles.label}>Request Type <Text style={styles.required}>*</Text></Text>
            <View style={styles.typeSelector}>
              <TouchableOpacity
                style={[
                  styles.typeOption,
                  {
                    borderColor: isPublic ? colors.primary : colors.border,
                    backgroundColor: isPublic ? colors.accentLight : 'transparent',
                  },
                ]}
                onPress={() => setIsPublic(true)}
              >
                <Ionicons
                  name="globe-outline"
                  size={24}
                  color={isPublic ? colors.primary : colors.textSecondary}
                />
                <Text style={[styles.typeOptionText, { color: isPublic ? colors.primary : colors.text }]}>
                  Public
                </Text>
                <Text style={[styles.typeDescription, { color: colors.textSecondary }]}>
                  Open for bids from all sellers
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.typeOption,
                  {
                    borderColor: !isPublic ? colors.primary : colors.border,
                    backgroundColor: !isPublic ? colors.accentLight : 'transparent',
                  },
                ]}
                onPress={() => setIsPublic(false)}
              >
                <Ionicons
                  name="person-outline"
                  size={24}
                  color={!isPublic ? colors.primary : colors.textSecondary}
                />
                <Text style={[styles.typeOptionText, { color: !isPublic ? colors.primary : colors.text }]}>
                  Direct
                </Text>
                <Text style={[styles.typeDescription, { color: colors.textSecondary }]}>
                  Send to a specific seller
                </Text>
              </TouchableOpacity>
            </View>

            {!isPublic && sellerId && sellerName && (
              <View style={styles.directSellerInfo}>
                <Ionicons name="person-circle" size={24} color={colors.primary} />
                <Text style={styles.directSellerText}>Sending to: {sellerName}</Text>
              </View>
            )}
          </View>

          {/* Title */}
          <View style={styles.section}>
            <Text style={styles.label}>Title <Text style={styles.required}>*</Text></Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., Custom wooden jewelry box"
              placeholderTextColor={colors.textSecondary}
              value={title}
              onChangeText={setTitle}
              maxLength={255}
            />
          </View>

          {/* Category */}
          <View style={styles.section}>
            <Text style={styles.label}>Category <Text style={styles.required}>*</Text></Text>
            <TouchableOpacity
              style={styles.pickerButton}
              onPress={() => setShowCategoryPicker(true)}
            >
              <Text style={[styles.pickerButtonText, !category && styles.placeholderText]}>
                {selectedCategory?.label || 'Select a category'}
              </Text>
              <Ionicons name="chevron-down" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Description */}
          <View style={styles.section}>
            <Text style={styles.label}>Description <Text style={styles.required}>*</Text></Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Describe what you're looking for in detail..."
              placeholderTextColor={colors.textSecondary}
              value={description}
              onChangeText={setDescription}
              multiline
              maxLength={2000}
            />
          </View>

          {/* Budget */}
          <View style={styles.section}>
            <Text style={styles.label}>Budget Range <Text style={styles.required}>*</Text></Text>
            <View style={styles.row}>
              <View style={styles.halfInput}>
                <View style={[styles.input, styles.budgetInput]}>
                  <Text style={styles.currencyPrefix}>₱</Text>
                  <TextInput
                    style={{ flex: 1, fontSize: 16, color: colors.text }}
                    placeholder="Min"
                    placeholderTextColor={colors.textSecondary}
                    value={budgetMin}
                    onChangeText={setBudgetMin}
                    keyboardType="numeric"
                  />
                </View>
              </View>
              <View style={styles.halfInput}>
                <View style={[styles.input, styles.budgetInput]}>
                  <Text style={styles.currencyPrefix}>₱</Text>
                  <TextInput
                    style={{ flex: 1, fontSize: 16, color: colors.text }}
                    placeholder="Max"
                    placeholderTextColor={colors.textSecondary}
                    value={budgetMax}
                    onChangeText={setBudgetMax}
                    keyboardType="numeric"
                  />
                </View>
              </View>
            </View>
          </View>

          {/* Quantity & Deadline */}
          <View style={styles.section}>
            <View style={styles.row}>
              <View style={styles.halfInput}>
                <Text style={styles.label}>Quantity <Text style={styles.required}>*</Text></Text>
                <TextInput
                  style={styles.input}
                  value={quantity}
                  onChangeText={setQuantity}
                  keyboardType="numeric"
                />
              </View>
              <View style={styles.halfInput}>
                <Text style={styles.label}>Preferred Deadline</Text>
                <TouchableOpacity
                  style={styles.pickerButton}
                  onPress={() => setShowDatePicker(true)}
                >
                  <Text style={[styles.pickerButtonText, !deadline && styles.placeholderText]}>
                    {deadline ? deadline.toLocaleDateString() : 'Select date'}
                  </Text>
                  <Ionicons name="calendar-outline" size={20} color={colors.textSecondary} />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {showDatePicker && (
            <DateTimePicker
              value={deadline || new Date()}
              mode="date"
              minimumDate={new Date()}
              onChange={(event: DateTimePickerEvent, selectedDate?: Date) => {
                setShowDatePicker(false);
                if (selectedDate) setDeadline(selectedDate);
              }}
            />
          )}

          {/* Special Requirements */}
          <View style={styles.section}>
            <Text style={styles.label}>Special Requirements</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Any specific requirements, materials, colors, etc."
              placeholderTextColor={colors.textSecondary}
              value={specialRequirements}
              onChangeText={setSpecialRequirements}
              multiline
              maxLength={1000}
            />
          </View>

          {/* Reference Images */}
          <View style={styles.section}>
            <Text style={styles.label}>Reference Images (up to 5)</Text>
            <View style={styles.imagesContainer}>
              {images.map((uri, index) => (
                <View key={index} style={styles.imageWrapper}>
                  <Image source={{ uri }} style={styles.image} />
                  <TouchableOpacity
                    style={styles.removeImageButton}
                    onPress={() => handleRemoveImage(index)}
                  >
                    <Ionicons name="close" size={16} color="#fff" />
                  </TouchableOpacity>
                </View>
              ))}
              {images.length < 5 && (
                <TouchableOpacity style={styles.addImageButton} onPress={handleAddImage}>
                  <Ionicons name="add" size={24} color={colors.textSecondary} />
                  <Text style={styles.addImageText}>Add</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={styles.submitButton}
            onPress={handleSubmit}
            disabled={createMutation.isPending}
          >
            {createMutation.isPending ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.submitButtonText}>
                {isPublic ? 'Post to Marketplace' : 'Send Request'}
              </Text>
            )}
          </TouchableOpacity>
        </ScrollView>

        {/* Category Picker Modal */}
        {showCategoryPicker && (
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setShowCategoryPicker(false)}
          >
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Select Category</Text>
                <TouchableOpacity onPress={() => setShowCategoryPicker(false)}>
                  <Ionicons name="close" size={24} color={colors.text} />
                </TouchableOpacity>
              </View>
              <ScrollView>
                {categories?.map((cat: Category) => (
                  <TouchableOpacity
                    key={cat.key}
                    style={[
                      styles.categoryItem,
                      category === cat.key && styles.categoryItemSelected,
                    ]}
                    onPress={() => {
                      setCategory(cat.key);
                      setShowCategoryPicker(false);
                    }}
                  >
                    <Text style={styles.categoryItemText}>{cat.label}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </TouchableOpacity>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
