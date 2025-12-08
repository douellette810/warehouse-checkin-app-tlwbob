
import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { colors } from '@/styles/commonStyles';

export default function SetupInstructions() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>✅ Supabase Connected!</Text>
      <Text style={styles.description}>
        Your Warehouse Check-In app is now connected to Supabase and ready to use.
      </Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Getting Started</Text>
        <Text style={styles.sectionText}>
          - Sample data has been added to help you get started
        </Text>
        <Text style={styles.sectionText}>
          - Go to the Admin tab to manage employees, companies, and materials
        </Text>
        <Text style={styles.sectionText}>
          - Use the Check-In tab to start logging material receipts
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Sample Data Included</Text>
        <Text style={styles.sectionText}>
          ✓ 4 Sample Employees
        </Text>
        <Text style={styles.sectionText}>
          ✓ 3 Sample Companies
        </Text>
        <Text style={styles.sectionText}>
          ✓ 5 Sample Categories
        </Text>
        <Text style={styles.sectionText}>
          ✓ 5 Value Materials
        </Text>
        <Text style={styles.sectionText}>
          ✓ 5 Charge Materials
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Next Steps</Text>
        <Text style={styles.sectionText}>
          1. Review and customize the sample data in the Admin tab
        </Text>
        <Text style={styles.sectionText}>
          2. Add your own employees, companies, and materials
        </Text>
        <Text style={styles.sectionText}>
          3. Start using the Check-In form to log material receipts
        </Text>
        <Text style={styles.sectionText}>
          4. View all check-in records in the Admin tab under "Check-Ins"
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
});
