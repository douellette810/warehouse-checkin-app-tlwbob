
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { colors } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import { checkBackendConnection, ConnectionStatus } from '@/utils/connectionCheck';

export default function HomeScreen() {
  const router = useRouter();
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus | null>(null);
  const [isCheckingConnection, setIsCheckingConnection] = useState(true);

  useEffect(() => {
    // Check connection on mount
    checkConnection();
    
    // Set up periodic connection checks every 10 seconds
    const interval = setInterval(() => {
      checkConnection();
    }, 10000);
    
    return () => clearInterval(interval);
  }, []);

  const checkConnection = async () => {
    setIsCheckingConnection(true);
    const status = await checkBackendConnection();
    setConnectionStatus(status);
    setIsCheckingConnection(false);
    
    if (!status.isConnected) {
      console.log('Backend not accessible:', status.error);
    }
  };

  const handleCheckInPress = () => {
    if (!connectionStatus?.isConnected) {
      Alert.alert(
        'Backend Not Connected',
        'Cannot access Check-In menu. The backend server is not accessible.\n\n' +
        'Please ensure:\n' +
        '- You are connected to the local network\n' +
        '- The backend server is running\n' +
        '- The server IP address is correct in the app configuration',
        [
          { text: 'Retry', onPress: checkConnection },
          { text: 'Cancel', style: 'cancel' },
        ]
      );
      return;
    }
    
    router.push('/(tabs)/(home)/checkin');
  };

  const handleAdminPress = () => {
    if (!connectionStatus?.isConnected) {
      Alert.alert(
        'Backend Not Connected',
        'Cannot access Admin menu. The backend server is not accessible.\n\n' +
        'Please ensure:\n' +
        '- You are connected to the local network\n' +
        '- The backend server is running\n' +
        '- The server IP address is correct in the app configuration',
        [
          { text: 'Retry', onPress: checkConnection },
          { text: 'Cancel', style: 'cancel' },
        ]
      );
      return;
    }
    
    setShowAdminLogin(true);
  };

  const handleAdminLogin = () => {
    // Default credentials
    if (username === 'admin' && password === 'password') {
      setShowAdminLogin(false);
      setUsername('');
      setPassword('');
      router.push('/(tabs)/profile');
    } else {
      Alert.alert('Login Failed', 'Invalid username or password');
    }
  };

  const getConnectionStatusColor = () => {
    if (isCheckingConnection) return colors.textSecondary;
    return connectionStatus?.isConnected ? '#4CAF50' : '#F44336';
  };

  const getConnectionStatusText = () => {
    if (isCheckingConnection) return 'Checking connection...';
    return connectionStatus?.isConnected 
      ? 'Backend Connected' 
      : 'Backend Not Connected';
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Warehouse Check-In</Text>
        <Text style={styles.headerSubtitle}>Select an option to continue</Text>
        
        <View style={styles.connectionStatusContainer}>
          <View style={[styles.connectionDot, { backgroundColor: getConnectionStatusColor() }]} />
          <Text style={[styles.connectionStatusText, { color: getConnectionStatusColor() }]}>
            {getConnectionStatusText()}
          </Text>
          {isCheckingConnection && (
            <ActivityIndicator size="small" color={colors.textSecondary} style={styles.connectionSpinner} />
          )}
          {!isCheckingConnection && (
            <TouchableOpacity onPress={checkConnection} style={styles.refreshButton}>
              <IconSymbol
                ios_icon_name="arrow.clockwise"
                android_material_icon_name="refresh"
                size={16}
                color={colors.textSecondary}
              />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.content}
      >
        <TouchableOpacity 
          style={[
            styles.optionCard,
            !connectionStatus?.isConnected && styles.optionCardDisabled
          ]} 
          onPress={handleCheckInPress}
          disabled={!connectionStatus?.isConnected}
        >
          <View style={styles.iconContainer}>
            <IconSymbol
              ios_icon_name="clipboard.fill"
              android_material_icon_name="assignment"
              size={64}
              color={connectionStatus?.isConnected ? colors.primary : colors.textSecondary}
            />
          </View>
          <Text style={[
            styles.optionTitle,
            !connectionStatus?.isConnected && styles.optionTitleDisabled
          ]}>
            Check-In
          </Text>
          <Text style={[
            styles.optionDescription,
            !connectionStatus?.isConnected && styles.optionDescriptionDisabled
          ]}>
            Start a new warehouse check-in form
          </Text>
          {!connectionStatus?.isConnected && (
            <View style={styles.disabledBadge}>
              <IconSymbol
                ios_icon_name="exclamationmark.triangle.fill"
                android_material_icon_name="warning"
                size={16}
                color="#F44336"
              />
              <Text style={styles.disabledBadgeText}>Requires Connection</Text>
            </View>
          )}
        </TouchableOpacity>

        <TouchableOpacity 
          style={[
            styles.optionCard,
            !connectionStatus?.isConnected && styles.optionCardDisabled
          ]} 
          onPress={handleAdminPress}
          disabled={!connectionStatus?.isConnected}
        >
          <View style={styles.iconContainer}>
            <IconSymbol
              ios_icon_name="gearshape.fill"
              android_material_icon_name="settings"
              size={64}
              color={connectionStatus?.isConnected ? colors.secondary : colors.textSecondary}
            />
          </View>
          <Text style={[
            styles.optionTitle,
            !connectionStatus?.isConnected && styles.optionTitleDisabled
          ]}>
            Admin
          </Text>
          <Text style={[
            styles.optionDescription,
            !connectionStatus?.isConnected && styles.optionDescriptionDisabled
          ]}>
            Manage data and view check-ins
          </Text>
          {!connectionStatus?.isConnected && (
            <View style={styles.disabledBadge}>
              <IconSymbol
                ios_icon_name="exclamationmark.triangle.fill"
                android_material_icon_name="warning"
                size={16}
                color="#F44336"
              />
              <Text style={styles.disabledBadgeText}>Requires Connection</Text>
            </View>
          )}
        </TouchableOpacity>

        {!connectionStatus?.isConnected && connectionStatus?.error && (
          <View style={styles.errorCard}>
            <IconSymbol
              ios_icon_name="wifi.slash"
              android_material_icon_name="wifi_off"
              size={32}
              color="#F44336"
            />
            <Text style={styles.errorTitle}>Connection Error</Text>
            <Text style={styles.errorMessage}>{connectionStatus.error}</Text>
            <Text style={styles.errorHint}>
              Make sure you are connected to the local network and the backend server is running.
            </Text>
            <TouchableOpacity style={styles.retryButton} onPress={checkConnection}>
              <IconSymbol
                ios_icon_name="arrow.clockwise"
                android_material_icon_name="refresh"
                size={20}
                color="#FFFFFF"
              />
              <Text style={styles.retryButtonText}>Retry Connection</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      <Modal
        visible={showAdminLogin}
        transparent
        animationType="fade"
        onRequestClose={() => setShowAdminLogin(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Admin Login</Text>
            <Text style={styles.modalSubtitle}>
              Enter your credentials to access the admin panel
            </Text>

            <TextInput
              style={styles.input}
              value={username}
              onChangeText={setUsername}
              placeholder="Username"
              placeholderTextColor={colors.textSecondary}
              autoCapitalize="none"
              autoCorrect={false}
            />

            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              placeholder="Password"
              placeholderTextColor={colors.textSecondary}
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
            />

            <TouchableOpacity style={styles.loginButton} onPress={handleAdminLogin}>
              <Text style={styles.loginButtonText}>Login</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => {
                setShowAdminLogin(false);
                setUsername('');
                setPassword('');
              }}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
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
    paddingBottom: 24,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
    elevation: 3,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: 12,
  },
  connectionStatusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  connectionDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  connectionStatusText: {
    fontSize: 14,
    fontWeight: '600',
  },
  connectionSpinner: {
    marginLeft: 8,
  },
  refreshButton: {
    marginLeft: 8,
    padding: 4,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 120,
    gap: 20,
  },
  optionCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.border,
    boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)',
    elevation: 4,
  },
  optionCardDisabled: {
    opacity: 0.5,
    borderColor: colors.textSecondary,
  },
  iconContainer: {
    marginBottom: 16,
  },
  optionTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
  },
  optionTitleDisabled: {
    color: colors.textSecondary,
  },
  optionDescription: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  optionDescriptionDisabled: {
    color: colors.textSecondary,
  },
  disabledBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(244, 67, 54, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginTop: 12,
  },
  disabledBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#F44336',
    marginLeft: 6,
  },
  errorCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#F44336',
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#F44336',
    marginTop: 12,
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 14,
    color: colors.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  errorHint: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 24,
    textAlign: 'center',
  },
  input: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    color: colors.text,
    marginBottom: 16,
  },
  loginButton: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  loginButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  cancelButton: {
    backgroundColor: colors.border,
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
});
