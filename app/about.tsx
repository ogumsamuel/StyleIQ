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
import { useTheme } from '../src/theme/ThemeContext';


// ==================================================
// ABOUT STYLEIQ
// ==================================================

export default function AboutStyleIQScreen() {

  const { colors } = useTheme();

  const styles = createStyles(colors);

  return (
    <SafeAreaView style={styles.container}>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >

        {/* ==========================================
            HEADER
        ========================================== */}

        <View style={styles.header}>

          <Pressable
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backIcon}>
              ‹
            </Text>
          </Pressable>

          <Text style={styles.headerTitle}>
            About StyleIQ
          </Text>

          <View style={styles.headerSpace} />

        </View>


        {/* ==========================================
            BRAND INTRO
        ========================================== */}

        <View style={styles.brandSection}>

          <View style={styles.logoContainer}>
            <Text style={styles.logoText}>
              IQ
            </Text>
          </View>

          <Text style={styles.brandName}>
            StyleIQ
          </Text>

          <Text style={styles.tagline}>
            Make your style yours.
          </Text>

          <Text style={styles.version}>
            Version 1.0.0
          </Text>

        </View>


        {/* ==========================================
            ABOUT
        ========================================== */}

        <View style={styles.card}>

          <Text style={styles.cardTitle}>
            What is StyleIQ?
          </Text>

          <Text style={styles.cardText}>
            StyleIQ is a fashion shopping and personal
            styling application designed to help you
            discover products, explore outfits, save
            your favorite styles, and build a wardrobe
            that reflects your personality.
          </Text>

          <Text style={styles.cardText}>
            Instead of simply browsing products, StyleIQ
            is designed around you. Your style
            preferences, favorite colors, clothing
            categories, and budget can help create a
            more personalized shopping experience.
          </Text>

        </View>


        {/* ==========================================
            OUR VISION
        ========================================== */}

        <View style={styles.card}>

          <Text style={styles.cardTitle}>
            Our Vision
          </Text>

          <Text style={styles.cardText}>
            Our vision is to make fashion discovery
            simpler, smarter, and more personal.
          </Text>

          <Text style={styles.cardText}>
            StyleIQ aims to bring shopping and personal
            styling together in one convenient
            experience.
          </Text>

        </View>


        {/* ==========================================
            FEATURES
        ========================================== */}

        <Text style={styles.sectionTitle}>
          What you can do with StyleIQ
        </Text>


        <View style={styles.featureCard}>

          <Feature
            icon="✨"
            title="Personalized Style"
            description="Set your style preferences so StyleIQ can better understand what you like."
            styles={styles}
          />

          <View style={styles.divider} />

          <Feature
            icon="🛍️"
            title="Discover Products"
            description="Explore fashion products across different categories."
            styles={styles}
          />

          <View style={styles.divider} />

          <Feature
            icon="❤️"
            title="Wishlist"
            description="Save products you love and easily find them later."
            styles={styles}
          />

          <View style={styles.divider} />

          <Feature
            icon="👗"
            title="Saved Outfits"
            description="Create and keep track of your favorite outfit combinations."
            styles={styles}
          />

          <View style={styles.divider} />

          <Feature
            icon="📦"
            title="Order Management"
            description="View and manage your StyleIQ purchases."
            styles={styles}
          />

          <View style={styles.divider} />

          <Feature
            icon="🔐"
            title="Secure Account"
            description="Manage your account securely with Firebase Authentication."
            styles={styles}
          />

        </View>


        {/* ==========================================
            TECHNOLOGY
        ========================================== */}

        <Text style={styles.sectionTitle}>
          Built with modern technology
        </Text>

        <View style={styles.techCard}>

          <Tech
            name="React Native"
            description="Mobile application development"
            styles={styles}
          />

          <Tech
            name="Expo"
            description="Development and deployment platform"
            styles={styles}
          />

          <Tech
            name="Firebase"
            description="Authentication and backend services"
            styles={styles}
          />

          <Tech
            name="Cloud Firestore"
            description="User and application data"
            styles={styles}
          />

        </View>


        {/* ==========================================
            SECURITY
        ========================================== */}

        <View style={styles.securityCard}>

          <Text style={styles.securityIcon}>
            🛡️
          </Text>

          <View style={styles.securityContent}>

            <Text style={styles.securityTitle}>
              Your account matters
            </Text>

            <Text style={styles.securityText}>
              StyleIQ is designed with account security
              in mind. Authentication and user account
              data are managed using Firebase services.
            </Text>

          </View>

        </View>


        {/* ==========================================
            PROJECT
        ========================================== */}

        <View style={styles.card}>

          <Text style={styles.cardTitle}>
            About the project
          </Text>

          <Text style={styles.cardText}>
            StyleIQ is an evolving project focused on
            combining mobile development, e-commerce,
            personalization, and modern technology
            into one fashion experience.
          </Text>

          <Text style={styles.cardText}>
            New features and improvements may be added
            as the platform continues to grow.
          </Text>

        </View>


        {/* ==========================================
            FOOTER
        ========================================== */}

        <View style={styles.footer}>

          <Text style={styles.footerBrand}>
            StyleIQ
          </Text>

          <Text style={styles.footerTagline}>
            Make your style yours.
          </Text>

          <Text style={styles.footerVersion}>
            Version 1.0.0
          </Text>

        </View>


        <View style={styles.bottomSpace} />

      </ScrollView>

    </SafeAreaView>
  );
}


