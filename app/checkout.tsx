import React, { useEffect, useState } from 'react';

import {
  ActivityIndicator,
  Alert,
  Image,
  Keyboard,
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

import { usePaystack } from 'react-native-paystack-webview';

import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  serverTimestamp,
} from 'firebase/firestore';

import { auth, db } from '../src/services/firebase';

import { useTheme } from '../src/theme/ThemeContext';


// ==================================================
// TYPES
// ==================================================

type CartProduct = {
  id: string;
  name: string;
  price: string;
  category: string;
  color: string;
  image: string;
  quantity: number;
};


// ==================================================
// CHECKOUT
// ==================================================

export default function CheckoutScreen() {

  const { colors } = useTheme();

  const { popup } = usePaystack();

  const [cart, setCart] = useState<CartProduct[]>([]);

  const [loading, setLoading] = useState(true);

  const [name, setName] = useState('');

  const [phone, setPhone] = useState('');

  const [address, setAddress] = useState('');

  const [paymentMethod, setPaymentMethod] =
    useState<string | null>(null);

  const [preferredPaymentMethod, setPreferredPaymentMethod] =
    useState<string | null>(null);

  const [defaultAddressId, setDefaultAddressId] =
    useState<string | null>(null);


  // ==================================================
  // LOAD CHECKOUT
  // ==================================================

  useEffect(() => {
    loadCheckoutData();
  }, []);


  const loadCheckoutData = async () => {

    const user = auth.currentUser;

    if (!user) {

      setLoading(false);

      Alert.alert(
        'Sign in required',
        'Please sign in before checking out.',
        [
          {
            text: 'Sign In',
            onPress: () => router.replace('/signin'),
          },
        ]
      );

      return;
    }

    try {

      // ==================================================
      // CART
      // ==================================================

      const cartRef = collection(
        db,
        'users',
        user.uid,
        'cart'
      );

      const cartSnapshot = await getDocs(cartRef);

      const products = cartSnapshot.docs.map((item) => {

        const data = item.data();

        return {
          id: item.id,
          name: data.name || '',
          price: data.price || '0',
          category: data.category || '',
          color: data.color || '',
          image: data.image || '',
          quantity:
            typeof data.quantity === 'number'
              ? data.quantity
              : 1,
        };

      }) as CartProduct[];

      setCart(products);


      // ==================================================
      // PREFERRED PAYMENT
      // ==================================================

      const paymentRef = doc(
        db,
        'users',
        user.uid,
        'paymentSettings',
        'default'
      );

      const paymentSnapshot =
        await getDoc(paymentRef);

      if (paymentSnapshot.exists()) {

        const paymentData =
          paymentSnapshot.data();

        const savedPaymentMethod =
          paymentData.paymentMethod;

        if (
          savedPaymentMethod === 'Paystack' ||
          savedPaymentMethod === 'Cash on Delivery'
        ) {

          setPreferredPaymentMethod(
            savedPaymentMethod
          );

          setPaymentMethod(
            savedPaymentMethod
          );

        } else {

          setPreferredPaymentMethod(null);
          setPaymentMethod(null);

        }

      } else {

        setPreferredPaymentMethod(null);
        setPaymentMethod(null);

      }


      // ==================================================
      // DEFAULT ADDRESS
      // ==================================================

      const addressesRef = collection(
        db,
        'users',
        user.uid,
        'deliveryAddresses'
      );

      const addressSnapshot =
        await getDocs(addressesRef);

      const defaultAddress =
        addressSnapshot.docs.find(
          (addressDoc) =>
            addressDoc.data().isDefault === true
        );

      if (defaultAddress) {

        const data = defaultAddress.data();

        setDefaultAddressId(
          defaultAddress.id
        );

        setName(
          data.fullName || ''
        );

        setPhone(
          data.phone || ''
        );

        const fullAddress = [
          data.address,
          data.city,
          data.state,
          data.postalCode,
          data.country,
        ]
          .filter(Boolean)
          .join(', ');

        setAddress(
          fullAddress
        );

      } else {

        setDefaultAddressId(null);
        setName('');
        setPhone('');
        setAddress('');

      }

    } catch (error) {

      console.log(
        'Load checkout data error:',
        error
      );

      Alert.alert(
        'Error',
        'We could not load your checkout information.'
      );

    } finally {

      setLoading(false);

    }
  };


  // ==================================================
  // PRICE
  // ==================================================

  const getPriceValue = (
    price: string
  ) => {

    const numericPrice =
      Number(
        String(price)
          .replace('$', '')
          .replace(',', '')
          .trim()
      );

    return Number.isFinite(numericPrice)
      ? numericPrice
      : 0;
  };


  // ==================================================
  // CLEAR CART
  // ==================================================

  const clearCart = async () => {

    const user = auth.currentUser;

    if (!user) {
      return;
    }

    const cartRef = collection(
      db,
      'users',
      user.uid,
      'cart'
    );

    const snapshot =
      await getDocs(cartRef);

    await Promise.all(
      snapshot.docs.map(
        (cartItem) =>
          deleteDoc(
            doc(
              db,
              'users',
              user.uid,
              'cart',
              cartItem.id
            )
          )
      )
    );

    setCart([]);

  };


  // ==================================================
  // TOTALS
  // ==================================================

  const subtotal =
    cart.reduce(
      (sum, product) => {

        const price =
          getPriceValue(product.price);

        const quantity =
          product.quantity || 1;

        return (
          sum +
          price * quantity
        );

      },
      0
    );

  const deliveryFee = 0;

  const total =
    subtotal + deliveryFee;

  const totalQuantity =
    cart.reduce(
      (sum, product) =>
        sum +
        (product.quantity || 1),
      0
    );


  // ==================================================
  // CREATE CUSTOMER ORDER
  // ==================================================

  const createOrder = async (
    selectedPaymentMethod: string,
    paymentStatus: string,
    paystackReference?: string
  ) => {

    const user = auth.currentUser;

    if (!user) {
      throw new Error(
        'User is not signed in.'
      );
    }

    if (cart.length === 0) {
      throw new Error(
        'Cart is empty.'
      );
    }


    // ==================================================
    // CUSTOMER ORDERS COLLECTION
    //
    // THIS IS THE ONLY PLACE THE ORDER IS CREATED.
    //
    // users/{uid}/orders/{orderId}
    // ==================================================

    const ordersRef = collection(
      db,
      'users',
      user.uid,
      'orders'
    );


    // ==================================================
    // ORDER NUMBER
    // ==================================================

    const orderNumber =
      `STYLEIQ-${Date.now()}`;


    // ==================================================
    // ITEMS
    // ==================================================

    const orderItems =
      cart.map((product) => ({
        id: product.id,
        name: product.name,
        price: product.price,
        category: product.category,
        color: product.color,
        image: product.image,
        quantity: product.quantity || 1,
      }));


    // ==================================================
    // ORDER DATA
    // ==================================================

    const orderData = {

      orderNumber,

      items: orderItems,

      total:
        Number(
          total.toFixed(2)
        ),

      totalQuantity,

      customerName:
        name.trim(),

      phone:
        phone.trim(),

      address:
        address.trim(),

      paymentMethod:
        selectedPaymentMethod,

      paymentStatus,

      orderStatus:
        'Processing',

      deliveryStatus:
        'Pending',

      deliveredAt:
        null,

      paystackReference:
        paystackReference || null,

      createdAt:
        serverTimestamp(),

      updatedAt:
        serverTimestamp(),

    };


    // ==================================================
    // CREATE ONLY ONE ORDER
    // ==================================================

    const orderDoc =
      await addDoc(
        ordersRef,
        orderData
      );

    console.log(
      'Customer order created:',
      orderNumber
    );

    console.log(
      'Order ID:',
      orderDoc.id
    );

    return orderDoc.id;
  };


  // ==================================================
  // PLACE ORDER
  // ==================================================

  const handlePlaceOrder = () => {

    if (!name.trim()) {

      Keyboard.dismiss();

      Alert.alert(
        'Missing information',
        'Please enter your full name.'
      );

      return;
    }

    if (!phone.trim()) {

      Keyboard.dismiss();

      Alert.alert(
        'Missing information',
        'Please enter your phone number.'
      );

      return;
    }

    if (!address.trim()) {

      Keyboard.dismiss();

      Alert.alert(
        'Missing information',
        'Please enter your delivery address.'
      );

      return;
    }

    if (cart.length === 0) {

      Keyboard.dismiss();

      Alert.alert(
        'Cart is empty',
        'Please add a product before checking out.'
      );

      return;
    }

    if (!paymentMethod) {

      Keyboard.dismiss();

      Alert.alert(
        'Select payment method',
        'Please select a payment method before placing your order.'
      );

      return;
    }

    Keyboard.dismiss();


    // ==================================================
    // CASH ON DELIVERY
    // ==================================================

    if (
      paymentMethod ===
      'Cash on Delivery'
    ) {

      Alert.alert(
        'Confirm Order',
        `Your order total is $${total.toFixed(
          2
        )}.\n\nYou will pay when your order arrives.`,
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Place Order',

            onPress: async () => {

              try {

                await createOrder(
                  'Cash on Delivery',
                  'Pending'
                );

                await clearCart();

                Alert.alert(
                  'Order Placed 🎉',
                  'Your order has been placed successfully. You can track your order from My Orders.',
                  [
                    {
                      text: 'View Orders',
                      onPress: () =>
                        router.replace('/orders'),
                    },
                  ]
                );

              } catch (error) {

                console.log(
                  'Cash order error:',
                  error
                );

                Alert.alert(
                  'Order Error',
                  'Your order could not be completed. Your cart has not been cleared. Please try again.'
                );

              }

            },
          },
        ]
      );

      return;
    }


    // ==================================================
    // PAYSTACK
    // ==================================================

    if (
      paymentMethod ===
      'Paystack'
    ) {

      const user =
        auth.currentUser;

      if (!user?.email) {

        Alert.alert(
          'Email required',
          'Please make sure your account has an email address before making a payment.'
        );

        return;
      }

      const reference =
        `STYLEIQ_${Date.now()}`;


      popup.checkout({

        email:
          user.email,

        amount:
          Number(
            total.toFixed(2)
          ),

        reference,

        metadata: {

          custom_fields: [

            {
              display_name:
                'Customer Name',

              variable_name:
                'customer_name',

              value:
                name.trim(),
            },

            {
              display_name:
                'Phone',

              variable_name:
                'phone',

              value:
                phone.trim(),
            },

            {
              display_name:
                'Delivery Address',

              variable_name:
                'delivery_address',

              value:
                address.trim(),
            },

            {
              display_name:
                'Items',

              variable_name:
                'items',

              value:
                String(totalQuantity),
            },

          ],

        },


        // ==================================================
        // PAYMENT SUCCESS
        // ==================================================

        onSuccess:
          async (response) => {

            console.log(
              'Payment successful:',
              response
            );

            try {

              await createOrder(
                'Paystack',
                'Paid',
                response.reference
              );

              await clearCart();

              Alert.alert(
                'Payment Successful 🎉',
                'Your payment was successful and your order has been placed. You can track your order from My Orders.',
                [
                  {
                    text: 'View Orders',
                    onPress: () =>
                      router.replace('/orders'),
                  },
                ]
              );

            } catch (error) {

              console.log(
                'Create Paystack order error:',
                error
              );

              Alert.alert(
                'Order Error',
                'Your payment was successful, but we could not save your order. Please contact support.'
              );

            }

          },


        onCancel:
          () => {

            Alert.alert(
              'Payment Cancelled',
              'You cancelled the payment.'
            );

          },


        onError:
          (error) => {

            console.log(
              'Paystack payment error:',
              error
            );

            Alert.alert(
              'Payment Error',
              'We could not process your payment. Please try again.'
            );

          },


        onLoad:
          (response) => {

            console.log(
              'Paystack WebView loaded:',
              response
            );

          },

      });

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
          Preparing checkout...
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

      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={
          Platform.OS === 'ios'
            ? 'padding'
            : undefined
        }
      >

        {/* HEADER */}

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
            onPress={() => {

              Keyboard.dismiss();

              router.back();

            }}
            style={styles.backButton}
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
            Checkout
          </Text>


          <View
            style={styles.headerSpace}
          />

        </View>


        {/* CONTENT */}

        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={
            styles.scrollContent
          }
          onScrollBeginDrag={() =>
            Keyboard.dismiss()
          }
        >

          {/* ORDER TOP */}

          <View
            style={[
              styles.topCard,
              {
                backgroundColor:
                  colors.black,
              },
            ]}
          >

            <View>

              <Text
                style={[
                  styles.topTitle,
                  {
                    color:
                      colors.white,
                  },
                ]}
              >
                Your Order
              </Text>

              <Text
                style={[
                  styles.topSubtitle,
                  {
                    color:
                      colors.secondaryText,
                  },
                ]}
              >
                {totalQuantity}{' '}
                {totalQuantity === 1
                  ? 'item'
                  : 'items'}
              </Text>

            </View>

            <Text
              style={[
                styles.topTotal,
                {
                  color:
                    colors.white,
                },
              ]}
            >
              ${total.toFixed(2)}
            </Text>

          </View>


          {/* DELIVERY */}

          <View style={styles.section}>

            <View
              style={styles.sectionHeader}
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
                Delivery Information
              </Text>

              {defaultAddressId && (
                <View
                  style={[
                    styles.defaultAddressBadge,
                    {
                      backgroundColor:
                        colors.primaryLight,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.defaultAddressBadgeText,
                      {
                        color:
                          colors.primary,
                      },
                    ]}
                  >
                    DEFAULT
                  </Text>
                </View>
              )}

            </View>


            <View
              style={styles.inputGroup}
            >

              <Text
                style={[
                  styles.inputLabel,
                  {
                    color:
                      colors.secondaryText,
                  },
                ]}
              >
                Full Name
              </Text>

              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="Enter your full name"
                placeholderTextColor={
                  colors.secondaryText
                }
                style={[
                  styles.input,
                  {
                    backgroundColor:
                      colors.input,
                    borderColor:
                      colors.border,
                    color:
                      colors.text,
                  },
                ]}
                returnKeyType="next"
              />

            </View>


            <View
              style={styles.inputGroup}
            >

              <Text
                style={[
                  styles.inputLabel,
                  {
                    color:
                      colors.secondaryText,
                  },
                ]}
              >
                Phone Number
              </Text>

              <TextInput
                value={phone}
                onChangeText={setPhone}
                placeholder="Enter your phone number"
                placeholderTextColor={
                  colors.secondaryText
                }
                keyboardType="phone-pad"
                style={[
                  styles.input,
                  {
                    backgroundColor:
                      colors.input,
                    borderColor:
                      colors.border,
                    color:
                      colors.text,
                  },
                ]}
                returnKeyType="done"
              />

            </View>


            <View
              style={styles.inputGroup}
            >

              <Text
                style={[
                  styles.inputLabel,
                  {
                    color:
                      colors.secondaryText,
                  },
                ]}
              >
                Delivery Address
              </Text>

              <TextInput
                value={address}
                onChangeText={setAddress}
                placeholder="Enter your delivery address"
                placeholderTextColor={
                  colors.secondaryText
                }
                multiline
                numberOfLines={3}
                style={[
                  styles.input,
                  styles.addressInput,
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

            </View>


            <Pressable
              style={
                styles.changeAddressButton
              }
              onPress={() => {

                Keyboard.dismiss();

                router.push(
                  '/delivery-addresses'
                );

              }}
            >

              <Text
                style={[
                  styles.changeAddressText,
                  {
                    color:
                      colors.primary,
                  },
                ]}
              >
                Manage Delivery Addresses
              </Text>

            </Pressable>

          </View>


          {/* ITEMS */}

          <View style={styles.section}>

            <Text
              style={[
                styles.sectionTitle,
                {
                  color:
                    colors.text,
                },
              ]}
            >
              Order Items
            </Text>

            {cart.map((product) => (

              <View
                key={product.id}
                style={[
                  styles.productCard,
                  {
                    backgroundColor:
                      colors.card,
                    borderColor:
                      colors.border,
                  },
                ]}
              >

                <Image
                  source={{
                    uri: product.image,
                  }}
                  style={styles.productImage}
                />

                <View
                  style={styles.productInfo}
                >

                  <Text
                    style={[
                      styles.productName,
                      {
                        color:
                          colors.text,
                      },
                    ]}
                    numberOfLines={2}
                  >
                    {product.name}
                  </Text>

                  <Text
                    style={[
                      styles.productColor,
                      {
                        color:
                          colors.secondaryText,
                      },
                    ]}
                  >
                    {product.color}
                  </Text>

                  <Text
                    style={[
                      styles.productQuantity,
                      {
                        color:
                          colors.secondaryText,
                      },
                    ]}
                  >
                    Quantity: {product.quantity}
                  </Text>

                </View>

                <Text
                  style={[
                    styles.productPrice,
                    {
                      color:
                        colors.text,
                    },
                  ]}
                >
                  $
                  {(
                    getPriceValue(
                      product.price
                    ) *
                    (product.quantity || 1)
                  ).toFixed(2)}
                </Text>

              </View>

            ))}

          </View>


          {/* PAYMENT */}

          <View style={styles.section}>

            <Text
              style={[
                styles.sectionTitle,
                {
                  color:
                    colors.text,
                },
              ]}
            >
              Payment Method
            </Text>


            {preferredPaymentMethod ? (

              <View
                style={[
                  styles.savedPaymentCard,
                  {
                    backgroundColor:
                      colors.primaryLight,
                    borderColor:
                      colors.primary,
                  },
                ]}
              >

                <View
                  style={[
                    styles.savedPaymentIcon,
                    {
                      backgroundColor:
                        colors.primary,
                    },
                  ]}
                >

                  <Text
                    style={[
                      styles.savedPaymentIconText,
                      {
                        color:
                          colors.white,
                      },
                    ]}
                  >
                    ✓
                  </Text>

                </View>

                <View
                  style={
                    styles.savedPaymentContent
                  }
                >

                  <Text
                    style={[
                      styles.savedPaymentLabel,
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
                      styles.savedPaymentValue,
                      {
                        color:
                          colors.text,
                      },
                    ]}
                  >
                    {preferredPaymentMethod ===
                    'Paystack'
                      ? 'Paystack Payment'
                      : 'Cash on Delivery'}
                  </Text>

                </View>

              </View>

            ) : (

              <View>

                <Text
                  style={[
                    styles.paymentHint,
                    {
                      color:
                        colors.secondaryText,
                    },
                  ]}
                >
                  Select a payment method for this order.
                </Text>


                <Pressable
                  style={[
                    styles.paymentOption,
                    {
                      backgroundColor:
                        colors.card,
                      borderColor:
                        paymentMethod ===
                        'Cash on Delivery'
                          ? colors.primary
                          : colors.border,
                    },
                    paymentMethod ===
                      'Cash on Delivery' && {
                      backgroundColor:
                        colors.primaryLight,
                    },
                  ]}
                  onPress={() => {

                    Keyboard.dismiss();

                    setPaymentMethod(
                      'Cash on Delivery'
                    );

                  }}
                >

                  <View
                    style={[
                      styles.radio,
                      {
                        borderColor:
                          paymentMethod ===
                          'Cash on Delivery'
                            ? colors.primary
                            : colors.border,
                      },
                      paymentMethod ===
                        'Cash on Delivery' && {
                        backgroundColor:
                          colors.primary,
                      },
                    ]}
                  />

                  <View>

                    <Text
                      style={[
                        styles.paymentTitle,
                        {
                          color:
                            colors.text,
                        },
                      ]}
                    >
                      Cash on Delivery
                    </Text>

                    <Text
                      style={[
                        styles.paymentSubtitle,
                        {
                          color:
                            colors.secondaryText,
                        },
                      ]}
                    >
                      Pay when your order arrives
                    </Text>

                  </View>

                </Pressable>


                <Pressable
                  style={[
                    styles.paymentOption,
                    {
                      backgroundColor:
                        colors.card,
                      borderColor:
                        paymentMethod ===
                        'Paystack'
                          ? colors.primary
                          : colors.border,
                    },
                    paymentMethod ===
                      'Paystack' && {
                      backgroundColor:
                        colors.primaryLight,
                    },
                  ]}
                  onPress={() => {

                    Keyboard.dismiss();

                    setPaymentMethod(
                      'Paystack'
                    );

                  }}
                >

                  <View
                    style={[
                      styles.radio,
                      {
                        borderColor:
                          paymentMethod ===
                          'Paystack'
                            ? colors.primary
                            : colors.border,
                      },
                      paymentMethod ===
                        'Paystack' && {
                        backgroundColor:
                          colors.primary,
                      },
                    ]}
                  />

                  <View>

                    <Text
                      style={[
                        styles.paymentTitle,
                        {
                          color:
                            colors.text,
                        },
                      ]}
                    >
                      Paystack Payment
                    </Text>

                    <Text
                      style={[
                        styles.paymentSubtitle,
                        {
                          color:
                            colors.secondaryText,
                        },
                      ]}
                    >
                      Pay securely with Paystack
                    </Text>

                  </View>

                </Pressable>

              </View>

            )}

          </View>


          {/* SUMMARY */}

          <View
            style={[
              styles.summary,
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
                styles.summaryTitle,
                {
                  color:
                    colors.text,
                },
              ]}
            >
              Order Summary
            </Text>

            <View
              style={styles.summaryRow}
            >

              <Text
                style={[
                  styles.summaryLabel,
                  {
                    color:
                      colors.secondaryText,
                  },
                ]}
              >
                Subtotal
              </Text>

              <Text
                style={[
                  styles.summaryValue,
                  {
                    color:
                      colors.text,
                  },
                ]}
              >
                ${subtotal.toFixed(2)}
              </Text>

            </View>

            <View
              style={styles.summaryRow}
            >

              <Text
                style={[
                  styles.summaryLabel,
                  {
                    color:
                      colors.secondaryText,
                  },
                ]}
              >
                Delivery
              </Text>

              <Text
                style={[
                  styles.freeText,
                  {
                    color:
                      colors.primary,
                  },
                ]}
              >
                Free
              </Text>

            </View>

            <View
              style={[
                styles.divider,
                {
                  backgroundColor:
                    colors.border,
                },
              ]}
            />

            <View
              style={styles.totalRow}
            >

              <Text
                style={[
                  styles.totalLabel,
                  {
                    color:
                      colors.text,
                  },
                ]}
              >
                Total
              </Text>

              <Text
                style={[
                  styles.totalValue,
                  {
                    color:
                      colors.primary,
                  },
                ]}
              >
                ${total.toFixed(2)}
              </Text>

            </View>

          </View>


          {/* PLACE ORDER */}

          <Pressable
            style={[
              styles.placeOrderButton,
              {
                backgroundColor:
                  colors.black,
              },
              !paymentMethod && {
                opacity: 0.55,
              },
            ]}
            onPress={
              handlePlaceOrder
            }
          >

            <Text
              style={[
                styles.placeOrderText,
                {
                  color:
                    colors.white,
                },
              ]}
            >
              {paymentMethod ===
              'Paystack'
                ? 'Pay with Paystack'
                : paymentMethod ===
                  'Cash on Delivery'
                  ? 'Place Order'
                  : 'Select Payment Method'}
            </Text>

          </Pressable>


          <Text
            style={[
              styles.secureText,
              {
                color:
                  colors.secondaryText,
              },
            ]}
          >
            🔒 Your information is securely processed
          </Text>

          <View
            style={{ height: 30 }}
          />

        </ScrollView>

      </KeyboardAvoidingView>

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

  keyboardContainer: {
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

  header: {
    height: 65,
    paddingHorizontal: 20,
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
    fontSize: 21,
    fontWeight: '800',
  },

  headerSpace: {
    width: 45,
  },

  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },

  topCard: {
    borderRadius: 18,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
    marginBottom: 22,
  },

  topTitle: {
    fontSize: 17,
    fontWeight: '800',
  },

  topSubtitle: {
    fontSize: 12,
    marginTop: 4,
  },

  topTotal: {
    fontSize: 20,
    fontWeight: '800',
  },

  section: {
    marginBottom: 24,
  },

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 13,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
  },

  defaultAddressBadge: {
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 8,
  },

  defaultAddressBadgeText: {
    fontSize: 9,
    fontWeight: '800',
  },

  inputGroup: {
    marginBottom: 13,
  },

  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 7,
  },

  input: {
    borderWidth: 1,
    borderRadius: 13,
    height: 50,
    paddingHorizontal: 14,
    fontSize: 14,
  },

  addressInput: {
    height: 90,
    paddingTop: 13,
    textAlignVertical: 'top',
  },

  changeAddressButton: {
    alignSelf: 'flex-start',
    marginTop: 2,
  },

  changeAddressText: {
    fontSize: 12,
    fontWeight: '700',
  },

  productCard: {
    borderRadius: 16,
    padding: 11,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
  },

  productImage: {
    width: 70,
    height: 78,
    borderRadius: 12,
  },

  productInfo: {
    flex: 1,
    paddingHorizontal: 11,
  },

  productName: {
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 18,
  },

  productColor: {
    fontSize: 11,
    marginTop: 3,
  },

  productQuantity: {
    fontSize: 11,
    marginTop: 5,
  },

  productPrice: {
    fontSize: 13,
    fontWeight: '800',
  },

  paymentHint: {
    fontSize: 12,
    marginBottom: 11,
  },

  paymentOption: {
    borderWidth: 1,
    borderRadius: 15,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },

  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    marginRight: 12,
  },

  paymentTitle: {
    fontSize: 13,
    fontWeight: '700',
  },

  paymentSubtitle: {
    fontSize: 11,
    marginTop: 3,
  },

  savedPaymentCard: {
    borderWidth: 1,
    borderRadius: 15,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
  },

  savedPaymentIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  savedPaymentIconText: {
    fontSize: 15,
    fontWeight: '800',
  },

  savedPaymentContent: {
    flex: 1,
  },

  savedPaymentLabel: {
    fontSize: 11,
    marginBottom: 3,
  },

  savedPaymentValue: {
    fontSize: 14,
    fontWeight: '800',
  },

  summary: {
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    marginBottom: 18,
  },

  summaryTitle: {
    fontSize: 17,
    fontWeight: '800',
    marginBottom: 16,
  },

  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 11,
  },

  summaryLabel: {
    fontSize: 13,
  },

  summaryValue: {
    fontSize: 13,
    fontWeight: '600',
  },

  freeText: {
    fontSize: 13,
    fontWeight: '700',
  },

  divider: {
    height: 1,
    marginVertical: 7,
  },

  totalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  totalLabel: {
    fontSize: 17,
    fontWeight: '800',
  },

  totalValue: {
    fontSize: 21,
    fontWeight: '800',
  },

  placeOrderButton: {
    height: 56,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },

  placeOrderText: {
    fontSize: 16,
    fontWeight: '800',
  },

  secureText: {
    textAlign: 'center',
    fontSize: 11,
    marginTop: 12,
  },

});