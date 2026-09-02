import React from 'react';

import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { router } from 'expo-router';

import {
  ThemeMode,
  useTheme,
} from '@/src/theme/ThemeContext';


// ==================================================
// APPEARANCE
// ==================================================

type ThemeOptionProps = {
  value: ThemeMode;
  title: string;
  description: string;
  icon: string;
};


// ==================================================
// APPEARANCE SCREEN
// ==================================================

export default function AppearanceScreen() {

  const {
    themeMode,
    setThemeMode,
    colors,
  } = useTheme();


  // ==================================================
  // CHANGE THEME
  // ==================================================

  const handleThemeChange = (
    theme: ThemeMode
  ) => {

    setThemeMode(theme);

  };


  // ==================================================
  // THEME OPTION
  // ==================================================

  const ThemeOption = ({
    value,
    title,
    description,
    icon,
  }: ThemeOptionProps) => {

    const isSelected =
      themeMode === value;


    return (

      <Pressable
        style={[
          styles.themeOption,

          {
            backgroundColor:
              isSelected
                ? colors.primaryLight
                : colors.card,
          },
        ]}

        onPress={() =>
          handleThemeChange(value)
        }
      >

        {/* ==========================================
            ICON
        ========================================== */}

        <View
          style={[
            styles.themeIconContainer,
            {
              backgroundColor:
                isSelected
                  ? colors.primaryLight
                  : colors.iconBackground,
            },
          ]}
        >

          <Text
            style={styles.themeIcon}
          >
            {icon}
          </Text>

        </View>


        {/* ==========================================
            CONTENT
        ========================================== */}

        <View
          style={styles.themeContent}
        >

          <Text
            style={[
              styles.themeTitle,
              {
                color: colors.text,
              },
            ]}
          >
            {title}
          </Text>


          <Text
            style={[
              styles.themeDescription,
              {
                color: colors.secondaryText,
              },
            ]}
          >
            {description}
          </Text>

        </View>


        {/* ==========================================
            RADIO
        ========================================== */}

        <View
          style={[
            styles.radio,

            {
              borderColor:
                isSelected
                  ? colors.primary
                  : colors.mutedText,
            },
          ]}
        >

          {isSelected && (

            <View
              style={[
                styles.radioDot,
                {
                  backgroundColor:
                    colors.primary,
                },
              ]}
            />

          )}

        </View>

      </Pressable>

    );

  };


  // ==================================================
  // SCREEN
  // ==================================================

  return (

    <SafeAreaView
      style={[
        styles.container,
        {
          backgroundColor:
            colors.background,
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
                  color: colors.text,
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
                color: colors.text,
              },
            ]}
          >
            Appearance
          </Text>


          <View
            style={styles.headerSpace}
          />

        </View>


        {/* ==========================================
            INTRO
        ========================================== */}

        <View
          style={styles.intro}
        >

          <View
            style={[
              styles.appearanceIconContainer,
              {
                backgroundColor:
                  colors.primaryLight,
              },
            ]}
          >

            <Text
              style={styles.appearanceIcon}
            >
              🎨
            </Text>

          </View>


          <Text
            style={[
              styles.introTitle,
              {
                color: colors.text,
              },
            ]}
          >
            Customize your StyleIQ
          </Text>


          <Text
            style={[
              styles.introText,
              {
                color:
                  colors.secondaryText,
              },
            ]}
          >
            Choose how StyleIQ should look on
            your device.
          </Text>

        </View>


        {/* ==========================================
            THEME
        ========================================== */}

        <Text
          style={[
            styles.sectionTitle,
            {
              color: colors.text,
            },
          ]}
        >
          Theme
        </Text>


        <View
          style={[
            styles.card,
            {
              backgroundColor:
                colors.card,
              borderColor:
                colors.border,
            },
          ]}
        >

          {/* SYSTEM DEFAULT */}

          <ThemeOption
            value="system"
            title="System Default"
            description="Follow your device's appearance settings"
            icon="📱"
          />


          <View
            style={[
              styles.divider,
              {
                backgroundColor:
                  colors.border,
              },
            ]}
          />


          {/* LIGHT MODE */}

          <ThemeOption
            value="light"
            title="Light Mode"
            description="Use StyleIQ with a bright appearance"
            icon="☀️"
          />


          <View
            style={[
              styles.divider,
              {
                backgroundColor:
                  colors.border,
              },
            ]}
          />


          {/* DARK MODE */}

          <ThemeOption
            value="dark"
            title="Dark Mode"
            description="Use StyleIQ with a darker appearance"
            icon="🌙"
          />

        </View>


        {/* ==========================================
            INFORMATION
        ========================================== */}

        <View
          style={[
            styles.infoCard,
            {
              backgroundColor:
                colors.primaryLight,
            },
          ]}
        >

          <Text
            style={styles.infoIcon}
          >
            💡
          </Text>


          <View
            style={styles.infoContent}
          >

            <Text
              style={[
                styles.infoTitle,
                {
                  color: colors.text,
                },
              ]}
            >
              Appearance settings
            </Text>


            <Text
              style={[
                styles.infoText,
                {
                  color:
                    colors.secondaryText,
                },
              ]}
            >
              System Default follows the appearance
              setting on your phone. Light Mode and
              Dark Mode allow you to choose a specific
              appearance for StyleIQ.
            </Text>

          </View>

        </View>


        {/* ==========================================
            FOOTER
        ========================================== */}

        <Text
          style={[
            styles.footerText,
            {
              color: colors.primary,
            },
          ]}
        >
          StyleIQ
        </Text>


        <Text
          style={[
            styles.footerSubtext,
            {
              color: colors.mutedText,
            },
          ]}
        >
          Make your style yours.
        </Text>


        <View
          style={styles.bottomSpace}
        />

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
    fontSize: 20,
    fontWeight: '800',
  },

  headerSpace: {
    width: 45,
  },


  // ==================================================
  // INTRO
  // ==================================================

  intro: {
    alignItems: 'center',
    marginTop: 18,
    marginBottom: 30,
  },

  appearanceIconContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
  },

  appearanceIcon: {
    fontSize: 32,
  },

  introTitle: {
    fontSize: 22,
    fontWeight: '800',
    textAlign: 'center',
  },

  introText: {
    fontSize: 13,
    lineHeight: 20,
    textAlign: 'center',
    marginTop: 7,
    paddingHorizontal: 15,
  },


  // ==================================================
  // SECTIONS
  // ==================================================

  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
    marginBottom: 12,
  },

  card: {
    borderRadius: 18,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: 25,
  },


  // ==================================================
  // THEME OPTIONS
  // ==================================================

  themeOption: {
    minHeight: 82,
    paddingHorizontal: 15,
    paddingVertical: 13,
    flexDirection: 'row',
    alignItems: 'center',
  },

  themeIconContainer: {
    width: 45,
    height: 45,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 13,
  },

  themeIcon: {
    fontSize: 21,
  },

  themeContent: {
    flex: 1,
  },

  themeTitle: {
    fontSize: 14,
    fontWeight: '800',
  },

  themeDescription: {
    fontSize: 11,
    lineHeight: 16,
    marginTop: 4,
  },


  // ==================================================
  // RADIO
  // ==================================================

  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
  },

  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },


  // ==================================================
  // DIVIDER
  // ==================================================

  divider: {
    height: 1,
    marginLeft: 73,
  },


  // ==================================================
  // INFO
  // ==================================================

  infoCard: {
    borderRadius: 18,
    padding: 16,
    flexDirection: 'row',
    marginBottom: 25,
  },

  infoIcon: {
    fontSize: 23,
    marginRight: 12,
  },

  infoContent: {
    flex: 1,
  },

  infoTitle: {
    fontSize: 13,
    fontWeight: '800',
  },

  infoText: {
    fontSize: 11,
    lineHeight: 17,
    marginTop: 5,
  },


  // ==================================================
  // FOOTER
  // ==================================================

  footerText: {
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '900',
    marginTop: 5,
  },

  footerSubtext: {
    textAlign: 'center',
    fontSize: 11,
    marginTop: 4,
  },

  bottomSpace: {
    height: 20,
  },

});