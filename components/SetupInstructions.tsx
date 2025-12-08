
import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { colors } from '@/styles/commonStyles';

export default function SetupInstructions() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Supabase Setup Required</Text>
      <Text style={styles.description}>
        This app requires Supabase to store and manage warehouse check-in data.
        Please follow these steps to set up your database:
      </Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>1. Enable Supabase</Text>
        <Text style={styles.sectionText}>
          - Press the Supabase button in Natively
        </Text>
        <Text style={styles.sectionText}>
          - Connect to an existing project or create a new one
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>2. Create Database Tables</Text>
        <Text style={styles.sectionText}>
          Run the following SQL in your Supabase SQL Editor:
        </Text>
      </View>

      <View style={styles.codeBlock}>
        <Text style={styles.code}>
{`-- Employees table
CREATE TABLE employees (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Companies table
CREATE TABLE companies (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  contact_person TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Categories table
CREATE TABLE categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Value materials table
CREATE TABLE value_materials (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  measurement TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Charge materials table
CREATE TABLE charge_materials (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  measurement TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Check-ins table
CREATE TABLE check_ins (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_name TEXT NOT NULL,
  date TEXT NOT NULL,
  time TEXT NOT NULL,
  total_time TEXT NOT NULL,
  company_id UUID NOT NULL,
  company_name TEXT NOT NULL,
  address TEXT NOT NULL,
  contact_person TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  categories JSONB NOT NULL,
  value_materials JSONB NOT NULL,
  charge_materials JSONB NOT NULL,
  suspected_value_note TEXT,
  other_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE value_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE charge_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE check_ins ENABLE ROW LEVEL SECURITY;

-- Create policies (allow all for now)
CREATE POLICY "Allow all" ON employees FOR ALL USING (true);
CREATE POLICY "Allow all" ON companies FOR ALL USING (true);
CREATE POLICY "Allow all" ON categories FOR ALL USING (true);
CREATE POLICY "Allow all" ON value_materials FOR ALL USING (true);
CREATE POLICY "Allow all" ON charge_materials FOR ALL USING (true);
CREATE POLICY "Allow all" ON check_ins FOR ALL USING (true);`}
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>3. Add Initial Data</Text>
        <Text style={styles.sectionText}>
          - Go to the Admin tab in the app
        </Text>
        <Text style={styles.sectionText}>
          - Add employees, companies, categories, and materials
        </Text>
        <Text style={styles.sectionText}>
          - Start using the Check-In form!
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 20,
    paddingBottom: 120,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: 24,
    lineHeight: 24,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  sectionText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 6,
    lineHeight: 20,
  },
  codeBlock: {
    backgroundColor: colors.card,
    borderRadius: 8,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: colors.border,
  },
  code: {
    fontSize: 12,
    fontFamily: 'monospace',
    color: colors.text,
    lineHeight: 18,
  },
});
