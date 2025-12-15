
import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet, Text, TouchableOpacity, Alert } from 'react-native';
import { Redirect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors } from '@/styles/commonStyles';
import { checkBackendConnection } from '@/utils/connectionCheck';
import { IconSymbol } from '@/components/IconSymbol';

const STORAGE_KEY_USER = '@warehouse_current_user';

export default function Index() {
  const [isLoading, setIsLoading] = useState(true);
  const [backendConnected, setBackendConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [isRetrying, setIsRetrying] = useState(false);

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    console.log('Initializing app...');
    
    // Clear any existing authentication on app start
    // This ensures users must login every time the app is opened
    console.log('Clearing authentication state...');
    await AsyncStorage.removeItem(STORAGE_KEY_USER);
    
    // Step 1: Check backend connection first
    console.log('Step 1: Checking backend connection...');
    const connectionStatus = await checkBackendConnection(8000);
    
    if (!connectionStatus.isConnected) {
      console.log('Backend is not accessible:', connectionStatus.error);
      setBackendConnected(false);
      setConnectionError(connectionStatus.error || 'Unable to connect to server');
      setIsLoading(false);
      return;
    }
    
    console.log('Backend is accessible');
    setBackendConnected(true);
    setConnectionError(null);
    setIsLoading(false);
  };

  const handleRetry = async () => {
    setIsRetrying(true);
    setConnectionError(null);
    setIsLoading(true);
    
    // Wait a moment before retrying
    await new Promise(resolve => setTimeout(resolve, 500));
    
    await initializeApp();
    setIsRetrying(false);
  };

  // Show loading screen
  if (isLoading) {
    return (
      <View style={styles.container}>
        <IconSymbol
          ios_icon_name="building.2.fill"
          android_material_icon_name="warehouse"
          size={80}
          color={colors.primary}
        />
        <ActivityIndicator size="large" color={colors.primary} style={styles.loader} />
        <Text style={styles.loadingText}>Connecting to server...</Text>
      </View>
    );
  }

  // Show connection error screen
  if (!backendConnected) {
    return (
      <View style={styles.container}>
        <IconSymbol
          ios_icon_name="exclamationmark.triangle.fill"
          android_material_icon_name="error"
          size={80}
          color={colors.error || '#FF3B30'}
        />
        <Text style={styles.errorTitle}>Connection Error</Text>
        <Text style={styles.errorMessage}>
          Unable to connect to the server. Please check:
        </Text>
        <View style={styles.checklistContainer}>
          <Text style={styles.checklistItem}>- Server is running on CRSERV</Text>
          <Text style={styles.checklistItem}>- You are connected to the local network</Text>
          <Text style={styles.checklistItem}>- Server IP address is correct</Text>
        </View>
        {connectionError && (
          <View style={styles.errorDetailsBox}>
            <Text style={styles.errorDetailsLabel}>Error Details:</Text>
            <Text style={styles.errorDetails}>{connectionError}</Text>
          </View>
        )}
        <TouchableOpacity
          style={[styles.retryButton, isRetrying && styles.retryButtonDisabled]}
          onPress={handleRetry}
          disabled={isRetrying}
        >
          {isRetrying ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <React.Fragment>
              <IconSymbol
                ios_icon_name="arrow.clockwise"
                android_material_icon_name="refresh"
                size={20}
                color="#FFFFFF"
              />
              <Text style={styles.retryButtonText}>Retry Connection</Text>
            </React.Fragment>
          )}
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.helpButton}
          onPress={() => {
            Alert.alert(
              'Connection Help',
              'Make sure:\n\n1. The server is running on CRSERV\n2. You are on the same network\n3. The server IP in the app matches CRSERV\n\nContact your administrator for assistance.',
              [{ text: 'OK' }]
            );
          }}
        >
          <IconSymbol
            ios_icon_name="questionmark.circle"
            android_material_icon_name="help"
            size={20}
            color={colors.primary}
          />
          <Text style={styles.helpButtonText}>Need Help?</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Backend is connected, redirect to login
  // Users must login every time the app is opened
  return <Redirect href="/login" />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
    padding: 20,
  },
  loader: {
    marginTop: 20,
  },
  loadingText: {
    fontSize: 16,
    color: colors.textSecondary,
    marginTop: 16,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginTop: 20,
    marginBottom: 12,
  },
  errorMessage: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 22,
  },
  checklistContainer: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    width: '100%',
    borderWidth: 1,
    borderColor: colors.border,
  },
  checklistItem: {
    fontSize: 14,
    color: colors.text,
    marginBottom: 8,
    lineHeight: 20,
  },
  errorDetailsBox: {
    backgroundColor: colors.highlight,
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
    width: '100%',
    borderLeftWidth: 4,
    borderLeftColor: colors.error || '#FF3B30',
  },
  errorDetailsLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  errorDetails: {
    fontSize: 12,
    color: colors.textSecondary,
    fontFamily: 'monospace',
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    borderRadius: 12,
    padding: 16,
    width: '100%',
    marginBottom: 12,
  },
  retryButtonDisabled: {
    opacity: 0.6,
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  helpButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
  },
  helpButtonText: {
    fontSize: 14,
    color: colors.primary,
    marginLeft: 8,
    fontWeight: '600',
  },
});
