
import { StyleSheet, ViewStyle, TextStyle } from 'react-native';

export const colors = {
  background: '#F5F5F5',
  text: '#333333',
  textSecondary: '#666666',
  primary: '#2196F3',
  secondary: '#F44336',
  accent: '#FFC107',
  card: '#FFFFFF',
  highlight: '#BBDEFB',
  border: '#E0E0E0',
  success: '#4CAF50',
  error: '#FF3B30',
  disabled: '#BDBDBD',
};

export const buttonStyles = StyleSheet.create({
  instructionsButton: {
    backgroundColor: colors.primary,
    alignSelf: 'center',
    width: '100%',
  },
  backButton: {
    backgroundColor: colors.card,
    alignSelf: 'center',
    width: '100%',
    borderWidth: 1,
    borderColor: colors.border,
  },
});

export const commonStyles = StyleSheet.create({
  wrapper: {
    backgroundColor: colors.background,
    width: '100%',
    height: '100%',
  },
  container: {
    flex: 1,
    backgroundColor: colors.background,
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    maxWidth: 800,
    width: '100%',
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    textAlign: 'center',
    color: colors.text,
    marginBottom: 10
  },
  text: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
    marginBottom: 8,
    lineHeight: 24,
    textAlign: 'center',
  },
  section: {
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  buttonContainer: {
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  card: {
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 10,
    padding: 16,
    marginVertical: 8,
    width: '100%',
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
    elevation: 2,
  },
  icon: {
    width: 60,
    height: 60,
    tintColor: colors.primary,
  },
});
