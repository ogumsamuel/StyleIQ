import React, { useEffect, useState } from 'react';

import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { router } from 'expo-router';

import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  setDoc,
} from 'firebase/firestore';

import { auth, db } from '../src/services/firebase';

// ==================================================
// THEME
// ==================================================

import { useTheme } from '../src/theme/ThemeContext';


// ==================================================
// CART PRODUCT TYPE
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
// CART SCREEN
// ==================================================

export default function CartScreen() {

  // ==================================================
  // GLOBAL THEME
  // ==================================================

  const { colors, isDark } = useTheme();


  // ==================================================
  // STATE
  // ==================================================

  const [cart, setCart] =
    useState<CartProduct[]>([]);

  const [loading, setLoading] =
    useState(true);


  // ==================================================
  // LOAD CART
  // ==================================================

  useEffect(() => {
    loadCart();
  }, []);


  const loadCart = async () => {

    const user = auth.currentUser;

    if (!user) {
      setLoading(false);
      return;
    }

    try {

      const cartRef = collection(
        db,
        'users',
        user.uid,
        'cart'
      );

      const snapshot =
        await getDocs(cartRef);

      const products: CartProduct[] =
        snapshot.docs.map((item) => {

          const data = item.data();

          return {
            id: item.id,
            name: data.name || '',
            price: data.price || '$0.00',
            category: data.category || '',
            color: data.color || '',
            image: data.image || '',
            quantity:
              typeof data.quantity === 'number'
                ? data.quantity
                : 1,
          };

        });

      setCart(products);

    } catch (error) {

      console.log(
        'Load cart error:',
        error
      );

      Alert.alert(
        'Error',
        'We could not load your cart.'
      );

    } finally {

      setLoading(false);

    }
  };


  // ==================================================
  // UPDATE QUANTITY
  // ==================================================

  const updateQuantity = async (
    productId: string,
    newQuantity: number
  ) => {

    const user = auth.currentUser;

    if (!user) {
      return;
    }

    try {

      const cartRef = doc(
        db,
        'users',
        user.uid,
        'cart',
        productId
      );


      // ----------------------------------------------
      // REMOVE IF ZERO
      // ----------------------------------------------

      if (newQuantity <= 0) {

        await deleteDoc(cartRef);

        setCart((current) =>
          current.filter(
            (product) =>
              product.id !== productId
          )
        );

        return;
      }


      // ----------------------------------------------
      // UPDATE FIRESTORE
      // ----------------------------------------------

      await setDoc(
        cartRef,
        {
          quantity: newQuantity,
        },
        {
          merge: true,
        }
      );


      // ----------------------------------------------
      // UPDATE SCREEN
      // ----------------------------------------------

      setCart((current) =>
        current.map((product) =>
          product.id === productId
            ? {
                ...product,
                quantity: newQuantity,
              }
            : product
        )
      );

    } catch (error) {

      console.log(
        'Quantity update error:',
        error
      );

      Alert.alert(
        'Error',
        'We could not update the quantity.'
      );

    }
  };


  // ==================================================
  // REMOVE PRODUCT
  // ==================================================

  const removeFromCart = async (
    productId: string
  ) => {

    const user = auth.currentUser;

    if (!user) {
      return;
    }

    try {

      await deleteDoc(
        doc(
          db,
          'users',
          user.uid,
          'cart',
          productId
        )
      );

      setCart((current) =>
        current.filter(
          (product) =>
            product.id !== productId
        )
      );

    } catch (error) {

      console.log(
        'Remove cart error:',
        error
      );

      Alert.alert(
        'Error',
        'We could not remove this product.'
      );

    }
  };


  // ==================================================
  // PRICE VALUE
  // ==================================================

  const getPriceValue = (
    price: string
  ) => {

    return Number(
      price
        .replace('$', '')
        .replace(',', '')
    );

  };


  // ==================================================
  // TOTAL QUANTITY
  // ==================================================

  const totalQuantity = cart.reduce(
    (sum, product) =>
      sum + (product.quantity || 1),
    0
  );


  // ==================================================
  // TOTAL PRICE
  // ==================================================

  const total = cart.reduce(
    (sum, product) =>
      sum +
      getPriceValue(product.price) *
        (product.quantity || 1),
    0
  );


  // ==================================================
  // LOADING SCREEN
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
          Loading your cart...
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

      {/* ============================================
          HEADER
      ============================================ */}

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
          onPress={() => router.back()}
          style={[
            styles.backButton,
            {
              backgroundColor:
                colors.card,
            },
          ]}
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


        <View
          style={styles.headerTitleContainer}
        >

          <Text
            style={[
              styles.headerTitle,
              {
                color: colors.text,
              },
            ]}
          >
            My Cart
          </Text>


          {totalQuantity > 0 && (

            <View
              style={[
                styles.headerBadge,
                {
                  backgroundColor:
                    colors.primary,
                },
              ]}
            >

              <Text
                style={
                  styles.headerBadgeText
                }
              >
                {totalQuantity}
              </Text>

            </View>

          )}

        </View>


        <View
          style={styles.headerSpace}
        />

      </View>


      {/* ============================================
          CONTENT
      ============================================ */}

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={
          styles.scroll
        }
      >

        {/* ==========================================
            EMPTY CART
        ========================================== */}

        {cart.length === 0 ? (

          <View
            style={
              styles.emptyContainer
            }
          >

            <View
              style={[
                styles.emptyCircle,
                {
                  backgroundColor:
                    colors.iconBackground,
                },
              ]}
            >

              <Text
                style={styles.emptyIcon}
              >
                🛍️
              </Text>

            </View>


            <Text
              style={[
                styles.emptyTitle,
                {
                  color: colors.text,
                },
              ]}
            >
              Your cart is empty
            </Text>


            <Text
              style={[
                styles.emptyText,
                {
                  color:
                    colors.secondaryText,
                },
              ]}
            >
              Products you add to your cart
              will appear here.
            </Text>


            <Pressable
              onPress={() =>
                router.replace('/home')
              }
              style={[
                styles.shopButton,
                {
                  backgroundColor:
                    colors.primary,
                },
              ]}
            >

              <Text
                style={styles.shopButtonText}
              >
                Start Shopping
              </Text>

            </Pressable>

          </View>

        ) : (

          <>

            {/* ======================================
                CART INTRO
            ====================================== */}

            <View
              style={styles.intro}
            >

              <Text
                style={[
                  styles.itemCount,
                  {
                    color: colors.text,
                  },
                ]}
              >
                {totalQuantity}{' '}
                {totalQuantity === 1
                  ? 'item'
                  : 'items'}
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
                Products ready for checkout
              </Text>

            </View>


            {/* ======================================
                CART PRODUCTS
            ====================================== */}

            {cart.map((product) => {

              const quantity =
                product.quantity || 1;


              return (

                <View
                  key={product.id}
                  style={[
                    styles.cartCard,
                    {
                      backgroundColor:
                        colors.card,
                      borderColor:
                        colors.border,
                    },
                  ]}
                >

                  {/* --------------------------------
                      PRODUCT IMAGE
                  -------------------------------- */}

                  <Pressable
                    onPress={() =>
                      router.push({
                        pathname:
                          '/product/[id]',
                        params: {
                          id: product.id,
                        },
                      })
                    }
                  >

                    <Image
                      source={{
                        uri: product.image,
                      }}
                      style={[
                        styles.productImage,
                        {
                          backgroundColor:
                            colors.input,
                        },
                      ]}
                    />

                  </Pressable>


                  {/* --------------------------------
                      PRODUCT INFORMATION
                  -------------------------------- */}

                  <View
                    style={
                      styles.productInfo
                    }
                  >

                    <Text
                      style={[
                        styles.category,
                        {
                          color:
                            colors.secondaryText,
                        },
                      ]}
                    >
                      {product.category}
                    </Text>


                    <Text
                      style={[
                        styles.productName,
                        {
                          color: colors.text,
                        },
                      ]}
                      numberOfLines={2}
                    >
                      {product.name}
                    </Text>


                    <Text
                      style={[
                        styles.price,
                        {
                          color: colors.text,
                        },
                      ]}
                    >
                      {product.price}
                    </Text>


                    <View
                      style={
                        styles.colorRow
                      }
                    >

                      <View
                        style={[
                          styles.colorDot,
                          {
                            backgroundColor:
                              getColorCode(
                                product.color
                              ),
                          },
                        ]}
                      />

                      <Text
                        style={[
                          styles.colorText,
                          {
                            color:
                              colors.secondaryText,
                          },
                        ]}
                      >
                        {product.color}
                      </Text>

                    </View>

                  </View>


                  {/* --------------------------------
                      QUANTITY
                  -------------------------------- */}

                  <View
                    style={
                      styles.quantityContainer
                    }
                  >

                    <Text
                      style={[
                        styles.quantityLabel,
                        {
                          color:
                            colors.secondaryText,
                        },
                      ]}
                    >
                      Quantity
                    </Text>


                    <Text
                      style={[
                        styles.quantityNumber,
                        {
                          color: colors.text,
                        },
                      ]}
                    >
                      {quantity}
                    </Text>


                    <View
                      style={[
                        styles.quantityControls,
                        {
                          backgroundColor:
                            colors.input,
                        },
                      ]}
                    >

                      {/* MINUS */}

                      <Pressable
                        style={
                          styles.quantityButton
                        }
                        onPress={() =>
                          updateQuantity(
                            product.id,
                            quantity - 1
                          )
                        }
                      >

                        <Text
                          style={[
                            styles.quantityButtonText,
                            {
                              color:
                                colors.text,
                            },
                          ]}
                        >
                          −
                        </Text>

                      </Pressable>


                      {/* PLUS */}

                      <Pressable
                        style={
                          styles.quantityButton
                        }
                        onPress={() =>
                          updateQuantity(
                            product.id,
                            quantity + 1
                          )
                        }
                      >

                        <Text
                          style={[
                            styles.quantityButtonText,
                            {
                              color:
                                colors.text,
                            },
                          ]}
                        >
                          +
                        </Text>

                      </Pressable>

                    </View>

                  </View>


                  {/* --------------------------------
                      REMOVE
                  -------------------------------- */}

                  <Pressable
                    style={[
                      styles.removeButton,
                      {
                        backgroundColor:
                          colors.input,
                      },
                    ]}
                    onPress={() =>
                      removeFromCart(
                        product.id
                      )
                    }
                  >

                    <Text
                      style={[
                        styles.removeText,
                        {
                          color:
                            colors.secondaryText,
                        },
                      ]}
                    >
                      ×
                    </Text>

                  </Pressable>

                </View>

              );

            })}


            {/* ======================================
                ORDER SUMMARY
            ====================================== */}

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
                    color: colors.text,
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
                      color: colors.text,
                    },
                  ]}
                >
                  ${total.toFixed(2)}
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
                    styles.summaryValue,
                    {
                      color: colors.text,
                    },
                  ]}
                >
                  Free
                </Text>

              </View>


              <View
                style={[
                  styles.summaryDivider,
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
                      color: colors.text,
                    },
                  ]}
                >
                  Total
                </Text>


                <Text
                  style={[
                    styles.totalValue,
                    {
                      color: colors.primary,
                    },
                  ]}
                >
                  ${total.toFixed(2)}
                </Text>

              </View>

            </View>


            {/* ======================================
                CHECKOUT
            ====================================== */}

            <Pressable
              style={[
                styles.checkoutButton,
                {
                  backgroundColor:
                    isDark
                      ? colors.primary
                      : colors.black,
                },
              ]}
              onPress={() =>
                router.push('/checkout')
              }
            >

              <Text
                style={
                  styles.checkoutText
                }
              >
                Proceed to Checkout
              </Text>

            </Pressable>

          </>

        )}


        <View
          style={{ height: 40 }}
        />

      </ScrollView>

    </SafeAreaView>

  );

}


