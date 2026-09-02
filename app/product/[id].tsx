import React, {
  useCallback,
  useState,
} from 'react';

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

import {
  router,
  useFocusEffect,
  useLocalSearchParams,
} from 'expo-router';

import {
  deleteDoc,
  doc,
  getDoc,
  setDoc,
} from 'firebase/firestore';

import { auth, db } from '../../src/services/firebase';

import { useTheme } from '@/src/theme/ThemeContext';


// ==================================================
// PRODUCT TYPE
// ==================================================

type Product = {
  id: string;
  name: string;
  price: string;
  priceValue?: number;
  category: string;
  gender?: string;
  style: string[];
  color: string;
  description: string;
  image: string;
};


// ==================================================
// PRODUCT COLOR
// ==================================================

const getColorCode = (color: string) => {

  switch (color.toLowerCase()) {

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
// PRODUCT DETAILS SCREEN
// ==================================================

export default function ProductDetails() {

  // ==================================================
  // GLOBAL THEME
  // ==================================================

  const {
    colors,
    isDark,
  } = useTheme();


  // ==================================================
  // PRODUCT ID
  // ==================================================

  const params =
    useLocalSearchParams<{
      id?: string | string[];
    }>();


  const productId =
    Array.isArray(params.id)
      ? params.id[0]
      : params.id;


  // ==================================================
  // STATE
  // ==================================================

  const [product, setProduct] =
    useState<Product | null>(null);

  const [loadingProduct, setLoadingProduct] =
    useState(true);

  const [isFavorite, setIsFavorite] =
    useState(false);

  const [addingToCart, setAddingToCart] =
    useState(false);

  const [checkingWishlist, setCheckingWishlist] =
    useState(true);


  // ==================================================
  // LOAD PRODUCT FROM FIRESTORE
  // ==================================================

  const loadProduct = useCallback(async () => {

    if (!productId) {

      setProduct(null);
      setLoadingProduct(false);

      return;
    }


    try {

      setLoadingProduct(true);


      const productRef = doc(
        db,
        'products',
        productId
      );


      const productSnapshot =
        await getDoc(productRef);


      if (!productSnapshot.exists()) {

        console.log(
          'Product not found in Firestore:',
          productId
        );

        setProduct(null);

        return;
      }


      const data =
        productSnapshot.data();


      const firestoreProduct: Product = {

        id: productSnapshot.id,

        name:
          typeof data.name === 'string'
            ? data.name
            : '',

        price:
          typeof data.price === 'string'
            ? data.price
            : '',

        priceValue:
          typeof data.priceValue === 'number'
            ? data.priceValue
            : undefined,

        category:
          typeof data.category === 'string'
            ? data.category
            : '',

        gender:
          typeof data.gender === 'string'
            ? data.gender
            : undefined,

        style:
          Array.isArray(data.style)
            ? data.style
            : [],

        color:
          typeof data.color === 'string'
            ? data.color
            : '',

        description:
          typeof data.description === 'string'
            ? data.description
            : '',

        image:
          typeof data.image === 'string'
            ? data.image
            : '',
      };


      setProduct(
        firestoreProduct
      );


    } catch (error) {

      console.log(
        'Error loading product:',
        error
      );

      Alert.alert(
        'Error',
        'We could not load this product. Please try again.'
      );

    } finally {

      setLoadingProduct(false);

    }

  }, [productId]);


  // ==================================================
  // LOAD PRODUCT WHEN SCREEN IS FOCUSED
  // ==================================================

  useFocusEffect(
    useCallback(() => {

      loadProduct();

    }, [loadProduct])
  );


  // ==================================================
  // CHECK WISHLIST
  // ==================================================

  useFocusEffect(
    useCallback(() => {

      const checkWishlist = async () => {

        const user = auth.currentUser;


        if (
          !user ||
          !productId
        ) {

          setIsFavorite(false);
          setCheckingWishlist(false);

          return;
        }


        try {

          setCheckingWishlist(true);


          const wishlistRef = doc(
            db,
            'users',
            user.uid,
            'wishlist',
            productId
          );


          const snapshot =
            await getDoc(wishlistRef);


          setIsFavorite(
            snapshot.exists()
          );


        } catch (error) {

          console.log(
            'Wishlist check error:',
            error
          );

        } finally {

          setCheckingWishlist(false);

        }

      };


      checkWishlist();

    }, [productId])
  );


  // ==================================================
  // TOGGLE WISHLIST
  // ==================================================

  const toggleFavorite = async () => {

    const user = auth.currentUser;


    if (!user) {

      Alert.alert(
        'Sign in required',
        'Please sign in to save products to your wishlist.',
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Sign In',
            onPress: () =>
              router.push('/signin'),
          },
        ]
      );

      return;
    }


    if (!product) {
      return;
    }


    try {

      const wishlistRef = doc(
        db,
        'users',
        user.uid,
        'wishlist',
        product.id
      );


      // --------------------------------------------
      // REMOVE FROM WISHLIST
      // --------------------------------------------

      if (isFavorite) {

        await deleteDoc(
          wishlistRef
        );


        setIsFavorite(false);


        Alert.alert(
          'Removed',
          `${product.name} was removed from your wishlist.`
        );


        return;
      }


      // --------------------------------------------
      // ADD TO WISHLIST
      // --------------------------------------------

      await setDoc(
        wishlistRef,
        {
          id: product.id,
          name: product.name,
          price: product.price,
          priceValue: product.priceValue ?? null,
          category: product.category,
          gender: product.gender ?? '',
          style: product.style,
          color: product.color,
          description: product.description,
          image: product.image,
          addedAt: new Date(),
        }
      );


      setIsFavorite(true);


      Alert.alert(
        'Added to wishlist ❤️',
        `${product.name} has been saved to your wishlist.`
      );


    } catch (error) {

      console.log(
        'Wishlist error:',
        error
      );


      Alert.alert(
        'Error',
        'We could not update your wishlist. Please try again.'
      );

    }

  };


  // ==================================================
  // ADD TO CART
  // ==================================================

  const handleAddToCart = async () => {

    const user = auth.currentUser;


    if (!user) {

      Alert.alert(
        'Sign in required',
        'Please sign in to add products to your cart.',
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Sign In',
            onPress: () =>
              router.push('/signin'),
          },
        ]
      );

      return;
    }


    if (!product) {
      return;
    }


    try {

      setAddingToCart(true);


      const cartRef = doc(
        db,
        'users',
        user.uid,
        'cart',
        product.id
      );


      const existingCartItem =
        await getDoc(cartRef);


      // --------------------------------------------
      // EXISTING CART ITEM
      // --------------------------------------------

      if (
        existingCartItem.exists()
      ) {

        const existingData =
          existingCartItem.data();


        const currentQuantity =
          typeof existingData.quantity === 'number'
            ? existingData.quantity
            : 1;


        await setDoc(
          cartRef,
          {
            quantity:
              currentQuantity + 1,
          },
          {
            merge: true,
          }
        );

      }


      // --------------------------------------------
      // NEW CART ITEM
      // --------------------------------------------

      else {

        await setDoc(
          cartRef,
          {
            id: product.id,
            name: product.name,
            price: product.price,
            priceValue: product.priceValue ?? null,
            category: product.category,
            gender: product.gender ?? '',
            style: product.style,
            color: product.color,
            description: product.description,
            image: product.image,
            quantity: 1,
            addedAt: new Date(),
          }
        );

      }


      Alert.alert(
        'Added to cart 🛍️',
        `${product.name} has been added to your cart.`,
        [
          {
            text: 'Continue Shopping',
            style: 'cancel',
          },
          {
            text: 'Open Cart',
            onPress: () =>
              router.push('/cart'),
          },
        ]
      );


    } catch (error) {

      console.log(
        'Add to cart error:',
        error
      );


      Alert.alert(
        'Error',
        'We could not add this product to your cart. Please try again.'
      );


    } finally {

      setAddingToCart(false);

    }

  };


  // ==================================================
  // LOADING SCREEN
  // ==================================================

  if (loadingProduct) {

    return (

      <SafeAreaView
        style={[
          styles.errorContainer,
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
          Loading product...
        </Text>

      </SafeAreaView>

    );

  }


  // ==================================================
  // PRODUCT NOT FOUND
  // ==================================================

  if (!product) {

    return (

      <SafeAreaView
        style={[
          styles.errorContainer,
          {
            backgroundColor:
              colors.background,
          },
        ]}
      >

        <Text
          style={[
            styles.errorTitle,
            {
              color:
                colors.text,
            },
          ]}
        >
          Product not found
        </Text>


        <Text
          style={[
            styles.errorText,
            {
              color:
                colors.secondaryText,
            },
          ]}
        >
          We couldn't find this product in the StyleIQ catalog.
        </Text>


        <Pressable
          onPress={() =>
            router.back()
          }
          style={[
            styles.backHomeButton,
            {
              backgroundColor:
                colors.primary,
            },
          ]}
        >

          <Text
            style={[
              styles.backHomeText,
              {
                color:
                  colors.white,
              },
            ]}
          >
            Go Back
          </Text>

        </Pressable>

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
        contentContainerStyle={
          styles.scroll
        }
      >

        {/* ==================================================
            HEADER
        ================================================== */}

        <View
          style={[
            styles.header,
            {
              backgroundColor:
                colors.background,
            },
          ]}
        >

          {/* BACK */}

          <Pressable
            onPress={() =>
              router.back()
            }
            style={[
              styles.headerButton,
              {
                backgroundColor:
                  colors.card,
              },
            ]}
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


          {/* TITLE */}

          <Text
            style={[
              styles.headerTitle,
              {
                color:
                  colors.text,
              },
            ]}
          >
            Product Details
          </Text>


          {/* HEADER WISHLIST */}

          <Pressable
            onPress={toggleFavorite}
            style={[
              styles.headerButton,
              {
                backgroundColor:
                  colors.card,
              },
            ]}
            disabled={
              checkingWishlist
            }
          >

            {checkingWishlist ? (

              <ActivityIndicator
                size="small"
                color={colors.text}
              />

            ) : (

              <Text
                style={[
                  styles.headerHeart,
                  {
                    color:
                      isFavorite
                        ? '#FF0000'
                        : colors.text,
                  },
                ]}
              >
                {isFavorite
                  ? '♥️'
                  : '♡'}
              </Text>

            )}

          </Pressable>

        </View>


        {/* ==================================================
            PRODUCT IMAGE
        ================================================== */}

        <View
          style={[
            styles.imageContainer,
            {
              backgroundColor:
                isDark
                  ? '#202020'
                  : '#F1F1F1',
            },
          ]}
        >

          <Image
            source={{
              uri: product.image,
            }}
            style={
              styles.productImage
            }
          />


          {/* IMAGE WISHLIST */}

          <Pressable
            onPress={toggleFavorite}
            style={[
              styles.imageHeart,
              {
                backgroundColor:
                  isDark
                    ? 'rgba(30,30,30,0.95)'
                    : 'rgba(255,255,255,0.95)',
              },
            ]}
            disabled={
              checkingWishlist
            }
          >

            {checkingWishlist ? (

              <ActivityIndicator
                size="small"
                color={colors.text}
              />

            ) : (

              <Text
                style={[
                  styles.imageHeartText,
                  {
                    color:
                      isFavorite
                        ? '#FF0000'
                        : colors.text,
                  },
                ]}
              >
                {isFavorite
                  ? '♥️'
                  : '♡'}
              </Text>

            )}

          </Pressable>

        </View>


        {/* ==================================================
            PRODUCT INFORMATION
        ================================================== */}

        <View
          style={styles.info}
        >

          {/* CATEGORY */}

          <Text
            style={[
              styles.category,
              {
                color:
                  colors.secondaryText,
              },
            ]}
          >
            {product.category.toUpperCase()}
          </Text>


          {/* NAME */}

          <Text
            style={[
              styles.productName,
              {
                color:
                  colors.text,
              },
            ]}
          >
            {product.name}
          </Text>


          {/* PRICE */}

          <Text
            style={[
              styles.price,
              {
                color:
                  colors.primary,
              },
            ]}
          >
            {product.price}
          </Text>


          {/* ==================================================
              STYLE
          ================================================== */}

          <View
            style={styles.section}
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
              Style
            </Text>


            <View
              style={styles.tags}
            >

              {product.style.map(
                (style, index) => (

                  <View
                    key={`${style}-${index}`}
                    style={[
                      styles.tag,
                      {
                        backgroundColor:
                          colors.primaryLight,
                      },
                    ]}
                  >

                    <Text
                      style={[
                        styles.tagText,
                        {
                          color:
                            colors.primary,
                        },
                      ]}
                    >
                      {style}
                    </Text>

                  </View>

                )
              )}

            </View>

          </View>


          {/* ==================================================
              COLOR
          ================================================== */}

          <View
            style={styles.section}
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
              Color
            </Text>


            <View
              style={styles.colorRow}
            >

              <View
                style={[
                  styles.colorCircle,
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


          {/* ==================================================
              DESCRIPTION
          ================================================== */}

          <View
            style={styles.section}
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
              About this product
            </Text>


            <Text
              style={[
                styles.description,
                {
                  color:
                    colors.secondaryText,
                },
              ]}
            >
              {product.description}
            </Text>

          </View>


          {/* ==================================================
              STYLEIQ MATCH
          ================================================== */}

          <View
            style={[
              styles.matchCard,
              {
                backgroundColor:
                  colors.iconBackground,
              },
            ]}
          >

            <Text
              style={styles.matchIcon}
            >
              ✨
            </Text>


            <View
              style={styles.matchContent}
            >

              <Text
                style={[
                  styles.matchTitle,
                  {
                    color:
                      colors.text,
                  },
                ]}
              >
                StyleIQ Pick
              </Text>


              <Text
                style={[
                  styles.matchText,
                  {
                    color:
                      colors.secondaryText,
                  },
                ]}
              >
                This product was selected
                because it matches your
                fashion preferences.
              </Text>

            </View>

          </View>

        </View>

      </ScrollView>


      {/* ==================================================
          ADD TO CART
      ================================================== */}

      <View
        style={[
          styles.bottomBar,
          {
            backgroundColor:
              colors.card,
            borderTopColor:
              colors.border,
          },
        ]}
      >

        <Pressable
          onPress={
            handleAddToCart
          }
          disabled={
            addingToCart
          }
          style={({ pressed }) => [

            styles.cartButton,

            {
              backgroundColor:
                colors.primary,
            },

            pressed &&
              styles.cartButtonPressed,

            addingToCart &&
              styles.cartButtonDisabled,

          ]}
        >

          {addingToCart ? (

            <ActivityIndicator
              color={colors.white}
            />

          ) : (

            <Text
              style={[
                styles.cartButtonText,
                {
                  color:
                    colors.white,
                },
              ]}
            >
              Add to Cart
            </Text>

          )}

        </Pressable>

      </View>

    </SafeAreaView>

  );

}


// ==================================================
// STATIC STYLES
// ==================================================

const styles = StyleSheet.create({

  // ==================================================
  // CONTAINER
  // ==================================================

  container: {
    flex: 1,
  },


  scroll: {
    paddingBottom: 110,
  },


  // ==================================================
  // HEADER
  // ==================================================

  header: {
    height: 65,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },


  headerButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
  },


  backIcon: {
    fontSize: 38,
    fontWeight: '300',
    marginTop: -4,
  },


  headerTitle: {
    fontSize: 17,
    fontWeight: '800',
  },


  headerHeart: {
    fontSize: 23,
  },


  // ==================================================
  // IMAGE
  // ==================================================

  imageContainer: {
    width: '100%',
    height: 430,
    position: 'relative',
  },


  productImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },


  imageHeart: {
    position: 'absolute',
    right: 18,
    top: 18,
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
  },


  imageHeartText: {
    fontSize: 27,
  },


  // ==================================================
  // PRODUCT INFORMATION
  // ==================================================

  info: {
    paddingHorizontal: 20,
    paddingTop: 22,
  },


  category: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
  },


  productName: {
    fontSize: 27,
    fontWeight: '800',
    marginTop: 6,
  },


  price: {
    fontSize: 22,
    fontWeight: '800',
    marginTop: 8,
  },


  // ==================================================
  // SECTIONS
  // ==================================================

  section: {
    marginTop: 25,
  },


  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 10,
  },


  // ==================================================
  // STYLE TAGS
  // ==================================================

  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },


  tag: {
    borderRadius: 18,
    paddingHorizontal: 13,
    paddingVertical: 8,
  },


  tagText: {
    fontSize: 12,
    fontWeight: '600',
  },


  // ==================================================
  // COLOR
  // ==================================================

  colorRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },


  colorCircle: {
    width: 25,
    height: 25,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: '#D1D1D1',
    marginRight: 10,
  },


  colorText: {
    fontSize: 14,
    fontWeight: '600',
  },


  // ==================================================
  // DESCRIPTION
  // ==================================================

  description: {
    fontSize: 14,
    lineHeight: 22,
  },


  // ==================================================
  // STYLEIQ MATCH
  // ==================================================

  matchCard: {
    marginTop: 25,
    borderRadius: 18,
    padding: 17,
    flexDirection: 'row',
  },


  matchIcon: {
    fontSize: 25,
    marginRight: 12,
  },


  matchContent: {
    flex: 1,
  },


  matchTitle: {
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 5,
  },


  matchText: {
    fontSize: 12,
    lineHeight: 18,
  },


  // ==================================================
  // BOTTOM BAR
  // ==================================================

  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderTopWidth: 1,
  },


  cartButton: {
    height: 55,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },


  cartButtonPressed: {
    opacity: 0.8,
  },


  cartButtonDisabled: {
    opacity: 0.6,
  },


  cartButtonText: {
    fontSize: 16,
    fontWeight: '700',
  },


  // ==================================================
  // LOADING / ERROR
  // ==================================================

  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 30,
  },


  loadingText: {
    fontSize: 14,
    marginTop: 15,
  },


  errorTitle: {
    fontSize: 24,
    fontWeight: '800',
    textAlign: 'center',
  },


  errorText: {
    fontSize: 14,
    marginTop: 8,
    marginBottom: 25,
    textAlign: 'center',
  },


  backHomeButton: {
    paddingHorizontal: 25,
    paddingVertical: 13,
    borderRadius: 14,
  },


  backHomeText: {
    fontSize: 14,
    fontWeight: '700',
  },

});