import React, { useState } from 'react';

import {
  ActivityIndicator,
  Alert,
  Keyboard,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { router } from 'expo-router';

import {
  sendPasswordResetEmail,
} from 'firebase/auth';

import { auth } from '../src/services/firebase';


// ==================================================
// RESET PASSWORD
// ==================================================

export default function ResetPasswordScreen() {

  const [email, setEmail] =
    useState('');

  const [loading, setLoading] =
    useState(false);

  const [emailSent, setEmailSent] =
    useState(false);


  // ==================================================
  // SEND RESET EMAIL
  // ==================================================

  const handleResetPassword = async () => {

    const cleanEmail =
      email.trim().toLowerCase();

    if (!cleanEmail) {

      Alert.alert(
        'Email required',
        'Please enter the email address connected to your StyleIQ account.'
      );

      return;
    }

    if (!cleanEmail.includes('@')) {

      Alert.alert(
        'Invalid email',
        'Please enter a valid email address.'
      );

      return;
    }

    try {

      setLoading(true);

      await sendPasswordResetEmail(
        auth,
        cleanEmail
      );

      setEmailSent(true);

    } catch (error: any) {

      console.log(
        'Password reset error:',
        error
      );

      if (
        error?.code ===
        'auth/user-not-found'
      ) {

        Alert.alert(
          'Account not found',
          'We could not find an account associated with this email address.'
        );

      } else if (
        error?.code ===
        'auth/invalid-email'
      ) {

        Alert.alert(
          'Invalid email',
          'Please enter a valid email address.'
        );

      } else {

        Alert.alert(
          'Unable to reset password',
          'We could not send the password reset email. Please try again.'
        );

      }

    } finally {

      setLoading(false);

    }
  };


  // ==================================================
  // LOADING
  // ==================================================

  if (loading) {

    return (

      <SafeAreaView
        style={styles.loadingContainer}
      >

        <ActivityIndicator
          size="large"
          color="#6C3CF0"
        />

        <Text
          style={styles.loadingText}
        >
          Sending reset link...
        </Text>

      </SafeAreaView>

    );
  }


  // ==================================================
  // SUCCESS SCREEN
  // ==================================================

  if (emailSent) {

    return (

      <SafeAreaView
        style={styles.container}
      >

        <View
          style={styles.successContainer}
        >

          <View
            style={styles.successIconContainer}
          >

            <Text
              style={styles.successIcon}
            >
              ✓
            </Text>

          </View>


          <Text
            style={styles.successTitle}
          >
            Check your email
          </Text>


          <Text
            style={styles.successText}
          >
            We sent a password reset link to
          </Text>


          <Text
            style={styles.emailText}
          >
            {email.trim().toLowerCase()}
          </Text>


          <Text
            style={styles.successHint}
          >
            Open the email and follow the instructions
            to create a new password.
          </Text>


          <Pressable
            style={styles.signInButton}
            onPress={() => {

              Keyboard.dismiss();

              router.replace('/signin');

            }}
          >

            <Text
              style={styles.signInButtonText}
            >
              Back to Sign In
            </Text>

          </Pressable>


          <Pressable
            style={styles.resendButton}
            onPress={() => {

              setEmailSent(false);

            }}
          >

            <Text
              style={styles.resendText}
            >
              Use a different email
            </Text>

          </Pressable>

        </View>

      </SafeAreaView>

    );
  }


  // ==================================================
  // SCREEN
  // ==================================================

  return (

    <SafeAreaView
      style={styles.container}
    >

      <View
        style={styles.screen}
      >

        {/* ==========================================
            BACK BUTTON
        ========================================== */}

        <Pressable
          style={styles.backButton}
          onPress={() => {

            Keyboard.dismiss();

            router.back();

          }}
        >

          <Text
            style={styles.backIcon}
          >
            ‹
          </Text>

        </Pressable>


        {/* ==========================================
            ICON
        ========================================== */}

        <View
          style={styles.iconContainer}
        >

          <Text
            style={styles.lockIcon}
          >
            🔐
          </Text>

        </View>


        {/* ==========================================
            TITLE
        ========================================== */}

        <Text
          style={styles.title}
        >
          Reset your password
        </Text>


        <Text
          style={styles.subtitle}
        >
          Enter the email address connected to your
          StyleIQ account and we'll send you a secure
          link to reset your password.
        </Text>


        {/* ==========================================
            EMAIL
        ========================================== */}

        <View
          style={styles.inputContainer}
        >

          <Text
            style={styles.inputLabel}
          >
            Email Address
          </Text>


          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="Enter your email"
            placeholderTextColor="#999"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            textContentType="emailAddress"
            style={styles.input}
          />

        </View>


        {/* ==========================================
            RESET BUTTON
        ========================================== */}

        <Pressable
          style={styles.resetButton}
          onPress={handleResetPassword}
        >

          <Text
            style={styles.resetButtonText}
          >
            Send Reset Link
          </Text>

        </Pressable>


        {/* ==========================================
            BACK TO SIGN IN
        ========================================== */}

        <Pressable
          style={styles.backToSignIn}
          onPress={() => {

            Keyboard.dismiss();

            router.replace('/signin');

          }}
        >

          <Text
            style={styles.backToSignInText}
          >
            Remember your password?{' '}

            <Text
              style={styles.signInText}
            >
              Sign In
            </Text>

          </Text>

        </Pressable>


        {/* ==========================================
            SECURITY MESSAGE
        ========================================== */}

        <View
          style={styles.securityCard}
        >

          <Text
            style={styles.securityIcon}
          >
            🛡️
          </Text>


          <Text
            style={styles.securityText}
          >
            Your password is securely managed by
            Firebase Authentication. StyleIQ never
            stores your password directly.
          </Text>

        </View>

      </View>

    </SafeAreaView>

  );
}


// ==================================================
// STYLES
// ==================================================

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },

  screen: {
    flex: 1,
    paddingHorizontal: 25,
    paddingTop: 10,
  },


  // ==================================================
  // LOADING
  // ==================================================

  loadingContainer: {
    flex: 1,
    backgroundColor: '#FAFAFA',
    alignItems: 'center',
    justifyContent: 'center',
  },

  loadingText: {
    marginTop: 12,
    color: '#777',
    fontSize: 14,
  },


  // ==================================================
  // BACK BUTTON
  // ==================================================

  backButton: {
    width: 45,
    height: 45,
    justifyContent: 'center',
    marginBottom: 25,
  },

  backIcon: {
    fontSize: 40,
    color: '#111',
    fontWeight: '300',
  },


  // ==================================================
  // ICON
  // ==================================================

  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F0EBFF',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: 20,
  },

  lockIcon: {
    fontSize: 35,
  },


  // ==================================================
  // TITLE
  // ==================================================

  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#111',
    textAlign: 'center',
  },

  subtitle: {
    fontSize: 13,
    lineHeight: 20,
    color: '#777',
    textAlign: 'center',
    marginTop: 10,
    paddingHorizontal: 10,
    marginBottom: 30,
  },


  // ==================================================
  // INPUT
  // ==================================================

  inputContainer: {
    marginBottom: 18,
  },

  inputLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#222',
    marginBottom: 8,
  },

  input: {
    height: 54,
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#E2E2E2',
    borderRadius: 14,
    paddingHorizontal: 15,
    color: '#111',
    fontSize: 14,
  },


  // ==================================================
  // RESET BUTTON
  // ==================================================

  resetButton: {
    height: 54,
    backgroundColor: '#6C3CF0',
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 5,
  },

  resetButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '800',
  },


  // ==================================================
  // SIGN IN
  // ==================================================

  backToSignIn: {
    alignItems: 'center',
    marginTop: 22,
  },

  backToSignInText: {
    fontSize: 12,
    color: '#777',
  },

  signInText: {
    color: '#6C3CF0',
    fontWeight: '800',
  },


  // ==================================================
  // SECURITY
  // ==================================================

  securityCard: {
    backgroundColor: '#F0EBFF',
    borderRadius: 16,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 35,
  },

  securityIcon: {
    fontSize: 21,
    marginRight: 10,
  },

  securityText: {
    flex: 1,
    fontSize: 11,
    lineHeight: 17,
    color: '#777',
  },


  // ==================================================
  // SUCCESS
  // ==================================================

  successContainer: {
    flex: 1,
    paddingHorizontal: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },

  successIconContainer: {
    width: 82,
    height: 82,
    borderRadius: 41,
    backgroundColor: '#E9F9EF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },

  successIcon: {
    fontSize: 42,
    color: '#22A05A',
    fontWeight: '800',
  },

  successTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#111',
    textAlign: 'center',
  },

  successText: {
    fontSize: 13,
    color: '#777',
    marginTop: 12,
    textAlign: 'center',
  },

  emailText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#6C3CF0',
    marginTop: 5,
    textAlign: 'center',
  },

  successHint: {
    fontSize: 12,
    lineHeight: 19,
    color: '#888',
    textAlign: 'center',
    marginTop: 15,
    paddingHorizontal: 15,
  },

  signInButton: {
    width: '100%',
    height: 54,
    backgroundColor: '#6C3CF0',
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 30,
  },

  signInButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '800',
  },

  resendButton: {
    marginTop: 18,
    paddingVertical: 8,
  },

  resendText: {
    color: '#6C3CF0',
    fontSize: 12,
    fontWeight: '700',
  },

});