
import React from 'react';
import { Stack, usePathname } from 'expo-router';
import FloatingTabBar, { TabBarItem } from '@/components/FloatingTabBar';

export default function TabLayout() {
  const pathname = usePathname();
  
  const tabs: TabBarItem[] = [
    {
      name: '(home)',
      route: '/(tabs)/(home)/',
      icon: 'clipboard',
      label: 'Check-In',
    },
    {
      name: 'profile',
      route: '/(tabs)/profile',
      icon: 'settings',
      label: 'Admin',
    },
  ];

  // Hide the FloatingTabBar on the homepage
  const isHomePage = pathname === '/(tabs)/(home)/' || pathname === '/(tabs)/(home)';
  const shouldShowTabBar = !isHomePage;

  return (
    <>
      <Stack
        screenOptions={{
          headerShown: false,
          animation: 'none',
        }}
      >
        <Stack.Screen key="home" name="(home)" />
        <Stack.Screen key="profile" name="profile" />
      </Stack>
      {shouldShowTabBar && <FloatingTabBar tabs={tabs} />}
    </>
  );
}
