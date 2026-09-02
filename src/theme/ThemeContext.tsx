import React, {
  createContext,
  useContext,
  useEffect,
  useState,
} from 'react';

import {
  useColorScheme,
} from 'react-native';

import AsyncStorage from '@react-native-async-storage/async-storage';


// ==================================================
// THEME TYPES
// ==================================================

export type ThemeMode =
  | 'light'
  | 'dark'
  | 'system';


// ==================================================
// THEME COLORS TYPE
// ==================================================

export type ThemeColors = {

  // Backgrounds
  background: string;
  card: string;

  // Text
  text: string;
  secondaryText: string;

  // StyleIQ brand
  primary: string;
  primaryLight: string;

  // Basic colors
  black: string;
  white: string;

  // UI
  border: string;
  input: string;
  iconBackground: string;
};


// ==================================================
// THEME CONTEXT TYPE
// ==================================================

export type ThemeContextType = {

  // Current selected theme
  themeMode: ThemeMode;

  // Whether dark mode is currently active
  isDark: boolean;

  // Global colors
  colors: ThemeColors;

  // Change theme
  setThemeMode: (
    mode: ThemeMode
  ) => Promise<void>;

};


// ==================================================
// CREATE CONTEXT
// ==================================================

const ThemeContext =
  createContext<
    ThemeContextType | undefined
  >(undefined);


// ==================================================
// STORAGE KEY
// ==================================================

const THEME_STORAGE_KEY =
  '@styleiq_theme';


// ==================================================
// THEME PROVIDER
// ==================================================

export const ThemeProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {

  // ==================================================
  // DEVICE THEME
  // ==================================================

  const systemTheme =
    useColorScheme();


  // ==================================================
  // SELECTED THEME
  // ==================================================

  const [
    themeMode,
    setThemeModeState,
  ] = useState<ThemeMode>('system');


  // ==================================================
  // LOAD SAVED THEME
  // ==================================================

  useEffect(() => {

    const loadTheme = async () => {

      try {

        const savedTheme =
          await AsyncStorage.getItem(
            THEME_STORAGE_KEY
          );


        if (
          savedTheme === 'light' ||
          savedTheme === 'dark' ||
          savedTheme === 'system'
        ) {

          setThemeModeState(
            savedTheme
          );

        }

      } catch (error) {

        console.log(
          'Load theme error:',
          error
        );

      }

    };


    loadTheme();

  }, []);


  // ==================================================
  // CHANGE THEME
  // ==================================================

  const setThemeMode = async (
    mode: ThemeMode
  ): Promise<void> => {

    try {

      // Update immediately
      setThemeModeState(mode);


      // Save for future app launches
      await AsyncStorage.setItem(
        THEME_STORAGE_KEY,
        mode
      );

    } catch (error) {

      console.log(
        'Save theme error:',
        error
      );

    }

  };


  // ==================================================
  // DETERMINE ACTIVE DARK MODE
  // ==================================================

  const isDark =
    themeMode === 'dark' ||
    (
      themeMode === 'system' &&
      systemTheme === 'dark'
    );


  // ==================================================
  // LIGHT THEME
  // ==================================================

  const lightColors: ThemeColors = {

    // Backgrounds
    background: '#FAFAFA',
    card: '#FFFFFF',

    // Text
    text: '#111111',
    secondaryText: '#777777',

    // StyleIQ brand
    primary: '#6C3CF0',
    primaryLight: '#F1EDFF',

    // Basic
    black: '#000000',
    white: '#FFFFFF',

    // UI
    border: '#EEEEEE',
    input: '#F5F5F5',
    iconBackground: '#F1EDFF',

  };


  // ==================================================
  // DARK THEME
  // ==================================================

  const darkColors: ThemeColors = {

    // Backgrounds
    background: '#121212',
    card: '#1E1E1E',

    // Text
    text: '#FFFFFF',
    secondaryText: '#AAAAAA',

    // StyleIQ brand
    primary: '#6C3CF0',
    primaryLight: '#2B2050',

    // Basic
    black: '#000000',
    white: '#FFFFFF',

    // UI
    border: '#2C2C2C',
    input: '#252525',
    iconBackground: '#29213F',

  };


  // ==================================================
  // ACTIVE COLORS
  // ==================================================

  const colors =
    isDark
      ? darkColors
      : lightColors;


  // ==================================================
  // PROVIDER
  // ==================================================

  return (

    <ThemeContext.Provider
      value={{
        themeMode,
        isDark,
        colors,
        setThemeMode,
      }}
    >

      {children}

    </ThemeContext.Provider>

  );

};


// ==================================================
// USE THEME HOOK
// ==================================================

export const useTheme = () => {

  const context =
    useContext(ThemeContext);


  if (!context) {

    throw new Error(
      'useTheme must be used inside ThemeProvider'
    );

  }


  return context;

};