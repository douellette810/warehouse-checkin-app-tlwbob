
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  FlatList,
  Platform,
} from 'react-native';
import { colors } from '@/styles/commonStyles';
import { Employee, Company, CheckInFormData } from '@/types/checkIn';
import DateTimePicker from '@react-native-community/datetimepicker';

interface BasicInfoStepProps {
  formData: CheckInFormData;
  updateFormData: (updates: Partial<CheckInFormData>) => void;
  employees: Employee[];
  companies: Company[];
  onNext: () => void;
}

export default function BasicInfoStep({
  formData,
  updateFormData,
  employees,
  companies,
  onNext,
}: BasicInfoStepProps) {
  const [showEmployeePicker, setShowEmployeePicker] = useState(false);
  const [showCompanyPicker, setShowCompanyPicker] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [showTotalTimePicker, setShowTotalTimePicker] = useState(false);

  const timeOptions = [
    '0.5', '1.0', '1.5', '2.0', '2.5', '3.0', '3.5', '4.0',
    '4.5', '5.0', '5.5', '6.0', '6.5', '7.0', '7.5', '8.0',
  ];

  const handleEmployeeSelect = (employee: Employee) => {
    updateFormData({ employeeName: employee.name });
    setShowEmployeePicker(false);
  };

  const handleCompanySelect = (company: Company) => {
    updateFormData({
      companyId: company.id,
      companyName: company.name,
      address: company.address,
      contactPerson: company.contact_person,
      email: company.email,
      phone: company.phone,
    });
    setShowCompanyPicker(false);
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      const dateString = selectedDate.toISOString().split('T')[0];
      updateFormData({ date: dateString });
    }
  };

  const handleTimeChange = (event: any, selectedTime?: Date) => {
    setShowTimePicker(Platform.OS === 'ios');
    if (selectedTime) {
      const hours = selectedTime.getHours().toString().padStart(2, '0');
      const minutes = selectedTime.getMinutes().toString().padStart(2, '0');
      updateFormData({ time: `${hours}:${minutes}` });
    }
  };

  const handleTotalTimeSelect = (time: string) => {
    updateFormData({ totalTime: time });
    setShowTotalTimePicker(false);
  };

  const isFormValid = () => {
    return (
      formData.employeeName &&
      formData.date &&
      formData.time &&
      formData.totalTime &&
      formData.companyId
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Basic Information</Text>
      <Text style={styles.sectionDescription}>
        Please fill in all required fields to continue
      </Text>

      <View style={styles.fieldContainer}>
        <Text style={styles.label}>Employee Name *</Text>
        <TouchableOpacity
          style={styles.picker}
          onPress={() => setShowEmployeePicker(true)}
        >
          <Text style={formData.employeeName ? styles.pickerText : styles.placeholderText}>
            {formData.employeeName || 'Select Employee'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.fieldContainer}>
        <Text style={styles.label}>Date *</Text>
        <TouchableOpacity
          style={styles.picker}
          onPress={() => setShowDatePicker(true)}
        >
          <Text style={formData.date ? styles.pickerText : styles.placeholderText}>
            {formData.date || 'Select Date'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.fieldContainer}>
        <Text style={styles.label}>Time *</Text>
        <TouchableOpacity
          style={styles.picker}
          onPress={() => setShowTimePicker(true)}
        >
          <Text style={formData.time ? styles.pickerText : styles.placeholderText}>
            {formData.time || 'Select Time'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.fieldContainer}>
        <Text style={styles.label}>Total Time Out and Back (Hrs.) *</Text>
        <TouchableOpacity
          style={styles.picker}
          onPress={() => setShowTotalTimePicker(true)}
        >
          <Text style={formData.totalTime ? styles.pickerText : styles.placeholderText}>
            {formData.totalTime ? `${formData.totalTime} hrs` : 'Select Total Time'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.fieldContainer}>
        <Text style={styles.label}>Company of Origin *</Text>
        <TouchableOpacity
          style={styles.picker}
          onPress={() => setShowCompanyPicker(true)}
        >
          <Text style={formData.companyName ? styles.pickerText : styles.placeholderText}>
            {formData.companyName || 'Select Company'}
          </Text>
        </TouchableOpacity>
      </View>

      {formData.companyId && (
        <View style={styles.autoFillSection}>
          <Text style={styles.autoFillTitle}>Auto-filled Information</Text>
          
          <View style={styles.autoFillField}>
            <Text style={styles.autoFillLabel}>Address:</Text>
            <Text style={styles.autoFillValue}>{formData.address}</Text>
          </View>

          <View style={styles.autoFillField}>
            <Text style={styles.autoFillLabel}>Contact Person:</Text>
            <Text style={styles.autoFillValue}>{formData.contactPerson}</Text>
          </View>

          <View style={styles.autoFillField}>
            <Text style={styles.autoFillLabel}>Email:</Text>
            <Text style={styles.autoFillValue}>{formData.email}</Text>
          </View>

          <View style={styles.autoFillField}>
            <Text style={styles.autoFillLabel}>Phone:</Text>
            <Text style={styles.autoFillValue}>{formData.phone}</Text>
          </View>
        </View>
      )}

      <TouchableOpacity
        style={[styles.nextButton, !isFormValid() && styles.nextButtonDisabled]}
        onPress={onNext}
        disabled={!isFormValid()}
      >
        <Text style={styles.nextButtonText}>Continue</Text>
      </TouchableOpacity>

      <Modal
        visible={showEmployeePicker}
        transparent
        animationType="slide"
        onRequestClose={() => setShowEmployeePicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Employee</Text>
            <FlatList
              data={employees}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.modalItem}
                  onPress={() => handleEmployeeSelect(item)}
                >
                  <Text style={styles.modalItemText}>{item.name}</Text>
                </TouchableOpacity>
              )}
            />
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowEmployeePicker(false)}
            >
              <Text style={styles.modalCloseButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal
        visible={showCompanyPicker}
        transparent
        animationType="slide"
        onRequestClose={() => setShowCompanyPicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Company</Text>
            <FlatList
              data={companies}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.modalItem}
                  onPress={() => handleCompanySelect(item)}
                >
                  <Text style={styles.modalItemText}>{item.name}</Text>
                </TouchableOpacity>
              )}
            />
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowCompanyPicker(false)}
            >
              <Text style={styles.modalCloseButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal
        visible={showTotalTimePicker}
        transparent
        animationType="slide"
        onRequestClose={() => setShowTotalTimePicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Total Time (Hours)</Text>
            <FlatList
              data={timeOptions}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.modalItem}
                  onPress={() => handleTotalTimeSelect(item)}
                >
                  <Text style={styles.modalItemText}>{item} hrs</Text>
                </TouchableOpacity>
              )}
            />
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowTotalTimePicker(false)}
            >
              <Text style={styles.modalCloseButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {showDatePicker && (
        <DateTimePicker
          value={formData.date ? new Date(formData.date) : new Date()}
          mode="date"
          display="default"
          onChange={handleDateChange}
        />
      )}

      {showTimePicker && (
        <DateTimePicker
          value={
            formData.time
              ? new Date(`2000-01-01T${formData.time}`)
              : new Date()
          }
          mode="time"
          display="default"
          onChange={handleTimeChange}
        />
      )}
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
  fieldContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  picker: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 16,
    minHeight: 50,
    justifyContent: 'center',
  },
  pickerText: {
    fontSize: 16,
    color: colors.text,
  },
  placeholderText: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  autoFillSection: {
    backgroundColor: colors.highlight,
    borderRadius: 8,
    padding: 16,
    marginTop: 8,
    marginBottom: 24,
  },
  autoFillTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  autoFillField: {
    marginBottom: 8,
  },
  autoFillLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  autoFillValue: {
    fontSize: 14,
    color: colors.text,
    marginTop: 2,
  },
  nextButton: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
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
  modalCloseButton: {
    backgroundColor: colors.border,
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 16,
  },
  modalCloseButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
});
