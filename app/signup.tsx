import React, { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { createUserWithEmailAndPassword, updateProfile,} from 'firebase/auth';
import { doc, setDoc, serverTimestamp, } from 'firebase/firestore';
import { auth } from '../src/services/firebase';
import { db } from '../src/services/firebase';

export default function SignUpScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSignUp = async () => {
    if (!name.trim() || !email.trim() || !password) {
      Alert.alert(
        'Missing information',
        'Please fill in all fields.'
      );
      return;
    }

    if (password.length < 6) {
      Alert.alert(
        'Password too short',
        'Your password must contain at least 6 characters.'
      );
      return;
    }

    try {
      const userCredential =
        await createUserWithEmailAndPassword(
          auth,
          email.trim(),
          password
        );
      await updateProfile(userCredential.user, {
  displayName: name.trim(),
});

await setDoc(
  doc(db, 'users', userCredential.user.uid),
  {
    uid: userCredential.user.uid,
    name: name.trim(),
    email: email.trim(),
    createdAt: serverTimestamp(),
  }
);

      console.log(
        'Account created:',
        userCredential.user.uid
      );

      Alert.alert(
        'Account created 🎉',
        `Welcome to StyleIQ, ${name.trim()}!`,
        [
          {
            text: 'Continue',
            onPress: () => router.replace('/signin'),
          },
        ]
      );
    } catch (error: any) {
      console.log('Sign up error:', error);

      if (error.code === 'auth/email-already-in-use') {
        Alert.alert(
          'Account already exists',
          'An account with this email already exists.'
        );
      } else if (error.code === 'auth/invalid-email') {
        Alert.alert(
          'Invalid email',
          'Please enter a valid email address.'
        );
      } else if (error.code === 'auth/weak-password') {
        Alert.alert(
          'Weak password',
          'Please choose a stronger password.'
        );
      } else {
        Alert.alert(
          'Sign up failed',
          'Something went wrong. Please try again.'
        );
      }
    }
  };

  return (
    <LinearGradient
      colors={['#6C3CF0', '#8B5CF6', '#4C1D95']}
      style={styles.container}
    >
      <KeyboardAvoidingView
        style={styles.keyboard}
        behavior={
          Platform.OS === 'ios' ? 'padding' : undefined
        }
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>

            <Pressable
              onPress={() => router.back()}
              style={styles.backButton}
            >
              <Text style={styles.back}>‹</Text>
            </Pressable>

            <View style={styles.logo}>
              <Text style={styles.logoText}>S</Text>
            </View>

            <Text style={styles.brand}>
              StyleIQ
            </Text>

            <Text style={styles.title}>
              Create your account
            </Text>

            <Text style={styles.subtitle}>
              Join StyleIQ and discover a smarter way
              to shop fashion.
            </Text>

          </View>

          <View style={styles.form}>

            <Text style={styles.label}>
              Full name
            </Text>

            <TextInput
              style={styles.input}
              placeholder="Enter your full name"
              placeholderTextColor="#999"
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
            />

            <Text style={styles.label}>
              Email address
            </Text>

            <TextInput
              style={styles.input}
              placeholder="Enter your email"
              placeholderTextColor="#999"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              value={email}
              onChangeText={setEmail}
            />

            <Text style={styles.label}>
              Password
            </Text>

            <TextInput
              style={styles.input}
              placeholder="Create a password"
              placeholderTextColor="#999"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />

            <Pressable
              onPress={handleSignUp}
              style={({ pressed }) => [
                styles.button,
                pressed && styles.buttonPressed,
              ]}
            >
              <Text style={styles.buttonText}>
                Create Account
              </Text>
            </Pressable>

            <View style={styles.loginRow}>
              <Text style={styles.loginText}>
                Already have an account?{' '}
              </Text>

              <Pressable
                onPress={() => router.push('/signin')}
              >
                <Text style={styles.loginLink}>
                  Sign In
                </Text>
              </Pressable>
            </View>

          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  keyboard: {
    flex: 1,
  },

  scroll: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 50,
    paddingBottom: 35,
  },

  header: {
    alignItems: 'center',
  },

  backButton: {
    alignSelf: 'flex-start',
  },

  back: {
    color: '#FFFFFF',
    fontSize: 42,
    fontWeight: '300',
  },

  logo: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  logoText: {
    color: '#FFFFFF',
    fontSize: 30,
    fontWeight: '800',
  },

  brand: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '800',
    marginTop: 10,
  },

  title: {
    color: '#FFFFFF',
    fontSize: 30,
    fontWeight: '800',
    marginTop: 28,
    textAlign: 'center',
  },

  subtitle: {
    color: 'rgba(255,255,255,0.78)',
    fontSize: 15,
    lineHeight: 23,
    textAlign: 'center',
    marginTop: 10,
    maxWidth: 330,
  },

  form: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 22,
    marginTop: 28,
  },

  label: {
    color: '#1F2937',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },

  input: {
    height: 54,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 13,
    paddingHorizontal: 16,
    fontSize: 15,
    color: '#1F2937',
    marginBottom: 18,
    backgroundColor: '#FAFAFA',
  },

  button: {
    height: 56,
    borderRadius: 14,
    backgroundColor: '#6C3CF0',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },

  buttonPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },

  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },

  loginRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 22,
  },

  loginText: {
    color: '#6B7280',
    fontSize: 14,
  },

  loginLink: {
    color: '#6C3CF0',
    fontSize: 14,
    fontWeight: '700',
  },
});