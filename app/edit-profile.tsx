import React, { useState } from 'react';

import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { router } from 'expo-router';

import { updateProfile } from 'firebase/auth';

import { auth } from '../src/services/firebase';

// ==================================================
// THEME
// ==================================================

import { useTheme } from '../src/theme/ThemeContext';


// ==================================================
// EDIT PROFILE
// ==================================================

export default function EditProfileScreen() {

  const user = auth.currentUser;

  // ==================================================
  // THEME
  // ==================================================

  const { colors } = useTheme();


  // ==================================================
  // NAME
  // ==================================================

  const [name, setName] = useState(
    user?.displayName || ''
  );


  // ==================================================
  // SAVE PROFILE
  // ==================================================

  const handleSave = async () => {

    const trimmedName = name.trim();


    // ----------------------------------------------
    // NAME VALIDATION
    // ----------------------------------------------

    if (!trimmedName) {

      Alert.alert(
        'Name required',
        'Please enter your name.'
      );

      return;
    }


    // ----------------------------------------------
    // USER CHECK
    // ----------------------------------------------

    if (!user) {

      Alert.alert(
        'Not signed in',
        'Please sign in again to edit your profile.'
      );

      router.replace('/signin');

      return;
    }


    // ----------------------------------------------
    // UPDATE FIREBASE PROFILE
    // ----------------------------------------------

    try {

      await updateProfile(user, {
        displayName: trimmedName,
      });


      Alert.alert(
        'Profile updated 🎉',
        'Your name has been successfully updated.',
        [
          {
            text: 'OK',

            onPress: () =>
              router.replace('/profile'),
          },
        ]
      );

    } catch (error) {

      console.log(
        'Profile update error:',
        error
      );

      Alert.alert(
        'Update failed',
        'We could not update your profile. Please try again.'
      );
    }
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

      <KeyboardAvoidingView
        style={styles.keyboard}
        behavior={
          Platform.OS === 'ios'
            ? 'padding'
            : undefined
        }
      >

        <View style={styles.content}>

          {/* ========================================
              HEADER
          ======================================== */}

          <View style={styles.header}>

            <Pressable
              onPress={() =>
                router.back()
              }
              style={styles.backButton}
            >

              <Text
                style={[
                  styles.back,
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
              Edit Profile
            </Text>


            <View
              style={styles.headerSpace}
            />

          </View>


          {/* ========================================
              AVATAR
          ======================================== */}

          <View
            style={[
              styles.avatar,
              {
                backgroundColor:
                  colors.primary,
              },
            ]}
          >

            <Text
              style={styles.avatarText}
            >
              {name.trim()
                ? name
                    .trim()
                    .charAt(0)
                    .toUpperCase()
                : 'S'}
            </Text>

          </View>


          <Text
            style={[
              styles.changePhoto,
              {
                color: colors.primary,
              },
            ]}
          >
            Profile photo
          </Text>


          <Text
            style={[
              styles.photoNote,
              {
                color:
                  colors.secondaryText,
              },
            ]}
          >
            Profile photo customization
            will be added soon.
          </Text>


          {/* ========================================
              FORM
          ======================================== */}

          <View
            style={[
              styles.form,
              {
                backgroundColor:
                  colors.card,

                borderColor:
                  colors.border,
              },
            ]}
          >

            {/* FULL NAME */}

            <Text
              style={[
                styles.label,
                {
                  color: colors.text,
                },
              ]}
            >
              Full name
            </Text>


            <TextInput
              style={[
                styles.input,
                {
                  borderColor:
                    colors.border,

                  color:
                    colors.text,

                  backgroundColor:
                    colors.input,
                },
              ]}
              placeholder="Enter your full name"
              placeholderTextColor={
                colors.secondaryText
              }
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
              autoCorrect={false}
            />


            {/* EMAIL */}

            <Text
              style={[
                styles.label,
                {
                  color: colors.text,
                },
              ]}
            >
              Email address
            </Text>


            <View
              style={[
                styles.disabledInput,
                {
                  borderColor:
                    colors.border,

                  backgroundColor:
                    colors.input,
                },
              ]}
            >

              <Text
                style={[
                  styles.disabledText,
                  {
                    color:
                      colors.secondaryText,
                  },
                ]}
              >
                {user?.email ||
                  'No email available'}
              </Text>

            </View>


            <Text
              style={[
                styles.emailNote,
                {
                  color:
                    colors.secondaryText,
                },
              ]}
            >
              Your email address cannot be
              changed here.
            </Text>

          </View>


          {/* ========================================
              SAVE
          ======================================== */}

          <Pressable
            onPress={handleSave}
            style={({ pressed }) => [
              styles.saveButton,

              {
                backgroundColor:
                  colors.primary,
              },

              pressed &&
                styles.saveButtonPressed,
            ]}
          >

            <Text
              style={styles.saveButtonText}
            >
              Save Changes
            </Text>

          </Pressable>


          {/* ========================================
              CANCEL
          ======================================== */}

          <Pressable
            onPress={() =>
              router.back()
            }
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

        </View>

      </KeyboardAvoidingView>

    </SafeAreaView>
  );
}


// ==================================================
// STYLES
// ==================================================

const styles = StyleSheet.create({

  // ================================================
  // CONTAINER
  // ================================================

  container: {
    flex: 1,
  },


  // ================================================
  // KEYBOARD
  // ================================================

  keyboard: {
    flex: 1,
  },


  // ================================================
  // CONTENT
  // ================================================

  content: {
    flex: 1,
    paddingHorizontal: 22,
  },


  // ================================================
  // HEADER
  // ================================================

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


  // ================================================
  // AVATAR
  // ================================================

  avatar: {
    width: 95,
    height: 95,
    borderRadius: 48,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 25,
  },

  avatarText: {
    color: '#FFFFFF',
    fontSize: 38,
    fontWeight: '800',
  },


  // ================================================
  // PROFILE PHOTO
  // ================================================

  changePhoto: {
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '700',
    marginTop: 12,
  },

  photoNote: {
    textAlign: 'center',
    fontSize: 11,
    marginTop: 5,
  },


  // ================================================
  // FORM
  // ================================================

  form: {
    borderRadius: 20,
    padding: 20,
    marginTop: 30,
    borderWidth: 1,
  },

  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },


  // ================================================
  // NAME INPUT
  // ================================================

  input: {
    height: 54,
    borderWidth: 1,
    borderRadius: 13,
    paddingHorizontal: 16,
    fontSize: 15,
    marginBottom: 20,
  },


  // ================================================
  // DISABLED EMAIL
  // ================================================

  disabledInput: {
    height: 54,
    borderWidth: 1,
    borderRadius: 13,
    paddingHorizontal: 16,
    justifyContent: 'center',
  },

  disabledText: {
    fontSize: 15,
  },

  emailNote: {
    fontSize: 11,
    marginTop: 7,
  },


  // ================================================
  // SAVE BUTTON
  // ================================================

  saveButton: {
    height: 56,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 25,
  },

  saveButtonPressed: {
    opacity: 0.8,
    transform: [
      {
        scale: 0.98,
      },
    ],
  },

  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },


  // ================================================
  // CANCEL
  // ================================================

  cancelButton: {
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },

  cancelText: {
    fontSize: 14,
    fontWeight: '600',
  },

});