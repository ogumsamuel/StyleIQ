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
} from 'firebase/firestore';

import { auth, db } from '../src/services/firebase';

// ==================================================
// THEME
// ==================================================

import { useTheme } from '../src/theme/ThemeContext';


// ==================================================
// WISHLIST PRODUCT TYPE
// ==================================================

type WishlistProduct = {
  id: string;
  name: string;
  price: string;
  category: string;
  color: string;
  image: string;
};


// ==================================================
// WISHLIST SCREEN
// ==================================================

export default function WishlistScreen() {

  // ==================================================
  // GLOBAL THEME
  // ==================================================

  const { colors, isDark } = useTheme();


  // ==================================================
  // STATE
  // ==================================================

  const [wishlist, setWishlist] =
    useState<WishlistProduct[]>([]);

  const [loading, setLoading] =
    useState(true);


  // ==================================================
  // LOAD WISHLIST
  // ==================================================

  useEffect(() => {
    loadWishlist();
  }, []);


  const loadWishlist = async () => {

    const user = auth.currentUser;

    if (!user) {
      setLoading(false);
      return;
    }

    try {

      const wishlistRef = collection(
        db,
        'users',
        user.uid,
        'wishlist'
      );

      const snapshot =
        await getDocs(wishlistRef);

      const products =
        snapshot.docs.map((item) => ({
          id: item.id,
          ...item.data(),
        })) as WishlistProduct[];

      setWishlist(products);

    } catch (error) {

      console.log(
        'Load wishlist error:',
        error
      );

      Alert.alert(
        'Error',
        'We could not load your wishlist.'
      );

    } finally {

      setLoading(false);

    }
  };


  // ==================================================
  // REMOVE FROM WISHLIST
  // ==================================================

  const removeFromWishlist = async (
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
          'wishlist',
          productId
        )
      );

      setWishlist((current) =>
        current.filter(
          (product) =>
            product.id !== productId
        )
      );

    } catch (error) {

      console.log(
        'Remove wishlist error:',
        error
      );

      Alert.alert(
        'Error',
        'We could not remove this product.'
      );
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
          Loading your wishlist...
        </Text>

      </SafeAreaView>
    );
  }


  // ==================================================
  // UI
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
          Wishlist
        </Text>


        <View
          style={styles.headerSpace}
        />

      </View>


      {/* ==================================================
          CONTENT
      ================================================== */}

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >

        {/* ==================================================
            EMPTY WISHLIST
        ================================================== */}

        {wishlist.length === 0 ? (

          <View
            style={[
              styles.emptyContainer,
              {
                backgroundColor:
                  colors.background,
              },
            ]}
          >

            <View
              style={[
                styles.emptyIconCircle,
                {
                  backgroundColor:
                    colors.iconBackground,
                },
              ]}
            >

              <Text
                style={[
                  styles.emptyIcon,
                  {
                    color:
                      colors.primary,
                  },
                ]}
              >
                ♡
              </Text>

            </View>


            <Text
              style={[
                styles.emptyTitle,
                {
                  color:
                    colors.text,
                },
              ]}
            >
              Your wishlist is empty
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
              Save products you love and find
              them here later.
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
                style={[
                  styles.shopButtonText,
                  {
                    color:
                      colors.white,
                  },
                ]}
              >
                Discover Fashion
              </Text>

            </Pressable>

          </View>

        ) : (

          <>
            {/* ==================================================
                INTRO
            ================================================== */}

            <View style={styles.intro}>

              <Text
                style={[
                  styles.count,
                  {
                    color:
                      colors.text,
                  },
                ]}
              >
                {wishlist.length}{' '}
                {wishlist.length === 1
                  ? 'item'
                  : 'items'}{' '}
                saved
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
                Your favorite StyleIQ products
              </Text>

            </View>


            {/* ==================================================
                PRODUCT GRID
            ================================================== */}

            <View
              style={styles.productGrid}
            >

              {wishlist.map((product) => (

                <Pressable
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

                  {/* ==========================================
                      PRODUCT IMAGE
                  ========================================== */}

                  <View
                    style={[
                      styles.imageContainer,
                      {
                        backgroundColor:
                          isDark
                            ? '#242424'
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


                    {/* ========================================
                        REMOVE HEART
                    ======================================== */}

                    <Pressable
                      onPress={(event) => {
                        event.stopPropagation();

                        removeFromWishlist(
                          product.id
                        );
                      }}
                      style={[
                        styles.removeButton,
                        {
                          backgroundColor:
                            isDark
                              ? 'rgba(30,30,30,0.95)'
                              : 'rgba(255,255,255,0.95)',
                        },
                      ]}
                    >

                      <Text
                        style={[
                          styles.removeIcon,
                          {
                            color:
                              '#FF0000',
                          },
                        ]}
                      >
                        ♥️
                      </Text>

                    </Pressable>

                  </View>


                  {/* ==========================================
                      PRODUCT INFO
                  ========================================== */}

                  <View
                    style={styles.info}
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
                          color:
                            colors.text,
                        },
                      ]}
                      numberOfLines={1}
                    >
                      {product.name}
                    </Text>


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


                    {/* COLOR */}

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

                </Pressable>

              ))}

            </View>

          </>

        )}


        <View
          style={{
            height: 40,
          }}
        />

      </ScrollView>


      {/* ==================================================
          BOTTOM NAVIGATION
      ================================================== */}

      <View
        style={[
          styles.bottomNav,
          {
            backgroundColor:
              colors.card,
            borderTopColor:
              colors.border,
          },
        ]}
      >

        {/* HOME */}

        <Pressable
          style={styles.navItem}
          onPress={() =>
            router.replace('/home')
          }
        >

          <Text
            style={[
              styles.navIcon,
              {
                color:
                  colors.secondaryText,
              },
            ]}
          >
            ⌂
          </Text>

          <Text
            style={[
              styles.navText,
              {
                color:
                  colors.secondaryText,
              },
            ]}
          >
            Home
          </Text>

        </Pressable>


        {/* DISCOVER */}

        <Pressable
          style={styles.navItem}
        >

          <Text
            style={[
              styles.navIcon,
              {
                color:
                  colors.secondaryText,
              },
            ]}
          >
            ⌕
          </Text>

          <Text
            style={[
              styles.navText,
              {
                color:
                  colors.secondaryText,
              },
            ]}
          >
            Discover
          </Text>

        </Pressable>


        {/* ADD */}

        <Pressable
        
          style={[
            styles.addButton,
            
            {
              backgroundColor:
                colors.primary,
            },
          ]}

          onPress={() => router.push("/home")}
        >

          <Text
            style={[
              styles.addText,
              {
                color:
                  colors.white,
              },
            ]}
          >
            +
          </Text>

        </Pressable>


        {/* WISHLIST */}

        <Pressable
          style={styles.navItem}
          onPress={() =>
            router.replace('/wishlist')
          }
        >

          <Text
            style={[
              styles.navIconActive,
              {
                color:
                  '#FF0000',
              },
            ]}
          >
            ♥️
          </Text>

          <Text
            style={[
              styles.navTextActive,
              {
                color:
                  '#FF0000',
              },
            ]}
          >
            Wishlist
          </Text>

        </Pressable>


        {/* PROFILE */}

        <Pressable
          style={styles.navItem}
          onPress={() =>
            router.push('/profile')
          }
        >

          <Text
            style={[
              styles.navIcon,
              {
                color:
                  colors.secondaryText,
              },
            ]}
          >
            ◉
          </Text>

          <Text
            style={[
              styles.navText,
              {
                color:
                  colors.secondaryText,
              },
            ]}
          >
            Profile
          </Text>

        </Pressable>

      </View>

    </SafeAreaView>
  );
}


