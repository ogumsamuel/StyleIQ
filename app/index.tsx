import { router } from 'expo-router';
import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  Pressable,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function WelcomeScreen() {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      <LinearGradient
        colors={['#6C3CF0', '#8B5CF6', '#4C1D95']}
        style={styles.background}
      >
        {/* Logo */}
        <View style={styles.logoContainer}>
          <View style={styles.logoCircle}>
            <Text style={styles.logoText}>S</Text>
          </View>

          <Text style={styles.brandName}>StyleIQ</Text>
        </View>

        {/* Main Content */}
        <View style={styles.content}>
          <Text style={styles.title}>
            Discover Your{'\n'}
            <Text style={styles.highlight}>Perfect Style</Text>
          </Text>

          <Text style={styles.description}>
            Your intelligent fashion companion. Discover outfits,
            find products and build your personal style with AI.
          </Text>
        </View>

        {/* Buttons */}
        <View style={styles.bottom}>
          <Pressable
  onPress={() => router.push('/signup')}
  style={({ pressed }) => [
    styles.getStartedButton,
    pressed && styles.buttonPressed,
  ]}
>
            <Text style={styles.getStartedText}>Get Started</Text>
          </Pressable>

         <Pressable onPress={() => router.push('/signin')}>
  <Text style={styles.signInText}>
    Already have an account?{' '}
    <Text style={styles.signIn}>Sign In</Text>
  </Text>
</Pressable> 

          <Text style={styles.tagline}>
            Smart Fashion. Smarter Choices.
          </Text>
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  background: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 70,
    paddingBottom: 35,
  },

  logoContainer: {
    alignItems: 'center',
  },

  logoCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  logoText: {
    color: '#FFFFFF',
    fontSize: 34,
    fontWeight: '800',
  },

  brandName: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '800',
    marginTop: 12,
  },

  content: {
    flex: 1,
    justifyContent: 'center',
  },

  title: {
    color: '#FFFFFF',
    fontSize: 46,
    lineHeight: 54,
    fontWeight: '800',
  },

  highlight: {
    color: '#FDE68A',
  },

  description: {
    color: 'rgba(255,255,255,0.82)',
    fontSize: 17,
    lineHeight: 26,
    marginTop: 22,
  },

  bottom: {
    alignItems: 'center',
  },

  getStartedButton: {
    width: '100%',
    height: 58,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  buttonPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },

  getStartedText: {
    color: '#6C3CF0',
    fontSize: 17,
    fontWeight: '700',
  },

  signInText: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 14,
    marginTop: 20,
  },

  signIn: {
    color: '#FFFFFF',
    fontWeight: '700',
  },

  tagline: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 12,
    marginTop: 28,
  },
});