
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
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { colors } from '@/styles/commonStyles';
import { localDb } from '@/app/integrations/local-db/client';
import { Employee, Company, Category, Material, ISeriesProcessor, CheckInFormData, FormStep } from '@/types/checkIn';
import BasicInfoStep from '@/components/checkIn/BasicInfoStep';
import CategoriesStep from '@/components/checkIn/CategoriesStep';
import ValueScrapStep from '@/components/checkIn/ValueScrapStep';
import ChargeMaterialsStep from '@/components/checkIn/ChargeMaterialsStep';
import ISeriesStep from '@/components/checkIn/ISeriesStep';
import AdditionalNotesStep from '@/components/checkIn/AdditionalNotesStep';
import ReviewStep from '@/components/checkIn/ReviewStep';
import { IconSymbol } from '@/components/IconSymbol';

export default function CheckInScreen() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<FormStep>('basic-info');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [valueScrap, setValueScrap] = useState<Material[]>([]);
  const [chargeMaterials, setChargeMaterials] = useState<Material[]>([]);
  const [iSeriesProcessors, setISeriesProcessors] = useState<ISeriesProcessor[]>([]);
  
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
    valueScrap: [],
    chargeMaterials: [],
    valueScrapTotals: [],
    chargeMaterialsTotals: [],
    hasISeriesPcs: null,
    hasISeriesLaptops: null,
    iSeriesPcs: [],
    iSeriesLaptops: [],
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
        employeesData,
        companiesData,
        categoriesData,
        valueScrapData,
        chargeMaterialsData,
        iSeriesData,
      ] = await Promise.all([
        localDb.employees.getAll(),
        localDb.companies.getAll(),
        localDb.categories.getAll(),
        localDb.valueScrap.getAll(),
        localDb.chargeMaterials.getAll(),
        localDb.iSeries.getAll(),
      ]);

      setEmployees(employeesData || []);
      setCompanies(companiesData || []);
      setCategories(categoriesData || []);
      setValueScrap(valueScrapData || []);
      setChargeMaterials(chargeMaterialsData || []);
      setISeriesProcessors(iSeriesData || []);

      console.log('Loaded data from local database:');
      console.log('- Employees:', employeesData.length);
      console.log('- Companies:', companiesData.length);
      console.log('- Categories:', categoriesData.length);
      console.log('- Value Scrap:', valueScrapData.length);
      console.log('- Charge Materials:', chargeMaterialsData.length);
      console.log('- i-Series:', iSeriesData.length);
    } catch (error) {
      console.log('Error loading data:', error);
      Alert.alert('Error', 'Failed to load data from local database. Please try again.');
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
      'value-scrap',
      'charge-materials',
      'i-series',
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
      'value-scrap',
      'charge-materials',
      'i-series',
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
      valueScrap: [],
      chargeMaterials: [],
      valueScrapTotals: [],
      chargeMaterialsTotals: [],
      hasISeriesPcs: null,
      hasISeriesLaptops: null,
      iSeriesPcs: [],
      iSeriesLaptops: [],
      suspectedValueNote: null,
      otherNotes: null,
    });
    
    // Navigate back to home
    router.back();
    
    console.log('Form reset complete. Ready for new check-in.');
  };

  const submitForm = async () => {
    // Prevent multiple submissions
    if (submitting) {
      console.log('Submission already in progress, ignoring duplicate click');
      return;
    }

    try {
      setSubmitting(true);
      console.log('Starting check-in submission to local database...');
      
      // Ensure finishedAt is set
      const finishedAt = formData.finishedAt || new Date().toISOString();
      
      // Update formData with finishedAt
      const checkInData = {
        ...formData,
        finishedAt,
      };

      console.log('Inserting check-in data to local database...');

      // Insert the check-in to local database
      await localDb.checkIns.add(checkInData);

      console.log('Check-in successfully saved to local database!');
      
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
        `Employee: ${employeeName}\nCompany: ${companyName}\n\nThe form has been reset and is ready for the next check-in.\n\n📱 Data saved to local device storage.`,
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
      case 'value-scrap':
        return 'Value Scrap';
      case 'charge-materials':
        return 'Charge Materials';
      case 'i-series':
        return 'i-Series / Ryzen';
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
      'value-scrap',
      'charge-materials',
      'i-series',
      'additional-notes',
      'review',
    ];
    return steps.indexOf(currentStep) + 1;
  };

  if (loading && employees.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading data from local database...</Text>
        <Text style={styles.setupText}>
          If this is your first time, please add employees, companies, and other data in the Admin Panel.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <IconSymbol
            ios_icon_name="chevron.left"
            android_material_icon_name="arrow_back"
            size={24}
            color={colors.text}
          />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Warehouse Check-In</Text>
          <Text style={styles.stepIndicator}>
            Step {getStepNumber()} of 7: {getStepTitle()}
          </Text>
        </View>
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

        {currentStep === 'value-scrap' && (
          <ValueScrapStep
            formData={formData}
            updateFormData={updateFormData}
            materials={valueScrap}
            onNext={goToNextStep}
            onBack={goToPreviousStep}
          />
        )}

        {currentStep === 'charge-materials' && (
          <ChargeMaterialsStep
            formData={formData}
            updateFormData={updateFormData}
            materials={chargeMaterials}
            onNext={goToNextStep}
            onBack={goToPreviousStep}
          />
        )}

        {currentStep === 'i-series' && (
          <ISeriesStep
            formData={formData}
            updateFormData={updateFormData}
            processors={iSeriesProcessors}
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
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: 12,
    padding: 4,
  },
  headerContent: {
    flex: 1,
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
