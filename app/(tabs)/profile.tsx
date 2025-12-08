
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
                case 'check-ins':
                  tableName = 'check_ins';
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
          <View key={item.id} style={styles.dataItem}>
            <View style={styles.dataItemContent}>
              <Text style={styles.dataItemTitle}>{item.company_name}</Text>
              <Text style={styles.dataItemSubtext}>
                Employee: {item.employee_name}
              </Text>
              <Text style={styles.dataItemSubtext}>
                Date: {item.date} at {item.time}
              </Text>
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
            Check-Ins
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
          <Text style={styles.emptyText}>No data available</Text>
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
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
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
});
