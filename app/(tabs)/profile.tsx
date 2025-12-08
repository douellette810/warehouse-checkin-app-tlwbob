
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { colors } from '@/styles/commonStyles';
import { supabase } from '@/utils/supabase';
import { IconSymbol } from '@/components/IconSymbol';

type AdminSection = 'employees' | 'companies' | 'categories' | 'value-materials' | 'charge-materials' | 'check-ins';

export default function ProfileScreen() {
  const [activeSection, setActiveSection] = useState<AdminSection>('employees');
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedCheckIn, setSelectedCheckIn] = useState<any>(null);
  const [data, setData] = useState<any[]>([]);

  const [employeeName, setEmployeeName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [companyAddress, setCompanyAddress] = useState('');
  const [companyContact, setCompanyContact] = useState('');
  const [companyEmail, setCompanyEmail] = useState('');
  const [companyPhone, setCompanyPhone] = useState('');
  const [categoryName, setCategoryName] = useState('');
  const [materialName, setMaterialName] = useState('');
  const [materialMeasurement, setMaterialMeasurement] = useState('');

  useEffect(() => {
    loadData();
  }, [activeSection]);

  const loadData = async () => {
    setLoading(true);
    try {
      let tableName = '';
      switch (activeSection) {
        case 'employees':
          tableName = 'employees';
          break;
        case 'companies':
          tableName = 'companies';
          break;
        case 'categories':
          tableName = 'categories';
          break;
        case 'value-materials':
          tableName = 'value_materials';
          break;
        case 'charge-materials':
          tableName = 'charge_materials';
          break;
        case 'check-ins':
          tableName = 'check_ins';
          break;
      }

      const { data: result, error } = await supabase
        .from(tableName)
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.log('Error loading data:', error);
      } else {
        console.log(`Loaded ${result?.length || 0} items from ${tableName}`);
        setData(result || []);
      }
    } catch (error) {
      console.log('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    setLoading(true);
    try {
      let tableName = '';
      let insertData: any = {};

      switch (activeSection) {
        case 'employees':
          tableName = 'employees';
          insertData = { name: employeeName };
          break;
        case 'companies':
          tableName = 'companies';
          insertData = {
            name: companyName,
            address: companyAddress,
            contact_person: companyContact,
            email: companyEmail,
            phone: companyPhone,
          };
          break;
        case 'categories':
          tableName = 'categories';
          insertData = { name: categoryName };
          break;
        case 'value-materials':
          tableName = 'value_materials';
          insertData = { name: materialName, measurement: materialMeasurement };
          break;
        case 'charge-materials':
          tableName = 'charge_materials';
          insertData = { name: materialName, measurement: materialMeasurement };
          break;
      }

      const { error } = await supabase.from(tableName).insert(insertData);

      if (error) {
        console.log('Error adding data:', error);
        Alert.alert('Error', 'Failed to add item. Please try again.');
      } else {
        Alert.alert('Success', 'Item added successfully!');
        resetForm();
        setShowAddModal(false);
        loadData();
      }
    } catch (error) {
      console.log('Error adding data:', error);
      Alert.alert('Error', 'Failed to add item. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    // Don't allow deletion of check-ins
    if (activeSection === 'check-ins') {
      Alert.alert(
        'Cannot Delete',
        'Check-ins cannot be deleted for record-keeping purposes. They are permanent records.'
      );
      return;
    }

    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to delete this item?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            try {
              let tableName = '';
              switch (activeSection) {
                case 'employees':
                  tableName = 'employees';
                  break;
                case 'companies':
                  tableName = 'companies';
                  break;
                case 'categories':
                  tableName = 'categories';
                  break;
                case 'value-materials':
                  tableName = 'value_materials';
                  break;
                case 'charge-materials':
                  tableName = 'charge_materials';
                  break;
              }

              const { error } = await supabase.from(tableName).delete().eq('id', id);

              if (error) {
                console.log('Error deleting data:', error);
                Alert.alert('Error', 'Failed to delete item. Please try again.');
              } else {
                loadData();
              }
            } catch (error) {
              console.log('Error deleting data:', error);
              Alert.alert('Error', 'Failed to delete item. Please try again.');
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleViewCheckIn = (checkIn: any) => {
    setSelectedCheckIn(checkIn);
    setShowViewModal(true);
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

  const calculateDuration = (startedAt: string | null, finishedAt: string | null) => {
    if (!startedAt || !finishedAt) return 'N/A';
    const start = new Date(startedAt);
    const finish = new Date(finishedAt);
    const durationMs = finish.getTime() - start.getTime();
    const minutes = Math.floor(durationMs / 60000);
    const seconds = Math.floor((durationMs % 60000) / 1000);
    return `${minutes} min ${seconds} sec`;
  };

  const resetForm = () => {
    setEmployeeName('');
    setCompanyName('');
    setCompanyAddress('');
    setCompanyContact('');
    setCompanyEmail('');
    setCompanyPhone('');
    setCategoryName('');
    setMaterialName('');
    setMaterialMeasurement('');
  };

  const renderAddForm = () => {
    switch (activeSection) {
      case 'employees':
        return (
          <TextInput
            style={styles.input}
            value={employeeName}
            onChangeText={setEmployeeName}
            placeholder="Employee Name"
            placeholderTextColor={colors.textSecondary}
          />
        );
      case 'companies':
        return (
          <React.Fragment>
            <TextInput
              style={styles.input}
              value={companyName}
              onChangeText={setCompanyName}
              placeholder="Company Name"
              placeholderTextColor={colors.textSecondary}
            />
            <TextInput
              style={styles.input}
              value={companyAddress}
              onChangeText={setCompanyAddress}
              placeholder="Address"
              placeholderTextColor={colors.textSecondary}
            />
            <TextInput
              style={styles.input}
              value={companyContact}
              onChangeText={setCompanyContact}
              placeholder="Contact Person"
              placeholderTextColor={colors.textSecondary}
            />
            <TextInput
              style={styles.input}
              value={companyEmail}
              onChangeText={setCompanyEmail}
              placeholder="Email"
              placeholderTextColor={colors.textSecondary}
              keyboardType="email-address"
            />
            <TextInput
              style={styles.input}
              value={companyPhone}
              onChangeText={setCompanyPhone}
              placeholder="Phone"
              placeholderTextColor={colors.textSecondary}
              keyboardType="phone-pad"
            />
          </React.Fragment>
        );
      case 'categories':
        return (
          <TextInput
            style={styles.input}
            value={categoryName}
            onChangeText={setCategoryName}
            placeholder="Category Name"
            placeholderTextColor={colors.textSecondary}
          />
        );
      case 'value-materials':
      case 'charge-materials':
        return (
          <React.Fragment>
            <TextInput
              style={styles.input}
              value={materialName}
              onChangeText={setMaterialName}
              placeholder="Material Name"
              placeholderTextColor={colors.textSecondary}
            />
            <TextInput
              style={styles.input}
              value={materialMeasurement}
              onChangeText={setMaterialMeasurement}
              placeholder="Measurement (e.g., Lbs., Pcs.)"
              placeholderTextColor={colors.textSecondary}
            />
          </React.Fragment>
        );
    }
  };

  const renderCheckInDetails = () => {
    if (!selectedCheckIn) return null;

    const getTotalCategoryQuantity = () => {
      if (!selectedCheckIn.categories || !Array.isArray(selectedCheckIn.categories)) return 0;
      return selectedCheckIn.categories.reduce((total: number, item: any) => {
        const qty = parseFloat(item.quantity) || 0;
        return total + qty;
      }, 0);
    };

    return (
      <ScrollView style={styles.checkInDetailsContainer}>
        <View style={styles.timestampSection}>
          <Text style={styles.timestampTitle}>Form Timestamps</Text>
          <View style={styles.timestampRow}>
            <Text style={styles.timestampLabel}>Started:</Text>
            <Text style={styles.timestampValue}>{formatDateTime(selectedCheckIn.started_at)}</Text>
          </View>
          <View style={styles.timestampRow}>
            <Text style={styles.timestampLabel}>Finished:</Text>
            <Text style={styles.timestampValue}>{formatDateTime(selectedCheckIn.finished_at)}</Text>
          </View>
          <View style={styles.timestampRow}>
            <Text style={styles.timestampLabel}>Duration:</Text>
            <Text style={styles.timestampValue}>
              {calculateDuration(selectedCheckIn.started_at, selectedCheckIn.finished_at)}
            </Text>
          </View>
        </View>

        <View style={styles.detailSection}>
          <Text style={styles.detailSectionTitle}>Basic Information</Text>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Employee:</Text>
            <Text style={styles.detailValue}>{selectedCheckIn.employee_name}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Total Time:</Text>
            <Text style={styles.detailValue}>{selectedCheckIn.total_time} hrs</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Company:</Text>
            <Text style={styles.detailValue}>{selectedCheckIn.company_name}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Address:</Text>
            <Text style={styles.detailValue}>{selectedCheckIn.address}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Contact:</Text>
            <Text style={styles.detailValue}>{selectedCheckIn.contact_person}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Email:</Text>
            <Text style={styles.detailValue}>{selectedCheckIn.email}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Phone:</Text>
            <Text style={styles.detailValue}>{selectedCheckIn.phone}</Text>
          </View>
        </View>

        <View style={styles.detailSection}>
          <Text style={styles.detailSectionTitle}>Certificate of Destruction</Text>
          {selectedCheckIn.categories && Array.isArray(selectedCheckIn.categories) ? (
            <React.Fragment>
              {selectedCheckIn.categories.map((item: any, index: number) => (
                <View key={index} style={styles.detailRow}>
                  <Text style={styles.detailLabel}>{item.category}:</Text>
                  <Text style={styles.detailValue}>{item.quantity}</Text>
                </View>
              ))}
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Total:</Text>
                <Text style={styles.totalValue}>{getTotalCategoryQuantity()}</Text>
              </View>
            </React.Fragment>
          ) : (
            <Text style={styles.emptyText}>No categories</Text>
          )}
        </View>

        <View style={styles.detailSection}>
          <Text style={styles.detailSectionTitle}>Value Materials</Text>
          {selectedCheckIn.value_materials && Array.isArray(selectedCheckIn.value_materials) && selectedCheckIn.value_materials.length > 0 ? (
            <React.Fragment>
              {selectedCheckIn.value_materials.map((item: any, index: number) => (
                <View key={index} style={styles.detailRow}>
                  <Text style={styles.detailLabel}>{item.materialName}:</Text>
                  <Text style={styles.detailValue}>{item.quantity} {item.measurement}</Text>
                </View>
              ))}
              {selectedCheckIn.value_materials_totals && Array.isArray(selectedCheckIn.value_materials_totals) && selectedCheckIn.value_materials_totals.length > 0 && (
                <View style={styles.totalsSection}>
                  <Text style={styles.totalsTitle}>Totals by Unit:</Text>
                  {selectedCheckIn.value_materials_totals.map((total: any, index: number) => (
                    <View key={index} style={styles.totalRow}>
                      <Text style={styles.totalLabel}>{total.measurement}:</Text>
                      <Text style={styles.totalValue}>{total.total}</Text>
                    </View>
                  ))}
                </View>
              )}
            </React.Fragment>
          ) : (
            <Text style={styles.emptyText}>No value materials</Text>
          )}
        </View>

        <View style={styles.detailSection}>
          <Text style={styles.detailSectionTitle}>Charge Materials</Text>
          {selectedCheckIn.charge_materials && Array.isArray(selectedCheckIn.charge_materials) && selectedCheckIn.charge_materials.length > 0 ? (
            <React.Fragment>
              {selectedCheckIn.charge_materials.map((item: any, index: number) => (
                <View key={index} style={styles.detailRow}>
                  <Text style={styles.detailLabel}>{item.materialName}:</Text>
                  <Text style={styles.detailValue}>{item.quantity} {item.measurement}</Text>
                </View>
              ))}
              {selectedCheckIn.charge_materials_totals && Array.isArray(selectedCheckIn.charge_materials_totals) && selectedCheckIn.charge_materials_totals.length > 0 && (
                <View style={styles.totalsSection}>
                  <Text style={styles.totalsTitle}>Totals by Unit:</Text>
                  {selectedCheckIn.charge_materials_totals.map((total: any, index: number) => (
                    <View key={index} style={styles.totalRow}>
                      <Text style={styles.totalLabel}>{total.measurement}:</Text>
                      <Text style={styles.totalValue}>{total.total}</Text>
                    </View>
                  ))}
                </View>
              )}
            </React.Fragment>
          ) : (
            <Text style={styles.emptyText}>No charge materials</Text>
          )}
        </View>

        <View style={styles.detailSection}>
          <Text style={styles.detailSectionTitle}>Additional Notes</Text>
          <View style={styles.noteSection}>
            <Text style={styles.noteLabel}>Suspected Value:</Text>
            <Text style={styles.noteValue}>{selectedCheckIn.suspected_value_note || 'None'}</Text>
          </View>
          <View style={styles.noteSection}>
            <Text style={styles.noteLabel}>Other Notes / Damages:</Text>
            <Text style={styles.noteValue}>{selectedCheckIn.other_notes || 'None'}</Text>
          </View>
        </View>
      </ScrollView>
    );
  };

  const renderDataItem = (item: any) => {
    switch (activeSection) {
      case 'employees':
        return (
          <View key={item.id} style={styles.dataItem}>
            <Text style={styles.dataItemText}>{item.name}</Text>
            <TouchableOpacity onPress={() => handleDelete(item.id)}>
              <IconSymbol
                ios_icon_name="trash.fill"
                android_material_icon_name="delete"
                size={20}
                color={colors.secondary}
              />
            </TouchableOpacity>
          </View>
        );
      case 'companies':
        return (
          <View key={item.id} style={styles.dataItem}>
            <View style={styles.dataItemContent}>
              <Text style={styles.dataItemTitle}>{item.name}</Text>
              <Text style={styles.dataItemSubtext}>{item.address}</Text>
              <Text style={styles.dataItemSubtext}>{item.contact_person}</Text>
            </View>
            <TouchableOpacity onPress={() => handleDelete(item.id)}>
              <IconSymbol
                ios_icon_name="trash.fill"
                android_material_icon_name="delete"
                size={20}
                color={colors.secondary}
              />
            </TouchableOpacity>
          </View>
        );
      case 'categories':
        return (
          <View key={item.id} style={styles.dataItem}>
            <Text style={styles.dataItemText}>{item.name}</Text>
            <TouchableOpacity onPress={() => handleDelete(item.id)}>
              <IconSymbol
                ios_icon_name="trash.fill"
                android_material_icon_name="delete"
                size={20}
                color={colors.secondary}
              />
            </TouchableOpacity>
          </View>
        );
      case 'value-materials':
      case 'charge-materials':
        return (
          <View key={item.id} style={styles.dataItem}>
            <View style={styles.dataItemContent}>
              <Text style={styles.dataItemTitle}>{item.name}</Text>
              <Text style={styles.dataItemSubtext}>Measurement: {item.measurement}</Text>
            </View>
            <TouchableOpacity onPress={() => handleDelete(item.id)}>
              <IconSymbol
                ios_icon_name="trash.fill"
                android_material_icon_name="delete"
                size={20}
                color={colors.secondary}
              />
            </TouchableOpacity>
          </View>
        );
      case 'check-ins':
        return (
          <TouchableOpacity
            key={item.id}
            style={styles.dataItem}
            onPress={() => handleViewCheckIn(item)}
          >
            <View style={styles.dataItemContent}>
              <Text style={styles.dataItemTitle}>{item.company_name}</Text>
              <Text style={styles.dataItemSubtext}>
                Employee: {item.employee_name}
              </Text>
              <Text style={styles.dataItemSubtext}>
                Created: {formatDateTime(item.created_at)}
              </Text>
            </View>
            <IconSymbol
              ios_icon_name="chevron.right"
              android_material_icon_name="chevron_right"
              size={20}
              color={colors.textSecondary}
            />
          </TouchableOpacity>
        );
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Admin Panel</Text>
        <Text style={styles.headerSubtitle}>Manage warehouse data</Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.tabsContainer}
        contentContainerStyle={styles.tabsContent}
      >
        <TouchableOpacity
          style={[styles.tab, activeSection === 'employees' && styles.tabActive]}
          onPress={() => setActiveSection('employees')}
        >
          <Text style={[styles.tabText, activeSection === 'employees' && styles.tabTextActive]}>
            Employees
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeSection === 'companies' && styles.tabActive]}
          onPress={() => setActiveSection('companies')}
        >
          <Text style={[styles.tabText, activeSection === 'companies' && styles.tabTextActive]}>
            Companies
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeSection === 'categories' && styles.tabActive]}
          onPress={() => setActiveSection('categories')}
        >
          <Text style={[styles.tabText, activeSection === 'categories' && styles.tabTextActive]}>
            Categories
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeSection === 'value-materials' && styles.tabActive]}
          onPress={() => setActiveSection('value-materials')}
        >
          <Text style={[styles.tabText, activeSection === 'value-materials' && styles.tabTextActive]}>
            Value Materials
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeSection === 'charge-materials' && styles.tabActive]}
          onPress={() => setActiveSection('charge-materials')}
        >
          <Text style={[styles.tabText, activeSection === 'charge-materials' && styles.tabTextActive]}>
            Charge Materials
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeSection === 'check-ins' && styles.tabActive]}
          onPress={() => setActiveSection('check-ins')}
        >
          <Text style={[styles.tabText, activeSection === 'check-ins' && styles.tabTextActive]}>
            Check-Ins ({data.length})
          </Text>
        </TouchableOpacity>
      </ScrollView>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        {activeSection !== 'check-ins' && (
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setShowAddModal(true)}
          >
            <IconSymbol
              ios_icon_name="plus.circle.fill"
              android_material_icon_name="add_circle"
              size={24}
              color="#FFFFFF"
            />
            <Text style={styles.addButtonText}>Add New</Text>
          </TouchableOpacity>
        )}

        {loading ? (
          <ActivityIndicator size="large" color={colors.primary} style={styles.loader} />
        ) : data.length === 0 ? (
          <Text style={styles.emptyText}>
            {activeSection === 'check-ins' 
              ? 'No check-ins found. Complete a check-in to see it here.'
              : 'No data available'}
          </Text>
        ) : (
          data.map(renderDataItem)
        )}
      </ScrollView>

      <Modal
        visible={showAddModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowAddModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              Add {activeSection.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </Text>
            {renderAddForm()}
            <TouchableOpacity
              style={styles.saveButton}
              onPress={handleAdd}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.saveButtonText}>Add</Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => {
                setShowAddModal(false);
                resetForm();
              }}
            >
              <Text style={styles.modalCloseButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal
        visible={showViewModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowViewModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Check-In Details</Text>
              <TouchableOpacity onPress={() => setShowViewModal(false)}>
                <IconSymbol
                  ios_icon_name="xmark.circle.fill"
                  android_material_icon_name="cancel"
                  size={28}
                  color={colors.textSecondary}
                />
              </TouchableOpacity>
            </View>
            {renderCheckInDetails()}
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
  header: {
    backgroundColor: colors.card,
    paddingTop: 48,
    paddingBottom: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  tabsContainer: {
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tabsContent: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginHorizontal: 4,
    borderRadius: 20,
    backgroundColor: colors.background,
  },
  tabActive: {
    backgroundColor: colors.primary,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  tabTextActive: {
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 120,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    borderRadius: 8,
    padding: 16,
    marginBottom: 20,
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  loader: {
    marginTop: 40,
  },
  emptyText: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 40,
  },
  dataItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  dataItemContent: {
    flex: 1,
  },
  dataItemText: {
    fontSize: 16,
    color: colors.text,
    fontWeight: '500',
  },
  dataItemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  dataItemSubtext: {
    fontSize: 14,
    color: colors.textSecondary,
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
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
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
    marginBottom: 12,
  },
  saveButton: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
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
  checkInDetailsContainer: {
    flex: 1,
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
  detailSection: {
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  detailSectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  detailLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    flex: 1,
  },
  detailValue: {
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
});
