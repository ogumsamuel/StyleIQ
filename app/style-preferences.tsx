import React, { useEffect, useState } from 'react';

import {
  ActivityIndicator,
  Alert,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { router } from 'expo-router';

import {
  doc,
  getDoc,
  setDoc,
} from 'firebase/firestore';

import { auth, db } from '../src/services/firebase';

import { useTheme } from '../src/theme/ThemeContext';


// ==================================================
// OPTIONS
// ==================================================

const clothingStyles = [
  'Casual',
  'Streetwear',
  'Classic',
  'Minimalist',
  'Smart Casual',
  'Formal',
  'Sporty',
  'Vintage',
];

const favoriteColors = [
  'Black',
  'White',
  'Grey',
  'Blue',
  'Brown',
  'Green',
  'Red',
  'Purple',
  'Pink',
  'Beige',
];

const clothingCategories = [
  'T-Shirts',
  'Shirts',
  'Jeans',
  'Trousers',
  'Dresses',
  'Jackets',
  'Sneakers',
  'Accessories',
];

const budgetRanges = [
  'Under $50',
  '$50 - $100',
  '$100 - $250',
  '$250 - $500',
  '$500+',
];


// ==================================================
// STYLE PREFERENCES SCREEN
// ==================================================

export default function StylePreferencesScreen() {

  // ==================================================
  // GLOBAL THEME
  // ==================================================

  const { colors } = useTheme();


  // ==================================================
  // STATE
  // ==================================================

  const [selectedStyles, setSelectedStyles] =
    useState<string[]>([]);

  const [selectedColors, setSelectedColors] =
    useState<string[]>([]);

  const [selectedCategories, setSelectedCategories] =
    useState<string[]>([]);

  const [budget, setBudget] =
    useState('');

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);


  // ==================================================
  // LOAD PREFERENCES
  // ==================================================

  useEffect(() => {
    loadPreferences();
  }, []);


  const loadPreferences = async () => {

    const user = auth.currentUser;

    if (!user) {
      setLoading(false);
      return;
    }

    try {

      const preferencesRef = doc(
        db,
        'users',
        user.uid,
        'preferences',
        'style'
      );

      const snapshot =
        await getDoc(preferencesRef);

      if (snapshot.exists()) {

        const data =
          snapshot.data();

        setSelectedStyles(
          Array.isArray(data.clothingStyles)
            ? data.clothingStyles
            : []
        );

        setSelectedColors(
          Array.isArray(data.favoriteColors)
            ? data.favoriteColors
            : []
        );

        setSelectedCategories(
          Array.isArray(data.clothingCategories)
            ? data.clothingCategories
            : []
        );

        setBudget(
          data.budget || ''
        );
      }

    } catch (error) {

      console.log(
        'Load preferences error:',
        error
      );

      Alert.alert(
        'Error',
        'We could not load your style preferences.'
      );

    } finally {

      setLoading(false);

    }
  };


  // ==================================================
  // TOGGLE SELECTION
  // ==================================================

  const toggleSelection = (
    value: string,
    selected: string[],
    setSelected: React.Dispatch<
      React.SetStateAction<string[]>
    >
  ) => {

    if (selected.includes(value)) {

      setSelected(
        selected.filter(
          (item) => item !== value
        )
      );

    } else {

      setSelected([
        ...selected,
        value,
      ]);

    }
  };


  // ==================================================
  // SAVE PREFERENCES
  // ==================================================

  const handleSave = async () => {

    const user = auth.currentUser;

    if (!user) {

      Alert.alert(
        'Not signed in',
        'Please sign in again to save your preferences.'
      );

      router.replace('/signin');

      return;
    }


    // -----------------------------------------------
    // STYLE VALIDATION
    // -----------------------------------------------

    if (selectedStyles.length === 0) {

      Alert.alert(
        'Choose your style',
        'Please select at least one clothing style.'
      );

      return;
    }


    // -----------------------------------------------
    // COLOR VALIDATION
    // -----------------------------------------------

    if (selectedColors.length === 0) {

      Alert.alert(
        'Choose your colors',
        'Please select at least one favorite color.'
      );

      return;
    }


    // -----------------------------------------------
    // CATEGORY VALIDATION
    // -----------------------------------------------

    if (selectedCategories.length === 0) {

      Alert.alert(
        'Choose categories',
        'Please select at least one clothing category.'
      );

      return;
    }


    // -----------------------------------------------
    // BUDGET VALIDATION
    // -----------------------------------------------

    if (!budget) {

      Alert.alert(
        'Choose your budget',
        'Please select your preferred budget range.'
      );

      return;
    }


    try {

      setSaving(true);

      const preferencesRef = doc(
        db,
        'users',
        user.uid,
        'preferences',
        'style'
      );


      await setDoc(
        preferencesRef,
        {
          clothingStyles:
            selectedStyles,

          favoriteColors:
            selectedColors,

          clothingCategories:
            selectedCategories,

          budget:
            budget,

          updatedAt:
            new Date(),
        }
      );


      Alert.alert(
        'Preferences saved 🎉',
        'StyleIQ will use your preferences to personalize your recommendations.',
        [
          {
            text: 'Continue',

            onPress: () =>
              router.back(),
          },
        ]
      );

    } catch (error) {

      console.log(
        'Save preferences error:',
        error
      );

      Alert.alert(
        'Save failed',
        'We could not save your preferences. Please try again.'
      );

    } finally {

      setSaving(false);

    }
  };


  // ==================================================
  // RENDER OPTIONS
  // ==================================================

  const renderOptions = (
    options: string[],
    selected: string[],
    setSelected: React.Dispatch<
      React.SetStateAction<string[]>
    >
  ) => {

    return (

      <View style={styles.optionsContainer}>

        {options.map((option) => {

          const isSelected =
            selected.includes(option);


          return (

            <Pressable

              key={option}

              onPress={() =>
                toggleSelection(
                  option,
                  selected,
                  setSelected
                )
              }

              style={[
                styles.option,

                {
                  backgroundColor:
                    isSelected
                      ? colors.primary
                      : colors.input,

                  borderColor:
                    isSelected
                      ? colors.primary
                      : colors.border,
                },
              ]}
            >

              <Text
                style={[
                  styles.optionText,

                  {
                    color:
                      isSelected
                        ? colors.white
                        : colors.secondaryText,
                  },
                ]}
              >
                {option}
              </Text>

            </Pressable>

          );
        })}

      </View>
    );
  };


  // ==================================================
  // LOADING
  // ==================================================

  if (loading) {

    return (

      <SafeAreaView
        style={[
          styles.loadingContainer,
          {
            backgroundColor:
              colors.background,
          },
        ]}
      >

        <ActivityIndicator
          size="large"
          color={colors.primary}
        />

        <Text
          style={[
            styles.loadingText,
            {
              color:
                colors.secondaryText,
            },
          ]}
        >
          Loading your preferences...
        </Text>

      </SafeAreaView>

    );
  }


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
          styles.scroll
        }
      >


        {/* ==================================================
            HEADER
        ================================================== */}

        <View
          style={styles.header}
        >

          <Pressable
            onPress={() => router.back()}
            style={styles.backButton}
          >

            <Text
              style={[
                styles.back,
                {
                  color:
                    colors.text,
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
                color:
                  colors.text,
              },
            ]}
          >
            Style Preferences
          </Text>


          <View
            style={styles.headerSpace}
          />

        </View>


        {/* ==================================================
            INTRODUCTION
        ================================================== */}

        <View
          style={styles.intro}
        >

          <View
            style={[
              styles.iconCircle,
              {
                backgroundColor:
                  colors.primaryLight,
              },
            ]}
          >

            <Text
              style={styles.icon}
            >
              ✨
            </Text>

          </View>


          <Text
            style={[
              styles.title,
              {
                color:
                  colors.text,
              },
            ]}
          >
            Tell us about your style
          </Text>


          <Text
            style={[
              styles.subtitle,
              {
                color:
                  colors.secondaryText,
              },
            ]}
          >
            Choose your preferences so StyleIQ can
            recommend fashion that matches you.
          </Text>

        </View>


        {/* ==================================================
            CLOTHING STYLE
        ================================================== */}

        <View
          style={[
            styles.section,
            {
              backgroundColor:
                colors.card,

              borderColor:
                colors.border,
            },
          ]}
        >

          <Text
            style={[
              styles.sectionTitle,
              {
                color:
                  colors.text,
              },
            ]}
          >
            What's your style?
          </Text>


          <Text
            style={[
              styles.sectionSubtitle,
              {
                color:
                  colors.secondaryText,
              },
            ]}
          >
            Select all that describe you
          </Text>


          {renderOptions(
            clothingStyles,
            selectedStyles,
            setSelectedStyles
          )}

        </View>


        {/* ==================================================
            FAVORITE COLORS
        ================================================== */}

        <View
          style={[
            styles.section,
            {
              backgroundColor:
                colors.card,

              borderColor:
                colors.border,
            },
          ]}
        >

          <Text
            style={[
              styles.sectionTitle,
              {
                color:
                  colors.text,
              },
            ]}
          >
            Favorite colors
          </Text>


          <Text
            style={[
              styles.sectionSubtitle,
              {
                color:
                  colors.secondaryText,
              },
            ]}
          >
            Choose the colors you love wearing
          </Text>


          {renderOptions(
            favoriteColors,
            selectedColors,
            setSelectedColors
          )}

        </View>


        {/* ==================================================
            CATEGORIES
        ================================================== */}

        <View
          style={[
            styles.section,
            {
              backgroundColor:
                colors.card,

              borderColor:
                colors.border,
            },
          ]}
        >

          <Text
            style={[
              styles.sectionTitle,
              {
                color:
                  colors.text,
              },
            ]}
          >
            What do you shop for?
          </Text>


          <Text
            style={[
              styles.sectionSubtitle,
              {
                color:
                  colors.secondaryText,
              },
            ]}
          >
            Select your favorite categories
          </Text>


          {renderOptions(
            clothingCategories,
            selectedCategories,
            setSelectedCategories
          )}

        </View>


        {/* ==================================================
            BUDGET
        ================================================== */}

        <View
          style={[
            styles.section,
            {
              backgroundColor:
                colors.card,

              borderColor:
                colors.border,
            },
          ]}
        >

          <Text
            style={[
              styles.sectionTitle,
              {
                color:
                  colors.text,
              },
            ]}
          >
            What's your typical budget?
          </Text>


          <Text
            style={[
              styles.sectionSubtitle,
              {
                color:
                  colors.secondaryText,
              },
            ]}
          >
            This helps us recommend products within
            your range
          </Text>


          <View
            style={styles.budgetContainer}
          >

            {budgetRanges.map((range) => {

              const isSelected =
                budget === range;


              return (

                <Pressable

                  key={range}

                  onPress={() =>
                    setBudget(range)
                  }

                  style={[
                    styles.budgetOption,

                    {
                      borderColor:
                        isSelected
                          ? colors.primary
                          : colors.border,

                      backgroundColor:
                        isSelected
                          ? colors.primaryLight
                          : colors.input,
                    },
                  ]}
                >

                  <View
                    style={[
                      styles.radio,

                      {
                        borderColor:
                          isSelected
                            ? colors.primary
                            : colors.border,
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


                  <Text
                    style={[
                      styles.budgetText,

                      {
                        color:
                          isSelected
                            ? colors.primary
                            : colors.secondaryText,
                      },
                    ]}
                  >
                    {range}
                  </Text>

                </Pressable>

              );
            })}

          </View>

        </View>


        {/* ==================================================
            SAVE
        ================================================== */}

        <Pressable

          onPress={handleSave}

          disabled={saving}

          style={({ pressed }) => [

            styles.saveButton,

            {
              backgroundColor:
                colors.primary,
            },

            pressed &&
              styles.saveButtonPressed,

            saving &&
              styles.saveButtonDisabled,
          ]}
        >

          {saving ? (

            <ActivityIndicator
              color={colors.white}
            />

          ) : (

            <Text
              style={[
                styles.saveButtonText,
                {
                  color:
                    colors.white,
                },
              ]}
            >
              Save Preferences
            </Text>

          )}

        </Pressable>


        {/* ==================================================
            CANCEL
        ================================================== */}

        <Pressable
          onPress={() => router.back()}
          style={styles.cancelButton}
        >

          <Text
            style={[
              styles.cancelText,
              {
                color:
                  colors.secondaryText,
              },
            ]}
          >
            Cancel
          </Text>

        </Pressable>


        <View
          style={{ height: 30 }}
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


  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },


  loadingText: {
    marginTop: 12,
    fontSize: 14,
  },


  scroll: {
    paddingHorizontal: 20,
    paddingBottom: 30,
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
    justifyContent: 'center',
  },


  back: {
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
    marginTop: 15,
    marginBottom: 25,
  },


  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },


  icon: {
    fontSize: 29,
  },


  title: {
    fontSize: 24,
    fontWeight: '800',
    marginTop: 14,
    textAlign: 'center',
  },


  subtitle: {
    fontSize: 14,
    lineHeight: 21,
    textAlign: 'center',
    marginTop: 7,
    maxWidth: 340,
  },


  // ==================================================
  // SECTION
  // ==================================================

  section: {
    borderRadius: 20,
    padding: 18,
    marginBottom: 18,
    borderWidth: 1,
  },


  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
  },


  sectionSubtitle: {
    fontSize: 12,
    marginTop: 5,
    marginBottom: 15,
  },


  // ==================================================
  // OPTIONS
  // ==================================================

  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 9,
  },


  option: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
  },


  optionText: {
    fontSize: 13,
    fontWeight: '600',
  },


  // ==================================================
  // BUDGET
  // ==================================================

  budgetContainer: {
    gap: 10,
  },


  budgetOption: {
    minHeight: 52,
    borderRadius: 13,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
  },


  radio: {
    width: 21,
    height: 21,
    borderRadius: 11,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },


  radioDot: {
    width: 11,
    height: 11,
    borderRadius: 6,
  },


  budgetText: {
    fontSize: 14,
    fontWeight: '600',
  },


  // ==================================================
  // SAVE BUTTON
  // ==================================================

  saveButton: {
    height: 56,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 5,
  },


  saveButtonPressed: {
    opacity: 0.8,
    transform: [
      {
        scale: 0.98,
      },
    ],
  },


  saveButtonDisabled: {
    opacity: 0.6,
  },


  saveButtonText: {
    fontSize: 16,
    fontWeight: '700',
  },


  // ==================================================
  // CANCEL
  // ==================================================

  cancelButton: {
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
  },


  cancelText: {
    fontSize: 14,
    fontWeight: '600',
  },

});