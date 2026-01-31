import React, { useState, useEffect } from 'react';
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
  Switch,
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

interface Category {
  id: number;
  name: string;
  slug: string;
}

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  compare_at_price: number | null;
  quantity: number;
  low_stock_threshold: number;
  category_id: number;
  status: string;
  images: string[];
  is_featured: boolean;
  free_shipping: boolean;
}

export default function SellerProductEditScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const isNew = id === 'new';
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const queryClient = useQueryClient();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [compareAtPrice, setCompareAtPrice] = useState('');
  const [quantity, setQuantity] = useState('');
  const [lowStockThreshold, setLowStockThreshold] = useState('5');
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [status, setStatus] = useState('active');
  const [images, setImages] = useState<string[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [newImages, setNewImages] = useState<string[]>([]);
  const [isFeatured, setIsFeatured] = useState(false);
  const [freeShipping, setFreeShipping] = useState(false);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);

  const { data: categories } = useQuery({
    queryKey: ['seller-categories'],
    queryFn: async () => {
      const response = await apiClient.get<{ success: boolean; data: Category[] }>(
        ENDPOINTS.SELLER.CATEGORIES
      );
      return response.data || [];
    },
  });

  const { data: product, isLoading: loadingProduct } = useQuery({
    queryKey: ['seller-product', id],
    queryFn: async () => {
      const response = await apiClient.get<{ success: boolean; data: Product }>(
        ENDPOINTS.SELLER.PRODUCTS.DETAIL(Number(id))
      );
      return response.data;
    },
    enabled: !isNew,
  });

  useEffect(() => {
    if (product) {
      setName(product.name);
      setDescription(product.description || '');
      setPrice(product.price.toString());
      setCompareAtPrice(product.compare_at_price?.toString() || '');
      setQuantity(product.quantity.toString());
      setLowStockThreshold(product.low_stock_threshold?.toString() || '5');
      setCategoryId(product.category_id);
      setStatus(product.status);
      setExistingImages(product.images || []);
      setIsFeatured(product.is_featured || false);
      setFreeShipping(product.free_shipping || false);
    }
  }, [product]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('description', description);
      formData.append('price', price);
      if (compareAtPrice) formData.append('compare_at_price', compareAtPrice);
      formData.append('quantity', quantity);
      formData.append('low_stock_threshold', lowStockThreshold);
      if (categoryId) formData.append('category_id', categoryId.toString());
      formData.append('status', status);
      formData.append('is_featured', isFeatured ? '1' : '0');
      formData.append('free_shipping', freeShipping ? '1' : '0');

      // Add new images
      newImages.forEach((uri, index) => {
        const filename = uri.split('/').pop() || `image_${index}.jpg`;
        formData.append('images[]', {
          uri,
          type: 'image/jpeg',
          name: filename,
        } as unknown as Blob);
      });

      // Keep existing images
      existingImages.forEach((url) => {
        formData.append('existing_images[]', url);
      });

      if (isNew) {
        return await apiClient.post(ENDPOINTS.SELLER.PRODUCTS.CREATE, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      } else {
        return await apiClient.put(ENDPOINTS.SELLER.PRODUCTS.UPDATE(Number(id)), formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['seller-products'] });
      if (!isNew) {
        queryClient.invalidateQueries({ queryKey: ['seller-product', id] });
      }
      Alert.alert('Success', isNew ? 'Product created!' : 'Product updated!', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    },
    onError: (error: Error) => {
      Alert.alert('Error', error.message || 'Failed to save product');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      await apiClient.delete(ENDPOINTS.SELLER.PRODUCTS.DELETE(Number(id)));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['seller-products'] });
      Alert.alert('Success', 'Product deleted', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    },
    onError: (error: Error) => {
      Alert.alert('Error', error.message || 'Failed to delete product');
    },
  });

  const handleAddImage = async () => {
    if (existingImages.length + newImages.length >= 5) {
      Alert.alert('Limit Reached', 'You can only add up to 5 images.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setNewImages([...newImages, result.assets[0].uri]);
    }
  };

  const handleRemoveExistingImage = (index: number) => {
    setExistingImages(existingImages.filter((_, i) => i !== index));
  };

  const handleRemoveNewImage = (index: number) => {
    setNewImages(newImages.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter a product name');
      return;
    }
    if (!price || Number(price) <= 0) {
      Alert.alert('Error', 'Please enter a valid price');
      return;
    }
    if (!quantity || Number(quantity) < 0) {
      Alert.alert('Error', 'Please enter a valid quantity');
      return;
    }
    if (!categoryId) {
      Alert.alert('Error', 'Please select a category');
      return;
    }
    saveMutation.mutate();
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Product',
      'Are you sure you want to delete this product? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => deleteMutation.mutate() },
      ]
    );
  };

  const selectedCategory = categories?.find((c) => c.id === categoryId);

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
    deleteButton: {
      padding: Spacing.sm,
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
    switchRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: Spacing.sm,
    },
    switchLabel: {
      fontSize: 15,
      color: colors.text,
    },
    statusSelector: {
      flexDirection: 'row',
      gap: Spacing.sm,
    },
    statusOption: {
      flex: 1,
      padding: Spacing.md,
      borderRadius: BorderRadius.md,
      borderWidth: 2,
      alignItems: 'center',
    },
    statusText: {
      fontSize: 14,
      fontWeight: '600',
    },
    saveButton: {
      backgroundColor: colors.primary,
      paddingVertical: Spacing.md,
      borderRadius: BorderRadius.lg,
      alignItems: 'center',
      marginTop: Spacing.lg,
    },
    saveButtonText: {
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

  if (!isNew && loadingProduct) {
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
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{isNew ? 'Add Product' : 'Edit Product'}</Text>
          {!isNew && (
            <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
              <Ionicons name="trash-outline" size={22} color={colors.error} />
            </TouchableOpacity>
          )}
        </View>

        <ScrollView style={styles.content}>
          {/* Images */}
          <View style={styles.section}>
            <Text style={styles.label}>Product Images (up to 5)</Text>
            <View style={styles.imagesContainer}>
              {existingImages.map((uri, index) => (
                <View key={`existing-${index}`} style={styles.imageWrapper}>
                  <Image source={{ uri }} style={styles.image} />
                  <TouchableOpacity
                    style={styles.removeImageButton}
                    onPress={() => handleRemoveExistingImage(index)}
                  >
                    <Ionicons name="close" size={16} color="#fff" />
                  </TouchableOpacity>
                </View>
              ))}
              {newImages.map((uri, index) => (
                <View key={`new-${index}`} style={styles.imageWrapper}>
                  <Image source={{ uri }} style={styles.image} />
                  <TouchableOpacity
                    style={styles.removeImageButton}
                    onPress={() => handleRemoveNewImage(index)}
                  >
                    <Ionicons name="close" size={16} color="#fff" />
                  </TouchableOpacity>
                </View>
              ))}
              {existingImages.length + newImages.length < 5 && (
                <TouchableOpacity style={styles.addImageButton} onPress={handleAddImage}>
                  <Ionicons name="add" size={24} color={colors.textSecondary} />
                  <Text style={styles.addImageText}>Add</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Name */}
          <View style={styles.section}>
            <Text style={styles.label}>
              Product Name <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={styles.input}
              placeholder="Enter product name"
              placeholderTextColor={colors.textSecondary}
              value={name}
              onChangeText={setName}
              maxLength={255}
            />
          </View>

          {/* Description */}
          <View style={styles.section}>
            <Text style={styles.label}>Description</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Describe your product..."
              placeholderTextColor={colors.textSecondary}
              value={description}
              onChangeText={setDescription}
              multiline
              maxLength={2000}
            />
          </View>

          {/* Category */}
          <View style={styles.section}>
            <Text style={styles.label}>
              Category <Text style={styles.required}>*</Text>
            </Text>
            <TouchableOpacity
              style={styles.pickerButton}
              onPress={() => setShowCategoryPicker(true)}
            >
              <Text style={[styles.pickerButtonText, !categoryId && styles.placeholderText]}>
                {selectedCategory?.name || 'Select a category'}
              </Text>
              <Ionicons name="chevron-down" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Price */}
          <View style={styles.section}>
            <View style={styles.row}>
              <View style={styles.halfInput}>
                <Text style={styles.label}>
                  Price (₱) <Text style={styles.required}>*</Text>
                </Text>
                <TextInput
                  style={styles.input}
                  placeholder="0.00"
                  placeholderTextColor={colors.textSecondary}
                  value={price}
                  onChangeText={setPrice}
                  keyboardType="numeric"
                />
              </View>
              <View style={styles.halfInput}>
                <Text style={styles.label}>Compare at Price (₱)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Optional"
                  placeholderTextColor={colors.textSecondary}
                  value={compareAtPrice}
                  onChangeText={setCompareAtPrice}
                  keyboardType="numeric"
                />
              </View>
            </View>
          </View>

          {/* Inventory */}
          <View style={styles.section}>
            <View style={styles.row}>
              <View style={styles.halfInput}>
                <Text style={styles.label}>
                  Quantity <Text style={styles.required}>*</Text>
                </Text>
                <TextInput
                  style={styles.input}
                  placeholder="0"
                  placeholderTextColor={colors.textSecondary}
                  value={quantity}
                  onChangeText={setQuantity}
                  keyboardType="numeric"
                />
              </View>
              <View style={styles.halfInput}>
                <Text style={styles.label}>Low Stock Alert</Text>
                <TextInput
                  style={styles.input}
                  placeholder="5"
                  placeholderTextColor={colors.textSecondary}
                  value={lowStockThreshold}
                  onChangeText={setLowStockThreshold}
                  keyboardType="numeric"
                />
              </View>
            </View>
          </View>

          {/* Status */}
          <View style={styles.section}>
            <Text style={styles.label}>Status</Text>
            <View style={styles.statusSelector}>
              <TouchableOpacity
                style={[
                  styles.statusOption,
                  {
                    borderColor: status === 'active' ? colors.success : colors.border,
                    backgroundColor: status === 'active' ? '#dcfce7' : 'transparent',
                  },
                ]}
                onPress={() => setStatus('active')}
              >
                <Text
                  style={[
                    styles.statusText,
                    { color: status === 'active' ? colors.success : colors.textSecondary },
                  ]}
                >
                  Active
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.statusOption,
                  {
                    borderColor: status === 'draft' ? colors.warning : colors.border,
                    backgroundColor: status === 'draft' ? '#fef3c7' : 'transparent',
                  },
                ]}
                onPress={() => setStatus('draft')}
              >
                <Text
                  style={[
                    styles.statusText,
                    { color: status === 'draft' ? colors.warning : colors.textSecondary },
                  ]}
                >
                  Draft
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Options */}
          <View style={styles.section}>
            <Text style={styles.label}>Options</Text>
            <View style={styles.switchRow}>
              <Text style={styles.switchLabel}>Free Shipping</Text>
              <Switch
                value={freeShipping}
                onValueChange={setFreeShipping}
                trackColor={{ false: colors.border, true: colors.primary }}
              />
            </View>
            <View style={styles.switchRow}>
              <Text style={styles.switchLabel}>Featured Product</Text>
              <Switch
                value={isFeatured}
                onValueChange={setIsFeatured}
                trackColor={{ false: colors.border, true: colors.primary }}
              />
            </View>
          </View>

          {/* Save Button */}
          <TouchableOpacity
            style={styles.saveButton}
            onPress={handleSave}
            disabled={saveMutation.isPending}
          >
            {saveMutation.isPending ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.saveButtonText}>{isNew ? 'Create Product' : 'Save Changes'}</Text>
            )}
          </TouchableOpacity>

          <View style={{ height: Spacing.xl }} />
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
                {categories?.map((cat) => (
                  <TouchableOpacity
                    key={cat.id}
                    style={[
                      styles.categoryItem,
                      categoryId === cat.id && styles.categoryItemSelected,
                    ]}
                    onPress={() => {
                      setCategoryId(cat.id);
                      setShowCategoryPicker(false);
                    }}
                  >
                    <Text style={styles.categoryItemText}>{cat.name}</Text>
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
