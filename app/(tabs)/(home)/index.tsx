
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { colors } from '@/styles/commonStyles';
import { supabase } from '@/utils/supabase';
import { Employee, Company, Category, Material, CheckInFormData, FormStep } from '@/types/checkIn';
import BasicInfoStep from '@/components/checkIn/BasicInfoStep';
import CategoriesStep from '@/components/checkIn/CategoriesStep';
import MaterialsStep from '@/components/checkIn/MaterialsStep';
import AdditionalNotesStep from '@/components/checkIn/AdditionalNotesStep';
import ReviewStep from '@/components/checkIn/ReviewStep';
import { IconSymbol } from '@/components/IconSymbol';

export default function HomeScreen() {
  const [currentStep, setCurrentStep] = useState<FormStep>('basic-info');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [valueMaterials, setValueMaterials] = useState<Material[]>([]);
  const [chargeMaterials, setChargeMaterials] = useState<Material[]>([]);
  
  const [formData, setFormData] = useState<CheckInFormData>({
    employeeName: '',
    startedAt: null,
    finishedAt: null,
    totalTime: '',
    companyId: '',
    companyName: '',
    address: '',
    contactPerson: '',
    email: '',
    phone: '',
    categories: [],
    valueMaterials: [],
    chargeMaterials: [],
    valueMaterialsTotals: [],
    chargeMaterialsTotals: [],
    suspectedValueNote: null,
    otherNotes: null,
  });

  useEffect(() => {
    loadData();
    // Record the start time when the form is first loaded
    setFormData(prev => ({
      ...prev,
      startedAt: new Date().toISOString(),
    }));
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      const [
        employeesRes,
        companiesRes,
        categoriesRes,
        valueMaterialsRes,
        chargeMaterialsRes,
      ] = await Promise.all([
        supabase.from('employees').select('*').order('name'),
        supabase.from('companies').select('*').order('name'),
        supabase.from('categories').select('*').order('name'),
        supabase.from('value_materials').select('*').order('name'),
        supabase.from('charge_materials').select('*').order('name'),
      ]);

      if (employeesRes.error) {
        console.log('Error loading employees:', employeesRes.error);
      } else {
        setEmployees(employeesRes.data || []);
      }

      if (companiesRes.error) {
        console.log('Error loading companies:', companiesRes.error);
      } else {
        setCompanies(companiesRes.data || []);
      }

      if (categoriesRes.error) {
        console.log('Error loading categories:', categoriesRes.error);
      } else {
        setCategories(categoriesRes.data || []);
      }

      if (valueMaterialsRes.error) {
        console.log('Error loading value materials:', valueMaterialsRes.error);
      } else {
        setValueMaterials(valueMaterialsRes.data || []);
      }

      if (chargeMaterialsRes.error) {
        console.log('Error loading charge materials:', chargeMaterialsRes.error);
      } else {
        setChargeMaterials(chargeMaterialsRes.data || []);
      }
    } catch (error) {
      console.log('Error loading data:', error);
      Alert.alert('Error', 'Failed to load data. Please check your Supabase connection.');
    } finally {
      setLoading(false);
    }
  };

  const updateFormData = (updates: Partial<CheckInFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  const goToNextStep = () => {
    const steps: FormStep[] = [
      'basic-info',
      'categories',
      'value-materials',
      'charge-materials',
      'additional-notes',
      'review',
    ];
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex < steps.length - 1) {
      const nextStep = steps[currentIndex + 1];
      setCurrentStep(nextStep);
      
      // If moving to review step, record the finish time
      if (nextStep === 'review') {
        setFormData(prev => ({
          ...prev,
          finishedAt: new Date().toISOString(),
        }));
      }
    }
  };

  const goToPreviousStep = () => {
    const steps: FormStep[] = [
      'basic-info',
      'categories',
      'value-materials',
      'charge-materials',
      'additional-notes',
      'review',
    ];
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1]);
    }
  };

  const goToStep = (step: FormStep) => {
    setCurrentStep(step);
  };

  const resetFormToBeginning = () => {
    console.log('Resetting form to beginning...');
    
    // Reset form data with a new start time
    setFormData({
      employeeName: '',
      startedAt: new Date().toISOString(),
      finishedAt: null,
      totalTime: '',
      companyId: '',
      companyName: '',
      address: '',
      contactPerson: '',
      email: '',
      phone: '',
      categories: [],
      valueMaterials: [],
      chargeMaterials: [],
      valueMaterialsTotals: [],
      chargeMaterialsTotals: [],
      suspectedValueNote: null,
      otherNotes: null,
    });
    
    // Reset to the first step
    setCurrentStep('basic-info');
    
    console.log('Form reset complete. Ready for new check-in.');
  };

  const confirmCheckInSaved = async (checkInId: string): Promise<boolean> => {
    try {
      console.log('Confirming check-in saved with ID:', checkInId);
      
      // Query the database to confirm the check-in exists
      const { data, error } = await supabase
        .from('check_ins')
        .select('id, employee_name, company_name, created_at')
        .eq('id', checkInId)
        .single();

      if (error) {
        console.error('Error confirming check-in:', error);
        console.error('Error details:', JSON.stringify(error, null, 2));
        return false;
      }

      if (!data) {
        console.error('Check-in not found in database after save. ID:', checkInId);
        return false;
      }

      console.log('Check-in confirmed in database:', data);
      return true;
    } catch (error) {
      console.error('Exception during check-in confirmation:', error);
      return false;
    }
  };

  const submitForm = async () => {
    // Prevent multiple submissions
    if (submitting) {
      console.log('Submission already in progress, ignoring duplicate click');
      return;
    }

    try {
      setSubmitting(true);
      console.log('Starting check-in submission...');
      
      // Ensure finishedAt is set
      const finishedAt = formData.finishedAt || new Date().toISOString();
      
      // Prepare the data to insert
      const checkInData = {
        employee_name: formData.employeeName,
        started_at: formData.startedAt,
        finished_at: finishedAt,
        total_time: formData.totalTime,
        company_id: formData.companyId,
        company_name: formData.companyName,
        address: formData.address,
        contact_person: formData.contactPerson,
        email: formData.email,
        phone: formData.phone,
        categories: formData.categories,
        value_materials: formData.valueMaterials,
        charge_materials: formData.chargeMaterials,
        value_materials_totals: formData.valueMaterialsTotals,
        charge_materials_totals: formData.chargeMaterialsTotals,
        suspected_value_note: formData.suspectedValueNote,
        other_notes: formData.otherNotes,
      };

      console.log('Inserting check-in data:', JSON.stringify(checkInData, null, 2));

      // Insert the check-in
      const { data, error } = await supabase
        .from('check_ins')
        .insert(checkInData)
        .select('id')
        .single();

      if (error) {
        console.error('Error submitting check-in:', error);
        console.error('Error code:', error.code);
        console.error('Error message:', error.message);
        console.error('Error details:', JSON.stringify(error, null, 2));
        
        // Trigger error haptic feedback
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        
        Alert.alert(
          'Save Failed',
          `Failed to save check-in. Error: ${error.message}. Please try again or contact support.`
        );
        
        setSubmitting(false);
        return;
      }

      if (!data || !data.id) {
        console.error('No data returned from insert operation');
        
        // Trigger error haptic feedback
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        
        Alert.alert(
          'Save Failed',
          'Failed to save check-in. No ID returned from database. Please try again.'
        );
        
        setSubmitting(false);
        return;
      }

      const checkInId = data.id;
      console.log('Check-in inserted with ID:', checkInId);

      // Confirm the check-in was saved
      console.log('Confirming check-in was saved...');
      const confirmed = await confirmCheckInSaved(checkInId);

      if (!confirmed) {
        console.error('Check-in confirmation failed for ID:', checkInId);
        
        // Trigger warning haptic feedback
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        
        Alert.alert(
          'Save Verification Failed',
          'The check-in was submitted but could not be verified in the database. Please check the admin panel to confirm it was saved.'
        );
        
        setSubmitting(false);
        return;
      }

      console.log('Check-in successfully saved and confirmed!');
      
      // Trigger success haptic feedback
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      
      // Store the employee and company names for the success message
      const employeeName = formData.employeeName;
      const companyName = formData.companyName;
      
      // IMMEDIATELY reset the form to prevent duplicate submissions
      resetFormToBeginning();
      
      // Reset submitting state AFTER resetting the form
      setSubmitting(false);
      
      // Show success message AFTER resetting (non-blocking)
      Alert.alert(
        '✓ Check-In Saved Successfully!',
        `Employee: ${employeeName}\nCompany: ${companyName}\n\nThe form has been reset and is ready for the next check-in.`,
        [{ text: 'OK' }]
      );
      
      console.log('Form reset complete. Ready for next check-in.');
    } catch (error) {
      console.error('Exception during form submission:', error);
      console.error('Exception details:', JSON.stringify(error, null, 2));
      
      // Trigger error haptic feedback
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      
      Alert.alert(
        'Error',
        `An unexpected error occurred: ${error instanceof Error ? error.message : 'Unknown error'}. Please try again.`
      );
      
      setSubmitting(false);
    }
  };

  const getStepTitle = () => {
    switch (currentStep) {
      case 'basic-info':
        return 'Basic Information';
      case 'categories':
        return 'Certificate of Destruction';
      case 'value-materials':
        return 'Value Materials';
      case 'charge-materials':
        return 'Charge Materials';
      case 'additional-notes':
        return 'Additional Notes';
      case 'review':
        return 'Review & Submit';
      default:
        return '';
    }
  };

  const getStepNumber = () => {
    const steps: FormStep[] = [
      'basic-info',
      'categories',
      'value-materials',
      'charge-materials',
      'additional-notes',
      'review',
    ];
    return steps.indexOf(currentStep) + 1;
  };

  if (loading && employees.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading data...</Text>
        <Text style={styles.setupText}>
          Make sure Supabase is configured with the required tables.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Warehouse Check-In</Text>
        <Text style={styles.stepIndicator}>
          Step {getStepNumber()} of 6: {getStepTitle()}
        </Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {currentStep === 'basic-info' && (
          <BasicInfoStep
            formData={formData}
            updateFormData={updateFormData}
            employees={employees}
            companies={companies}
            onNext={goToNextStep}
          />
        )}

        {currentStep === 'categories' && (
          <CategoriesStep
            formData={formData}
            updateFormData={updateFormData}
            categories={categories}
            onNext={goToNextStep}
            onBack={goToPreviousStep}
          />
        )}

        {currentStep === 'value-materials' && (
          <MaterialsStep
            formData={formData}
            updateFormData={updateFormData}
            materials={valueMaterials}
            materialType="value"
            onNext={goToNextStep}
            onBack={goToPreviousStep}
          />
        )}

        {currentStep === 'charge-materials' && (
          <MaterialsStep
            formData={formData}
            updateFormData={updateFormData}
            materials={chargeMaterials}
            materialType="charge"
            onNext={goToNextStep}
            onBack={goToPreviousStep}
          />
        )}

        {currentStep === 'additional-notes' && (
          <AdditionalNotesStep
            formData={formData}
            updateFormData={updateFormData}
            onNext={goToNextStep}
            onBack={goToPreviousStep}
          />
        )}

        {currentStep === 'review' && (
          <ReviewStep
            formData={formData}
            onEdit={goToStep}
            onSubmit={submitForm}
            onBack={goToPreviousStep}
            loading={submitting}
          />
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    fontSize: 18,
    color: colors.text,
    marginTop: 16,
    fontWeight: '600',
  },
  setupText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 8,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  header: {
    backgroundColor: colors.card,
    paddingTop: 48,
    paddingBottom: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
    elevation: 3,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
  },
  stepIndicator: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 120,
  },
});
