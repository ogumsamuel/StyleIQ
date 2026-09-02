import React, { useState } from 'react';

import {
  ActivityIndicator,
  Alert,
  Keyboard,
  Modal,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { router } from 'expo-router';

import {
  EmailAuthProvider,
  deleteUser,
  reauthenticateWithCredential,
  sendPasswordResetEmail,
  signOut,
  updateEmail,
} from 'firebase/auth';

import { auth } from '../src/services/firebase';

// ==================================================
// GLOBAL THEME
// ==================================================

import { useTheme } from '../src/theme/ThemeContext';


// ==================================================
// PRIVACY & SECURITY
// ==================================================

export default function PrivacySecurityScreen() {

  // ==================================================
  // GLOBAL THEME
  // ==================================================

  const {
    colors,
    isDark,
  } = useTheme();


  // ==================================================
  // STATE
  // ==================================================

  const [newEmail, setNewEmail] =
    useState('');

  const [loading, setLoading] =
    useState(false);

  const [passwordModalVisible, setPasswordModalVisible] =
    useState(false);

  const [currentPassword, setCurrentPassword] =
    useState('');


  // ==================================================
  // CHANGE EMAIL
  // ==================================================

  const handleChangeEmail = async () => {

    const user = auth.currentUser;

    if (!user) {

      Alert.alert(
        'Sign in required',
        'Please sign in to manage your account.'
      );

      return;
    }

    if (!newEmail.trim()) {

      Alert.alert(
        'Email required',
        'Please enter your new email address.'
      );

      return;
    }

    const email =
      newEmail.trim().toLowerCase();

    if (email === user.email) {

      Alert.alert(
        'Same email',
        'Please enter an email address different from your current one.'
      );

      return;
    }

    // Open password confirmation modal
    setCurrentPassword('');
    setPasswordModalVisible(true);
  };


  // ==================================================
  // CONFIRM EMAIL CHANGE
  // ==================================================

  const confirmEmailChange = async () => {

    const user = auth.currentUser;

    if (!user?.email) {

      Alert.alert(
        'Sign in required',
        'Please sign in again and try again.'
      );

      return;
    }

    if (!currentPassword) {

      Alert.alert(
        'Password required',
        'Please enter your current password.'
      );

      return;
    }

    try {

      setLoading(true);

      setPasswordModalVisible(false);

      const email =
        newEmail.trim().toLowerCase();

      const credential =
        EmailAuthProvider.credential(
          user.email,
          currentPassword
        );

      await reauthenticateWithCredential(
        user,
        credential
      );

      await updateEmail(
        user,
        email
      );

      setCurrentPassword('');
      setNewEmail('');

      Alert.alert(
        'Email updated',
        'Your email address has been updated successfully.'
      );

    } catch (error: any) {

      console.log(
        'Change email error:',
        error
      );

      if (
        error?.code ===
        'auth/wrong-password'
      ) {

        Alert.alert(
          'Incorrect password',
          'The password you entered is incorrect.'
        );

      } else if (
        error?.code ===
        'auth/invalid-credential'
      ) {

        Alert.alert(
          'Incorrect password',
          'The password you entered is incorrect.'
        );

      } else if (
        error?.code ===
        'auth/email-already-in-use'
      ) {

        Alert.alert(
          'Email already in use',
          'That email address is already connected to another account.'
        );

      } else if (
        error?.code ===
        'auth/requires-recent-login'
      ) {

        Alert.alert(
          'Recent sign-in required',
          'For your security, please sign in again before changing your email address.'
        );

      } else {

        Alert.alert(
          'Unable to update email',
          'We could not update your email address. Please try again.'
        );

      }

    } finally {

      setLoading(false);

    }
  };


  // ==================================================
  // RESET PASSWORD
  // ==================================================

  const handleChangePassword = async () => {

    const user = auth.currentUser;

    if (!user?.email) {

      Alert.alert(
        'Email required',
        'Your account does not have an email address available for password reset.'
      );

      return;
    }

    try {

      setLoading(true);

      await sendPasswordResetEmail(
        auth,
        user.email
      );

      Alert.alert(
        'Password reset email sent',
        `We sent a password reset link to ${user.email}. Please check your inbox.`
      );

    } catch (error) {

      console.log(
        'Password reset error:',
        error
      );

      Alert.alert(
        'Unable to send email',
        'We could not send the password reset email. Please try again.'
      );

    } finally {

      setLoading(false);

    }
  };


  // ==================================================
  // SIGN OUT
  // ==================================================

  const handleSignOut = () => {

    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out of StyleIQ?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },

        {
          text: 'Sign Out',
          style: 'destructive',

          onPress: async () => {

            try {

              setLoading(true);

              await signOut(auth);

              router.replace('/signin');

            } catch (error) {

              console.log(
                'Sign out error:',
                error
              );

              Alert.alert(
                'Error',
                'We could not sign you out. Please try again.'
              );

            } finally {

              setLoading(false);

            }

          },
        },
      ]
    );
  };


  // ==================================================
  // DELETE ACCOUNT
  // ==================================================

  const handleDeleteAccount = () => {

    const user = auth.currentUser;

    if (!user) {

      Alert.alert(
        'Sign in required',
        'Please sign in to manage your account.'
      );

      return;
    }

    Alert.alert(
      'Delete Account',
      'This will permanently delete your StyleIQ account. This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },

        {
          text: 'Delete Account',
          style: 'destructive',

          onPress: () => {

            Alert.alert(
              'Are you absolutely sure?',
              'Your account and account information will be permanently removed.',
              [
                {
                  text: 'Cancel',
                  style: 'cancel',
                },

                {
                  text: 'Delete Permanently',
                  style: 'destructive',

                  onPress: async () => {

                    try {

                      setLoading(true);

                      await deleteUser(
                        user
                      );

                      Alert.alert(
                        'Account deleted',
                        'Your StyleIQ account has been deleted.',
                        [
                          {
                            text: 'OK',

                            onPress: () =>
                              router.replace(
                                '/signin'
                              ),
                          },
                        ]
                      );

                    } catch (error: any) {

                      console.log(
                        'Delete account error:',
                        error
                      );

                      if (
                        error?.code ===
                        'auth/requires-recent-login'
                      ) {

                        Alert.alert(
                          'Recent sign-in required',
                          'For your security, please sign out, sign in again, and then try deleting your account.'
                        );

                      } else {

                        Alert.alert(
                          'Unable to delete account',
                          'We could not delete your account. Please try again.'
                        );

                      }

                    } finally {

                      setLoading(false);

                    }

                  },
                },
              ]
            );

          },
        },
      ]
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
          Updating your account...
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
            onPress={() => {

              Keyboard.dismiss();

              router.back();

            }}
          >

            <Text
              style={[
                styles.backIcon,
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
            Privacy & Security
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
              styles.securityIconContainer,
              {
                backgroundColor:
                  colors.iconBackground,
              },
            ]}
          >

            <Text
              style={styles.securityIcon}
            >
              🔐
            </Text>

          </View>


          <Text
            style={[
              styles.introTitle,
              {
                color:
                  colors.text,
              },
            ]}
          >
            Keep your account secure
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
            Manage your StyleIQ login information
            and account security from one place.
          </Text>

        </View>


        {/* ==========================================
            ACCOUNT SECURITY
        ========================================== */}

        <Text
          style={[
            styles.sectionTitle,
            {
              color:
                colors.text,
            },
          ]}
        >
          Account Security
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

          {/* CHANGE PASSWORD */}

          <Pressable
            style={styles.option}
            onPress={handleChangePassword}
          >

            <View
              style={[
                styles.optionIcon,
                {
                  backgroundColor:
                    colors.iconBackground,
                },
              ]}
            >

              <Text
                style={
                  styles.optionIconText
                }
              >
                🔑
              </Text>

            </View>


            <View
              style={styles.optionContent}
            >

              <Text
                style={[
                  styles.optionTitle,
                  {
                    color:
                      colors.text,
                  },
                ]}
              >
                Change Password
              </Text>


              <Text
                style={[
                  styles.optionSubtitle,
                  {
                    color:
                      colors.secondaryText,
                  },
                ]}
              >
                Receive a secure password reset link
              </Text>

            </View>


            <Text
              style={[
                styles.arrow,
                {
                  color:
                    colors.secondaryText,
                },
              ]}
            >
              ›
            </Text>

          </Pressable>


          <View
            style={[
              styles.divider,
              {
                backgroundColor:
                  colors.border,
              },
            ]}
          />


          {/* CHANGE EMAIL */}

          <View
            style={styles.emailSection}
          >

            <View
              style={styles.option}
            >

              <View
                style={[
                  styles.optionIcon,
                  {
                    backgroundColor:
                      colors.iconBackground,
                  },
                ]}
              >

                <Text
                  style={
                    styles.optionIconText
                  }
                >
                  📧
                </Text>

              </View>


              <View
                style={styles.optionContent}
              >

                <Text
                  style={[
                    styles.optionTitle,
                    {
                      color:
                        colors.text,
                    },
                  ]}
                >
                  Change Email
                </Text>


                <Text
                  style={[
                    styles.optionSubtitle,
                    {
                      color:
                        colors.secondaryText,
                    },
                  ]}
                >
                  Current email:{' '}
                  {auth.currentUser?.email ||
                    'Not available'}
                </Text>

              </View>

            </View>


            <TextInput
              value={newEmail}
              onChangeText={setNewEmail}
              placeholder="Enter new email address"
              placeholderTextColor={
                colors.secondaryText
              }
              keyboardType="email-address"
              autoCapitalize="none"
              style={[
                styles.emailInput,
                {
                  backgroundColor:
                    colors.input,
                  borderColor:
                    colors.border,
                  color:
                    colors.text,
                },
              ]}
            />


            <Pressable
              style={[
                styles.updateEmailButton,
                {
                  backgroundColor:
                    colors.primary,
                },
              ]}
              onPress={
                handleChangeEmail
              }
            >

              <Text
                style={
                  styles.updateEmailText
                }
              >
                Update Email
              </Text>

            </Pressable>

          </View>

        </View>


        {/* ==========================================
            SECURITY INFORMATION
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
            🛡️
          </Text>


          <View
            style={styles.infoContent}
          >

            <Text
              style={[
                styles.infoTitle,
                {
                  color:
                    colors.text,
                },
              ]}
            >
              Your security matters
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
              StyleIQ uses Firebase Authentication
              to securely manage your account
              credentials. Your password is never
              stored directly inside the StyleIQ
              application.
            </Text>

          </View>

        </View>


        {/* ==========================================
            ACCOUNT ACTIONS
        ========================================== */}

        <Text
          style={[
            styles.sectionTitle,
            {
              color:
                colors.text,
            },
          ]}
        >
          Account
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

          {/* SIGN OUT */}

          <Pressable
            style={styles.option}
            onPress={handleSignOut}
          >

            <View
              style={[
                styles.optionIcon,
                {
                  backgroundColor:
                    colors.iconBackground,
                },
              ]}
            >

              <Text
                style={
                  styles.optionIconText
                }
              >
                🚪
              </Text>

            </View>


            <View
              style={styles.optionContent}
            >

              <Text
                style={[
                  styles.optionTitle,
                  {
                    color:
                      colors.text,
                  },
                ]}
              >
                Sign Out
              </Text>


              <Text
                style={[
                  styles.optionSubtitle,
                  {
                    color:
                      colors.secondaryText,
                  },
                ]}
              >
                Sign out of your StyleIQ account
              </Text>

            </View>


            <Text
              style={[
                styles.arrow,
                {
                  color:
                    colors.secondaryText,
                },
              ]}
            >
              ›
            </Text>

          </Pressable>


          <View
            style={[
              styles.divider,
              {
                backgroundColor:
                  colors.border,
              },
            ]}
          />


          {/* DELETE ACCOUNT */}

          <Pressable
            style={styles.option}
            onPress={
              handleDeleteAccount
            }
          >

            <View
              style={[
                styles.optionIcon,
                styles.deleteIcon,
              ]}
            >

              <Text
                style={
                  styles.optionIconText
                }
              >
                🗑️
              </Text>

            </View>


            <View
              style={styles.optionContent}
            >

              <Text
                style={styles.deleteTitle}
              >
                Delete Account
              </Text>


              <Text
                style={[
                  styles.optionSubtitle,
                  {
                    color:
                      colors.secondaryText,
                  },
                ]}
              >
                Permanently delete your StyleIQ account
              </Text>

            </View>


            <Text
              style={styles.deleteArrow}
            >
              ›
            </Text>

          </Pressable>

        </View>


        {/* ==========================================
            FOOTER
        ========================================== */}

        <Text
          style={[
            styles.footerText,
            {
              color:
                colors.secondaryText,
            },
          ]}
        >
          StyleIQ Security
        </Text>


        <View
          style={
            styles.bottomSpace
          }
        />

      </ScrollView>


      {/* ==================================================
          PASSWORD CONFIRMATION MODAL
      ================================================== */}

      <Modal
        visible={
          passwordModalVisible
        }
        transparent={true}
        animationType="fade"
        onRequestClose={() => {

          setPasswordModalVisible(
            false
          );

          setCurrentPassword('');

        }}
      >

        <View
          style={styles.modalOverlay}
        >

          <View
            style={[
              styles.passwordModal,
              {
                backgroundColor:
                  colors.card,
              },
            ]}
          >

            <Text
              style={[
                styles.modalTitle,
                {
                  color:
                    colors.text,
                },
              ]}
            >
              Confirm your password
            </Text>


            <Text
              style={[
                styles.modalSubtitle,
                {
                  color:
                    colors.secondaryText,
                },
              ]}
            >
              Enter your current password to change
              your email address.
            </Text>


            <TextInput
              value={
                currentPassword
              }
              onChangeText={
                setCurrentPassword
              }
              placeholder="Current password"
              placeholderTextColor={
                colors.secondaryText
              }
              secureTextEntry={true}
              autoCapitalize="none"
              autoCorrect={false}
              style={[
                styles.passwordInput,
                {
                  backgroundColor:
                    colors.input,
                  borderColor:
                    colors.border,
                  color:
                    colors.text,
                },
              ]}
            />


            <View
              style={
                styles.modalButtons
              }
            >

              <Pressable
                style={[
                  styles.cancelButton,
                  {
                    backgroundColor:
                      colors.input,
                  },
                ]}
                onPress={() => {

                  setPasswordModalVisible(
                    false
                  );

                  setCurrentPassword('');

                }}
              >

                <Text
                  style={[
                    styles.cancelButtonText,
                    {
                      color:
                        colors.text,
                    },
                  ]}
                >
                  Cancel
                </Text>

              </Pressable>


              <Pressable
                style={[
                  styles.confirmButton,
                  {
                    backgroundColor:
                      colors.primary,
                  },
                ]}
                onPress={
                  confirmEmailChange
                }
              >

                <Text
                  style={
                    styles.confirmButtonText
                  }
                >
                  Continue
                </Text>

              </Pressable>

            </View>

          </View>

        </View>

      </Modal>

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

  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  loadingText: {
    marginTop: 12,
    fontSize: 14,
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
    marginBottom: 28,
  },

  securityIconContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
  },

  securityIcon: {
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
    marginBottom: 22,
  },


  // ==================================================
  // OPTIONS
  // ==================================================

  option: {
    minHeight: 75,
    paddingHorizontal: 15,
    paddingVertical: 13,
    flexDirection: 'row',
    alignItems: 'center',
  },

  optionIcon: {
    width: 43,
    height: 43,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  deleteIcon: {
    backgroundColor: '#FFF0F0',
  },

  optionIconText: {
    fontSize: 20,
  },

  optionContent: {
    flex: 1,
  },

  optionTitle: {
    fontSize: 14,
    fontWeight: '800',
  },

  deleteTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#DC2626',
  },

  optionSubtitle: {
    fontSize: 11,
    lineHeight: 16,
    marginTop: 4,
  },

  arrow: {
    fontSize: 25,
    marginLeft: 8,
  },

  deleteArrow: {
    fontSize: 25,
    color: '#DC2626',
    marginLeft: 8,
  },

  divider: {
    height: 1,
    marginLeft: 70,
  },


  // ==================================================
  // EMAIL
  // ==================================================

  emailSection: {
    paddingBottom: 15,
  },

  emailInput: {
    height: 50,
    borderWidth: 1,
    borderRadius: 13,
    marginHorizontal: 15,
    paddingHorizontal: 13,
    fontSize: 13,
  },

  updateEmailButton: {
    height: 48,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 15,
    marginTop: 10,
  },

  updateEmailText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
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
    fontSize: 24,
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
  // PASSWORD MODAL
  // ==================================================

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 25,
  },

  passwordModal: {
    width: '100%',
    borderRadius: 20,
    padding: 20,
  },

  modalTitle: {
    fontSize: 19,
    fontWeight: '800',
  },

  modalSubtitle: {
    fontSize: 13,
    lineHeight: 19,
    marginTop: 7,
    marginBottom: 16,
  },

  passwordInput: {
    height: 50,
    borderWidth: 1,
    borderRadius: 13,
    paddingHorizontal: 14,
    fontSize: 14,
  },

  modalButtons: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 15,
  },

  cancelButton: {
    flex: 1,
    height: 48,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },

  cancelButtonText: {
    fontSize: 13,
    fontWeight: '700',
  },

  confirmButton: {
    flex: 1,
    height: 48,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },

  confirmButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },


  // ==================================================
  // FOOTER
  // ==================================================

  footerText: {
    textAlign: 'center',
    fontSize: 11,
    marginTop: 5,
  },

  bottomSpace: {
    height: 20,
  },

});