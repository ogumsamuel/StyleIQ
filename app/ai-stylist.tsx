import { useEffect, useRef, useState } from 'react';

import {
  doc,
  getDoc,
} from 'firebase/firestore';

import {
  auth,
  db,
} from '../src/services/firebase';

import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
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

export default function AIStylistScreen() {

  // ==========================================
  // GLOBAL THEME
  // ==========================================

  const {
    colors,
    isDark,
  } = useTheme();


  // ==========================================
  // STATE
  // ==========================================

  const [message, setMessage] = useState('');
  const [reply, setReply] = useState('');
  const [loading, setLoading] = useState(false);
  const [preferences, setPreferences] = useState<any>(null);
  const [preferencesLoading, setPreferencesLoading] = useState(true);


  // ==========================================
  // TEXT INPUT REF
  // ==========================================

  const inputRef = useRef<TextInput>(null);


  // ==========================================
  // LOAD STYLE PREFERENCES
  // ==========================================

  useEffect(() => {
    loadStylePreferences();
  }, []);


  const loadStylePreferences = async () => {

    const user = auth.currentUser;

    if (!user) {
      setPreferencesLoading(false);
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

        setPreferences(
          snapshot.data()
        );

      } else {

        setPreferences(null);

      }

    } catch (error) {

      console.log(
        'Style preferences error:',
        error
      );

      setPreferences(null);

    } finally {

      setPreferencesLoading(false);

    }
  };


  // ==========================================
  // SEND MESSAGE TO STYLEIQ AI
  // ==========================================

  const sendMessage = async () => {

    const trimmedMessage =
      message.trim();

    if (
      !trimmedMessage ||
      loading
    ) {
      return;
    }

    try {

      setLoading(true);
      setReply('');
const user = auth.currentUser;

if (!user) {
  setReply(
    'Please sign in again before using StyleIQ AI.'
  );
  return;
}

const idToken = await user.getIdToken();

const response = await fetch(
  'http://10.114.60.190:3000/api/ai',
  {
    method: 'POST',

    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${idToken}`,
    },

    body: JSON.stringify({
      message: trimmedMessage,
      preferences: preferences,
    }),
  }
);

      const data =
        await response.json();

      if (
        !response.ok ||
        !data.success
      ) {

        throw new Error(
          data.error ||
          'Unable to get AI response.'
        );

      }

      setReply(
        data.reply
      );

      setMessage('');

    } catch (error) {

      console.log(
        'AI Stylist error:',
        error
      );

      setReply(
        'Sorry, I could not connect to StyleIQ AI right now. Please make sure the StyleIQ backend is running.'
      );

    } finally {

      setLoading(false);

    }
  };


  // ==========================================
  // QUICK QUESTIONS
  // ==========================================

  const askQuickQuestion = (
    question: string
  ) => {

    setMessage(question);

    setTimeout(() => {

      inputRef.current?.focus();

    }, 100);

  };


  // ==========================================
  // SCREEN
  // ==========================================

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
            : 'height'
        }

        keyboardVerticalOffset={
          Platform.OS === 'ios'
            ? 0
            : 0
        }
      >

        {/* =====================================
            HEADER
        ====================================== */}

        <View
          style={[
            styles.header,
            {
              backgroundColor:
                colors.background,
            },
          ]}
        >

          <Pressable
            style={styles.backButton}
            onPress={() =>
              router.back()
            }
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


          <View
            style={styles.headerCenter}
          >

            <Text
              style={[
                styles.headerTitle,
                {
                  color:
                    colors.text,
                },
              ]}
            >
              StyleIQ AI
            </Text>


            <Text
              style={[
                styles.headerSubtitle,
                {
                  color:
                    colors.secondaryText,
                },
              ]}
            >
              Your personal fashion stylist
            </Text>

          </View>


          <View
            style={styles.headerSpace}
          />

        </View>


        {/* =====================================
            MESSAGE INPUT
        ====================================== */}

        <View
          style={[
            styles.inputContainer,
            {
              backgroundColor:
                colors.card,

              borderColor:
                colors.border,
            },
          ]}
        >

          <View
            style={styles.inputWrapper}
          >

            <TextInput
              ref={inputRef}

              value={message}

              onChangeText={
                setMessage
              }

              placeholder="Ask StyleIQ AI..."

              placeholderTextColor={
                colors.secondaryText
              }

              multiline

              scrollEnabled

              textAlignVertical="top"

              style={[
                styles.input,
                {
                  backgroundColor:
                    colors.input,

                  color:
                    colors.text,
                },
              ]}

              editable={!loading}

              returnKeyType="default"

              blurOnSubmit={false}

              autoCorrect={true}

              autoCapitalize="sentences"
            />


            <Pressable
              style={[
                styles.sendButton,

                {
                  backgroundColor:
                    colors.primary,
                },

                (!message.trim() ||
                  loading) &&
                  styles.sendButtonDisabled,
              ]}

              onPress={
                sendMessage
              }

              disabled={
                !message.trim() ||
                loading
              }
            >

              <Text
                style={
                  styles.sendIcon
                }
              >
                ↑
              </Text>

            </Pressable>

          </View>

        </View>


        {/* =====================================
            CONTENT
        ====================================== */}

        <ScrollView

          style={[
            styles.chatScroll,
            {
              backgroundColor:
                colors.background,
            },
          ]}

          showsVerticalScrollIndicator={
            false
          }

          contentContainerStyle={
            styles.scrollContent
          }

          keyboardShouldPersistTaps="always"

          keyboardDismissMode={
            Platform.OS === 'ios'
              ? 'interactive'
              : 'on-drag'
          }
        >

          {/* ===================================
              INTRO
          ==================================== */}

          <View
            style={styles.intro}
          >

            <View
              style={[
                styles.aiIcon,
                {
                  backgroundColor:
                    colors.primaryLight,
                },
              ]}
            >

              <Text
                style={
                  styles.aiIconText
                }
              >
                ✨
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
              What can I style for you?
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
              Tell me what you're looking for and
              I'll help you create the perfect look.
            </Text>

          </View>


          {/* ===================================
              QUICK QUESTIONS
          ==================================== */}

          {!reply &&
            !loading && (

              <View
                style={
                  styles.quickSection
                }
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
                  Try asking
                </Text>


                {/* WEDDING */}

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

                  onPress={() =>
                    askQuickQuestion(
                      'What should I wear to a wedding as a man?'
                    )
                  }
                >

                  <Text
                    style={
                      styles.quickIcon
                    }
                  >
                    👔
                  </Text>


                  <View
                    style={
                      styles.quickContent
                    }
                  >

                    <Text
                      style={[
                        styles.quickTitle,
                        {
                          color:
                            colors.text,
                        },
                      ]}
                    >
                      Wedding outfit
                    </Text>


                    <Text
                      style={[
                        styles.quickText,
                        {
                          color:
                            colors.secondaryText,
                        },
                      ]}
                    >
                      Help me choose an outfit for a wedding
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


                {/* COLORS */}

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

                  onPress={() =>
                    askQuickQuestion(
                      'What colors go well together for a stylish outfit?'
                    )
                  }
                >

                  <Text
                    style={
                      styles.quickIcon
                    }
                  >
                    🎨
                  </Text>


                  <View
                    style={
                      styles.quickContent
                    }
                  >

                    <Text
                      style={[
                        styles.quickTitle,
                        {
                          color:
                            colors.text,
                        },
                      ]}
                    >
                      Match my colors
                    </Text>


                    <Text
                      style={[
                        styles.quickText,
                        {
                          color:
                            colors.secondaryText,
                        },
                      ]}
                    >
                      Help me combine colors
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


                {/* CASUAL */}

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

                  onPress={() =>
                    askQuickQuestion(
                      'Create a stylish casual outfit for me.'
                    )
                  }
                >

                  <Text
                    style={
                      styles.quickIcon
                    }
                  >
                    👕
                  </Text>


                  <View
                    style={
                      styles.quickContent
                    }
                  >

                    <Text
                      style={[
                        styles.quickTitle,
                        {
                          color:
                            colors.text,
                        },
                      ]}
                    >
                      Casual outfit
                    </Text>


                    <Text
                      style={[
                        styles.quickText,
                        {
                          color:
                            colors.secondaryText,
                        },
                      ]}
                    >
                      Create an everyday stylish look
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


                {/* BUDGET */}

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

                  onPress={() =>
                    askQuickQuestion(
                      'Create an outfit for me with a budget of ₦80,000.'
                    )
                  }
                >

                  <Text
                    style={
                      styles.quickIcon
                    }
                  >
                    💰
                  </Text>


                  <View
                    style={
                      styles.quickContent
                    }
                  >

                    <Text
                      style={[
                        styles.quickTitle,
                        {
                          color:
                            colors.text,
                        },
                      ]}
                    >
                      Style on a budget
                    </Text>


                    <Text
                      style={[
                        styles.quickText,
                        {
                          color:
                            colors.secondaryText,
                        },
                      ]}
                    >
                      Build an outfit within my budget
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

              </View>
            )}


          {/* ===================================
              LOADING
          ==================================== */}

          {loading && (

            <View
              style={[
                styles.loadingCard,
                {
                  backgroundColor:
                    colors.primaryLight,
                },
              ]}
            >

              <ActivityIndicator
                size="small"
                color={
                  colors.primary
                }
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
                StyleIQ AI is creating your look...
              </Text>

            </View>

          )}


          {/* ===================================
              AI RESPONSE
          ==================================== */}

          {reply !== '' &&
            !loading && (

              <View
                style={[
                  styles.responseCard,
                  {
                    backgroundColor:
                      colors.card,

                    borderColor:
                      colors.border,
                  },
                ]}
              >

                <View
                  style={
                    styles.responseHeader
                  }
                >

                  <View
                    style={[
                      styles.smallAiIcon,
                      {
                        backgroundColor:
                          colors.primaryLight,
                      },
                    ]}
                  >

                    <Text>
                      ✨
                    </Text>

                  </View>


                  <Text
                    style={[
                      styles.responseTitle,
                      {
                        color:
                          colors.text,
                      },
                    ]}
                  >
                    StyleIQ AI
                  </Text>

                </View>


                <Text
                  style={[
                    styles.responseText,
                    {
                      color:
                        colors.text,
                    },
                  ]}
                >
                  {reply}
                </Text>

              </View>

            )}

        </ScrollView>

      </KeyboardAvoidingView>

    </SafeAreaView>

  );
}


// ==========================================
// STYLES
// ==========================================

const styles = StyleSheet.create({

  container: {
    flex: 1,
  },

  keyboard: {
    flex: 1,
  },

  chatScroll: {
    flex: 1,
  },

  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },


  // ========================================
  // HEADER
  // ========================================

  header: {
    height: 65,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },

  backButton: {
    width: 42,
    height: 42,
    justifyContent: 'center',
  },

  backIcon: {
    fontSize: 40,
    fontWeight: '300',
  },

  headerCenter: {
    alignItems: 'center',
  },

  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
  },

  headerSubtitle: {
    fontSize: 10,
    marginTop: 2,
  },

  headerSpace: {
    width: 42,
  },


  // ========================================
  // INPUT
  // ========================================

  inputContainer: {
    borderTopWidth: 1,
    borderBottomWidth: 1,
    paddingHorizontal: 15,
    paddingTop: 10,
    paddingBottom: 10,
  },

  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },

  input: {
    flex: 1,
    minHeight: 48,
    maxHeight: 120,
    borderRadius: 15,
    paddingHorizontal: 15,
    paddingTop: 13,
    paddingBottom: 13,
    fontSize: 14,
    lineHeight: 20,
  },

  sendButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },

  sendButtonDisabled: {
    opacity: 0.45,
  },

  sendIcon: {
    color: '#FFF',
    fontSize: 24,
    fontWeight: '800',
  },


  // ========================================
  // INTRO
  // ========================================

  intro: {
    alignItems: 'center',
    marginTop: 25,
    marginBottom: 30,
  },

  aiIcon: {
    width: 75,
    height: 75,
    borderRadius: 38,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
  },

  aiIconText: {
    fontSize: 34,
  },

  introTitle: {
    fontSize: 22,
    fontWeight: '800',
    textAlign: 'center',
  },

  introText: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 20,
    marginTop: 7,
    paddingHorizontal: 15,
  },


  // ========================================
  // QUICK QUESTIONS
  // ========================================

  quickSection: {
    marginBottom: 20,
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 12,
  },

  quickCard: {
    minHeight: 70,
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    marginBottom: 10,
  },

  quickIcon: {
    fontSize: 23,
    marginRight: 12,
  },

  quickContent: {
    flex: 1,
  },

  quickTitle: {
    fontSize: 13,
    fontWeight: '800',
  },

  quickText: {
    fontSize: 11,
    marginTop: 3,
  },

  arrow: {
    fontSize: 24,
  },


  // ========================================
  // LOADING
  // ========================================

  loadingCard: {
    borderRadius: 16,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
  },

  loadingText: {
    marginLeft: 10,
    fontSize: 12,
  },


  // ========================================
  // RESPONSE
  // ========================================

  responseCard: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 17,
    marginBottom: 20,
  },

  responseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 13,
  },

  smallAiIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 9,
  },

  responseTitle: {
    fontSize: 14,
    fontWeight: '800',
  },

  responseText: {
    fontSize: 13,
    lineHeight: 21,
  },

});