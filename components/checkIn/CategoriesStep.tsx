
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  FlatList,
  TextInput,
} from 'react-native';
import { colors } from '@/styles/commonStyles';
import { Category, CheckInFormData, CategoryQuantity } from '@/types/checkIn';
import { IconSymbol } from '@/components/IconSymbol';

interface CategoriesStepProps {
  formData: CheckInFormData;
  updateFormData: (updates: Partial<CheckInFormData>) => void;
  categories: Category[];
  onNext: () => void;
  onBack: () => void;
}

export default function CategoriesStep({
  formData,
  updateFormData,
  categories,
  onNext,
  onBack,
}: CategoriesStepProps) {
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [showQuantityInput, setShowQuantityInput] = useState(false);
  const [quantityInputIndex, setQuantityInputIndex] = useState<number | null>(null);
  const [quantityValue, setQuantityValue] = useState('');

  const addCategoryRow = () => {
    const newCategories = [...formData.categories, { category: '', quantity: '' }];
    updateFormData({ categories: newCategories });
  };

  const removeCategoryRow = (index: number) => {
    const newCategories = formData.categories.filter((_, i) => i !== index);
    updateFormData({ categories: newCategories });
  };

  const handleCategorySelect = (category: Category) => {
    if (selectedIndex !== null) {
      const newCategories = [...formData.categories];
      newCategories[selectedIndex].category = category.name;
      updateFormData({ categories: newCategories });
    }
    setShowCategoryPicker(false);
    setSelectedIndex(null);
  };

  const openQuantityInput = (index: number) => {
    setQuantityInputIndex(index);
    setQuantityValue(formData.categories[index].quantity);
    setShowQuantityInput(true);
  };

  const saveQuantity = () => {
    if (quantityInputIndex !== null) {
      const newCategories = [...formData.categories];
      newCategories[quantityInputIndex].quantity = quantityValue;
      updateFormData({ categories: newCategories });
    }
    setShowQuantityInput(false);
    setQuantityInputIndex(null);
    setQuantityValue('');
  };

  const getTotalQuantity = () => {
    return formData.categories.reduce((total, item) => {
      const qty = parseFloat(item.quantity) || 0;
      return total + qty;
    }, 0);
  };

  const isFormValid = () => {
    return formData.categories.length > 0 &&
      formData.categories.every(item => item.category && item.quantity);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Total Quantity for Certificate of Destruction by Category</Text>
      <Text style={styles.sectionDescription}>
        Add categories and quantities. All fields are required.
      </Text>

      {formData.categories.map((item, index) => (
        <View key={index} style={styles.row}>
          <View style={styles.rowContent}>
            <View style={styles.field}>
              <Text style={styles.label}>Category</Text>
              <TouchableOpacity
                style={styles.picker}
                onPress={() => {
                  setSelectedIndex(index);
                  setShowCategoryPicker(true);
                }}
              >
                <Text style={item.category ? styles.pickerText : styles.placeholderText}>
                  {item.category || 'Select Category'}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Quantity</Text>
              <TouchableOpacity
                style={styles.picker}
                onPress={() => openQuantityInput(index)}
              >
                <Text style={item.quantity ? styles.pickerText : styles.placeholderText}>
                  {item.quantity || 'Enter Quantity'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            style={styles.removeButton}
            onPress={() => removeCategoryRow(index)}
          >
            <IconSymbol
              ios_icon_name="trash.fill"
              android_material_icon_name="delete"
              size={20}
              color={colors.secondary}
            />
          </TouchableOpacity>
        </View>
      ))}

      <TouchableOpacity style={styles.addButton} onPress={addCategoryRow}>
        <IconSymbol
          ios_icon_name="plus.circle.fill"
          android_material_icon_name="add_circle"
          size={24}
          color={colors.primary}
        />
        <Text style={styles.addButtonText}>Add Category</Text>
      </TouchableOpacity>

      {formData.categories.length > 0 && (
        <View style={styles.totalContainer}>
          <Text style={styles.totalLabel}>Total Quantity:</Text>
          <Text style={styles.totalValue}>{getTotalQuantity()}</Text>
        </View>
      )}

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.nextButton, !isFormValid() && styles.nextButtonDisabled]}
          onPress={onNext}
          disabled={!isFormValid()}
        >
          <Text style={styles.nextButtonText}>Continue</Text>
        </TouchableOpacity>
      </View>

      <Modal
        visible={showCategoryPicker}
        transparent
        animationType="slide"
        onRequestClose={() => setShowCategoryPicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Category</Text>
            <FlatList
              data={categories}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.modalItem}
                  onPress={() => handleCategorySelect(item)}
                >
                  <Text style={styles.modalItemText}>{item.name}</Text>
                </TouchableOpacity>
              )}
            />
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowCategoryPicker(false)}
            >
              <Text style={styles.modalCloseButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal
        visible={showQuantityInput}
        transparent
        animationType="slide"
        onRequestClose={() => setShowQuantityInput(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Enter Quantity</Text>
            <TextInput
              style={styles.input}
              value={quantityValue}
              onChangeText={setQuantityValue}
              keyboardType="numeric"
              placeholder="Enter quantity"
              placeholderTextColor={colors.textSecondary}
            />
            <TouchableOpacity style={styles.saveButton} onPress={saveQuantity}>
              <Text style={styles.saveButtonText}>Save</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowQuantityInput(false)}
            >
              <Text style={styles.modalCloseButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 24,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 16,
    backgroundColor: colors.card,
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  rowContent: {
    flex: 1,
    gap: 12,
  },
  field: {
    flex: 1,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 6,
  },
  picker: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 6,
    padding: 12,
    minHeight: 44,
    justifyContent: 'center',
  },
  pickerText: {
    fontSize: 14,
    color: colors.text,
  },
  placeholderText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  removeButton: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingLeft: 12,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    backgroundColor: colors.card,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.primary,
    borderStyle: 'dashed',
    marginBottom: 24,
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
    marginLeft: 8,
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.accent,
    padding: 16,
    borderRadius: 8,
    marginBottom: 24,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  totalValue: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  backButton: {
    flex: 1,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  nextButton: {
    flex: 1,
    backgroundColor: colors.primary,
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  nextButtonDisabled: {
    backgroundColor: colors.disabled,
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.card,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '70%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 16,
  },
  modalItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalItemText: {
    fontSize: 16,
    color: colors.text,
  },
  input: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    color: colors.text,
    marginBottom: 16,
  },
  saveButton: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginBottom: 8,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  modalCloseButton: {
    backgroundColor: colors.border,
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  modalCloseButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
});
