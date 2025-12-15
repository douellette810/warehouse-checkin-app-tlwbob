
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Modal,
} from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import { colors } from '@/styles/commonStyles';
import api from '@/app/api/client';
import { Employee, Company, Category, Material, ISeriesProcessor, CheckInFormData, FormStep } from '@/types/checkIn';
import BasicInfoStep from '@/components/checkIn/BasicInfoStep';
import CategoriesStep from '@/components/checkIn/CategoriesStep';
import ValueScrapStep from '@/components/checkIn/ValueScrapStep';
import ChargeMaterialsStep from '@/components/checkIn/ChargeMaterialsStep';
import ISeriesStep from '@/components/checkIn/ISeriesStep';
import AdditionalNotesStep from '@/components/checkIn/AdditionalNotesStep';
import ReviewStep from '@/components/checkIn/ReviewStep';
import { IconSymbol } from '@/components/IconSymbol';

const STORAGE_KEY_USER = '@warehouse_current_user';

export default function CheckInScreen() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<FormStep>('basic-info');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
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
    checkAuthentication();
  }, []);

  const checkAuthentication = async () => {
    try {
      const userJson = await AsyncStorage.getItem(STORAGE_KEY_USER);
      if (!userJson) {
        Alert.alert('Not Logged In', 'Please log in to continue');
        router.replace('/(tabs)/(home)/login');
        return;
      }

      const user = JSON.parse(userJson);
      setCurrentUser(user);
      console.log('Current user:', user.name);

      // Load data after authentication
      await loadData();

      // Auto-fill employee name if user has a preference
      if (user.employee_id) {
        const employee = employees.find(e => e.id === user.employee_id);
        if (employee) {
          setFormData(prev => ({
            ...prev,
            employeeName: employee.name,
          }));
          console.log('Auto-filled employee:', employee.name);
        }
      }

      // Record the start time when the form is first loaded
      setFormData(prev => ({
        ...prev,
        startedAt: new Date().toISOString(),
      }));
    } catch (error) {
      console.error('Error checking authentication:', error);
      Alert.alert('Error', 'Failed to verify authentication');
      router.replace('/(tabs)/(home)/login');
    }
  };

  const loadData = async () => {
    try {
      setLoading(true);
      
      const [
        employeesRes,
        companiesRes,
        categoriesRes,
        valueScrapRes,
        chargeMaterialsRes,
        iSeriesRes,
      ] = await Promise.all([
        api.employees.getAll(),
        api.companies.getAll(),
        api.categories.getAll(),
        api.valueScrap.getAll(),
        api.chargeMaterials.getAll(),
        api.iSeries.getAll(),
      ]);

      if (employeesRes.success && employeesRes.data) {
        setEmployees(employeesRes.data);
      } else {
        console.log('Error loading employees:', employeesRes.error);
      }

      if (companiesRes.success && companiesRes.data) {
        setCompanies(companiesRes.data);
      } else {
        console.log('Error loading companies:', companiesRes.error);
      }

      if (categoriesRes.success && categoriesRes.data) {
        setCategories(categoriesRes.data);
      } else {
        console.log('Error loading categories:', categoriesRes.error);
      }

      if (valueScrapRes.success && valueScrapRes.data) {
        setValueScrap(valueScrapRes.data);
      } else {
        console.log('Error loading value scrap:', valueScrapRes.error);
      }

      if (chargeMaterialsRes.success && chargeMaterialsRes.data) {
        setChargeMaterials(chargeMaterialsRes.data);
      } else {
        console.log('Error loading charge materials:', chargeMaterialsRes.error);
      }

      if (iSeriesRes.success && iSeriesRes.data) {
        setISeriesProcessors(iSeriesRes.data);
      } else {
        console.log('Error loading i-Series processors:', iSeriesRes.error);
      }
    } catch (error) {
      console.log('Error loading data:', error);
      Alert.alert('Error', 'Failed to load data. Please check your backend connection.');
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

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.removeItem(STORAGE_KEY_USER);
              console.log('User logged out');
              router.replace('/(tabs)/(home)');
            } catch (error) {
              console.error('Error logging out:', error);
              Alert.alert('Error', 'Failed to logout');
            }
          },
        },
      ]
    );
  };

  const handleChangePassword = () => {
    setShowUserMenu(false);
    router.push('/(tabs)/(home)/change-password');
  };

  const handleSetEmployeePreference = async () => {
    if (!currentUser) return;

    Alert.alert(
      'Set Employee Preference',
      'Would you like to set your employee entry for auto-fill?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Choose Employee',
          onPress: () => {
            setShowUserMenu(false);
            // This will be handled in BasicInfoStep
            Alert.alert(
              'Employee Preference',
              'Select your employee name in the form, then it will be saved for future check-ins.'
            );
          },
        },
      ]
    );
  };

  const resetFormToBeginning = () => {
    console.log('Resetting form to beginning...');
    
    // Get the employee name to preserve if user has preference
    const employeeName = currentUser?.employee_id 
      ? employees.find(e => e.id === currentUser.employee_id)?.name || ''
      : '';
    
    // Reset form data with a new start time
    setFormData({
      employeeName: employeeName,
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

  const confirmCheckInSaved = async (checkInId: string): Promise<boolean> => {
    try {
      console.log('Confirming check-in saved with ID:', checkInId);
      
      // Query the database to confirm the check-in exists
      const response = await api.checkIns.getById(checkInId);

      if (!response.success || !response.data) {
        console.error('Check-in not found in database after save. ID:', checkInId);
        return false;
      }

      console.log('Check-in confirmed in database:', response.data);
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
        started_at: formData.startedAt || new Date().toISOString(),
        finished_at: finishedAt,
        total_time: formData.totalTime,
        company_id: formData.companyId,
        company_name: formData.companyName,
        address: formData.address,
        contact_person: formData.contactPerson,
        email: formData.email,
        phone: formData.phone,
        categories: formData.categories,
        value_scrap: formData.valueScrap,
        charge_materials: formData.chargeMaterials,
        value_scrap_totals: formData.valueScrapTotals,
        charge_materials_totals: formData.chargeMaterialsTotals,
        has_i_series_pcs: formData.hasISeriesPcs || false,
        has_i_series_laptops: formData.hasISeriesLaptops || false,
        i_series_pcs: formData.iSeriesPcs,
        i_series_laptops: formData.iSeriesLaptops,
        suspected_value_note: formData.suspectedValueNote || '',
        other_notes: formData.otherNotes || '',
      };

      console.log('Inserting check-in data:', JSON.stringify(checkInData, null, 2));

      // Insert the check-in
      const response = await api.checkIns.create(checkInData as any);

      if (!response.success || !response.data) {
        console.error('Error submitting check-in:', response.error);
        
        // Trigger error haptic feedback
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        
        Alert.alert(
          'Save Failed',
          `Failed to save check-in. Error: ${response.error || 'Unknown error'}. Please try again or contact support.`
        );
        
        setSubmitting(false);
        return;
      }

      const checkInId = response.data.id;
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
        <Text style={styles.loadingText}>Loading data...</Text>
        <Text style={styles.setupText}>
          Make sure your backend server is running and accessible.
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
          {currentUser && (
            <Text style={styles.userIndicator}>
              Logged in as: {currentUser.name}
            </Text>
          )}
        </View>
        <TouchableOpacity style={styles.userMenuButton} onPress={() => setShowUserMenu(true)}>
          <IconSymbol
            ios_icon_name="person.circle.fill"
            android_material_icon_name="account_circle"
            size={32}
            color={colors.primary}
          />
        </TouchableOpacity>
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
            currentUser={currentUser}
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

      <Modal
        visible={showUserMenu}
        transparent
        animationType="fade"
        onRequestClose={() => setShowUserMenu(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.userMenuContent}>
            <View style={styles.userMenuHeader}>
              <IconSymbol
                ios_icon_name="person.circle.fill"
                android_material_icon_name="account_circle"
                size={48}
                color={colors.primary}
              />
              <View style={styles.userMenuInfo}>
                <Text style={styles.userMenuName}>{currentUser?.name}</Text>
                <Text style={styles.userMenuEmail}>{currentUser?.email}</Text>
              </View>
            </View>

            <TouchableOpacity style={styles.userMenuItem} onPress={handleChangePassword}>
              <IconSymbol
                ios_icon_name="key.fill"
                android_material_icon_name="vpn_key"
                size={24}
                color={colors.text}
              />
              <Text style={styles.userMenuItemText}>Change Password</Text>
              <IconSymbol
                ios_icon_name="chevron.right"
                android_material_icon_name="chevron_right"
                size={20}
                color={colors.textSecondary}
              />
            </TouchableOpacity>

            <TouchableOpacity style={styles.userMenuItem} onPress={handleSetEmployeePreference}>
              <IconSymbol
                ios_icon_name="person.fill"
                android_material_icon_name="person"
                size={24}
                color={colors.text}
              />
              <Text style={styles.userMenuItemText}>Set Employee Preference</Text>
              <IconSymbol
                ios_icon_name="chevron.right"
                android_material_icon_name="chevron_right"
                size={20}
                color={colors.textSecondary}
              />
            </TouchableOpacity>

            <TouchableOpacity style={styles.userMenuItemDanger} onPress={handleLogout}>
              <IconSymbol
                ios_icon_name="arrow.right.square.fill"
                android_material_icon_name="logout"
                size={24}
                color="#F44336"
              />
              <Text style={styles.userMenuItemTextDanger}>Logout</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.userMenuCloseButton}
              onPress={() => setShowUserMenu(false)}
            >
              <Text style={styles.userMenuCloseButtonText}>Close</Text>
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
    marginBottom: 4,
  },
  stepIndicator: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '500',
    marginBottom: 2,
  },
  userIndicator: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '600',
  },
  userMenuButton: {
    marginLeft: 8,
    padding: 4,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 120,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  userMenuContent: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 20,
    width: '100%',
    maxWidth: 400,
  },
  userMenuHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  userMenuInfo: {
    marginLeft: 16,
    flex: 1,
  },
  userMenuName: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  userMenuEmail: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  userMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: colors.background,
    borderRadius: 12,
    marginBottom: 12,
  },
  userMenuItemText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginLeft: 12,
  },
  userMenuItemDanger: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'rgba(244, 67, 54, 0.1)',
    borderRadius: 12,
    marginBottom: 12,
  },
  userMenuItemTextDanger: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#F44336',
    marginLeft: 12,
  },
  userMenuCloseButton: {
    backgroundColor: colors.border,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  userMenuCloseButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
});
