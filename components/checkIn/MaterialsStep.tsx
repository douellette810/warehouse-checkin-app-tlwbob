
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
} from 'react-native';
import { colors } from '@/styles/commonStyles';
import { Material, CheckInFormData, MaterialQuantity, MaterialTotal } from '@/types/checkIn';

interface MaterialsStepProps {
  formData: CheckInFormData;
  updateFormData: (updates: Partial<CheckInFormData>) => void;
  materials: Material[];
  materialType: 'value' | 'charge';
  onNext: () => void;
  onBack: () => void;
}

export default function MaterialsStep({
  formData,
  updateFormData,
  materials,
  materialType,
  onNext,
  onBack,
}: MaterialsStepProps) {
  const [currentMaterialIndex, setCurrentMaterialIndex] = useState(0);
  const [hasReceived, setHasReceived] = useState<boolean | null>(null);
  const [showQuantityInput, setShowQuantityInput] = useState(false);
  const [quantityValue, setQuantityValue] = useState('');

  const currentMaterial = materials[currentMaterialIndex];
  const isLastMaterial = currentMaterialIndex === materials.length - 1;

  const getMaterialsList = () => {
    return materialType === 'value' ? formData.valueMaterials : formData.chargeMaterials;
  };

  const updateMaterialsList = (newList: MaterialQuantity[]) => {
    if (materialType === 'value') {
      updateFormData({ valueMaterials: newList });
    } else {
      updateFormData({ chargeMaterials: newList });
    }
  };

  const calculateTotals = (materialsList: MaterialQuantity[]): MaterialTotal[] => {
    const totalsMap = new Map<string, number>();
    
    materialsList.forEach(item => {
      const quantity = parseFloat(item.quantity) || 0;
      const currentTotal = totalsMap.get(item.measurement) || 0;
      totalsMap.set(item.measurement, currentTotal + quantity);
    });

    return Array.from(totalsMap.entries()).map(([measurement, total]) => ({
      measurement,
      total,
    }));
  };

  const updateTotals = (materialsList: MaterialQuantity[]) => {
    const totals = calculateTotals(materialsList);
    if (materialType === 'value') {
      updateFormData({ valueMaterialsTotals: totals });
    } else {
      updateFormData({ chargeMaterialsTotals: totals });
    }
  };

  const handleYes = () => {
    setHasReceived(true);
    setShowQuantityInput(true);
  };

  const handleNo = () => {
    setHasReceived(false);
    goToNextMaterial();
  };

  const saveQuantity = () => {
    if (quantityValue && currentMaterial) {
      const materialsList = getMaterialsList();
      const newMaterial: MaterialQuantity = {
        materialId: currentMaterial.id,
        materialName: currentMaterial.name,
        quantity: quantityValue,
        measurement: currentMaterial.measurement,
      };
      const updatedList = [...materialsList, newMaterial];
      updateMaterialsList(updatedList);
      updateTotals(updatedList);
    }
    setShowQuantityInput(false);
    setQuantityValue('');
    goToNextMaterial();
  };

  const goToNextMaterial = () => {
    if (isLastMaterial) {
      onNext();
    } else {
      setCurrentMaterialIndex(currentMaterialIndex + 1);
      setHasReceived(null);
    }
  };

  const goToPreviousMaterial = () => {
    if (currentMaterialIndex > 0) {
      setCurrentMaterialIndex(currentMaterialIndex - 1);
      setHasReceived(null);
    } else {
      onBack();
    }
  };

  const getTotals = (): MaterialTotal[] => {
    return materialType === 'value' 
      ? formData.valueMaterialsTotals 
      : formData.chargeMaterialsTotals;
  };

  if (materials.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.sectionTitle}>
          {materialType === 'value' ? 'Value Materials' : 'Charge Materials'}
        </Text>
        <Text style={styles.emptyText}>
          No {materialType} materials configured. Please contact admin.
        </Text>
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.backButton} onPress={onBack}>
            <Text style={styles.backButtonText}>Back</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.nextButton} onPress={onNext}>
            <Text style={styles.nextButtonText}>Skip</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>
        {materialType === 'value' ? 'Value Materials' : 'Charge Materials'}
      </Text>
      <Text style={styles.progressText}>
        Question {currentMaterialIndex + 1} of {materials.length}
      </Text>

      <View style={styles.questionCard}>
        <Text style={styles.questionText}>
          Did you receive any {currentMaterial?.name} in bulk quantity or pre-sorted?
        </Text>

        <View style={styles.buttonGroup}>
          <TouchableOpacity
            style={[
              styles.choiceButton,
              hasReceived === true && styles.choiceButtonSelected,
            ]}
            onPress={handleYes}
          >
            <Text
              style={[
                styles.choiceButtonText,
                hasReceived === true && styles.choiceButtonTextSelected,
              ]}
            >
              Yes
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.choiceButton,
              hasReceived === false && styles.choiceButtonSelected,
            ]}
            onPress={handleNo}
          >
            <Text
              style={[
                styles.choiceButtonText,
                hasReceived === false && styles.choiceButtonTextSelected,
              ]}
            >
              No
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>Materials Received So Far:</Text>
        {getMaterialsList().length === 0 ? (
          <Text style={styles.summaryEmpty}>None yet</Text>
        ) : (
          <React.Fragment>
            {getMaterialsList().map((item, index) => (
              <View key={index} style={styles.summaryItem}>
                <Text style={styles.summaryItemText}>
                  {item.materialName}: {item.quantity} {item.measurement}
                </Text>
              </View>
            ))}
            
            {getTotals().length > 0 && (
              <View style={styles.totalsSection}>
                <Text style={styles.totalsTitle}>Totals by Unit:</Text>
                {getTotals().map((total, index) => (
                  <View key={index} style={styles.totalItem}>
                    <Text style={styles.totalItemText}>
                      {total.total} {total.measurement}
                    </Text>
                  </View>
                ))}
              </View>
            )}
          </React.Fragment>
        )}
      </View>

      <TouchableOpacity style={styles.backButton} onPress={goToPreviousMaterial}>
        <Text style={styles.backButtonText}>
          {currentMaterialIndex === 0 ? 'Back to Categories' : 'Previous Question'}
        </Text>
      </TouchableOpacity>

      <Modal
        visible={showQuantityInput}
        transparent
        animationType="slide"
        onRequestClose={() => setShowQuantityInput(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              Enter Quantity of {currentMaterial?.name}
            </Text>
            <Text style={styles.modalSubtitle}>
              Measurement: {currentMaterial?.measurement}
            </Text>
            <TextInput
              style={styles.input}
              value={quantityValue}
              onChangeText={setQuantityValue}
              keyboardType="numeric"
              placeholder={`Enter quantity in ${currentMaterial?.measurement}`}
              placeholderTextColor={colors.textSecondary}
              autoFocus
            />
            <TouchableOpacity
              style={[
                styles.saveButton,
                !quantityValue && styles.saveButtonDisabled,
              ]}
              onPress={saveQuantity}
              disabled={!quantityValue}
            >
              <Text style={styles.saveButtonText}>Save & Continue</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => {
                setShowQuantityInput(false);
                setHasReceived(null);
              }}
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
  progressText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 24,
  },
  emptyText: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    marginVertical: 40,
  },
  questionCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 24,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: colors.border,
  },
  questionText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 24,
    textAlign: 'center',
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
  summaryCard: {
    backgroundColor: colors.highlight,
    borderRadius: 8,
    padding: 16,
    marginBottom: 24,
  },
  summaryTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  summaryEmpty: {
    fontSize: 14,
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
  summaryItem: {
    paddingVertical: 6,
  },
  summaryItemText: {
    fontSize: 14,
    color: colors.text,
  },
  totalsSection: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  totalsTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
  },
  totalItem: {
    paddingVertical: 4,
  },
  totalItemText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.primary,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  backButton: {
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
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 16,
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
  saveButtonDisabled: {
    backgroundColor: colors.disabled,
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