// ==================================================
// COLOR HELPER
// ==================================================

const getColorCode = (
  color: string
) => {

  switch (color?.toLowerCase()) {

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


  // ==================================================
  // LOADING
  // ==================================================

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
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  backButton: {
    width: 45,
    height: 45,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
  },

  back: {
    fontSize: 40,
    fontWeight: '300',
    marginTop: -4,
  },

  headerTitle: {
    fontSize: 21,
    fontWeight: '800',
  },

  headerSpace: {
    width: 45,
  },


  // ==================================================
  // SCROLL
  // ==================================================

  scroll: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },


  // ==================================================
  // INTRO
  // ==================================================

  intro: {
    marginTop: 10,
    marginBottom: 20,
  },

  count: {
    fontSize: 19,
    fontWeight: '800',
  },

  introText: {
    fontSize: 13,
    marginTop: 4,
  },


  // ==================================================
  // EMPTY STATE
  // ==================================================

  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 25,
    paddingTop: 100,
  },

  emptyIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },

  emptyIcon: {
    fontSize: 42,
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
    fontSize: 14,
    fontWeight: '700',
  },


  // ==================================================
  // PRODUCT GRID
  // ==================================================

  productGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },

  productCard: {
    width: '48%',
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 18,
    borderWidth: 1,
  },

  imageContainer: {
    height: 190,
    position: 'relative',
  },

  productImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },


  // ==================================================
  // REMOVE BUTTON
  // ==================================================

  removeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 35,
    height: 35,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },

  removeIcon: {
    fontSize: 21,
  },


  // ==================================================
  // PRODUCT INFO
  // ==================================================

  info: {
    padding: 11,
  },

  category: {
    fontSize: 9,
    textTransform: 'uppercase',
    fontWeight: '700',
    marginBottom: 3,
  },

  productName: {
    fontSize: 13,
    fontWeight: '700',
  },

  price: {
    fontSize: 14,
    fontWeight: '800',
    marginTop: 5,
  },


  // ==================================================
  // COLOR
  // ==================================================

  colorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 7,
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


  // ==================================================
  // BOTTOM NAVIGATION
  // ==================================================

  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 75,
    borderTopWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 10,
  },

  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 65,
  },

  navIcon: {
    fontSize: 22,
    marginBottom: 3,
  },

  navIconActive: {
    fontSize: 22,
    marginBottom: 3,
  },

  navText: {
    fontSize: 10,
  },

  navTextActive: {
    fontSize: 10,
    fontWeight: '700',
  },

  addButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -20,
  },

  addText: {
    fontSize: 28,
    fontWeight: '300',
  },

});