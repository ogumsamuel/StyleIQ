import React, { useEffect, useState } from 'react';

import {
  ActivityIndicator,
  Alert,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { router } from 'expo-router';

import {
  deleteDoc,
  doc,
  getDoc,
  setDoc,
} from 'firebase/firestore';

import { auth, db } from '../src/services/firebase';

import { useTheme } from '../src/theme/ThemeContext';


// ==================================================
// PAYMENT METHODS SCREEN
// ==================================================

export default function PaymentMethodsScreen() {

  // ==================================================
  // GLOBAL THEME
  // ==================================================

  const { colors } = useTheme();


  // ==================================================
  // STATE
  // ==================================================

  const [paymentMethod, setPaymentMethod] =
    useState<string>('None');

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);


  // ==================================================
  // LOAD SAVED PAYMENT METHOD
  // ==================================================

  useEffect(() => {
    loadPaymentMethod();
  }, []);


  const loadPaymentMethod = async () => {

    const user = auth.currentUser;

    if (!user) {
      setLoading(false);
      return;
    }

    try {

      const paymentRef = doc(
        db,
        'users',
        user.uid,
        'paymentSettings',
        'default'
      );

      const snapshot =
        await getDoc(paymentRef);

      if (snapshot.exists()) {

        const data =
          snapshot.data();

        if (
          data.paymentMethod === 'Paystack' ||
          data.paymentMethod === 'Cash on Delivery'
        ) {

          setPaymentMethod(
            data.paymentMethod
          );

        }

      }

    } catch (error) {

      console.log(
        'Load payment method error:',
        error
      );

    } finally {

      setLoading(false);

    }

  };


  // ==================================================
  // SELECT PAYMENT METHOD
  // ==================================================

  const handleSelectPaymentMethod = async (
    method: string
  ) => {

    const user = auth.currentUser;

    if (!user) {

      Alert.alert(
        'Sign in required',
        'Please sign in to manage your payment methods.'
      );

      return;
    }

    try {

      setSaving(true);

      const paymentRef = doc(
        db,
        'users',
        user.uid,
        'paymentSettings',
        'default'
      );


      // ==================================================
      // REMOVE PAYMENT PREFERENCE
      // ==================================================

      if (method === 'None') {

        await deleteDoc(paymentRef);

        setPaymentMethod('None');

        Alert.alert(
          'Payment Preference Removed',
          'You can now choose your payment method during checkout.'
        );

        return;
      }


      // ==================================================
      // SAVE PAYMENT METHOD
      // ==================================================

      await setDoc(
        paymentRef,
        {
          paymentMethod: method,
          updatedAt: new Date(),
        },
        {
          merge: true,
        }
      );


      setPaymentMethod(method);


      Alert.alert(
        'Payment Method Updated',
        `${method} is now your preferred payment method.`
      );

    } catch (error) {

      console.log(
        'Save payment method error:',
        error
      );

      Alert.alert(
        'Error',
        'We could not update your payment method.'
      );

    } finally {

      setSaving(false);

    }

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
          Loading payment methods...
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
        contentContainerStyle={styles.scroll}
      >

        {/* ==========================================
            HEADER
        ========================================== */}

        <View style={styles.header}>

          <Pressable
            onPress={() => router.back()}
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
            Payment Methods
          </Text>


          <View
            style={styles.headerSpacer}
          />

        </View>


        {/* ==========================================
            INTRO
        ========================================== */}

        <View style={styles.intro}>

          <Text
            style={[
              styles.introTitle,
              {
                color: colors.text,
              },
            ]}
          >
            Your payment options
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
            Choose your preferred payment method
            for shopping on StyleIQ.
          </Text>

        </View>


        {/* ==========================================
            PAYMENT METHODS
        ========================================== */}

        <View
          style={[
            styles.methodsCard,
            {
              backgroundColor:
                colors.card,
              borderColor:
                colors.border,
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
            Select payment method
          </Text>


          {/* ========================================
              PAYSTACK
          ======================================== */}

          <Pressable
            disabled={saving}
            style={[
              styles.paymentOption,
              {
                borderColor:
                  paymentMethod === 'Paystack'
                    ? colors.primary
                    : colors.border,

                backgroundColor:
                  paymentMethod === 'Paystack'
                    ? colors.primaryLight
                    : colors.card,
              },
            ]}
            onPress={() =>
              handleSelectPaymentMethod(
                'Paystack'
              )
            }
          >

            <View
              style={[
                styles.paymentIcon,
                {
                  backgroundColor:
                    colors.iconBackground,
                },
              ]}
            >

              <Text
                style={styles.paymentIconText}
              >
                💳
              </Text>

            </View>


            <View
              style={styles.paymentContent}
            >

              <View
                style={styles.titleRow}
              >

                <Text
                  style={[
                    styles.paymentTitle,
                    {
                      color: colors.text,
                    },
                  ]}
                >
                  Paystack
                </Text>


                {paymentMethod === 'Paystack' && (

                  <View
                    style={[
                      styles.selectedBadge,
                      {
                        backgroundColor:
                          colors.primary,
                      },
                    ]}
                  >

                    <Text
                      style={styles.selectedText}
                    >
                      Selected
                    </Text>

                  </View>

                )}

              </View>


              <Text
                style={[
                  styles.paymentSubtitle,
                  {
                    color:
                      colors.secondaryText,
                  },
                ]}
              >
                Pay securely with your card through
                Paystack.
              </Text>

            </View>


            {/* RADIO */}

            <View
              style={[
                styles.radio,
                {
                  borderColor:
                    paymentMethod === 'Paystack'
                      ? colors.primary
                      : colors.secondaryText,
                },
              ]}
            >

              {paymentMethod === 'Paystack' && (

                <View
                  style={[
                    styles.radioDot,
                    {
                      backgroundColor:
                        colors.primary,
                    },
                  ]}
                />

              )}

            </View>

          </Pressable>


          {/* ========================================
              CASH ON DELIVERY
          ======================================== */}

          <Pressable
            disabled={saving}
            style={[
              styles.paymentOption,
              {
                borderColor:
                  paymentMethod ===
                  'Cash on Delivery'
                    ? colors.primary
                    : colors.border,

                backgroundColor:
                  paymentMethod ===
                  'Cash on Delivery'
                    ? colors.primaryLight
                    : colors.card,
              },
            ]}
            onPress={() =>
              handleSelectPaymentMethod(
                'Cash on Delivery'
              )
            }
          >

            <View
              style={[
                styles.paymentIcon,
                {
                  backgroundColor:
                    colors.iconBackground,
                },
              ]}
            >

              <Text
                style={styles.paymentIconText}
              >
                💵
              </Text>

            </View>


            <View
              style={styles.paymentContent}
            >

              <View
                style={styles.titleRow}
              >

                <Text
                  style={[
                    styles.paymentTitle,
                    {
                      color: colors.text,
                    },
                  ]}
                >
                  Cash on Delivery
                </Text>


                {paymentMethod ===
                  'Cash on Delivery' && (

                  <View
                    style={[
                      styles.selectedBadge,
                      {
                        backgroundColor:
                          colors.primary,
                      },
                    ]}
                  >

                    <Text
                      style={styles.selectedText}
                    >
                      Selected
                    </Text>

                  </View>

                )}

              </View>


              <Text
                style={[
                  styles.paymentSubtitle,
                  {
                    color:
                      colors.secondaryText,
                  },
                ]}
              >
                Pay when your StyleIQ order arrives.
              </Text>

            </View>


            {/* RADIO */}

            <View
              style={[
                styles.radio,
                {
                  borderColor:
                    paymentMethod ===
                    'Cash on Delivery'
                      ? colors.primary
                      : colors.secondaryText,
                },
              ]}
            >

              {paymentMethod ===
                'Cash on Delivery' && (

                <View
                  style={[
                    styles.radioDot,
                    {
                      backgroundColor:
                        colors.primary,
                    },
                  ]}
                />

              )}

            </View>

          </Pressable>


          {/* ========================================
              SAVING
          ======================================== */}

          {saving && (

            <View
              style={styles.savingContainer}
            >

              <ActivityIndicator
                size="small"
                color={colors.primary}
              />

              <Text
                style={[
                  styles.savingText,
                  {
                    color:
                      colors.secondaryText,
                  },
                ]}
              >
                Saving your preference...
              </Text>

            </View>

          )}

        </View>


        {/* ==========================================
            CURRENT PAYMENT METHOD
        ========================================== */}

        <View
          style={[
            styles.currentCard,
            {
              backgroundColor:
                colors.primaryLight,
            },
          ]}
        >

          <Text
            style={[
              styles.currentIcon,
              {
                backgroundColor:
                  colors.primary,
              },
            ]}
          >
            ✓
          </Text>


          <View
            style={styles.currentContent}
          >

            <Text
              style={[
                styles.currentTitle,
                {
                  color:
                    colors.secondaryText,
                },
              ]}
            >
              Preferred payment method
            </Text>


            <Text
              style={[
                styles.currentMethod,
                {
                  color: colors.text,
                },
              ]}
            >
              {paymentMethod}
            </Text>

          </View>

        </View>


        {/* ==========================================
            SECURITY
        ========================================== */}

        <View
          style={[
            styles.securityCard,
            {
              backgroundColor:
                colors.card,
              borderColor:
                colors.border,
            },
          ]}
        >

          <Text
            style={styles.securityIcon}
          >
            🔒
          </Text>


          <View
            style={styles.securityContent}
          >

            <Text
              style={[
                styles.securityTitle,
                {
                  color: colors.text,
                },
              ]}
            >
              Your payment information is secure
            </Text>


            <Text
              style={[
                styles.securityText,
                {
                  color:
                    colors.secondaryText,
                },
              ]}
            >
              StyleIQ uses secure payment processing.
              Your full card details are not stored
              directly in StyleIQ.
            </Text>

          </View>

        </View>


        <View
          style={{ height: 30 }}
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


  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },


  loadingText: {
    marginTop: 12,
    fontSize: 14,
  },


  scroll: {
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
    width: 42,
    height: 42,
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


  headerSpacer: {
    width: 42,
  },


  // ==================================================
  // INTRO
  // ==================================================

  intro: {
    marginTop: 20,
    marginBottom: 20,
  },


  introTitle: {
    fontSize: 22,
    fontWeight: '800',
  },


  introText: {
    fontSize: 13,
    lineHeight: 20,
    marginTop: 7,
  },


  // ==================================================
  // METHODS
  // ==================================================

  methodsCard: {
    borderRadius: 22,
    borderWidth: 1,
    padding: 18,
  },


  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 15,
  },


  paymentOption: {
    borderWidth: 1,
    borderRadius: 17,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },


  paymentIcon: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },


  paymentIconText: {
    fontSize: 22,
  },


  paymentContent: {
    flex: 1,
    paddingRight: 8,
  },


  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },


  paymentTitle: {
    fontSize: 14,
    fontWeight: '800',
  },


  paymentSubtitle: {
    fontSize: 11,
    lineHeight: 17,
    marginTop: 4,
  },


  selectedBadge: {
    borderRadius: 8,
    paddingHorizontal: 7,
    paddingVertical: 3,
    marginLeft: 7,
  },


  selectedText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
  },


  // ==================================================
  // RADIO
  // ==================================================

  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },


  radioDot: {
    width: 11,
    height: 11,
    borderRadius: 6,
  },


  // ==================================================
  // SAVING
  // ==================================================

  savingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 5,
  },


  savingText: {
    fontSize: 11,
    marginLeft: 7,
  },


  // ==================================================
  // CURRENT PAYMENT
  // ==================================================

  currentCard: {
    borderRadius: 18,
    padding: 17,
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 18,
  },


  currentIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 32,
    fontSize: 18,
    fontWeight: '800',
    marginRight: 12,
  },


  currentContent: {
    flex: 1,
  },


  currentTitle: {
    fontSize: 11,
  },


  currentMethod: {
    fontSize: 15,
    fontWeight: '800',
    marginTop: 3,
  },


  // ==================================================
  // SECURITY
  // ==================================================

  securityCard: {
    borderRadius: 18,
    padding: 17,
    flexDirection: 'row',
    marginTop: 18,
    borderWidth: 1,
  },


  securityIcon: {
    fontSize: 23,
    marginRight: 12,
  },


  securityContent: {
    flex: 1,
  },


  securityTitle: {
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 5,
  },


  securityText: {
    fontSize: 12,
    lineHeight: 18,
  },

});