// ==================================================
// FEATURE COMPONENT
// ==================================================

function Feature({
  icon,
  title,
  description,
  styles,
}: {
  icon: string;
  title: string;
  description: string;
  styles: ReturnType<typeof createStyles>;
}) {

  return (
    <View style={styles.feature}>

      <View style={styles.featureIcon}>
        <Text style={styles.featureIconText}>
          {icon}
        </Text>
      </View>

      <View style={styles.featureContent}>

        <Text style={styles.featureTitle}>
          {title}
        </Text>

        <Text style={styles.featureDescription}>
          {description}
        </Text>

      </View>

    </View>
  );
}


// ==================================================
// TECHNOLOGY COMPONENT
// ==================================================

function Tech({
  name,
  description,
  styles,
}: {
  name: string;
  description: string;
  styles: ReturnType<typeof createStyles>;
}) {

  return (
    <View style={styles.techItem}>

      <View style={styles.techBullet}>
        <Text style={styles.techBulletText}>
          ✓
        </Text>
      </View>

      <View style={styles.techContent}>

        <Text style={styles.techName}>
          {name}
        </Text>

        <Text style={styles.techDescription}>
          {description}
        </Text>

      </View>

    </View>
  );
}


// ==================================================
// STYLES
// ==================================================

const createStyles = (colors: any) =>
  StyleSheet.create({

    container: {
      flex: 1,
      backgroundColor: colors.background,
    },

    scrollContent: {
      paddingHorizontal: 20,
      paddingBottom: 40,
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
      height: 45,
      justifyContent: 'center',
    },

    backIcon: {
      fontSize: 40,
      color: colors.text,
      fontWeight: '300',
    },

    headerTitle: {
      fontSize: 20,
      fontWeight: '800',
      color: colors.text,
    },

    headerSpace: {
      width: 45,
    },


    // ================================================
    // BRAND
    // ================================================

    brandSection: {
      alignItems: 'center',
      marginTop: 20,
      marginBottom: 30,
    },

    logoContainer: {
      width: 82,
      height: 82,
      borderRadius: 24,
      backgroundColor: colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 15,
    },

    logoText: {
      color: colors.white,
      fontSize: 27,
      fontWeight: '900',
    },

    brandName: {
      fontSize: 30,
      fontWeight: '900',
      color: colors.text,
    },

    tagline: {
      fontSize: 13,
      color: colors.secondaryText,
      marginTop: 5,
    },

    version: {
      fontSize: 11,
      color: colors.secondaryText,
      marginTop: 8,
    },


    // ================================================
    // CARDS
    // ================================================

    card: {
      backgroundColor: colors.card,
      borderRadius: 18,
      borderWidth: 1,
      borderColor: colors.border,
      padding: 17,
      marginBottom: 16,
    },

    cardTitle: {
      fontSize: 17,
      fontWeight: '800',
      color: colors.text,
      marginBottom: 10,
    },

    cardText: {
      fontSize: 12,
      color: colors.secondaryText,
      lineHeight: 19,
      marginBottom: 10,
    },


    // ================================================
    // SECTIONS
    // ================================================

    sectionTitle: {
      fontSize: 17,
      fontWeight: '800',
      color: colors.text,
      marginTop: 10,
      marginBottom: 12,
    },


    // ================================================
    // FEATURES
    // ================================================

    featureCard: {
      backgroundColor: colors.card,
      borderRadius: 18,
      borderWidth: 1,
      borderColor: colors.border,
      overflow: 'hidden',
      marginBottom: 20,
    },

    feature: {
      minHeight: 75,
      paddingHorizontal: 15,
      paddingVertical: 12,
      flexDirection: 'row',
      alignItems: 'center',
    },

    featureIcon: {
      width: 43,
      height: 43,
      borderRadius: 13,
      backgroundColor: colors.primaryLight,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 12,
    },

    featureIconText: {
      fontSize: 20,
    },

    featureContent: {
      flex: 1,
    },

    featureTitle: {
      fontSize: 14,
      fontWeight: '800',
      color: colors.text,
    },

    featureDescription: {
      fontSize: 11,
      color: colors.secondaryText,
      lineHeight: 16,
      marginTop: 3,
    },

    divider: {
      height: 1,
      backgroundColor: colors.border,
      marginLeft: 70,
    },


    // ================================================
    // TECHNOLOGY
    // ================================================

    techCard: {
      backgroundColor: colors.card,
      borderRadius: 18,
      borderWidth: 1,
      borderColor: colors.border,
      paddingVertical: 5,
      marginBottom: 20,
    },

    techItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 13,
    },

    techBullet: {
      width: 32,
      height: 32,
      borderRadius: 10,
      backgroundColor: colors.primaryLight,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 12,
    },

    techBulletText: {
      color: colors.primary,
      fontSize: 15,
      fontWeight: '900',
    },

    techContent: {
      flex: 1,
    },

    techName: {
      fontSize: 13,
      fontWeight: '800',
      color: colors.text,
    },

    techDescription: {
      fontSize: 11,
      color: colors.secondaryText,
      marginTop: 3,
    },


    // ================================================
    // SECURITY
    // ================================================

    securityCard: {
      backgroundColor: colors.primaryLight,
      borderRadius: 18,
      padding: 16,
      flexDirection: 'row',
      marginBottom: 20,
    },

    securityIcon: {
      fontSize: 24,
      marginRight: 12,
    },

    securityContent: {
      flex: 1,
    },

    securityTitle: {
      fontSize: 13,
      fontWeight: '800',
      color: colors.text,
      marginBottom: 5,
    },

    securityText: {
      fontSize: 11,
      color: colors.secondaryText,
      lineHeight: 17,
    },


    // ================================================
    // FOOTER
    // ================================================

    footer: {
      alignItems: 'center',
      marginTop: 5,
    },

    footerBrand: {
      fontSize: 20,
      fontWeight: '900',
      color: colors.primary,
    },

    footerTagline: {
      fontSize: 11,
      color: colors.secondaryText,
      marginTop: 4,
    },

    footerVersion: {
      fontSize: 10,
      color: colors.secondaryText,
      marginTop: 6,
    },

    bottomSpace: {
      height: 20,
    },

  });