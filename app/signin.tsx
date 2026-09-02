import React, { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth} from '../src/services/firebase';

export default function SignInScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
const handleSignIn = async () => {
  if (!email || !password) {
    Alert.alert(
      'Missing information',
      'Please enter your email and password.'
    );
    return;
  }

  try {
    await signInWithEmailAndPassword(
      auth,
      email.trim(),
      password
    );

    router.replace('/home');
  } catch (error: any) {
    console.log(error);

    if (error.code === 'auth/invalid-credential') {
      Alert.alert(
        'Sign in failed',
        'Your email or password is incorrect.'
      );
    } else if (error.code === 'auth/invalid-email') {
      Alert.alert(
        'Invalid email',
        'Please enter a valid email address.'
      );
    } else {
      Alert.alert(
        'Sign in failed',
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
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.content}>

          <Pressable onPress={() => router.back()}>
            <Text style={styles.back}>‹</Text>
          </Pressable>

          <View style={styles.logo}>
            <Text style={styles.logoText}>S</Text>
          </View>

          <Text style={styles.brand}>StyleIQ</Text>

          <Text style={styles.title}>
            Welcome back
          </Text>

          <Text style={styles.subtitle}>
            Sign in to continue discovering your style.
          </Text>

          <View style={styles.form}>

            <Text style={styles.label}>
              Email address
            </Text>

            <TextInput
              style={styles.input}
              placeholder="Enter your email"
              placeholderTextColor="#999"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />

            <Text style={styles.label}>
              Password
            </Text>

            <TextInput
              style={styles.input}
              placeholder="Enter your password"
              placeholderTextColor="#999"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />

            <Pressable style={styles.forgot}
            onPress={() => router.push("/reset-password")}
            >
              <Text style={styles.forgotText}>
                Forgot password?
              </Text>
            </Pressable>

            <Pressable
              onPress={handleSignIn}
              style={({ pressed }) => [
                styles.button,
                pressed && styles.buttonPressed,
              ]}
            >
              <Text style={styles.buttonText}>
                Sign In
              </Text>
            </Pressable>

            <View style={styles.signupRow}>
              <Text style={styles.signupText}>
                Don't have an account?{' '}
              </Text>

              <Pressable
                onPress={() => router.push('/signup')}
              >
                <Text style={styles.signupLink}>
                  Create Account
                </Text>
              </Pressable>
            </View>

          </View>
        </View>
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

  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 55,
  },

  back: {
    color: '#FFFFFF',
    fontSize: 42,
    fontWeight: '300',
  },

  logo: {
    alignSelf: 'center',
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 5,
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
    textAlign: 'center',
    marginTop: 10,
  },

  title: {
    color: '#FFFFFF',
    fontSize: 30,
    fontWeight: '800',
    textAlign: 'center',
    marginTop: 30,
  },

  subtitle: {
    color: 'rgba(255,255,255,0.78)',
    fontSize: 15,
    textAlign: 'center',
    marginTop: 10,
  },

  form: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 22,
    marginTop: 30,
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

  forgot: {
    alignSelf: 'flex-end',
    marginBottom: 20,
  },

  forgotText: {
    color: '#6C3CF0',
    fontSize: 13,
    fontWeight: '600',
  },

  button: {
    height: 56,
    borderRadius: 14,
    backgroundColor: '#6C3CF0',
    alignItems: 'center',
    justifyContent: 'center',
  },

  buttonPressed: {
    opacity: 0.8,
  },

  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },

  signupRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 22,
  },

  signupText: {
    color: '#6B7280',
    fontSize: 14,
  },

  signupLink: {
    color: '#6C3CF0',
    fontSize: 14,
    fontWeight: '700',
  },
});