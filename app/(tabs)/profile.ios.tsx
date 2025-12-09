
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
  Platform,
} from 'react-native';
import { colors } from '@/styles/commonStyles';
import { supabase } from '@/utils/supabase';
import { IconSymbol } from '@/components/IconSymbol';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system/legacy';

type AdminSection = 'employees' | 'companies' | 'categories' | 'value-scrap' | 'charge-materials' | 'i-series' | 'check-ins';

export default function ProfileScreen() {
  const [expandedSection, setExpandedSection] = useState<AdminSection | null>(null);
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedCheckIn, setSelectedCheckIn] = useState<any>(null);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [data, setData] = useState<{ [key: string]: any[] }>({
    employees: [],
    companies: [],
    categories: [],
    'value-scrap': [],
    'charge-materials': [],
    'i-series': [],
    'check-ins': [],
  });

  const [employeeName, setEmployeeName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [companyAddress, setCompanyAddress] = useState('');
  const [companyContact, setCompanyContact] = useState('');
  const [companyEmail, setCompanyEmail] = useState('');
  const [companyPhone, setCompanyPhone] = useState('');
  const [categoryName, setCategoryName] = useState('');
  const [materialName, setMaterialName] = useState('');
  const [materialMeasurement, setMaterialMeasurement] = useState('');
  const [processorSeries, setProcessorSeries] = useState('');
  const [processorGeneration, setProcessorGeneration] = useState('');

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    const sections: AdminSection[] = ['employees', 'companies', 'categories', 'value-scrap', 'charge-materials', 'i-series', 'check-ins'];
    
    for (const section of sections) {
      await loadDataForSection(section);
    }
  };

  const loadDataForSection = async (section: AdminSection) => {
    try {
      let tableName = '';
      switch (section) {
        case 'employees':
          tableName = 'employees';
          break;
        case 'companies':
          tableName = 'companies';
          break;
        case 'categories':
          tableName = 'categories';
          break;
        case 'value-scrap':
          tableName = 'value_scrap';
          break;
        case 'charge-materials':
          tableName = 'charge_materials';
          break;
        case 'i-series':
          tableName = 'i_series';
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
        setData(prev => ({ ...prev, [section]: result || [] }));
      }
    } catch (error) {
      console.log('Error loading data:', error);
    }
  };

  const handleAdd = async (section: AdminSection) => {
    setLoading(true);
    try {
      let tableName = '';
      let insertData: any = {};

      switch (section) {
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
        case 'value-scrap':
          tableName = 'value_scrap';
          insertData = { name: materialName, measurement: materialMeasurement };
          break;
        case 'charge-materials':
          tableName = 'charge_materials';
          insertData = { name: materialName, measurement: materialMeasurement };
          break;
        case 'i-series':
          tableName = 'i_series';
          insertData = { processor_series: processorSeries, processor_generation: processorGeneration };
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
        loadDataForSection(section);
      }
    } catch (error) {
      console.log('Error adding data:', error);
      Alert.alert('Error', 'Failed to add item. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async (section: AdminSection) => {
    if (!editingItem) return;
    
    setLoading(true);
    try {
      let tableName = '';
      let updateData: any = {};

      switch (section) {
        case 'employees':
          tableName = 'employees';
          updateData = { name: employeeName };
          break;
        case 'companies':
          tableName = 'companies';
          updateData = {
            name: companyName,
            address: companyAddress,
            contact_person: companyContact,
            email: companyEmail,
            phone: companyPhone,
          };
          break;
        case 'categories':
          tableName = 'categories';
          updateData = { name: categoryName };
          break;
        case 'value-scrap':
          tableName = 'value_scrap';
          updateData = { name: materialName, measurement: materialMeasurement };
          break;
        case 'charge-materials':
          tableName = 'charge_materials';
          updateData = { name: materialName, measurement: materialMeasurement };
          break;
        case 'i-series':
          tableName = 'i_series';
          updateData = { processor_series: processorSeries, processor_generation: processorGeneration };
          break;
      }

      const { error } = await supabase
        .from(tableName)
        .update(updateData)
        .eq('id', editingItem.id);

      if (error) {
        console.log('Error updating data:', error);
        Alert.alert('Error', 'Failed to update item. Please try again.');
      } else {
        Alert.alert('Success', 'Item updated successfully!');
        resetForm();
        setShowEditModal(false);
        setEditingItem(null);
        loadDataForSection(section);
      }
    } catch (error) {
      console.log('Error updating data:', error);
      Alert.alert('Error', 'Failed to update item. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (section: AdminSection, id: string) => {
    if (section === 'check-ins') {
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
              switch (section) {
                case 'employees':
                  tableName = 'employees';
                  break;
                case 'companies':
                  tableName = 'companies';
                  break;
                case 'categories':
                  tableName = 'categories';
                  break;
                case 'value-scrap':
                  tableName = 'value_scrap';
                  break;
                case 'charge-materials':
                  tableName = 'charge_materials';
                  break;
                case 'i-series':
                  tableName = 'i_series';
                  break;
              }

              const { error } = await supabase.from(tableName).delete().eq('id', id);

              if (error) {
                console.log('Error deleting data:', error);
                Alert.alert('Error', 'Failed to delete item. Please try again.');
              } else {
                loadDataForSection(section);
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

  const openEditModal = (section: AdminSection, item: any) => {
    setEditingItem(item);
    
    switch (section) {
      case 'employees':
        setEmployeeName(item.name);
        break;
      case 'companies':
        setCompanyName(item.name);
        setCompanyAddress(item.address);
        setCompanyContact(item.contact_person);
        setCompanyEmail(item.email);
        setCompanyPhone(item.phone);
        break;
      case 'categories':
        setCategoryName(item.name);
        break;
      case 'value-scrap':
      case 'charge-materials':
        setMaterialName(item.name);
        setMaterialMeasurement(item.measurement);
        break;
      case 'i-series':
        setProcessorSeries(item.processor_series);
        setProcessorGeneration(item.processor_generation);
        break;
    }
    
    setShowEditModal(true);
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

  const generateCheckInText = (checkIn: any) => {
    const getTotalCategoryQuantity = () => {
      if (!checkIn.categories || !Array.isArray(checkIn.categories)) return 0;
      return checkIn.categories.reduce((total: number, item: any) => {
        const qty = parseFloat(item.quantity) || 0;
        return total + qty;
      }, 0);
    };

    let text = '═══════════════════════════════════════\n';
    text += '        WAREHOUSE CHECK-IN REPORT\n';
    text += '═══════════════════════════════════════\n\n';

    text += '─────────────────────────────────────\n';
    text += 'FORM TIMESTAMPS\n';
    text += '─────────────────────────────────────\n';
    text += `Started:  ${formatDateTime(checkIn.started_at)}\n`;
    text += `Finished: ${formatDateTime(checkIn.finished_at)}\n`;
    text += `Duration: ${calculateDuration(checkIn.started_at, checkIn.finished_at)}\n\n`;

    text += '─────────────────────────────────────\n';
    text += 'BASIC INFORMATION\n';
    text += '─────────────────────────────────────\n';
    text += `Employee:     ${checkIn.employee_name}\n`;
    text += `Total Time:   ${checkIn.total_time} hrs\n`;
    text += `Company:      ${checkIn.company_name}\n`;
    text += `Address:      ${checkIn.address}\n`;
    text += `Contact:      ${checkIn.contact_person}\n`;
    text += `Email:        ${checkIn.email}\n`;
    text += `Phone:        ${checkIn.phone}\n\n`;

    text += '─────────────────────────────────────\n';
    text += 'CERTIFICATE OF DESTRUCTION\n';
    text += '─────────────────────────────────────\n';
    if (checkIn.categories && Array.isArray(checkIn.categories) && checkIn.categories.length > 0) {
      checkIn.categories.forEach((item: any) => {
        text += `${item.category}: ${item.quantity}\n`;
      });
      text += `\nTOTAL: ${getTotalCategoryQuantity()}\n\n`;
    } else {
      text += 'No categories\n\n';
    }

    text += '─────────────────────────────────────\n';
    text += 'VALUE SCRAP\n';
    text += '─────────────────────────────────────\n';
    if (checkIn.value_scrap && Array.isArray(checkIn.value_scrap) && checkIn.value_scrap.length > 0) {
      checkIn.value_scrap.forEach((item: any) => {
        text += `${item.materialName}: ${item.quantity} ${item.measurement}\n`;
      });
      if (checkIn.value_scrap_totals && Array.isArray(checkIn.value_scrap_totals) && checkIn.value_scrap_totals.length > 0) {
        text += '\nTotals by Unit:\n';
        checkIn.value_scrap_totals.forEach((total: any) => {
          text += `  ${total.measurement}: ${total.total}\n`;
        });
      }
      text += '\n';
    } else {
      text += 'No value scrap\n\n';
    }

    text += '─────────────────────────────────────\n';
    text += 'CHARGE MATERIALS\n';
    text += '─────────────────────────────────────\n';
    if (checkIn.charge_materials && Array.isArray(checkIn.charge_materials) && checkIn.charge_materials.length > 0) {
      checkIn.charge_materials.forEach((item: any) => {
        text += `${item.materialName}: ${item.quantity} ${item.measurement}\n`;
      });
      if (checkIn.charge_materials_totals && Array.isArray(checkIn.charge_materials_totals) && checkIn.charge_materials_totals.length > 0) {
        text += '\nTotals by Unit:\n';
        checkIn.charge_materials_totals.forEach((total: any) => {
          text += `  ${total.measurement}: ${total.total}\n`;
        });
      }
      text += '\n';
    } else {
      text += 'No charge materials\n\n';
    }

    text += '─────────────────────────────────────\n';
    text += 'i-SERIES / RYZEN\n';
    text += '─────────────────────────────────────\n';
    text += 'PCs:\n';
    if (checkIn.i_series_pcs && Array.isArray(checkIn.i_series_pcs) && checkIn.i_series_pcs.length > 0) {
      checkIn.i_series_pcs.forEach((item: any) => {
        text += `  ${item.processorSeries} ${item.processorGeneration}: ${item.quantity}\n`;
      });
    } else {
      text += '  None\n';
    }
    text += '\nLaptops:\n';
    if (checkIn.i_series_laptops && Array.isArray(checkIn.i_series_laptops) && checkIn.i_series_laptops.length > 0) {
      checkIn.i_series_laptops.forEach((item: any) => {
        text += `  ${item.processorSeries} ${item.processorGeneration}: ${item.quantity}\n`;
      });
    } else {
      text += '  None\n';
    }
    text += '\n';

    text += '─────────────────────────────────────\n';
    text += 'ADDITIONAL NOTES\n';
    text += '─────────────────────────────────────\n';
    text += `Suspected Value:\n${checkIn.suspected_value_note || 'None'}\n\n`;
    text += `Other Notes / Damages / Customer Requests:\n${checkIn.other_notes || 'None'}\n\n`;

    text += '═══════════════════════════════════════\n';
    text += `Generated: ${new Date().toLocaleString('en-US')}\n`;
    text += '═══════════════════════════════════════\n';

    return text;
  };

  const handlePrintCheckIn = async () => {
    if (!selectedCheckIn) return;

    try {
      const checkInText = generateCheckInText(selectedCheckIn);
      const fileName = `check-in-${selectedCheckIn.company_name.replace(/[^a-z0-9]/gi, '_')}-${new Date().getTime()}.txt`;
      const fileUri = `${FileSystem.documentDirectory}${fileName}`;

      console.log('Saving check-in to:', fileUri);

      await FileSystem.writeAsStringAsync(fileUri, checkInText, {
        encoding: FileSystem.EncodingType.UTF8,
      });

      console.log('File saved successfully');

      const isAvailable = await Sharing.isAvailableAsync();
      if (isAvailable) {
        await Sharing.shareAsync(fileUri, {
          mimeType: 'text/plain',
          dialogTitle: 'Share Check-In Report',
          UTI: 'public.plain-text',
        });
        console.log('File shared successfully');
      } else {
        Alert.alert(
          'File Saved',
          `Check-in report saved to:\n${fileUri}\n\nYou can find it in your device's file manager.`
        );
      }
    } catch (error) {
      console.error('Error sharing check-in:', error);
      Alert.alert('Error', 'Failed to share check-in. Please try again.');
    }
  };

  const handleShareAllCheckIns = async () => {
    const checkIns = data['check-ins'];
    if (checkIns.length === 0) {
      Alert.alert('No Data', 'There are no check-ins to share.');
      return;
    }

    try {
      let allCheckInsText = '═══════════════════════════════════════\n';
      allCheckInsText += '   ALL WAREHOUSE CHECK-IN REPORTS\n';
      allCheckInsText += '═══════════════════════════════════════\n\n';
      allCheckInsText += `Total Check-Ins: ${checkIns.length}\n`;
      allCheckInsText += `Generated: ${new Date().toLocaleString('en-US')}\n\n`;

      checkIns.forEach((checkIn, index) => {
        allCheckInsText += `\n\n${'═'.repeat(39)}\n`;
        allCheckInsText += `CHECK-IN #${index + 1}\n`;
        allCheckInsText += `${'═'.repeat(39)}\n\n`;
        allCheckInsText += generateCheckInText(checkIn);
      });

      const fileName = `all-check-ins-${new Date().getTime()}.txt`;
      const fileUri = `${FileSystem.documentDirectory}${fileName}`;

      console.log('Saving all check-ins to:', fileUri);

      await FileSystem.writeAsStringAsync(fileUri, allCheckInsText, {
        encoding: FileSystem.EncodingType.UTF8,
      });

      console.log('File saved successfully');

      const isAvailable = await Sharing.isAvailableAsync();
      if (isAvailable) {
        await Sharing.shareAsync(fileUri, {
          mimeType: 'text/plain',
          dialogTitle: 'Share All Check-In Reports',
          UTI: 'public.plain-text',
        });
        console.log('File shared successfully');
      } else {
        Alert.alert(
          'File Saved',
          `All check-in reports saved to:\n${fileUri}\n\nYou can find it in your device's file manager.`
        );
      }
    } catch (error) {
      console.error('Error sharing all check-ins:', error);
      Alert.alert('Error', 'Failed to share check-ins. Please try again.');
    }
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
    setProcessorSeries('');
    setProcessorGeneration('');
  };

  const renderAddForm = (section: AdminSection) => {
    switch (section) {
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
      case 'value-scrap':
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
      case 'i-series':
        return (
          <React.Fragment>
            <TextInput
              style={styles.input}
              value={processorSeries}
              onChangeText={setProcessorSeries}
              placeholder="Processor Series (e.g., i3, i5, Ryzen 5)"
              placeholderTextColor={colors.textSecondary}
            />
            <TextInput
              style={styles.input}
              value={processorGeneration}
              onChangeText={setProcessorGeneration}
              placeholder="Processor Generation (e.g., 10th, 11th, N/A)"
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
          {selectedCheckIn.categories && Array.isArray(selectedCheckIn.categories) && selectedCheckIn.categories.length > 0 ? (
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
          <Text style={styles.detailSectionTitle}>Value Scrap</Text>
          {selectedCheckIn.value_scrap && Array.isArray(selectedCheckIn.value_scrap) && selectedCheckIn.value_scrap.length > 0 ? (
            <React.Fragment>
              {selectedCheckIn.value_scrap.map((item: any, index: number) => (
                <View key={index} style={styles.detailRow}>
                  <Text style={styles.detailLabel}>{item.materialName}:</Text>
                  <Text style={styles.detailValue}>{item.quantity} {item.measurement}</Text>
                </View>
              ))}
              {selectedCheckIn.value_scrap_totals && Array.isArray(selectedCheckIn.value_scrap_totals) && selectedCheckIn.value_scrap_totals.length > 0 && (
                <View style={styles.totalsSection}>
                  <Text style={styles.totalsTitle}>Totals by Unit:</Text>
                  {selectedCheckIn.value_scrap_totals.map((total: any, index: number) => (
                    <View key={index} style={styles.totalRow}>
                      <Text style={styles.totalLabel}>{total.measurement}:</Text>
                      <Text style={styles.totalValue}>{total.total}</Text>
                    </View>
                  ))}
                </View>
              )}
            </React.Fragment>
          ) : (
            <Text style={styles.emptyText}>No value scrap</Text>
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
          <Text style={styles.detailSectionTitle}>i-Series / Ryzen</Text>
          
          <View style={styles.subsection}>
            <Text style={styles.subsectionTitle}>PCs:</Text>
            {selectedCheckIn.i_series_pcs && Array.isArray(selectedCheckIn.i_series_pcs) && selectedCheckIn.i_series_pcs.length > 0 ? (
              selectedCheckIn.i_series_pcs.map((item: any, index: number) => (
                <View key={index} style={styles.detailRow}>
                  <Text style={styles.detailLabel}>{item.processorSeries} {item.processorGeneration}:</Text>
                  <Text style={styles.detailValue}>{item.quantity}</Text>
                </View>
              ))
            ) : (
              <Text style={styles.emptyText}>None</Text>
            )}
          </View>

          <View style={styles.subsection}>
            <Text style={styles.subsectionTitle}>Laptops:</Text>
            {selectedCheckIn.i_series_laptops && Array.isArray(selectedCheckIn.i_series_laptops) && selectedCheckIn.i_series_laptops.length > 0 ? (
              selectedCheckIn.i_series_laptops.map((item: any, index: number) => (
                <View key={index} style={styles.detailRow}>
                  <Text style={styles.detailLabel}>{item.processorSeries} {item.processorGeneration}:</Text>
                  <Text style={styles.detailValue}>{item.quantity}</Text>
                </View>
              ))
            ) : (
              <Text style={styles.emptyText}>None</Text>
            )}
          </View>
        </View>

        <View style={styles.detailSection}>
          <Text style={styles.detailSectionTitle}>Additional Notes</Text>
          <View style={styles.noteSection}>
            <Text style={styles.noteLabel}>Suspected Value:</Text>
            <Text style={styles.noteValue}>{selectedCheckIn.suspected_value_note || 'None'}</Text>
          </View>
          <View style={styles.noteSection}>
            <Text style={styles.noteLabel}>Other Notes / Damages / Customer Requests:</Text>
            <Text style={styles.noteValue}>{selectedCheckIn.other_notes || 'None'}</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.shareButton} onPress={handlePrintCheckIn}>
          <IconSymbol
            ios_icon_name="square.and.arrow.up.fill"
            android_material_icon_name="share"
            size={20}
            color="#FFFFFF"
          />
          <Text style={styles.shareButtonText}>Share / Print This Check-In</Text>
        </TouchableOpacity>
      </ScrollView>
    );
  };

  const renderDataItem = (section: AdminSection, item: any) => {
    switch (section) {
      case 'employees':
        return (
          <View key={item.id} style={styles.dataItem}>
            <Text style={styles.dataItemText}>{item.name}</Text>
            <View style={styles.actionButtons}>
              <TouchableOpacity 
                onPress={() => openEditModal(section, item)}
                style={styles.iconButton}
              >
                <IconSymbol
                  ios_icon_name="pencil"
                  android_material_icon_name="edit"
                  size={20}
                  color={colors.primary}
                />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleDelete(section, item.id)}>
                <IconSymbol
                  ios_icon_name="trash.fill"
                  android_material_icon_name="delete"
                  size={20}
                  color={colors.secondary}
                />
              </TouchableOpacity>
            </View>
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
            <View style={styles.actionButtons}>
              <TouchableOpacity 
                onPress={() => openEditModal(section, item)}
                style={styles.iconButton}
              >
                <IconSymbol
                  ios_icon_name="pencil"
                  android_material_icon_name="edit"
                  size={20}
                  color={colors.primary}
                />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleDelete(section, item.id)}>
                <IconSymbol
                  ios_icon_name="trash.fill"
                  android_material_icon_name="delete"
                  size={20}
                  color={colors.secondary}
                />
              </TouchableOpacity>
            </View>
          </View>
        );
      case 'categories':
        return (
          <View key={item.id} style={styles.dataItem}>
            <Text style={styles.dataItemText}>{item.name}</Text>
            <View style={styles.actionButtons}>
              <TouchableOpacity 
                onPress={() => openEditModal(section, item)}
                style={styles.iconButton}
              >
                <IconSymbol
                  ios_icon_name="pencil"
                  android_material_icon_name="edit"
                  size={20}
                  color={colors.primary}
                />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleDelete(section, item.id)}>
                <IconSymbol
                  ios_icon_name="trash.fill"
                  android_material_icon_name="delete"
                  size={20}
                  color={colors.secondary}
                />
              </TouchableOpacity>
            </View>
          </View>
        );
      case 'value-scrap':
      case 'charge-materials':
        return (
          <View key={item.id} style={styles.dataItem}>
            <View style={styles.dataItemContent}>
              <Text style={styles.dataItemTitle}>{item.name}</Text>
              <Text style={styles.dataItemSubtext}>Measurement: {item.measurement}</Text>
            </View>
            <View style={styles.actionButtons}>
              <TouchableOpacity 
                onPress={() => openEditModal(section, item)}
                style={styles.iconButton}
              >
                <IconSymbol
                  ios_icon_name="pencil"
                  android_material_icon_name="edit"
                  size={20}
                  color={colors.primary}
                />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleDelete(section, item.id)}>
                <IconSymbol
                  ios_icon_name="trash.fill"
                  android_material_icon_name="delete"
                  size={20}
                  color={colors.secondary}
                />
              </TouchableOpacity>
            </View>
          </View>
        );
      case 'i-series':
        return (
          <View key={item.id} style={styles.dataItem}>
            <View style={styles.dataItemContent}>
              <Text style={styles.dataItemTitle}>{item.processor_series}</Text>
              <Text style={styles.dataItemSubtext}>Generation: {item.processor_generation}</Text>
            </View>
            <View style={styles.actionButtons}>
              <TouchableOpacity 
                onPress={() => openEditModal(section, item)}
                style={styles.iconButton}
              >
                <IconSymbol
                  ios_icon_name="pencil"
                  android_material_icon_name="edit"
                  size={20}
                  color={colors.primary}
                />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleDelete(section, item.id)}>
                <IconSymbol
                  ios_icon_name="trash.fill"
                  android_material_icon_name="delete"
                  size={20}
                  color={colors.secondary}
                />
              </TouchableOpacity>
            </View>
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

  const getSectionTitle = (section: AdminSection) => {
    switch (section) {
      case 'employees':
        return 'Employees';
      case 'companies':
        return 'Companies';
      case 'categories':
        return 'Categories';
      case 'value-scrap':
        return 'Value Scrap';
      case 'charge-materials':
        return 'Charge Materials';
      case 'i-series':
        return 'i-Series';
      case 'check-ins':
        return 'Check-Ins';
    }
  };

  const renderAccordionSection = (section: AdminSection) => {
    const isExpanded = expandedSection === section;
    const sectionData = data[section] || [];
    const itemCount = sectionData.length;

    return (
      <View key={section} style={styles.accordionSection}>
        <TouchableOpacity
          style={styles.accordionHeader}
          onPress={() => setExpandedSection(isExpanded ? null : section)}
        >
          <View style={styles.accordionHeaderLeft}>
            <Text style={styles.accordionTitle}>{getSectionTitle(section)}</Text>
            <Text style={styles.accordionCount}>({itemCount})</Text>
          </View>
          <IconSymbol
            ios_icon_name={isExpanded ? 'chevron.up' : 'chevron.down'}
            android_material_icon_name={isExpanded ? 'expand_less' : 'expand_more'}
            size={24}
            color={colors.text}
          />
        </TouchableOpacity>

        {isExpanded && (
          <View style={styles.accordionContent}>
            {section === 'check-ins' && sectionData.length > 0 && (
              <TouchableOpacity
                style={styles.shareAllButton}
                onPress={handleShareAllCheckIns}
              >
                <IconSymbol
                  ios_icon_name="square.and.arrow.up.fill"
                  android_material_icon_name="share"
                  size={20}
                  color="#FFFFFF"
                />
                <Text style={styles.shareAllButtonText}>Share / Print All</Text>
              </TouchableOpacity>
            )}

            {section !== 'check-ins' && (
              <TouchableOpacity
                style={styles.addButton}
                onPress={() => {
                  resetForm();
                  setShowAddModal(true);
                }}
              >
                <IconSymbol
                  ios_icon_name="plus.circle.fill"
                  android_material_icon_name="add_circle"
                  size={20}
                  color="#FFFFFF"
                />
                <Text style={styles.addButtonText}>Add New</Text>
              </TouchableOpacity>
            )}

            {sectionData.length === 0 ? (
              <Text style={styles.emptyText}>
                {section === 'check-ins' 
                  ? 'No check-ins found. Complete a check-in to see it here.'
                  : 'No data available'}
              </Text>
            ) : (
              <ScrollView style={styles.dataList} nestedScrollEnabled>
                {sectionData.map((item) => renderDataItem(section, item))}
              </ScrollView>
            )}
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Admin Panel</Text>
        <Text style={styles.headerSubtitle}>Manage/Edit Warehouse Data and View/Print Check-Ins</Text>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        {(['check-ins', 'employees', 'companies', 'categories', 'value-scrap', 'charge-materials', 'i-series'] as AdminSection[]).map(renderAccordionSection)}
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
              Add {expandedSection ? getSectionTitle(expandedSection) : ''}
            </Text>
            <ScrollView style={styles.modalForm}>
              {expandedSection && renderAddForm(expandedSection)}
            </ScrollView>
            <TouchableOpacity
              style={styles.saveButton}
              onPress={() => expandedSection && handleAdd(expandedSection)}
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
        visible={showEditModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowEditModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              Edit {expandedSection ? getSectionTitle(expandedSection) : ''}
            </Text>
            <ScrollView style={styles.modalForm}>
              {expandedSection && renderAddForm(expandedSection)}
            </ScrollView>
            <TouchableOpacity
              style={styles.saveButton}
              onPress={() => expandedSection && handleEdit(expandedSection)}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.saveButtonText}>Save Changes</Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => {
                setShowEditModal(false);
                setEditingItem(null);
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
          <View style={styles.viewModalContent}>
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
    paddingTop: 60,
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
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 120,
  },
  accordionSection: {
    backgroundColor: colors.card,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  accordionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: colors.card,
  },
  accordionHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  accordionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginRight: 8,
  },
  accordionCount: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  accordionContent: {
    padding: 16,
    paddingTop: 0,
    backgroundColor: colors.background,
  },
  dataList: {
    maxHeight: 400,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  addButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  shareAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.secondary,
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  shareAllButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.secondary,
    borderRadius: 8,
    padding: 16,
    marginTop: 20,
    marginBottom: 20,
  },
  shareButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  emptyText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 20,
  },
  dataItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  dataItemContent: {
    flex: 1,
  },
  dataItemText: {
    fontSize: 15,
    color: colors.text,
    fontWeight: '500',
  },
  dataItemTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  dataItemSubtext: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    marginRight: 12,
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
  viewModalContent: {
    backgroundColor: colors.card,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '85%',
    minHeight: '85%',
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
  modalForm: {
    maxHeight: 300,
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
  subsection: {
    marginBottom: 12,
  },
  subsectionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
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
