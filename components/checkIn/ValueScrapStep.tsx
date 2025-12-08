
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
import { Material, CheckInFormData, MaterialQuantity, MaterialTotal } from '@/types/checkIn';
import { IconSymbol } from '@/components/IconSymbol';

interface ValueScrapStepProps {
  formData: CheckInFormData;
  updateFormData: (updates: Partial<CheckInFormData>) => void;
  materials: Material[];
  onNext: () => void;
  onBack: () => void;
}

export default function ValueScrapStep({
  formData,
  updateFormData,
  materials,
  onNext,
  onBack,
}: ValueScrapStepProps) {
  const [showMaterialPicker, setShowMaterialPicker] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [showQuantityInput, setShowQuantityInput] = useState(false);
  const [quantityInputIndex, setQuantityInputIndex] = useState<number | null>(null);
  const [quantityValue, setQuantityValue] = useState('');

  const addMaterialRow = () => {
    const newMaterials = [...formData.valueScrap, { materialId: '', materialName: '', quantity: '', measurement: '' }];
    updateFormData({ valueScrap: newMaterials });
  };

  const removeMaterialRow = (index: number) => {
    const newMaterials = formData.valueScrap.filter((_, i) => i !== index);
    updateFormData({ valueScrap: newMaterials });
    updateTotals(newMaterials);
  };

  const handleMaterialSelect = (material: Material) => {
    if (selectedIndex !== null) {
      const newMaterials = [...formData.valueScrap];
      newMaterials[selectedIndex] = {
        materialId: material.id,
        materialName: material.name,
        quantity: newMaterials[selectedIndex].quantity,
        measurement: material.measurement,
      };
      updateFormData({ valueScrap: newMaterials });
    }
    setShowMaterialPicker(false);
    setSelectedIndex(null);
  };

  const openQuantityInput = (index: number) => {
    setQuantityInputIndex(index);
    setQuantityValue(formData.valueScrap[index].quantity);
    setShowQuantityInput(true);
  };

  const saveQuantity = () => {
    if (quantityInputIndex !== null) {
      const newMaterials = [...formData.valueScrap];
      newMaterials[quantityInputIndex].quantity = quantityValue;
      updateFormData({ valueScrap: newMaterials });
      updateTotals(newMaterials);
    }
    setShowQuantityInput(false);
    setQuantityInputIndex(null);
    setQuantityValue('');
  };

  const calculateTotals = (materialsList: MaterialQuantity[]): MaterialTotal[] => {
    const totalsMap = new Map<string, number>();
    
    materialsList.forEach(item => {
      if (item.quantity && item.measurement) {
        const quantity = parseFloat(item.quantity) || 0;
        const currentTotal = totalsMap.get(item.measurement) || 0;
        totalsMap.set(item.measurement, currentTotal + quantity);
      }
    });

    return Array.from(totalsMap.entries()).map(([measurement, total]) => ({
      measurement,
      total,
    }));
  };

  const updateTotals = (materialsList: MaterialQuantity[]) => {
    const totals = calculateTotals(materialsList);
    updateFormData({ valueScrapTotals: totals });
  };

  const isFormValid = () => {
    // Allow proceeding with no materials or with all materials filled
    if (formData.valueScrap.length === 0) {
      return true;
    }
    return formData.valueScrap.every(item => item.materialName && item.quantity);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Value Scrap</Text>
      <Text style={styles.sectionDescription}>
        Please only add materials here that are either received in pre-sorted, bulk quantities or are being purchased directly from the vendor
      </Text>

      {formData.valueScrap.map((item, index) => (
        <View key={index} style={styles.row}>
          <View style={styles.rowContent}>
            <View style={styles.field}>
              <Text style={styles.label}>Material</Text>
              <TouchableOpacity
                style={styles.picker}
                onPress={() => {
                  setSelectedIndex(index);
                  setShowMaterialPicker(true);
                }}
              >
                <Text style={item.materialName ? styles.pickerText : styles.placeholderText}>
                  {item.materialName || 'Select Material'}
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
                  {item.quantity ? `${item.quantity} ${item.measurement}` : 'Enter Quantity'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            style={styles.removeButton}
            onPress={() => removeMaterialRow(index)}
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

      <TouchableOpacity style={styles.addButton} onPress={addMaterialRow}>
        <IconSymbol
          ios_icon_name="plus.circle.fill"
          android_material_icon_name="add_circle"
          size={24}
          color={colors.primary}
        />
        <Text style={styles.addButtonText}>Add Material</Text>
      </TouchableOpacity>

      {formData.valueScrapTotals.length > 0 && (
        <View style={styles.totalsContainer}>
          <Text style={styles.totalsTitle}>Totals by Unit:</Text>
          {formData.valueScrapTotals.map((total, index) => (
            <View key={index} style={styles.totalRow}>
              <Text style={styles.totalLabel}>{total.measurement}:</Text>
              <Text style={styles.totalValue}>{total.total}</Text>
            </View>
          ))}
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
        visible={showMaterialPicker}
        transparent
        animationType="slide"
        onRequestClose={() => setShowMaterialPicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Material</Text>
            <FlatList
              data={materials}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.modalItem}
                  onPress={() => handleMaterialSelect(item)}
                >
                  <Text style={styles.modalItemText}>{item.name}</Text>
                  <Text style={styles.modalItemSubtext}>Unit: {item.measurement}</Text>
                </TouchableOpacity>
              )}
            />
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowMaterialPicker(false)}
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
            {quantityInputIndex !== null && formData.valueScrap[quantityInputIndex] && (
              <Text style={styles.modalSubtitle}>
                Unit: {formData.valueScrap[quantityInputIndex].measurement || 'Select material first'}
              </Text>
            )}
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
    marginBottom: 12,
  },
  sectionDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 24,
    lineHeight: 20,
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
  totalsContainer: {
    backgroundColor: colors.accent,
    borderRadius: 8,
    padding: 16,
    marginBottom: 24,
  },
  totalsTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 12,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  totalLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
  },
  totalValue: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.primary,
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
  modalSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
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
    fontWeight: '500',
  },
  modalItemSubtext: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 4,
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
