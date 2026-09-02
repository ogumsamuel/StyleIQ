import React from 'react';

import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider as NavigationThemeProvider,
} from '@react-navigation/native';

import { Stack } from 'expo-router';

import { StatusBar } from 'expo-status-bar';

import 'react-native-reanimated';

import { PaystackProvider } from 'react-native-paystack-webview';

import { useColorScheme } from '@/hooks/use-color-scheme';

import {
  ThemeProvider as StyleIQThemeProvider,
} from '@/src/theme/ThemeContext';


// ==================================================
// SETTINGS
// ==================================================

export const unstable_settings = {
  anchor: '(tabs)',
};


// ==================================================
// ROOT LAYOUT
// ==================================================

export default function RootLayout() {

  const colorScheme =
    useColorScheme();


  return (

    <PaystackProvider
      publicKey="pk_test_c56d5b35dc64e1a4a11da8a037c8a6b4a58eda5a"
      currency="NGN"
      debug={true}
    >

      {/* ==========================================
          STYLEIQ THEME
      ========================================== */}

      <StyleIQThemeProvider>

        {/* ========================================
            REACT NAVIGATION THEME
        ======================================== */}

        <NavigationThemeProvider
          value={
            colorScheme === 'dark'
              ? DarkTheme
              : DefaultTheme
          }
        >

          {/* ======================================
              NAVIGATION
          ====================================== */}

          <Stack>

            <Stack.Screen
              name="(tabs)"
              options={{
                headerShown: false,
              }}
            />

            <Stack.Screen
              name="modal"
              options={{
                presentation: 'modal',
                title: 'Modal',
              }}
            />

          </Stack>


          {/* ======================================
              STATUS BAR
          ====================================== */}

          <StatusBar
            style={
              colorScheme === 'dark'
                ? 'light'
                : 'dark'
            }
          />

        </NavigationThemeProvider>

      </StyleIQThemeProvider>

    </PaystackProvider>

  );

}