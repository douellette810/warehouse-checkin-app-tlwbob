
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
} from 'react-native';
import { colors } from '@/styles/commonStyles';
import { CheckInFormData } from '@/types/checkIn';

interface AdditionalNotesStepProps {
  formData: CheckInFormData;
  updateFormData: (updates: Partial<CheckInFormData>) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function AdditionalNotesStep({
  formData,
  updateFormData,
  onNext,
  onBack,
}: AdditionalNotesStepProps) {
  const [suspectedValueAnswer, setSuspectedValueAnswer] = useState<boolean | null>(
    formData.suspectedValueNote !== null ? true : null
  );
  const [otherNotesAnswer, setOtherNotesAnswer] = useState<boolean | null>(
    formData.otherNotes !== null ? true : null
  );
  const [showSuspectedValueInput, setShowSuspectedValueInput] = useState(false);
  const [showOtherNotesInput, setShowOtherNotesInput] = useState(false);
  const [suspectedValueText, setSuspectedValueText] = useState(formData.suspectedValueNote || '');
  const [otherNotesText, setOtherNotesText] = useState(formData.otherNotes || '');

  const handleSuspectedValueYes = () => {
    setSuspectedValueAnswer(true);
    setShowSuspectedValueInput(true);
  };

  const handleSuspectedValueNo = () => {
    setSuspectedValueAnswer(false);
    updateFormData({ suspectedValueNote: null });
  };

  const saveSuspectedValue = () => {
    updateFormData({ suspectedValueNote: suspectedValueText || null });
    setShowSuspectedValueInput(false);
  };

  const handleOtherNotesYes = () => {
    setOtherNotesAnswer(true);
    setShowOtherNotesInput(true);
  };

  const handleOtherNotesNo = () => {
    setOtherNotesAnswer(false);
    updateFormData({ otherNotes: null });
  };

  const saveOtherNotes = () => {
    updateFormData({ otherNotes: otherNotesText || null });
    setShowOtherNotesInput(false);
  };

  const canProceed = () => {
    return suspectedValueAnswer !== null && otherNotesAnswer !== null;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Additional Notes</Text>
      <Text style={styles.sectionDescription}>
        Please answer the following questions
      </Text>

      <View style={styles.questionCard}>
        <Text style={styles.questionText}>
          Is there anything else of suspected value in this load? (e.g. Test Equipment, Newer Servers (DDR4), Newer Devices, etc.)
        </Text>

        <View style={styles.buttonGroup}>
          <TouchableOpacity
            style={[
              styles.choiceButton,
              suspectedValueAnswer === true && styles.choiceButtonSelected,
            ]}
            onPress={handleSuspectedValueYes}
          >
            <Text
              style={[
                styles.choiceButtonText,
                suspectedValueAnswer === true && styles.choiceButtonTextSelected,
              ]}
            >
              Yes
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.choiceButton,
              suspectedValueAnswer === false && styles.choiceButtonSelected,
            ]}
            onPress={handleSuspectedValueNo}
          >
            <Text
              style={[
                styles.choiceButtonText,
                suspectedValueAnswer === false && styles.choiceButtonTextSelected,
              ]}
            >
              No
            </Text>
          </TouchableOpacity>
        </View>

        {formData.suspectedValueNote && (
          <View style={styles.notePreview}>
            <Text style={styles.notePreviewLabel}>Your note:</Text>
            <Text style={styles.notePreviewText}>{formData.suspectedValueNote}</Text>
            <TouchableOpacity
              style={styles.editNoteButton}
              onPress={() => setShowSuspectedValueInput(true)}
            >
              <Text style={styles.editNoteButtonText}>Edit</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      <View style={styles.questionCard}>
        <Text style={styles.questionText}>
          Other Notes / Damages / Customer Requests?
        </Text>

        <View style={styles.buttonGroup}>
          <TouchableOpacity
            style={[
              styles.choiceButton,
              otherNotesAnswer === true && styles.choiceButtonSelected,
            ]}
            onPress={handleOtherNotesYes}
          >
            <Text
              style={[
                styles.choiceButtonText,
                otherNotesAnswer === true && styles.choiceButtonTextSelected,
              ]}
            >
              Yes
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.choiceButton,
              otherNotesAnswer === false && styles.choiceButtonSelected,
            ]}
            onPress={handleOtherNotesNo}
          >
            <Text
              style={[
                styles.choiceButtonText,
                otherNotesAnswer === false && styles.choiceButtonTextSelected,
              ]}
            >
              No
            </Text>
          </TouchableOpacity>
        </View>

        {formData.otherNotes && (
          <View style={styles.notePreview}>
            <Text style={styles.notePreviewLabel}>Your note:</Text>
            <Text style={styles.notePreviewText}>{formData.otherNotes}</Text>
            <TouchableOpacity
              style={styles.editNoteButton}
              onPress={() => setShowOtherNotesInput(true)}
            >
              <Text style={styles.editNoteButtonText}>Edit</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.nextButton, !canProceed() && styles.nextButtonDisabled]}
          onPress={onNext}
          disabled={!canProceed()}
        >
          <Text style={styles.nextButtonText}>Review</Text>
        </TouchableOpacity>
      </View>

      <Modal
        visible={showSuspectedValueInput}
        transparent
        animationType="slide"
        onRequestClose={() => setShowSuspectedValueInput(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Suspected Value Note</Text>
            <TextInput
              style={styles.textArea}
              value={suspectedValueText}
              onChangeText={setSuspectedValueText}
              placeholder="Enter your note here..."
              placeholderTextColor={colors.textSecondary}
              multiline
              numberOfLines={6}
              textAlignVertical="top"
              autoFocus
            />
            <TouchableOpacity
              style={[
                styles.saveButton,
                !suspectedValueText && styles.saveButtonDisabled,
              ]}
              onPress={saveSuspectedValue}
              disabled={!suspectedValueText}
            >
              <Text style={styles.saveButtonText}>Save</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => {
                setShowSuspectedValueInput(false);
                setSuspectedValueAnswer(null);
              }}
            >
              <Text style={styles.modalCloseButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal
        visible={showOtherNotesInput}
        transparent
        animationType="slide"
        onRequestClose={() => setShowOtherNotesInput(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Other Notes / Damages / Customer Requests</Text>
            <TextInput
              style={styles.textArea}
              value={otherNotesText}
              onChangeText={setOtherNotesText}
              placeholder="Enter your note here..."
              placeholderTextColor={colors.textSecondary}
              multiline
              numberOfLines={6}
              textAlignVertical="top"
              autoFocus
            />
            <TouchableOpacity
              style={[
                styles.saveButton,
                !otherNotesText && styles.saveButtonDisabled,
              ]}
              onPress={saveOtherNotes}
              disabled={!otherNotesText}
            >
              <Text style={styles.saveButtonText}>Save</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => {
                setShowOtherNotesInput(false);
                setOtherNotesAnswer(null);
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
    lineHeight: 24,
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
  notePreview: {
    marginTop: 16,
    padding: 12,
    backgroundColor: colors.highlight,
    borderRadius: 8,
  },
  notePreviewLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 4,
  },
  notePreviewText: {
    fontSize: 14,
    color: colors.text,
    marginBottom: 8,
  },
  editNoteButton: {
    alignSelf: 'flex-start',
    paddingVertical: 4,
    paddingHorizontal: 12,
    backgroundColor: colors.primary,
    borderRadius: 4,
  },
  editNoteButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
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
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 16,
  },
  textArea: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    color: colors.text,
    marginBottom: 16,
    minHeight: 120,
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
