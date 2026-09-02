import React, { useState } from 'react';

import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { router } from 'expo-router';

import { useTheme } from '../src/theme/ThemeContext';


// ==================================================
// SETTINGS SCREEN
// ==================================================

export default function SettingsScreen() {

  const {
    themeMode,
    setThemeMode,
    isDark,
  } = useTheme();

  const [showAppearance, setShowAppearance] =
    useState(false);


  // ==================================================
  // THEME COLORS
  // ==================================================

  const backgroundColor =
    isDark ? '#121212' : '#FAFAFA';

  const cardColor =
    isDark ? '#1E1E1E' : '#FFFFFF';

  const primaryText =
    isDark ? '#FFFFFF' : '#111111';

  const secondaryText =
    isDark ? '#AAAAAA' : '#888888';

  const borderColor =
    isDark ? '#2C2C2C' : '#EEEEEE';

  const iconBackground =
    isDark ? '#29213F' : '#F1EDFF';


  // ==================================================
  // APPEARANCE LABEL
  // ==================================================

  const getAppearanceLabel = () => {

    if (themeMode === 'light') {
      return 'Light';
    }

    if (themeMode === 'dark') {
      return 'Dark';
    }

    return 'System Default';

  };


  // ==================================================
  // SCREEN
  // ==================================================

  return (

    <SafeAreaView
      style={[
        styles.container,
        {
          backgroundColor,
        },
      ]}
    >

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={
          styles.scrollContent
        }
      >

        {/* ==========================================
            HEADER
        ========================================== */}

        <View
          style={styles.header}
        >

          <Pressable
            style={styles.backButton}
            onPress={() =>
              router.back()
            }
          >

            <Text
              style={[
                styles.backIcon,
                {
                  color: primaryText,
                },
              ]}
            >
              ‹
            </Text>

          </Pressable>


          <Text
            style={[
              styles.headerTitle,
              {
                color: primaryText,
              },
            ]}
          >
            Settings
          </Text>


          <View
            style={styles.headerSpace}
          />

        </View>


        {/* ==========================================
            APPEARANCE
        ========================================== */}

        <Text
          style={[
            styles.sectionTitle,
            {
              color: primaryText,
            },
          ]}
        >
          Appearance
        </Text>


        <View
          style={[
            styles.card,
            {
              backgroundColor: cardColor,
              borderColor,
            },
          ]}
        >

          {/* ========================================
              APPEARANCE HEADER
          ======================================== */}

          <Pressable
            style={({ pressed }) => [
              styles.settingRow,
              pressed &&
                styles.rowPressed,
            ]}
            onPress={() =>
              setShowAppearance(
                !showAppearance
              )
            }
          >

            <View
              style={[
                styles.iconContainer,
                {
                  backgroundColor:
                    iconBackground,
                },
              ]}
            >

              <Text
                style={styles.icon}
              >
                🎨
              </Text>

            </View>


            <View
              style={styles.rowContent}
            >

              <Text
                style={[
                  styles.rowTitle,
                  {
                    color: primaryText,
                  },
                ]}
              >
                Appearance
              </Text>


              <Text
                style={[
                  styles.rowSubtitle,
                  {
                    color: secondaryText,
                  },
                ]}
              >
                {getAppearanceLabel()}
              </Text>

            </View>


            <Text
              style={[
                styles.arrow,
                {
                  color: secondaryText,
                },
              ]}
            >
              {showAppearance ? '⌃' : '›'}
            </Text>

          </Pressable>


          {/* ========================================
              APPEARANCE OPTIONS
          ======================================== */}

          {showAppearance && (

            <View
              style={[
                styles.appearanceOptions,
                {
                  borderTopColor:
                    borderColor,
                },
              ]}
            >

              {/* ====================================
                  SYSTEM DEFAULT
              ==================================== */}

              <Pressable
                style={
                  styles.appearanceOption
                }
                onPress={() => {
                  setThemeMode('system');
                  setShowAppearance(false);
                }}
              >

                <View
                  style={[
                    styles.radio,
                    themeMode === 'system' &&
                      styles.radioActive,
                  ]}
                >

                  {themeMode === 'system' && (
                    <View
                      style={
                        styles.radioDot
                      }
                    />
                  )}

                </View>


                <View
                  style={
                    styles.optionContent
                  }
                >

                  <Text
                    style={[
                      styles.optionTitle,
                      {
                        color: primaryText,
                      },
                    ]}
                  >
                    System Default
                  </Text>


                  <Text
                    style={[
                      styles.optionSubtitle,
                      {
                        color: secondaryText,
                      },
                    ]}
                  >
                    Follow your device settings
                  </Text>

                </View>

              </Pressable>


              {/* ====================================
                  LIGHT
              ==================================== */}

              <Pressable
                style={
                  styles.appearanceOption
                }
                onPress={() => {
                  setThemeMode('light');
                  setShowAppearance(false);
                }}
              >

                <View
                  style={[
                    styles.radio,
                    themeMode === 'light' &&
                      styles.radioActive,
                  ]}
                >

                  {themeMode === 'light' && (
                    <View
                      style={
                        styles.radioDot
                      }
                    />
                  )}

                </View>


                <View
                  style={
                    styles.optionContent
                  }
                >

                  <Text
                    style={[
                      styles.optionTitle,
                      {
                        color: primaryText,
                      },
                    ]}
                  >
                    Light
                  </Text>


                  <Text
                    style={[
                      styles.optionSubtitle,
                      {
                        color: secondaryText,
                      },
                    ]}
                  >
                    Always use light mode
                  </Text>

                </View>

              </Pressable>


              {/* ====================================
                  DARK
              ==================================== */}

              <Pressable
                style={
                  styles.appearanceOption
                }
                onPress={() => {
                  setThemeMode('dark');
                  setShowAppearance(false);
                }}
              >

                <View
                  style={[
                    styles.radio,
                    themeMode === 'dark' &&
                      styles.radioActive,
                  ]}
                >

                  {themeMode === 'dark' && (
                    <View
                      style={
                        styles.radioDot
                      }
                    />
                  )}

                </View>


                <View
                  style={
                    styles.optionContent
                  }
                >

                  <Text
                    style={[
                      styles.optionTitle,
                      {
                        color: primaryText,
                      },
                    ]}
                  >
                    Dark
                  </Text>


                  <Text
                    style={[
                      styles.optionSubtitle,
                      {
                        color: secondaryText,
                      },
                    ]}
                  >
                    Always use dark mode
                  </Text>

                </View>

              </Pressable>

            </View>

          )}

        </View>


        {/* ==========================================
            LEGAL
        ========================================== */}

        <Text
          style={[
            styles.sectionTitle,
            {
              color: primaryText,
            },
          ]}
        >
          Legal
        </Text>


        <View
          style={[
            styles.card,
            {
              backgroundColor: cardColor,
              borderColor,
            },
          ]}
        >

          <Pressable
            style={({ pressed }) => [
              styles.settingRow,
              pressed &&
                styles.rowPressed,
            ]}
            onPress={() =>
              router.push('/terms')
            }
          >

            <View
              style={[
                styles.iconContainer,
                {
                  backgroundColor:
                    iconBackground,
                },
              ]}
            >

              <Text
                style={styles.icon}
              >
                📄
              </Text>

            </View>


            <View
              style={styles.rowContent}
            >

              <Text
                style={[
                  styles.rowTitle,
                  {
                    color: primaryText,
                  },
                ]}
              >
                Terms & Conditions
              </Text>


              <Text
                style={[
                  styles.rowSubtitle,
                  {
                    color: secondaryText,
                  },
                ]}
              >
                Read the terms of using StyleIQ
              </Text>

            </View>


            <Text
              style={[
                styles.arrow,
                {
                  color: secondaryText,
                },
              ]}
            >
              ›
            </Text>

          </Pressable>

        </View>


        {/* ==========================================
            ABOUT
        ========================================== */}

        <Text
          style={[
            styles.sectionTitle,
            {
              color: primaryText,
            },
          ]}
        >
          About
        </Text>


        <View
          style={[
            styles.card,
            {
              backgroundColor: cardColor,
              borderColor,
            },
          ]}
        >

          <Pressable
            style={({ pressed }) => [
              styles.settingRow,
              pressed &&
                styles.rowPressed,
            ]}
            onPress={() =>
              router.push('/about')
            }
          >

            <View
              style={[
                styles.iconContainer,
                {
                  backgroundColor:
                    iconBackground,
                },
              ]}
            >

              <Text
                style={styles.icon}
              >
                ℹ️
              </Text>

            </View>


            <View
              style={styles.rowContent}
            >

              <Text
                style={[
                  styles.rowTitle,
                  {
                    color: primaryText,
                  },
                ]}
              >
                About StyleIQ
              </Text>


              <Text
                style={[
                  styles.rowSubtitle,
                  {
                    color: secondaryText,
                  },
                ]}
              >
                Learn more about StyleIQ
              </Text>

            </View>


            <Text
              style={[
                styles.arrow,
                {
                  color: secondaryText,
                },
              ]}
            >
              ›
            </Text>

          </Pressable>

        </View>


        {/* ==========================================
            APP INFORMATION
        ========================================== */}

        <View
          style={styles.appInfo}
        >

          <Text
            style={styles.appName}
          >
            StyleIQ
          </Text>


          <Text
            style={[
              styles.tagline,
              {
                color: secondaryText,
              },
            ]}
          >
            Smart Fashion. Smarter Choices.
          </Text>


          <Text
            style={[
              styles.version,
              {
                color: isDark
                  ? '#666666'
                  : '#BBBBBB',
              },
            ]}
          >
            Version 1.0.0
          </Text>

        </View>

      </ScrollView>

    </SafeAreaView>

  );

}


