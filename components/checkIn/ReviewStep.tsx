
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { colors } from '@/styles/commonStyles';
import { CheckInFormData, FormStep } from '@/types/checkIn';
import { IconSymbol } from '@/components/IconSymbol';

interface ReviewStepProps {
  formData: CheckInFormData;
  onEdit: (step: FormStep) => void;
  onSubmit: () => void;
  onBack: () => void;
  loading: boolean;
}

export default function ReviewStep({
  formData,
  onEdit,
  onSubmit,
  onBack,
  loading,
}: ReviewStepProps) {
  const getTotalCategoryQuantity = () => {
    return formData.categories.reduce((total, item) => {
      const qty = parseFloat(item.quantity) || 0;
      return total + qty;
    }, 0);
  };

  const formatDateTime = (dateString: string | null) => {
    if (!dateString) return 'Not recorded';
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    });
  };

  const calculateDuration = () => {
    if (!formData.startedAt || !formData.finishedAt) return 'N/A';
    const start = new Date(formData.startedAt);
    const finish = new Date(formData.finishedAt);
    const durationMs = finish.getTime() - start.getTime();
    const minutes = Math.floor(durationMs / 60000);
    const seconds = Math.floor((durationMs % 60000) / 1000);
    return `${minutes} min ${seconds} sec`;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Review Your Submission</Text>
      <Text style={styles.sectionDescription}>
        Please review all information before submitting
      </Text>

      <View style={styles.timestampSection}>
        <Text style={styles.timestampTitle}>Form Timestamps</Text>
        <View style={styles.timestampRow}>
          <Text style={styles.timestampLabel}>Started:</Text>
          <Text style={styles.timestampValue}>{formatDateTime(formData.startedAt)}</Text>
        </View>
        <View style={styles.timestampRow}>
          <Text style={styles.timestampLabel}>Finished:</Text>
          <Text style={styles.timestampValue}>{formatDateTime(formData.finishedAt)}</Text>
        </View>
        <View style={styles.timestampRow}>
          <Text style={styles.timestampLabel}>Duration:</Text>
          <Text style={styles.timestampValue}>{calculateDuration()}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionHeaderTitle}>Basic Information</Text>
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => onEdit('basic-info')}
          >
            <IconSymbol
              ios_icon_name="pencil"
              android_material_icon_name="edit"
              size={16}
              color={colors.primary}
            />
            <Text style={styles.editButtonText}>Edit</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Employee Name:</Text>
          <Text style={styles.infoValue}>{formData.employeeName}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Total Time:</Text>
          <Text style={styles.infoValue}>{formData.totalTime} hrs</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Company:</Text>
          <Text style={styles.infoValue}>{formData.companyName}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Address:</Text>
          <Text style={styles.infoValue}>{formData.address}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Contact Person:</Text>
          <Text style={styles.infoValue}>{formData.contactPerson}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Email:</Text>
          <Text style={styles.infoValue}>{formData.email}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Phone:</Text>
          <Text style={styles.infoValue}>{formData.phone}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionHeaderTitle}>Certificate of Destruction</Text>
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => onEdit('categories')}
          >
            <IconSymbol
              ios_icon_name="pencil"
              android_material_icon_name="edit"
              size={16}
              color={colors.primary}
            />
            <Text style={styles.editButtonText}>Edit</Text>
          </TouchableOpacity>
        </View>
        {formData.categories.map((item, index) => (
          <View key={index} style={styles.infoRow}>
            <Text style={styles.infoLabel}>{item.category}:</Text>
            <Text style={styles.infoValue}>{item.quantity}</Text>
          </View>
        ))}
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total:</Text>
          <Text style={styles.totalValue}>{getTotalCategoryQuantity()}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionHeaderTitle}>Value Materials</Text>
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => onEdit('value-materials')}
          >
            <IconSymbol
              ios_icon_name="pencil"
              android_material_icon_name="edit"
              size={16}
              color={colors.primary}
            />
            <Text style={styles.editButtonText}>Edit</Text>
          </TouchableOpacity>
        </View>
        {formData.valueMaterials.length === 0 ? (
          <Text style={styles.emptyText}>No value materials received</Text>
        ) : (
          <React.Fragment>
            {formData.valueMaterials.map((item, index) => (
              <View key={index} style={styles.infoRow}>
                <Text style={styles.infoLabel}>{item.materialName}:</Text>
                <Text style={styles.infoValue}>
                  {item.quantity} {item.measurement}
                </Text>
              </View>
            ))}
            {formData.valueMaterialsTotals.length > 0 && (
              <View style={styles.totalsSection}>
                <Text style={styles.totalsTitle}>Totals by Unit:</Text>
                {formData.valueMaterialsTotals.map((total, index) => (
                  <View key={index} style={styles.totalRow}>
                    <Text style={styles.totalLabel}>{total.measurement}:</Text>
                    <Text style={styles.totalValue}>{total.total}</Text>
                  </View>
                ))}
              </View>
            )}
          </React.Fragment>
        )}
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionHeaderTitle}>Charge Materials</Text>
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => onEdit('charge-materials')}
          >
            <IconSymbol
              ios_icon_name="pencil"
              android_material_icon_name="edit"
              size={16}
              color={colors.primary}
            />
            <Text style={styles.editButtonText}>Edit</Text>
          </TouchableOpacity>
        </View>
        {formData.chargeMaterials.length === 0 ? (
          <Text style={styles.emptyText}>No charge materials received</Text>
        ) : (
          <React.Fragment>
            {formData.chargeMaterials.map((item, index) => (
              <View key={index} style={styles.infoRow}>
                <Text style={styles.infoLabel}>{item.materialName}:</Text>
                <Text style={styles.infoValue}>
                  {item.quantity} {item.measurement}
                </Text>
              </View>
            ))}
            {formData.chargeMaterialsTotals.length > 0 && (
              <View style={styles.totalsSection}>
                <Text style={styles.totalsTitle}>Totals by Unit:</Text>
                {formData.chargeMaterialsTotals.map((total, index) => (
                  <View key={index} style={styles.totalRow}>
                    <Text style={styles.totalLabel}>{total.measurement}:</Text>
                    <Text style={styles.totalValue}>{total.total}</Text>
                  </View>
                ))}
              </View>
            )}
          </React.Fragment>
        )}
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionHeaderTitle}>Additional Notes</Text>
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => onEdit('additional-notes')}
          >
            <IconSymbol
              ios_icon_name="pencil"
              android_material_icon_name="edit"
              size={16}
              color={colors.primary}
            />
            <Text style={styles.editButtonText}>Edit</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.noteSection}>
          <Text style={styles.noteLabel}>Suspected Value:</Text>
          <Text style={styles.noteValue}>
            {formData.suspectedValueNote || 'None'}
          </Text>
        </View>
        <View style={styles.noteSection}>
          <Text style={styles.noteLabel}>Other Notes / Damages:</Text>
          <Text style={styles.noteValue}>
            {formData.otherNotes || 'None'}
          </Text>
        </View>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={onBack}
          disabled={loading}
        >
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.submitButton, loading && styles.submitButtonDisabled]}
          onPress={onSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.submitButtonText}>Submit Check-In</Text>
          )}
        </TouchableOpacity>
      </View>
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
  timestampSection: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  timestampTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  timestampRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  timestampLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.8)',
  },
  timestampValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  section: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  sectionHeaderTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  editButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  infoLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    flex: 1,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
    flex: 1,
    textAlign: 'right',
  },
  totalsSection: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 2,
    borderTopColor: colors.primary,
    backgroundColor: colors.highlight,
    padding: 12,
    borderRadius: 8,
  },
  totalsTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  totalLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
  },
  totalValue: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.primary,
  },
  emptyText: {
    fontSize: 14,
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
  noteSection: {
    marginBottom: 12,
  },
  noteLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 4,
  },
  noteValue: {
    fontSize: 14,
    color: colors.text,
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
  submitButton: {
    flex: 2,
    backgroundColor: colors.success,
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: colors.disabled,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
