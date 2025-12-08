
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
import { ISeriesProcessor, CheckInFormData, ISeriesEntry } from '@/types/checkIn';
import { IconSymbol } from '@/components/IconSymbol';

interface ISeriesStepProps {
  formData: CheckInFormData;
  updateFormData: (updates: Partial<CheckInFormData>) => void;
  processors: ISeriesProcessor[];
  onNext: () => void;
  onBack: () => void;
}

export default function ISeriesStep({
  formData,
  updateFormData,
  processors,
  onNext,
  onBack,
}: ISeriesStepProps) {
  const [showSeriesPicker, setShowSeriesPicker] = useState(false);
  const [showGenerationPicker, setShowGenerationPicker] = useState(false);
  const [showQuantityInput, setShowQuantityInput] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [selectedType, setSelectedType] = useState<'pcs' | 'laptops' | null>(null);
  const [quantityValue, setQuantityValue] = useState('');

  const processorSeries = ['i3', 'i5', 'i7', 'Ryzen 3', 'Ryzen 5', 'Ryzen 7'];
  const processorGenerations = ['6th', '7th', '8th', '9th', '10th', '11th', '12th', '13th', '14th', 'N/A'];

  const handlePcsYes = () => {
    updateFormData({ hasISeriesPcs: true });
    if (formData.iSeriesPcs.length === 0) {
      updateFormData({ iSeriesPcs: [{ processorSeries: '', processorGeneration: '', quantity: '' }] });
    }
  };

  const handlePcsNo = () => {
    updateFormData({ hasISeriesPcs: false, iSeriesPcs: [] });
  };

  const handleLaptopsYes = () => {
    updateFormData({ hasISeriesLaptops: true });
    if (formData.iSeriesLaptops.length === 0) {
      updateFormData({ iSeriesLaptops: [{ processorSeries: '', processorGeneration: '', quantity: '' }] });
    }
  };

  const handleLaptopsNo = () => {
    updateFormData({ hasISeriesLaptops: false, iSeriesLaptops: [] });
  };

  const addPcsRow = () => {
    const newEntries = [...formData.iSeriesPcs, { processorSeries: '', processorGeneration: '', quantity: '' }];
    updateFormData({ iSeriesPcs: newEntries });
  };

  const addLaptopsRow = () => {
    const newEntries = [...formData.iSeriesLaptops, { processorSeries: '', processorGeneration: '', quantity: '' }];
    updateFormData({ iSeriesLaptops: newEntries });
  };

  const removePcsRow = (index: number) => {
    const newEntries = formData.iSeriesPcs.filter((_, i) => i !== index);
    updateFormData({ iSeriesPcs: newEntries });
  };

  const removeLaptopsRow = (index: number) => {
    const newEntries = formData.iSeriesLaptops.filter((_, i) => i !== index);
    updateFormData({ iSeriesLaptops: newEntries });
  };

  const handleSeriesSelect = (series: string) => {
    if (selectedIndex !== null && selectedType) {
      const entries = selectedType === 'pcs' ? [...formData.iSeriesPcs] : [...formData.iSeriesLaptops];
      entries[selectedIndex].processorSeries = series;
      
      if (selectedType === 'pcs') {
        updateFormData({ iSeriesPcs: entries });
      } else {
        updateFormData({ iSeriesLaptops: entries });
      }
    }
    setShowSeriesPicker(false);
  };

  const handleGenerationSelect = (generation: string) => {
    if (selectedIndex !== null && selectedType) {
      const entries = selectedType === 'pcs' ? [...formData.iSeriesPcs] : [...formData.iSeriesLaptops];
      entries[selectedIndex].processorGeneration = generation;
      
      if (selectedType === 'pcs') {
        updateFormData({ iSeriesPcs: entries });
      } else {
        updateFormData({ iSeriesLaptops: entries });
      }
    }
    setShowGenerationPicker(false);
  };

  const openQuantityInput = (index: number, type: 'pcs' | 'laptops') => {
    setSelectedIndex(index);
    setSelectedType(type);
    const entries = type === 'pcs' ? formData.iSeriesPcs : formData.iSeriesLaptops;
    setQuantityValue(entries[index].quantity);
    setShowQuantityInput(true);
  };

  const saveQuantity = () => {
    if (selectedIndex !== null && selectedType) {
      const entries = selectedType === 'pcs' ? [...formData.iSeriesPcs] : [...formData.iSeriesLaptops];
      entries[selectedIndex].quantity = quantityValue;
      
      if (selectedType === 'pcs') {
        updateFormData({ iSeriesPcs: entries });
      } else {
        updateFormData({ iSeriesLaptops: entries });
      }
    }
    setShowQuantityInput(false);
    setQuantityValue('');
  };

  const isFormValid = () => {
    // Must answer both questions
    if (formData.hasISeriesPcs === null || formData.hasISeriesLaptops === null) {
      return false;
    }

    // If yes to PCs, must have at least one complete entry
    if (formData.hasISeriesPcs && formData.iSeriesPcs.length > 0) {
      const allPcsComplete = formData.iSeriesPcs.every(
        entry => entry.processorSeries && entry.processorGeneration && entry.quantity
      );
      if (!allPcsComplete) return false;
    }

    // If yes to Laptops, must have at least one complete entry
    if (formData.hasISeriesLaptops && formData.iSeriesLaptops.length > 0) {
      const allLaptopsComplete = formData.iSeriesLaptops.every(
        entry => entry.processorSeries && entry.processorGeneration && entry.quantity
      );
      if (!allLaptopsComplete) return false;
    }

    return true;
  };

  const renderEntryRow = (entry: ISeriesEntry, index: number, type: 'pcs' | 'laptops') => (
    <View key={index} style={styles.row}>
      <View style={styles.rowContent}>
        <View style={styles.field}>
          <Text style={styles.label}>Processor Series</Text>
          <TouchableOpacity
            style={styles.picker}
            onPress={() => {
              setSelectedIndex(index);
              setSelectedType(type);
              setShowSeriesPicker(true);
            }}
          >
            <Text style={entry.processorSeries ? styles.pickerText : styles.placeholderText}>
              {entry.processorSeries || 'Select Series'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Generation</Text>
          <TouchableOpacity
            style={styles.picker}
            onPress={() => {
              setSelectedIndex(index);
              setSelectedType(type);
              setShowGenerationPicker(true);
            }}
          >
            <Text style={entry.processorGeneration ? styles.pickerText : styles.placeholderText}>
              {entry.processorGeneration || 'Select Gen'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Quantity</Text>
          <TouchableOpacity
            style={styles.picker}
            onPress={() => openQuantityInput(index, type)}
          >
            <Text style={entry.quantity ? styles.pickerText : styles.placeholderText}>
              {entry.quantity || 'Enter Qty'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <TouchableOpacity
        style={styles.removeButton}
        onPress={() => type === 'pcs' ? removePcsRow(index) : removeLaptopsRow(index)}
      >
        <IconSymbol
          ios_icon_name="trash.fill"
          android_material_icon_name="delete"
          size={20}
          color={colors.secondary}
        />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>i-Series / Ryzen Processors</Text>
      <Text style={styles.sectionDescription}>
        Please answer the following questions about i-Series or Ryzen devices
      </Text>

      {/* PCs Question */}
      <View style={styles.questionCard}>
        <Text style={styles.questionText}>
          Does the load contain any i-Series or Ryzen PCs?
        </Text>

        <View style={styles.buttonGroup}>
          <TouchableOpacity
            style={[
              styles.choiceButton,
              formData.hasISeriesPcs === true && styles.choiceButtonSelected,
            ]}
            onPress={handlePcsYes}
          >
            <Text
              style={[
                styles.choiceButtonText,
                formData.hasISeriesPcs === true && styles.choiceButtonTextSelected,
              ]}
            >
              Yes
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.choiceButton,
              formData.hasISeriesPcs === false && styles.choiceButtonSelected,
            ]}
            onPress={handlePcsNo}
          >
            <Text
              style={[
                styles.choiceButtonText,
                formData.hasISeriesPcs === false && styles.choiceButtonTextSelected,
              ]}
            >
              No
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* PCs Entry Section */}
      {formData.hasISeriesPcs === true && (
        <View style={styles.entrySection}>
          <Text style={styles.entrySectionTitle}>i-Series / Ryzen PCs</Text>
          
          {formData.iSeriesPcs.map((entry, index) => renderEntryRow(entry, index, 'pcs'))}

          <TouchableOpacity style={styles.addButton} onPress={addPcsRow}>
            <IconSymbol
              ios_icon_name="plus.circle.fill"
              android_material_icon_name="add_circle"
              size={24}
              color={colors.primary}
            />
            <Text style={styles.addButtonText}>Add PC</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Laptops Question */}
      <View style={styles.questionCard}>
        <Text style={styles.questionText}>
          Does the load contain any i-Series or Ryzen Laptops?
        </Text>

        <View style={styles.buttonGroup}>
          <TouchableOpacity
            style={[
              styles.choiceButton,
              formData.hasISeriesLaptops === true && styles.choiceButtonSelected,
            ]}
            onPress={handleLaptopsYes}
          >
            <Text
              style={[
                styles.choiceButtonText,
                formData.hasISeriesLaptops === true && styles.choiceButtonTextSelected,
              ]}
            >
              Yes
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.choiceButton,
              formData.hasISeriesLaptops === false && styles.choiceButtonSelected,
            ]}
            onPress={handleLaptopsNo}
          >
            <Text
              style={[
                styles.choiceButtonText,
                formData.hasISeriesLaptops === false && styles.choiceButtonTextSelected,
              ]}
            >
              No
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Laptops Entry Section */}
      {formData.hasISeriesLaptops === true && (
        <View style={styles.entrySection}>
          <Text style={styles.entrySectionTitle}>i-Series / Ryzen Laptops</Text>
          
          {formData.iSeriesLaptops.map((entry, index) => renderEntryRow(entry, index, 'laptops'))}

          <TouchableOpacity style={styles.addButton} onPress={addLaptopsRow}>
            <IconSymbol
              ios_icon_name="plus.circle.fill"
              android_material_icon_name="add_circle"
              size={24}
              color={colors.primary}
            />
            <Text style={styles.addButtonText}>Add Laptop</Text>
          </TouchableOpacity>
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

      {/* Modals */}
      <Modal
        visible={showSeriesPicker}
        transparent
        animationType="slide"
        onRequestClose={() => setShowSeriesPicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Processor Series</Text>
            <FlatList
              data={processorSeries}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.modalItem}
                  onPress={() => handleSeriesSelect(item)}
                >
                  <Text style={styles.modalItemText}>{item}</Text>
                </TouchableOpacity>
              )}
            />
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowSeriesPicker(false)}
            >
              <Text style={styles.modalCloseButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal
        visible={showGenerationPicker}
        transparent
        animationType="slide"
        onRequestClose={() => setShowGenerationPicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Processor Generation</Text>
            <FlatList
              data={processorGenerations}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.modalItem}
                  onPress={() => handleGenerationSelect(item)}
                >
                  <Text style={styles.modalItemText}>{item}</Text>
                </TouchableOpacity>
              )}
            />
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowGenerationPicker(false)}
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
  questionCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  questionText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
  },
  buttonGroup: {
    flexDirection: 'row',
    gap: 12,
  },
  choiceButton: {
    flex: 1,
    backgroundColor: colors.background,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  choiceButtonSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  choiceButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  choiceButtonTextSelected: {
    color: '#FFFFFF',
  },
  entrySection: {
    marginBottom: 24,
  },
  entrySectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 16,
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
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
    marginLeft: 8,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
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
