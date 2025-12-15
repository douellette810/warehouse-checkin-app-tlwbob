
import { Platform } from 'react-native';
import { Stack } from 'expo-router';

export default function HomeLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          headerShown: Platform.OS === 'ios',
          title: 'Home'
        }}
      />
      <Stack.Screen
        name="login"
        options={{
          headerShown: false,
          title: 'Login'
        }}
      />
      <Stack.Screen
        name="change-password"
        options={{
          headerShown: false,
          title: 'Change Password'
        }}
      />
      <Stack.Screen
        name="checkin"
        options={{
          headerShown: false,
          title: 'Check-In'
        }}
      />
    </Stack>
  );
}
