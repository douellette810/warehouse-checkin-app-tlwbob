
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

  const submitForm = async () => {
    try {
      setLoading(true);
      
      // Ensure finishedAt is set
      const finishedAt = formData.finishedAt || new Date().toISOString();
      
      const { error } = await supabase.from('check_ins').insert({
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
        suspected_value_note: formData.suspectedValueNote,
        other_notes: formData.otherNotes,
      });

      if (error) {
        console.log('Error submitting form:', error);
        Alert.alert('Error', 'Failed to submit form. Please try again.');
      } else {
        Alert.alert('Success', 'Check-in submitted successfully!', [
          {
            text: 'OK',
            onPress: () => {
              // Reset form and record new start time
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
                suspectedValueNote: null,
                otherNotes: null,
              });
              setCurrentStep('basic-info');
            },
          },
        ]);
      }
    } catch (error) {
      console.log('Error submitting form:', error);
      Alert.alert('Error', 'Failed to submit form. Please try again.');
    } finally {
      setLoading(false);
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
            loading={loading}
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
