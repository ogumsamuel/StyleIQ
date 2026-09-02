import React from 'react';

import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Pressable,
} from 'react-native';

import { router } from 'expo-router';

import { useTheme } from '../src/theme/ThemeContext';


// ==================================================
// TERMS & CONDITIONS
// ==================================================

export default function TermsConditionsScreen() {

  // ==================================================
  // GLOBAL THEME
  // ==================================================

  const { colors } = useTheme();


  return (

    <SafeAreaView
      style={[
        styles.container,
        {
          backgroundColor: colors.background,
        },
      ]}
    >

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >

        {/* ==========================================
            HEADER
        ========================================== */}

        <View
          style={styles.header}
        >

          <Pressable
            style={styles.backButton}
            onPress={() => router.back()}
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
            Terms & Conditions
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
              styles.iconContainer,
              {
                backgroundColor:
                  colors.iconBackground,
              },
            ]}
          >

            <Text
              style={styles.icon}
            >
              📄
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
            StyleIQ Terms & Conditions
          </Text>


          <Text
            style={[
              styles.introText,
              {
                color: colors.secondaryText,
              },
            ]}
          >
            Please read these terms carefully before
            using StyleIQ.
          </Text>


          <Text
            style={[
              styles.updated,
              {
                color: colors.secondaryText,
              },
            ]}
          >
            Last updated: August 2026
          </Text>

        </View>


        {/* ==========================================
            1
        ========================================== */}

        <Section
          title="1. Acceptance of Terms"
          text={`By creating an account or using StyleIQ, you agree to these Terms & Conditions and our applicable policies.

If you do not agree with these terms, please do not use the StyleIQ application.`}
          colors={colors}
        />


        {/* ==========================================
            2
        ========================================== */}

        <Section
          title="2. About StyleIQ"
          text={`StyleIQ is a fashion shopping and personal styling application designed to help users discover fashion products, manage their preferences, create or save outfits, manage wishlists, and interact with shopping features.

Some features may change, be added, or be removed as StyleIQ continues to develop.`}
          colors={colors}
        />


        {/* ==========================================
            3
        ========================================== */}

        <Section
          title="3. User Accounts"
          text={`To use certain features of StyleIQ, you may need to create an account.

You are responsible for:

• Providing accurate information when creating your account.
• Keeping your login credentials secure.
• Maintaining the security of your account.
• Not allowing unauthorized people to access your account.

You should contact StyleIQ if you believe your account has been accessed without your permission.`}
          colors={colors}
        />


        {/* ==========================================
            4
        ========================================== */}

        <Section
          title="4. Products and Shopping"
          text={`StyleIQ may display fashion products, product descriptions, prices, images, availability information, and other shopping-related information.

Product information may change from time to time. While we aim to provide accurate information, StyleIQ does not guarantee that every product description, image, price, or availability status will always be completely accurate or current.

Where purchases are available, payment and order processing may be handled through third-party payment providers.`}
          colors={colors}
        />


        {/* ==========================================
            5
        ========================================== */}

        <Section
          title="5. Payments"
          text={`Where payment functionality is available, payments may be processed through third-party payment services.

StyleIQ does not intentionally store your complete payment card details within the application.

You agree to provide accurate payment information and authorize applicable payment providers to process transactions associated with your purchases.`}
          colors={colors}
        />


        {/* ==========================================
            6
        ========================================== */}

        <Section
          title="6. User Content"
          text={`Some StyleIQ features may allow you to save preferences, outfits, or other information.

You remain responsible for information and content that you submit or save within the application.

You agree not to use StyleIQ to upload, share, or store content that is unlawful, harmful, fraudulent, abusive, or infringes the rights of another person.`}
          colors={colors}
        />


        {/* ==========================================
            7
        ========================================== */}

        <Section
          title="7. Personalization and Recommendations"
          text={`StyleIQ may use information such as your selected style preferences, favorite colors, clothing categories, and budget preferences to provide personalized recommendations.

Recommendations are intended to assist your shopping and styling decisions. They should not be considered professional advice or a guarantee that a particular product or style is suitable for you.`}
          colors={colors}
        />


        {/* ==========================================
            8
        ========================================== */}

        <Section
          title="8. Intellectual Property"
          text={`The StyleIQ name, branding, design, application interface, graphics, original content, and software are protected by applicable intellectual property laws.

You may use StyleIQ for its intended personal purposes, but you may not copy, reproduce, modify, distribute, sell, or commercially exploit StyleIQ's proprietary content or software without permission.`}
          colors={colors}
        />


        {/* ==========================================
            9
        ========================================== */}

        <Section
          title="9. Third-Party Services"
          text={`StyleIQ may rely on third-party services to provide certain functionality, including authentication, databases, payments, analytics, hosting, or other technical services.

Third-party services operate under their own terms and privacy policies. StyleIQ is not responsible for the independent practices of third-party providers.`}
          colors={colors}
        />


        {/* ==========================================
            10
        ========================================== */}

        <Section
          title="10. Account Suspension or Termination"
          text={`You may stop using StyleIQ at any time.

StyleIQ may suspend or terminate access to an account where necessary to protect the application, other users, prevent abuse, address security concerns, or comply with applicable law.`}
          colors={colors}
        />


        {/* ==========================================
            11
        ========================================== */}

        <Section
          title="11. Disclaimer"
          text={`StyleIQ is provided on an "as available" basis.

We work to keep the application reliable and useful, but we do not guarantee that the application will always be available, error-free, secure, or uninterrupted.

Features may occasionally be unavailable because of maintenance, technical problems, third-party services, or other circumstances.`}
          colors={colors}
        />


        {/* ==========================================
            12
        ========================================== */}

        <Section
          title="12. Limitation of Liability"
          text={`To the extent permitted by applicable law, StyleIQ and its developers will not be responsible for indirect, incidental, special, or consequential losses resulting from your use of, or inability to use, the application.

Nothing in these terms is intended to exclude rights or protections that cannot legally be excluded.`}
          colors={colors}
        />


        {/* ==========================================
            13
        ========================================== */}

        <Section
          title="13. Changes to These Terms"
          text={`These Terms & Conditions may be updated as StyleIQ develops or as legal and operational requirements change.

When significant changes are made, we may provide an appropriate notice within the application or through another reasonable method.

Your continued use of StyleIQ after an update means that you accept the revised terms.`}
          colors={colors}
        />


        {/* ==========================================
            14
        ========================================== */}

        <Section
          title="14. Contact"
          text={`If you have questions, concerns, or requests regarding these Terms & Conditions, please contact the StyleIQ support team through the Help & Support section of the application.`}
          colors={colors}
        />


        {/* ==========================================
            IMPORTANT NOTICE
        ========================================== */}

        <View
          style={[
            styles.noticeCard,
            {
              backgroundColor:
                colors.primaryLight,
            },
          ]}
        >

          <Text
            style={styles.noticeIcon}
          >
            ℹ️
          </Text>


          <View
            style={styles.noticeContent}
          >

            <Text
              style={[
                styles.noticeTitle,
                {
                  color: colors.text,
                },
              ]}
            >
              Important
            </Text>


            <Text
              style={[
                styles.noticeText,
                {
                  color: colors.secondaryText,
                },
              ]}
            >
              These terms are provided as a general
              application template and should be reviewed
              by a qualified legal professional before
              StyleIQ is launched commercially.
            </Text>

          </View>

        </View>


        {/* ==========================================
            FOOTER
        ========================================== */}

        <Text
          style={[
            styles.footer,
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
              color: colors.secondaryText,
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
// SECTION COMPONENT
// ==================================================

function Section({
  title,
  text,
  colors,
}: {
  title: string;
  text: string;
  colors: {
    background: string;
    card: string;
    text: string;
    secondaryText: string;
    primary: string;
    primaryLight: string;
    black: string;
    white: string;
    border: string;
    input: string;
    iconBackground: string;
  };
}) {

  return (

    <View
      style={[
        styles.section,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
        },
      ]}
    >

      <Text
        style={[
          styles.sectionTitle,
          {
            color: colors.text,
          },
        ]}
      >
        {title}
      </Text>


      <Text
        style={[
          styles.sectionText,
          {
            color: colors.secondaryText,
          },
        ]}
      >
        {text}
      </Text>

    </View>
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
    fontSize: 19,
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
    marginBottom: 30,
  },

  iconContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
  },

  icon: {
    fontSize: 30,
  },

  introTitle: {
    fontSize: 21,
    fontWeight: '800',
    textAlign: 'center',
  },

  introText: {
    fontSize: 13,
    textAlign: 'center',
    marginTop: 7,
    lineHeight: 19,
  },

  updated: {
    fontSize: 11,
    marginTop: 8,
  },


  // ==================================================
  // SECTIONS
  // ==================================================

  section: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 17,
    marginBottom: 14,
  },

  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 9,
  },

  sectionText: {
    fontSize: 12,
    lineHeight: 19,
  },


  // ==================================================
  // NOTICE
  // ==================================================

  noticeCard: {
    borderRadius: 17,
    padding: 16,
    flexDirection: 'row',
    marginTop: 8,
    marginBottom: 25,
  },

  noticeIcon: {
    fontSize: 22,
    marginRight: 12,
  },

  noticeContent: {
    flex: 1,
  },

  noticeTitle: {
    fontSize: 13,
    fontWeight: '800',
    marginBottom: 5,
  },

  noticeText: {
    fontSize: 11,
    lineHeight: 17,
  },


  // ==================================================
  // FOOTER
  // ==================================================

  footer: {
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '900',
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