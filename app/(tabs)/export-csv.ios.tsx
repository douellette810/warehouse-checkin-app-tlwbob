
import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { colors } from '../../styles/commonStyles';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import supabase from '../integrations/supabase/client';

interface TableExport {
  name: string;
  displayName: string;
  exported: boolean;
}

export default function ExportCSVScreen() {
  const [exporting, setExporting] = useState(false);
  const [tables, setTables] = useState<TableExport[]>([
    { name: 'employees', displayName: 'Employees', exported: false },
    { name: 'companies', displayName: 'Companies', exported: false },
    { name: 'categories', displayName: 'Categories', exported: false },
    { name: 'value_scrap', displayName: 'Value Scrap', exported: false },
    { name: 'charge_materials', displayName: 'Charge Materials', exported: false },
    { name: 'i_series', displayName: 'I-Series', exported: false },
    { name: 'check_ins', displayName: 'Check-Ins', exported: false },
  ]);

  const escapeCSVValue = (value: any): string => {
    if (value === null || value === undefined) {
      return '';
    }
    
    // Convert objects/arrays to JSON strings
    if (typeof value === 'object') {
      value = JSON.stringify(value);
    }
    
    // Convert to string
    const stringValue = String(value);
    
    // If contains comma, newline, or quote, wrap in quotes and escape quotes
    if (stringValue.includes(',') || stringValue.includes('\n') || stringValue.includes('"')) {
      return `"${stringValue.replace(/"/g, '""')}"`;
    }
    
    return stringValue;
  };

  const convertToCSV = (data: any[]): string => {
    if (!data || data.length === 0) {
      return '';
    }

    const headers = Object.keys(data[0]);
    const csvRows = [];
    
    // Add header row
    csvRows.push(headers.map(h => escapeCSVValue(h)).join(','));
    
    // Add data rows
    for (const row of data) {
      const values = headers.map(header => escapeCSVValue(row[header]));
      csvRows.push(values.join(','));
    }
    
    return csvRows.join('\n');
  };

  const exportTable = async (tableName: string) => {
    try {
      console.log(`Exporting table: ${tableName}`);
      
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .order('created_at', { ascending: true });

      if (error) {
        throw new Error(`Error fetching ${tableName}: ${error.message}`);
      }

      if (!data || data.length === 0) {
        Alert.alert('No Data', `Table ${tableName} is empty.`);
        return null;
      }

      const csvContent = convertToCSV(data);
      const fileName = `${tableName}_export.csv`;
      const fileUri = FileSystem.documentDirectory + fileName;

      await FileSystem.writeAsStringAsync(fileUri, csvContent, {
        encoding: FileSystem.EncodingType.UTF8,
      });

      console.log(`Exported ${tableName} to ${fileUri}`);
      return fileUri;
    } catch (error) {
      console.error(`Error exporting ${tableName}:`, error);
      throw error;
    }
  };

  const exportSingleTable = async (tableName: string, displayName: string) => {
    setExporting(true);
    try {
      const fileUri = await exportTable(tableName);
      
      if (fileUri) {
        // Mark as exported
        setTables(prev => prev.map(t => 
          t.name === tableName ? { ...t, exported: true } : t
        ));

        // Share the file
        const canShare = await Sharing.isAvailableAsync();
        if (canShare) {
          await Sharing.shareAsync(fileUri, {
            mimeType: 'text/csv',
            dialogTitle: `Export ${displayName}`,
            UTI: 'public.comma-separated-values-text',
          });
        } else {
          Alert.alert('Success', `${displayName} exported to ${fileUri}`);
        }
      }
    } catch (error: any) {
      Alert.alert('Export Error', error.message || 'Failed to export table');
    } finally {
      setExporting(false);
    }
  };

  const exportAllTables = async () => {
    setExporting(true);
    const exportedFiles: string[] = [];
    
    try {
      for (const table of tables) {
        try {
          const fileUri = await exportTable(table.name);
          if (fileUri) {
            exportedFiles.push(fileUri);
            setTables(prev => prev.map(t => 
              t.name === table.name ? { ...t, exported: true } : t
            ));
          }
        } catch (error) {
          console.error(`Failed to export ${table.name}:`, error);
        }
      }

      if (exportedFiles.length > 0) {
        Alert.alert(
          'Export Complete',
          `Successfully exported ${exportedFiles.length} table(s).\n\nFiles saved to:\n${FileSystem.documentDirectory}`,
          [
            {
              text: 'OK',
              onPress: async () => {
                // Try to share the first file as an example
                const canShare = await Sharing.isAvailableAsync();
                if (canShare && exportedFiles.length > 0) {
                  await Sharing.shareAsync(exportedFiles[0], {
                    mimeType: 'text/csv',
                    dialogTitle: 'Export CSV Files',
                  });
                }
              }
            }
          ]
        );
      } else {
        Alert.alert('Export Failed', 'No tables were exported successfully.');
      }
    } catch (error: any) {
      Alert.alert('Export Error', error.message || 'Failed to export tables');
    } finally {
      setExporting(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView 
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 20, paddingBottom: 120 }}
      >
        <Text style={{
          fontSize: 28,
          fontWeight: 'bold',
          color: colors.text,
          marginBottom: 10,
        }}>
          Export to CSV
        </Text>
        
        <Text style={{
          fontSize: 16,
          color: colors.textSecondary,
          marginBottom: 30,
          lineHeight: 24,
        }}>
          Export your Supabase data to CSV files for import into SQL Server.
          {'\n\n'}
          You can export individual tables or all tables at once.
        </Text>

        {/* Export All Button */}
        <TouchableOpacity
          onPress={exportAllTables}
          disabled={exporting}
          style={{
            backgroundColor: colors.primary,
            padding: 18,
            borderRadius: 12,
            alignItems: 'center',
            marginBottom: 30,
            opacity: exporting ? 0.6 : 1,
          }}
        >
          {exporting ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={{
              color: '#FFFFFF',
              fontSize: 18,
              fontWeight: '600',
            }}>
              Export All Tables
            </Text>
          )}
        </TouchableOpacity>

        {/* Individual Table Exports */}
        <Text style={{
          fontSize: 20,
          fontWeight: '600',
          color: colors.text,
          marginBottom: 15,
        }}>
          Individual Tables
        </Text>

        {tables.map((table, index) => (
          <TouchableOpacity
            key={index}
            onPress={() => exportSingleTable(table.name, table.displayName)}
            disabled={exporting}
            style={{
              backgroundColor: colors.card,
              padding: 16,
              borderRadius: 12,
              marginBottom: 12,
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              opacity: exporting ? 0.6 : 1,
            }}
          >
            <View style={{ flex: 1 }}>
              <Text style={{
                fontSize: 18,
                fontWeight: '600',
                color: colors.text,
                marginBottom: 4,
              }}>
                {table.displayName}
              </Text>
              <Text style={{
                fontSize: 14,
                color: colors.textSecondary,
              }}>
                {table.name}.csv
              </Text>
            </View>
            
            {table.exported && (
              <View style={{
                backgroundColor: '#4CAF50',
                paddingHorizontal: 12,
                paddingVertical: 6,
                borderRadius: 6,
              }}>
                <Text style={{
                  color: '#FFFFFF',
                  fontSize: 12,
                  fontWeight: '600',
                }}>
                  ✓ Exported
                </Text>
              </View>
            )}
          </TouchableOpacity>
        ))}

        {/* Instructions */}
        <View style={{
          backgroundColor: colors.card,
          padding: 20,
          borderRadius: 12,
          marginTop: 20,
        }}>
          <Text style={{
            fontSize: 18,
            fontWeight: '600',
            color: colors.text,
            marginBottom: 12,
          }}>
            Import Instructions for SQL Server
          </Text>
          
          <Text style={{
            fontSize: 14,
            color: colors.textSecondary,
            lineHeight: 22,
          }}>
            1. Export the CSV files using the buttons above
            {'\n\n'}
            2. Transfer the CSV files to your SQL Server machine
            {'\n\n'}
            3. In SQL Server Management Studio, right-click your database
            {'\n\n'}
            4. Select Tasks → Import Data
            {'\n\n'}
            5. Choose &quot;Flat File Source&quot; and select each CSV file
            {'\n\n'}
            6. Map the columns to your SQL Server tables
            {'\n\n'}
            Note: JSONB columns (categories, value_scrap, charge_materials, etc.) are exported as JSON strings. You may need to parse these in SQL Server.
          </Text>
        </View>

        {/* SQL Server Connection Info */}
        <View style={{
          backgroundColor: colors.card,
          padding: 20,
          borderRadius: 12,
          marginTop: 20,
        }}>
          <Text style={{
            fontSize: 18,
            fontWeight: '600',
            color: colors.text,
            marginBottom: 12,
          }}>
            Your SQL Server Details
          </Text>
          
          <Text style={{
            fontSize: 14,
            color: colors.textSecondary,
            lineHeight: 22,
            fontFamily: 'monospace',
          }}>
            Server: CRSERV\SQLEXPRESS
            {'\n'}
            User: CRSERV\Administrator
            {'\n'}
            Password: W1@3!-j/R
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}
