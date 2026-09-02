import React, { useState } from 'react';

import {
  ActivityIndicator,
  Alert,
  Keyboard,
  Linking,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { router } from 'expo-router';

import { useTheme } from '../src/theme/ThemeContext';


// ==================================================
// HELP & SUPPORT
// ==================================================

export default function HelpSupportScreen() {

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

  const [search, setSearch] =
    useState('');

  const [loading, setLoading] =
    useState(false);

  const [expandedFAQ, setExpandedFAQ] =
    useState<number | null>(null);


  // ==================================================
  // FAQ DATA
  // ==================================================

  const faqs = [
    {
      question: 'How does StyleIQ work?',
      answer:
        'StyleIQ helps you discover fashion products and outfits based on your personal style preferences. Your preferences help us provide more relevant recommendations and StyleIQ Matches.',
    },

    {
      question: 'What is StyleIQ Match?',
      answer:
        'StyleIQ Match is our personalized fashion recommendation feature. It uses your style preferences, categories, colors, and other preferences to help identify products that may be a good match for you.',
    },

    {
      question: 'How do I change my style preferences?',
      answer:
        'Go to your Profile, open Style Preferences, make your changes, and save your preferences. Your updated preferences will be used for future recommendations.',
    },

    {
      question: 'How do I change my email address?',
      answer:
        'Go to Profile → Settings → Privacy & Security. Enter your new email address and confirm your current password when requested.',
    },

    {
      question: 'How do I reset my password?',
      answer:
        'Go to Profile → Settings → Privacy & Security and select Change Password. StyleIQ will send a secure password reset link to the email connected to your account.',
    },

    {
      question: 'How do I delete my StyleIQ account?',
      answer:
        'Go to Profile → Settings → Privacy & Security → Delete Account. You will be asked to confirm before your account is permanently deleted.',
    },

    {
      question: 'Why am I seeing products that do not match my style?',
      answer:
        'Recommendations improve when your style preferences are complete and up to date. Check your Style Preferences and make sure your preferred categories, colors, budget, and styles are correctly selected.',
    },

    {
      question: 'How can I report a problem?',
      answer:
        'Use the Contact Support or Report a Problem option below. Include as much information as possible so our support team can investigate the issue.',
    },
  ];


  // ==================================================
  // FILTER FAQ
  // ==================================================

  const filteredFAQs =
    faqs.filter((faq) =>
      faq.question
        .toLowerCase()
        .includes(search.toLowerCase())
    );


  // ==================================================
  // CONTACT SUPPORT
  // ==================================================

  const handleContactSupport = async () => {

    try {

      const email =
        'support@styleiq.app';

      const subject =
        'StyleIQ Support Request';

      const body =
        'Hello StyleIQ Support Team,%0D%0A%0D%0AI need help with:%0D%0A%0D%0A';

      const url =
        `mailto:${email}?subject=${encodeURIComponent(
          subject
        )}&body=${body}`;

      const supported =
        await Linking.canOpenURL(url);

      if (supported) {

        await Linking.openURL(url);

      } else {

        Alert.alert(
          'Unable to open email',
          'Please send an email to support@styleiq.app.'
        );

      }

    } catch (error) {

      console.log(
        'Support email error:',
        error
      );

      Alert.alert(
        'Unable to contact support',
        'Please try again later.'
      );

    }
  };


  // ==================================================
  // REPORT PROBLEM
  // ==================================================

  const handleReportProblem = () => {

    Alert.alert(
      'Report a Problem',
      'Would you like to contact StyleIQ support about this problem?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },

        {
          text: 'Contact Support',
          onPress: handleContactSupport,
        },
      ]
    );
  };


  // ==================================================
  // SEND FEEDBACK
  // ==================================================

  const handleFeedback = async () => {

    try {

      const email =
        'feedback@styleiq.app';

      const subject =
        'StyleIQ Feedback';

      const body =
        'Hello StyleIQ Team,%0D%0A%0D%0AHere is my feedback:%0D%0A%0D%0A';

      const url =
        `mailto:${email}?subject=${encodeURIComponent(
          subject
        )}&body=${body}`;

      const supported =
        await Linking.canOpenURL(url);

      if (supported) {

        await Linking.openURL(url);

      } else {

        Alert.alert(
          'Unable to open email',
          'Please send your feedback to feedback@styleiq.app.'
        );

      }

    } catch (error) {

      console.log(
        'Feedback error:',
        error
      );

    }
  };


  // ==================================================
  // FAQ TOGGLE
  // ==================================================

  const toggleFAQ = (index: number) => {

    setExpandedFAQ(
      expandedFAQ === index
        ? null
        : index
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
          Loading...
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
        keyboardShouldPersistTaps="handled"
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
            Help & Support
          </Text>


          <View
            style={styles.headerSpace}
          />

        </View>


        {/* ==========================================
            HERO
        ========================================== */}

        <View
          style={styles.hero}
        >

          <View
            style={[
              styles.helpIconContainer,
              {
                backgroundColor:
                  colors.primaryLight,
              },
            ]}
          >

            <Text
              style={styles.helpIcon}
            >
              💬
            </Text>

          </View>


          <Text
            style={[
              styles.heroTitle,
              {
                color:
                  colors.text,
              },
            ]}
          >
            How can we help?
          </Text>


          <Text
            style={[
              styles.heroText,
              {
                color:
                  colors.secondaryText,
              },
            ]}
          >
            Find answers, get support, or send us
            feedback about your StyleIQ experience.
          </Text>

        </View>


        {/* ==========================================
            SEARCH
        ========================================== */}

        <View
          style={[
            styles.searchContainer,
            {
              backgroundColor:
                colors.card,

              borderColor:
                colors.border,
            },
          ]}
        >

          <Text
            style={styles.searchIcon}
          >
            🔍
          </Text>


          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search for help..."
            placeholderTextColor={
              colors.secondaryText
            }
            style={[
              styles.searchInput,
              {
                color:
                  colors.text,
              },
            ]}
          />


          {search.length > 0 && (

            <Pressable
              onPress={() =>
                setSearch('')
              }
            >

              <Text
                style={[
                  styles.clearSearch,
                  {
                    color:
                      colors.secondaryText,
                  },
                ]}
              >
                ✕
              </Text>

            </Pressable>

          )}

        </View>


        {/* ==========================================
            QUICK HELP
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
          Quick Help
        </Text>


        <View
          style={styles.quickGrid}
        >

          <Pressable
            style={[
              styles.quickCard,
              {
                backgroundColor:
                  colors.card,

                borderColor:
                  colors.border,
              },
            ]}
            onPress={() => {
              setSearch('account');
            }}
          >

            <Text
              style={styles.quickIcon}
            >
              👤
            </Text>

            <Text
              style={[
                styles.quickTitle,
                {
                  color:
                    colors.text,
                },
              ]}
            >
              Account
            </Text>

            <Text
              style={[
                styles.quickSubtitle,
                {
                  color:
                    colors.secondaryText,
                },
              ]}
            >
              Profile & login
            </Text>

          </Pressable>


          <Pressable
            style={[
              styles.quickCard,
              {
                backgroundColor:
                  colors.card,

                borderColor:
                  colors.border,
              },
            ]}
            onPress={() => {
              setSearch('StyleIQ Match');
            }}
          >

            <Text
              style={styles.quickIcon}
            >
              ✨
            </Text>

            <Text
              style={[
                styles.quickTitle,
                {
                  color:
                    colors.text,
                },
              ]}
            >
              StyleIQ Match
            </Text>

            <Text
              style={[
                styles.quickSubtitle,
                {
                  color:
                    colors.secondaryText,
                },
              ]}
            >
              Recommendations
            </Text>

          </Pressable>


          <Pressable
            style={[
              styles.quickCard,
              {
                backgroundColor:
                  colors.card,

                borderColor:
                  colors.border,
              },
            ]}
            onPress={() => {
              setSearch('password');
            }}
          >

            <Text
              style={styles.quickIcon}
            >
              🔐
            </Text>

            <Text
              style={[
                styles.quickTitle,
                {
                  color:
                    colors.text,
                },
              ]}
            >
              Security
            </Text>

            <Text
              style={[
                styles.quickSubtitle,
                {
                  color:
                    colors.secondaryText,
                },
              ]}
            >
              Password & email
            </Text>

          </Pressable>


          <Pressable
            style={[
              styles.quickCard,
              {
                backgroundColor:
                  colors.card,

                borderColor:
                  colors.border,
              },
            ]}
            onPress={() => {
              setSearch('problem');
            }}
          >

            <Text
              style={styles.quickIcon}
            >
              🛠️
            </Text>

            <Text
              style={[
                styles.quickTitle,
                {
                  color:
                    colors.text,
                },
              ]}
            >
              Problems
            </Text>

            <Text
              style={[
                styles.quickSubtitle,
                {
                  color:
                    colors.secondaryText,
                },
              ]}
            >
              Troubleshooting
            </Text>

          </Pressable>

        </View>


        {/* ==========================================
            FAQ
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
          Frequently Asked Questions
        </Text>


        <View
          style={[
            styles.faqCard,
            {
              backgroundColor:
                colors.card,

              borderColor:
                colors.border,
            },
          ]}
        >

          {filteredFAQs.length === 0 ? (

            <View
              style={styles.noResults}
            >

              <Text
                style={styles.noResultsIcon}
              >
                🔍
              </Text>

              <Text
                style={[
                  styles.noResultsTitle,
                  {
                    color:
                      colors.text,
                  },
                ]}
              >
                No results found
              </Text>

              <Text
                style={[
                  styles.noResultsText,
                  {
                    color:
                      colors.secondaryText,
                  },
                ]}
              >
                Try searching with a different keyword.
              </Text>

            </View>

          ) : (

            filteredFAQs.map(
              (faq, index) => {

                const isExpanded =
                  expandedFAQ === index;

                return (

                  <View
                    key={faq.question}
                  >

                    <Pressable
                      style={styles.faqRow}
                      onPress={() =>
                        toggleFAQ(index)
                      }
                    >

                      <View
                        style={[
                          styles.faqIconContainer,
                          {
                            backgroundColor:
                              colors.primaryLight,
                          },
                        ]}
                      >

                        <Text
                          style={[
                            styles.faqIcon,
                            {
                              color:
                                colors.primary,
                            },
                          ]}
                        >
                          ?
                        </Text>

                      </View>


                      <Text
                        style={[
                          styles.faqQuestion,
                          {
                            color:
                              colors.text,
                          },
                        ]}
                      >
                        {faq.question}
                      </Text>


                      <Text
                        style={[
                          styles.faqArrow,
                          {
                            color:
                              colors.secondaryText,
                          },
                        ]}
                      >
                        {isExpanded ? '⌃' : '⌄'}
                      </Text>

                    </Pressable>


                    {isExpanded && (

                      <View
                        style={styles.answerContainer}
                      >

                        <Text
                          style={[
                            styles.answerText,
                            {
                              color:
                                colors.secondaryText,
                            },
                          ]}
                        >
                          {faq.answer}
                        </Text>

                      </View>

                    )}


                    {index <
                      filteredFAQs.length - 1 && (

                      <View
                        style={[
                          styles.divider,
                          {
                            backgroundColor:
                              colors.border,
                          },
                        ]}
                      />

                    )}

                  </View>

                );

              }
            )

          )}

        </View>


        {/* ==========================================
            CONTACT SUPPORT
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
          Need More Help?
        </Text>


        <View
          style={[
            styles.supportCard,
            {
              backgroundColor:
                colors.primaryLight,
            },
          ]}
        >

          <View
            style={[
              styles.supportIconContainer,
              {
                backgroundColor:
                  colors.card,
              },
            ]}
          >

            <Text
              style={styles.supportIcon}
            >
              🎧
            </Text>

          </View>


          <View
            style={styles.supportContent}
          >

            <Text
              style={[
                styles.supportTitle,
                {
                  color:
                    colors.text,
                },
              ]}
            >
              Contact StyleIQ Support
            </Text>


            <Text
              style={[
                styles.supportText,
                {
                  color:
                    colors.secondaryText,
                },
              ]}
            >
              Can't find what you're looking for?
              Our support team is here to help.
            </Text>


            <Pressable
              style={[
                styles.contactButton,
                {
                  backgroundColor:
                    colors.primary,
                },
              ]}
              onPress={handleContactSupport}
            >

              <Text
                style={styles.contactButtonText}
              >
                Contact Support
              </Text>

            </Pressable>

          </View>

        </View>


        {/* ==========================================
            ADDITIONAL ACTIONS
        ========================================== */}

        <View
          style={[
            styles.actionCard,
            {
              backgroundColor:
                colors.card,

              borderColor:
                colors.border,
            },
          ]}
        >

          <Pressable
            style={styles.actionRow}
            onPress={handleReportProblem}
          >

            <Text
              style={styles.actionIcon}
            >
              🐛
            </Text>


            <View
              style={styles.actionContent}
            >

              <Text
                style={[
                  styles.actionTitle,
                  {
                    color:
                      colors.text,
                  },
                ]}
              >
                Report a Problem
              </Text>


              <Text
                style={[
                  styles.actionSubtitle,
                  {
                    color:
                      colors.secondaryText,
                  },
                ]}
              >
                Tell us about an issue with the app
              </Text>

            </View>


            <Text
              style={[
                styles.actionArrow,
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


          <Pressable
            style={styles.actionRow}
            onPress={handleFeedback}
          >

            <Text
              style={styles.actionIcon}
            >
              💡
            </Text>


            <View
              style={styles.actionContent}
            >

              <Text
                style={[
                  styles.actionTitle,
                  {
                    color:
                      colors.text,
                  },
                ]}
              >
                Send Feedback
              </Text>


              <Text
                style={[
                  styles.actionSubtitle,
                  {
                    color:
                      colors.secondaryText,
                  },
                ]}
              >
                Help us improve StyleIQ
              </Text>

            </View>


            <Text
              style={[
                styles.actionArrow,
                {
                  color:
                    colors.secondaryText,
                },
              ]}
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
            styles.footerTitle,
            {
              color:
                colors.secondaryText,
            },
          ]}
        >
          StyleIQ Support
        </Text>


        <Text
          style={[
            styles.footerText,
            {
              color:
                colors.secondaryText,
            },
          ]}
        >
          We're here to make your StyleIQ experience
          better.
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
  // HERO
  // ==================================================

  hero: {
    alignItems: 'center',
    marginTop: 18,
    marginBottom: 24,
  },

  helpIconContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
  },

  helpIcon: {
    fontSize: 32,
  },

  heroTitle: {
    fontSize: 22,
    fontWeight: '800',
    textAlign: 'center',
  },

  heroText: {
    fontSize: 13,
    lineHeight: 20,
    textAlign: 'center',
    marginTop: 7,
    paddingHorizontal: 15,
  },


  // ==================================================
  // SEARCH
  // ==================================================

  searchContainer: {
    height: 52,
    borderWidth: 1,
    borderRadius: 15,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    marginBottom: 25,
  },

  searchIcon: {
    fontSize: 18,
    marginRight: 9,
  },

  searchInput: {
    flex: 1,
    fontSize: 13,
  },

  clearSearch: {
    fontSize: 16,
    paddingLeft: 8,
  },


  // ==================================================
  // SECTIONS
  // ==================================================

  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
    marginBottom: 12,
  },

  divider: {
    height: 1,
    marginLeft: 55,
  },


  // ==================================================
  // QUICK HELP
  // ==================================================

  quickGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 25,
  },

  quickCard: {
    width: '48%',
    borderWidth: 1,
    borderRadius: 17,
    padding: 15,
    marginBottom: 10,
  },

  quickIcon: {
    fontSize: 24,
    marginBottom: 9,
  },

  quickTitle: {
    fontSize: 13,
    fontWeight: '800',
  },

  quickSubtitle: {
    fontSize: 10,
    marginTop: 4,
  },


  // ==================================================
  // FAQ
  // ==================================================

  faqCard: {
    borderWidth: 1,
    borderRadius: 18,
    overflow: 'hidden',
    marginBottom: 25,
  },

  faqRow: {
    minHeight: 65,
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },

  faqIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },

  faqIcon: {
    fontSize: 15,
    fontWeight: '800',
  },

  faqQuestion: {
    flex: 1,
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 18,
  },

  faqArrow: {
    fontSize: 20,
    marginLeft: 8,
  },

  answerContainer: {
    paddingHorizontal: 57,
    paddingBottom: 15,
  },

  answerText: {
    fontSize: 11,
    lineHeight: 18,
  },

  noResults: {
    padding: 30,
    alignItems: 'center',
  },

  noResultsIcon: {
    fontSize: 28,
    marginBottom: 10,
  },

  noResultsTitle: {
    fontSize: 14,
    fontWeight: '800',
  },

  noResultsText: {
    fontSize: 11,
    marginTop: 5,
    textAlign: 'center',
  },


  // ==================================================
  // SUPPORT
  // ==================================================

  supportCard: {
    borderRadius: 18,
    padding: 16,
    flexDirection: 'row',
    marginBottom: 15,
  },

  supportIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  supportIcon: {
    fontSize: 23,
  },

  supportContent: {
    flex: 1,
  },

  supportTitle: {
    fontSize: 14,
    fontWeight: '800',
  },

  supportText: {
    fontSize: 11,
    lineHeight: 17,
    marginTop: 5,
  },

  contactButton: {
    height: 43,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
  },

  contactButtonText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '800',
  },


  // ==================================================
  // ACTIONS
  // ==================================================

  actionCard: {
    borderWidth: 1,
    borderRadius: 18,
    overflow: 'hidden',
    marginBottom: 25,
  },

  actionRow: {
    minHeight: 72,
    paddingHorizontal: 15,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },

  actionIcon: {
    fontSize: 22,
    marginRight: 13,
  },

  actionContent: {
    flex: 1,
  },

  actionTitle: {
    fontSize: 13,
    fontWeight: '800',
  },

  actionSubtitle: {
    fontSize: 10,
    marginTop: 4,
  },

  actionArrow: {
    fontSize: 25,
    marginLeft: 8,
  },


  // ==================================================
  // FOOTER
  // ==================================================

  footerTitle: {
    textAlign: 'center',
    fontSize: 13,
    fontWeight: '800',
    marginTop: 5,
  },

  footerText: {
    textAlign: 'center',
    fontSize: 10,
    lineHeight: 16,
    marginTop: 5,
    paddingHorizontal: 30,
  },

  bottomSpace: {
    height: 20,
  },

});