// ==================================================
// STYLES
// ==================================================

const styles = StyleSheet.create({

  container: {
    flex: 1,
  },

  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },


  // ==================================================
  // HEADER
  // ==================================================

  header: {
    height: 65,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  backButton: {
    width: 45,
    height: 45,
    justifyContent: 'center',
  },

  backIcon: {
    fontSize: 40,
    fontWeight: '300',
  },

  headerTitle: {
    fontSize: 21,
    fontWeight: '800',
  },

  headerSpace: {
    width: 45,
  },


  // ==================================================
  // SECTIONS
  // ==================================================

  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    marginTop: 20,
    marginBottom: 10,
  },


  // ==================================================
  // CARD
  // ==================================================

  card: {
    borderRadius: 18,
    borderWidth: 1,
    overflow: 'hidden',
  },


  // ==================================================
  // SETTING ROW
  // ==================================================

  settingRow: {
    minHeight: 72,
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },

  rowPressed: {
    opacity: 0.65,
  },


  iconContainer: {
    width: 43,
    height: 43,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  icon: {
    fontSize: 20,
  },


  rowContent: {
    flex: 1,
  },

  rowTitle: {
    fontSize: 14,
    fontWeight: '800',
  },

  rowSubtitle: {
    fontSize: 11,
    marginTop: 4,
  },


  arrow: {
    fontSize: 25,
    marginLeft: 8,
  },


  // ==================================================
  // APPEARANCE OPTIONS
  // ==================================================

  appearanceOptions: {
    borderTopWidth: 1,
    paddingHorizontal: 15,
    paddingVertical: 7,
  },

  appearanceOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 13,
  },

  optionContent: {
    flex: 1,
    marginLeft: 12,
  },

  optionTitle: {
    fontSize: 13,
    fontWeight: '700',
  },

  optionSubtitle: {
    fontSize: 11,
    marginTop: 3,
  },


  // ==================================================
  // RADIO
  // ==================================================

  radio: {
    width: 21,
    height: 21,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#CCC',
    alignItems: 'center',
    justifyContent: 'center',
  },

  radioActive: {
    borderColor: '#6C3CF0',
  },

  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#6C3CF0',
  },


  // ==================================================
  // APP INFORMATION
  // ==================================================

  appInfo: {
    alignItems: 'center',
    marginTop: 35,
  },

  appName: {
    fontSize: 20,
    fontWeight: '800',
    color: '#6C3CF0',
  },

  tagline: {
    fontSize: 11,
    marginTop: 5,
  },

  version: {
    fontSize: 10,
    marginTop: 8,
  },

});