// ==================================================
// PRODUCT COLOR
// ==================================================

const getColorCode = (
  color: string
) => {

  switch (
    color?.toLowerCase()
  ) {

    case 'black':
      return '#111111';

    case 'white':
      return '#FFFFFF';

    case 'grey':
    case 'gray':
      return '#808080';

    case 'blue':
      return '#2563EB';

    case 'brown':
      return '#8B5E3C';

    case 'green':
      return '#16A34A';

    case 'red':
      return '#DC2626';

    case 'purple':
      return '#7C3AED';

    case 'pink':
      return '#EC4899';

    case 'beige':
      return '#D6C2A1';

    default:
      return '#CCCCCC';

  }

};


// ==================================================
// STYLES
// ==================================================

const styles = StyleSheet.create({

  container: {
    flex: 1,
  },


  // ================================================
  // LOADING
  // ================================================

  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  loadingText: {
    marginTop: 12,
    fontSize: 14,
  },


  // ================================================
  // HEADER
  // ================================================

  header: {
    height: 65,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  backButton: {
    width: 45,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
  },

  back: {
    fontSize: 40,
    fontWeight: '300',
  },

  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  headerTitle: {
    fontSize: 21,
    fontWeight: '800',
  },

  headerBadge: {
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 7,
    paddingHorizontal: 5,
  },

  headerBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },

  headerSpace: {
    width: 45,
  },


  // ================================================
  // SCROLL
  // ================================================

  scroll: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },


  // ================================================
  // INTRO
  // ================================================

  intro: {
    marginTop: 10,
    marginBottom: 18,
  },

  itemCount: {
    fontSize: 20,
    fontWeight: '800',
  },

  introText: {
    fontSize: 13,
    marginTop: 4,
  },


  // ================================================
  // CART CARD
  // ================================================

  cartCard: {
    borderRadius: 18,
    padding: 12,
    marginBottom: 14,
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
    borderWidth: 1,
  },


  // ================================================
  // PRODUCT IMAGE
  // ================================================

  productImage: {
    width: 95,
    height: 120,
    borderRadius: 14,
  },


  // ================================================
  // PRODUCT INFORMATION
  // ================================================

  productInfo: {
    flex: 1,
    paddingHorizontal: 11,
    paddingVertical: 4,
    paddingRight: 4,
  },

  category: {
    fontSize: 9,
    textTransform: 'uppercase',
    fontWeight: '700',
    marginBottom: 4,
  },

  productName: {
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 19,
  },

  price: {
    fontSize: 16,
    fontWeight: '800',
    marginTop: 8,
  },


  // ================================================
  // COLOR
  // ================================================

  colorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },

  colorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#D1D1D1',
    marginRight: 6,
  },

  colorText: {
    fontSize: 10,
  },


  // ================================================
  // QUANTITY
  // ================================================

  quantityContainer: {
    width: 65,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 3,
  },

  quantityLabel: {
    fontSize: 9,
    fontWeight: '600',
    marginBottom: 3,
  },

  quantityNumber: {
    fontSize: 19,
    fontWeight: '800',
    marginBottom: 7,
  },

  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    overflow: 'hidden',
  },

  quantityButton: {
    width: 30,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },

  quantityButtonText: {
    fontSize: 20,
    fontWeight: '600',
  },


  // ================================================
  // REMOVE
  // ================================================

  removeButton: {
    position: 'absolute',
    right: 8,
    top: 8,
    width: 25,
    height: 25,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },

  removeText: {
    fontSize: 19,
    fontWeight: '300',
    marginTop: -2,
  },


  // ================================================
  // ORDER SUMMARY
  // ================================================

  summary: {
    borderRadius: 18,
    padding: 18,
    marginTop: 8,
    borderWidth: 1,
  },

  summaryTitle: {
    fontSize: 17,
    fontWeight: '800',
    marginBottom: 16,
  },

  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },

  summaryLabel: {
    fontSize: 13,
  },

  summaryValue: {
    fontSize: 13,
    fontWeight: '600',
  },

  summaryDivider: {
    height: 1,
    marginVertical: 7,
  },

  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  totalLabel: {
    fontSize: 16,
    fontWeight: '800',
  },

  totalValue: {
    fontSize: 20,
    fontWeight: '800',
  },


  // ================================================
  // CHECKOUT
  // ================================================

  checkoutButton: {
    height: 55,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 18,
  },

  checkoutText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },


  // ================================================
  // EMPTY CART
  // ================================================

  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 25,
    paddingTop: 120,
  },

  emptyCircle: {
    width: 82,
    height: 82,
    borderRadius: 41,
    alignItems: 'center',
    justifyContent: 'center',
  },

  emptyIcon: {
    fontSize: 38,
  },

  emptyTitle: {
    fontSize: 23,
    fontWeight: '800',
    marginTop: 20,
  },

  emptyText: {
    fontSize: 14,
    lineHeight: 21,
    textAlign: 'center',
    marginTop: 8,
    maxWidth: 300,
  },

  shopButton: {
    paddingHorizontal: 22,
    paddingVertical: 13,
    borderRadius: 15,
    marginTop: 22,
  },

  shopButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },

});