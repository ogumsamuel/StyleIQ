import React, {
  useState,
  useCallback,
} from 'react';

import {
  Alert,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  Keyboard,
  ActivityIndicator,
} from 'react-native';

import {
  router,
  useFocusEffect,
} from 'expo-router';

import {
  collection,
  doc,
  getDoc,
  getDocs,
  deleteDoc,
  setDoc,
} from 'firebase/firestore';

import { auth, db } from '../src/services/firebase';

import { useTheme } from '../src/theme/ThemeContext';


// ==================================================
// PRODUCT TYPE
// ==================================================

type Product = {
  id: string;
  name: string;
  price: string;
  priceValue: number;
  category: string;
  gender: string;
  style: string[];
  color: string;
  description: string;
  image: string;
};


// ==================================================
// HOME
// ==================================================

export default function Home() {

  // ==================================================
  // GLOBAL THEME
  // ==================================================

  const {
    colors,
    isDark,
  } = useTheme();


  // ==================================================
  // PRODUCTS
  // ==================================================

  const [products, setProducts] =
    useState<Product[]>([]);

  const [loadingProducts, setLoadingProducts] =
    useState(true);


  // ==================================================
  // USER DATA
  // ==================================================

  const [budget, setBudget] = useState('');
  const [userName, setUserName] = useState('');

  const [userStyles, setUserStyles] =
    useState<string[]>([]);

  const [userColors, setUserColors] =
    useState<string[]>([]);

  const [userCategories, setUserCategories] =
    useState<string[]>([]);


  // ==================================================
  // CART
  // ==================================================

  const [cartCount, setCartCount] = useState(0);


  // ==================================================
  // WISHLIST
  // ==================================================

  const [favorites, setFavorites] =
    useState<string[]>([]);


  // ==================================================
  // SEARCH
  // ==================================================

  const [searchText, setSearchText] =
    useState('');


  // ==================================================
  // CATEGORY
  // ==================================================

  const [selectedCategory, setSelectedCategory] =
    useState<string>('All');


  // ==================================================
  // LOAD PRODUCTS FROM FIRESTORE
  // ==================================================

  const loadProducts = async () => {

    try {

      setLoadingProducts(true);

      const productsRef =
        collection(db, 'products');

      const snapshot =
        await getDocs(productsRef);

      const firestoreProducts: Product[] =
        snapshot.docs.map((productDoc) => {

          const data =
            productDoc.data();

          return {

            id:
              productDoc.id,

            name:
              data.name || '',

            price:
              data.price || '$0.00',

            priceValue:
              typeof data.priceValue === 'number'
                ? data.priceValue
                : 0,

            category:
              data.category || '',

            gender:
              data.gender || 'Unisex',

            style:
              Array.isArray(data.style)
                ? data.style
                : [],

            color:
              data.color || '',

            description:
              data.description || '',

            image:
              data.image || '',

          };

        });

      setProducts(
        firestoreProducts
      );

    } catch (error) {

      console.log(
        'Error loading products:',
        error
      );

      setProducts([]);

    } finally {

      setLoadingProducts(false);

    }
  };


  // ==================================================
  // LOAD DATA
  // ==================================================

  useFocusEffect(
    useCallback(() => {

      loadProducts();

      loadCartCount();

      loadWishlist();

      loadUserPreferences();

    }, [])
  );


  // ==================================================
  // LOAD CART COUNT
  // ==================================================

  const loadCartCount = async () => {

    const user = auth.currentUser;

    if (!user) {

      setCartCount(0);

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

      const totalQuantity =
        snapshot.docs.reduce(
          (total, item) => {

            const data =
              item.data();

            const quantity =
              typeof data.quantity === 'number'
                ? data.quantity
                : 1;

            return total + quantity;

          },
          0
        );

      setCartCount(
        totalQuantity
      );

    } catch (error) {

      console.log(
        'Error loading cart count:',
        error
      );

    }
  };


  // ==================================================
  // LOAD USER PREFERENCES
  // ==================================================

  const loadUserPreferences = async () => {

    const user = auth.currentUser;

    if (!user) {
      return;
    }

    try {

      // ----------------------------------------------
      // PROFILE
      // ----------------------------------------------

      const profileRef = doc(
        db,
        'users',
        user.uid
      );

      const profileSnapshot =
        await getDoc(profileRef);

      if (
        profileSnapshot.exists()
      ) {

        const profileData =
          profileSnapshot.data();

        setUserName(
          profileData.name || ''
        );

      }


      // ----------------------------------------------
      // STYLE PREFERENCES
      // ----------------------------------------------

      const preferencesRef = doc(
        db,
        'users',
        user.uid,
        'preferences',
        'style'
      );

      const preferencesSnapshot =
        await getDoc(
          preferencesRef
        );

      if (
        preferencesSnapshot.exists()
      ) {

        const data =
          preferencesSnapshot.data();

        setUserStyles(
          Array.isArray(
            data.clothingStyles
          )
            ? data.clothingStyles
            : []
        );

        setUserColors(
          Array.isArray(
            data.favoriteColors
          )
            ? data.favoriteColors
            : []
        );

        setUserCategories(
          Array.isArray(
            data.clothingCategories
          )
            ? data.clothingCategories
            : []
        );

        setBudget(
          data.budget || ''
        );

      }

    } catch (error) {

      console.log(
        'Error loading user preferences:',
        error
      );

    }
  };


  // ==================================================
  // LOAD WISHLIST
  // ==================================================

  const loadWishlist = async () => {

    const user = auth.currentUser;

    if (!user) {

      setFavorites([]);

      return;
    }

    try {

      const wishlistRef =
        collection(
          db,
          'users',
          user.uid,
          'wishlist'
        );

      const snapshot =
        await getDocs(
          wishlistRef
        );

      const savedProductIds =
        snapshot.docs.map(
          (wishlistItem) =>
            wishlistItem.id
        );

      setFavorites(
        savedProductIds
      );

    } catch (error) {

      console.log(
        'Error loading wishlist:',
        error
      );

    }
  };


  // ==================================================
  // TOGGLE WISHLIST
  // ==================================================

  const toggleFavorite = async (
    product: Product
  ) => {

    const user =
      auth.currentUser;

    if (!user) {

      Alert.alert(
        'Sign in required',
        'Please sign in to save products to your wishlist.'
      );

      router.push('/signin');

      return;
    }

    try {

      const wishlistRef =
        doc(
          db,
          'users',
          user.uid,
          'wishlist',
          product.id
        );

      const isCurrentlyFavorite =
        favorites.includes(
          product.id
        );


      // ----------------------------------------------
      // REMOVE
      // ----------------------------------------------

      if (isCurrentlyFavorite) {

        await deleteDoc(
          wishlistRef
        );

        setFavorites(
          (previous) =>
            previous.filter(
              (id) =>
                id !== product.id
            )
        );

        return;
      }


      // ----------------------------------------------
      // ADD
      // ----------------------------------------------

      await setDoc(
        wishlistRef,
        {
          id:
            product.id,

          name:
            product.name,

          price:
            product.price,

          priceValue:
            product.priceValue,

          category:
            product.category,

          gender:
            product.gender,

          style:
            product.style,

          color:
            product.color,

          image:
            product.image,

          addedAt:
            new Date(),
        }
      );

      setFavorites(
        (previous) => [
          ...previous,
          product.id,
        ]
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
  // CATEGORIES
  // ==================================================

  const categories = [

    {
      name: 'All',
      emoji: '✨',
    },

    {
      name: 'Men',
      emoji: '👔',
    },

    {
      name: 'Women',
      emoji: '👗',
    },

    {
      name: 'Children',
      emoji: '🧒',
    },

    {
      name: 'Shoes',
      emoji: '👟',
    },

    {
      name: 'Accessories',
      emoji: '👜',
    },

  ];


  // ==================================================
  // RECOMMENDATION SYSTEM
  // ==================================================

  const recommendedProducts =
    products
      .map((product) => {

        let score = 0;


        // ----------------------------------------------
        // STYLE MATCH
        // ----------------------------------------------

        if (
          product.style.some(
            (style) =>
              userStyles.includes(
                style
              )
          )
        ) {

          score += 3;

        }


        // ----------------------------------------------
        // COLOR MATCH
        // ----------------------------------------------

        if (
          userColors.includes(
            product.color
          )
        ) {

          score += 2;

        }


        // ----------------------------------------------
        // CATEGORY MATCH
        // ----------------------------------------------

        if (
          userCategories.includes(
            product.category
          )
        ) {

          score += 3;

        }


        // ----------------------------------------------
        // BUDGET MATCH
        // ----------------------------------------------

        if (

          (
            budget === 'Under $50' &&
            product.priceValue < 50
          )

          ||

          (
            budget === '$50 - $100' &&
            product.priceValue >= 50 &&
            product.priceValue <= 100
          )

          ||

          (
            budget === '$100 - $250' &&
            product.priceValue > 100 &&
            product.priceValue <= 250
          )

          ||

          (
            budget === '$250 - $500' &&
            product.priceValue > 250 &&
            product.priceValue <= 500
          )

          ||

          (
            budget === '$500+' &&
            product.priceValue > 500
          )

        ) {

          score += 2;

        }


        return {
          ...product,
          score,
        };

      })

      .sort(
        (a, b) =>
          b.score - a.score
      );


  // ==================================================
  // FILTER PRODUCTS
  // ==================================================

  const filteredProducts =
    recommendedProducts.filter(
      (product) => {

        const search =
          searchText
            .trim()
            .toLowerCase();


        // ----------------------------------------------
        // SEARCH
        // ----------------------------------------------

        const matchesSearch =
          search === '' ||

          product.name
            .toLowerCase()
            .includes(search) ||

          product.category
            .toLowerCase()
            .includes(search) ||

          product.gender
            .toLowerCase()
            .includes(search) ||

          product.color
            .toLowerCase()
            .includes(search) ||

          product.style.some(
            (style) =>
              style
                .toLowerCase()
                .includes(search)
          );


        // ----------------------------------------------
        // CATEGORY
        // ----------------------------------------------

        let matchesCategory =
          true;


        if (
          selectedCategory !== 'All'
        ) {

          if (
            selectedCategory === 'Men'
          ) {

            matchesCategory =
              product.gender === 'Men' ||
              product.gender === 'Unisex';

          }

          else if (
            selectedCategory === 'Women'
          ) {

            matchesCategory =
              product.gender === 'Women' ||
              product.gender === 'Unisex';

          }

          else if (
            selectedCategory === 'Children'
          ) {

            matchesCategory =
              product.gender === 'Children';

          }

          else if (
            selectedCategory === 'Shoes'
          ) {

            matchesCategory =
              [
                'Sneakers',
                'Shoes',
                'Boots',
              ].includes(
                product.category
              );

          }

          else if (
            selectedCategory === 'Accessories'
          ) {

            matchesCategory =
              [
                'Accessories',
                'Bags',
                'Jewelry',
                'Watches',
              ].includes(
                product.category
              );

          }

        }


        return (
          matchesSearch &&
          matchesCategory
        );

      }
    );


  // ==================================================
  // SEARCH BUTTON
  // ==================================================

  const handleSearch = () => {

    const cleanedSearch =
      searchText.trim();

    setSearchText(
      cleanedSearch
    );

    Keyboard.dismiss();

  };


  // ==================================================
  // CLEAR SEARCH
  // ==================================================

  const clearSearch = () => {

    setSearchText('');

    Keyboard.dismiss();

  };


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

      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={
          styles.scrollContent
        }
      >

        {/* ==================================================
            HEADER
        ================================================== */}

        <View
          style={styles.header}
        >

          <View>

            <Text
              style={[
                styles.greeting,
                {
                  color:
                    colors.secondaryText,
                },
              ]}
            >
              {userName
                ? `Welcome back, ${userName} 👋`
                : 'Welcome back 👋'}
            </Text>

            <Text
              style={[
                styles.logo,
                {
                  color:
                    colors.text,
                },
              ]}
            >
              Ogum Samuel
            </Text>

          </View>

        </View>


        {/* ==================================================
            SEARCH
        ================================================== */}

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
            style={
              styles.searchIcon
            }
          >
            🔍
          </Text>


          <TextInput
            placeholder="Search fashion, brands, styles..."
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
            value={searchText}
            onChangeText={
              setSearchText
            }
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="search"
            onSubmitEditing={
              handleSearch
            }
          />


          {searchText.length > 0 && (

            <TouchableOpacity
              style={
                styles.clearButton
              }
              onPress={
                clearSearch
              }
            >

              <Text
                style={[
                  styles.clearText,
                  {
                    color:
                      colors.secondaryText,
                  },
                ]}
              >
                ×
              </Text>

            </TouchableOpacity>

          )}

        </View>


        {/* ==================================================
            SEARCH RESULT HEADER
        ================================================== */}

        {searchText.trim() !== '' && (

          <View
            style={
              styles.searchResultHeader
            }
          >

            <Text
              style={[
                styles.searchResultText,
                {
                  color:
                    colors.secondaryText,
                },
              ]}
            >

              {filteredProducts.length}{' '}

              {filteredProducts.length === 1
                ? 'result'
                : 'results'}{' '}

              for "{searchText.trim()}"

            </Text>


            <TouchableOpacity
              onPress={
                clearSearch
              }
            >

              <Text
                style={[
                  styles.clearSearchText,
                  {
                    color:
                      colors.primary,
                  },
                ]}
              >
                Clear
              </Text>

            </TouchableOpacity>

          </View>

        )}


        {/* ==================================================
            AI BANNER
        ================================================== */}

        {searchText.trim() === '' && (

          <View
            style={[
              styles.banner,
              {
                backgroundColor:
                  isDark
                    ? '#242424'
                    : '#111111',
              },
            ]}
          >

            <View
              style={
                styles.bannerText
              }
            >

              <Text
                style={
                  styles.bannerSmall
                }
              >
                STYLEIQ AI
              </Text>


              <Text
                style={
                  styles.bannerTitle
                }
              >
                Find your perfect style.
              </Text>


              <Text
                style={
                  styles.bannerDescription
                }
              >
                Let AI help you discover
                outfits that match your
                personality.
              </Text>


              <TouchableOpacity
                style={
                  styles.exploreButton
                }
                onPress={() =>
                  router.push(
                    '/ai-stylist'
                  )
                }
              >

                <Text
                  style={
                    styles.exploreText
                  }
                >
                  Explore Style
                </Text>

              </TouchableOpacity>

            </View>


            <Text
              style={
                styles.bannerEmoji
              }
            >
              👗
            </Text>

          </View>

        )}


        {/* ==================================================
            CATEGORIES
        ================================================== */}

        <View
          style={
            styles.sectionHeader
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
            Categories
          </Text>


          <TouchableOpacity
            onPress={() =>
              setSelectedCategory(
                'All'
              )
            }
          >

            <Text
              style={[
                styles.seeAll,
                {
                  color:
                    colors.primary,
                },
              ]}
            >
              See all
            </Text>

          </TouchableOpacity>

        </View>


        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={
            styles.categoryList
          }
        >

          {categories.map(
            (category) => (

              <TouchableOpacity
                key={
                  category.name
                }
                style={[

                  styles.categoryCard,

                  {
                    backgroundColor:
                      colors.card,

                    borderColor:
                      colors.border,
                  },

                  selectedCategory ===
                    category.name && {

                    backgroundColor:
                      colors.primary,

                    borderColor:
                      colors.primary,

                  },

                ]}
                onPress={() => {

                  setSelectedCategory(
                    category.name
                  );

                  Keyboard.dismiss();

                }}
              >

                <Text
                  style={
                    styles.categoryEmoji
                  }
                >
                  {category.emoji}
                </Text>


                <Text
                  style={[

                    styles.categoryText,

                    {
                      color:
                        colors.secondaryText,
                    },

                    selectedCategory ===
                      category.name && {

                      color:
                        colors.white,

                    },

                  ]}
                >
                  {category.name}
                </Text>

              </TouchableOpacity>

            )
          )}

        </ScrollView>


        {/* ==================================================
            USER PREFERENCES
        ================================================== */}

        {userStyles.length > 0 &&
          searchText.trim() === '' && (

            <View
              style={[
                styles.preferenceCard,
                {
                  backgroundColor:
                    colors.primaryLight,
                },
              ]}
            >

              <Text
                style={[
                  styles.preferenceTitle,
                  {
                    color:
                      isDark
                        ? colors.white
                        : colors.text,
                  },
                ]}
              >
                Your Style
              </Text>


              <Text
                style={[
                  styles.preferenceText,
                  {
                    color:
                      isDark
                        ? '#D0C5FF'
                        : colors.secondaryText,
                  },
                ]}
              >
                {userStyles.join(
                  ' • '
                )}
              </Text>


              {userColors.length > 0 && (

                <Text
                  style={[
                    styles.preferenceText,
                    {
                      color:
                        isDark
                          ? '#D0C5FF'
                          : colors.secondaryText,
                    },
                  ]}
                >
                  Colors:{' '}
                  {userColors.join(
                    ', '
                  )}
                </Text>

              )}


              {userCategories.length > 0 && (

                <Text
                  style={[
                    styles.preferenceText,
                    {
                      color:
                        isDark
                          ? '#D0C5FF'
                          : colors.secondaryText,
                    },
                  ]}
                >
                  Shopping for:{' '}
                  {userCategories.join(
                    ', '
                  )}
                </Text>

              )}

            </View>

          )}


        {/* ==================================================
            RECOMMENDED TITLE
        ================================================== */}

        {searchText.trim() === '' && (

          <View
            style={
              styles.sectionHeader
            }
          >

            <View>

              <Text
                style={[
                  styles.sectionTitle,
                  {
                    color:
                      colors.text,
                  },
                ]}
              >
                Recommended for you
              </Text>


              <Text
                style={[
                  styles.sectionSubtitle,
                  {
                    color:
                      colors.secondaryText,
                  },
                ]}
              >

                {userStyles.length > 0
                  ? `Based on your ${userStyles[0]} style`
                  : 'Selected by StyleIQ'}

              </Text>

            </View>


            <TouchableOpacity
              onPress={() =>
                setSelectedCategory(
                  'All'
                )
              }
            >

              <Text
                style={[
                  styles.seeAll,
                  {
                    color:
                      colors.primary,
                  },
                ]}
              >
                See all
              </Text>

            </TouchableOpacity>

          </View>

        )}


        {/* ==================================================
            SEARCH RESULTS TITLE
        ================================================== */}

        {searchText.trim() !== '' && (

          <View
            style={
              styles.searchProductsHeader
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
              Search Results
            </Text>

          </View>

        )}


        {/* ==================================================
            PRODUCTS
        ================================================== */}

        {loadingProducts ? (

          <View
            style={
              styles.loadingProducts
            }
          >

            <ActivityIndicator
              size="large"
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
              Loading products...
            </Text>

          </View>

        ) : filteredProducts.length > 0 ? (

          <View
            style={
              styles.productGrid
            }
          >

            {filteredProducts.map(
              (product) => {

                const isFavorite =
                  favorites.includes(
                    product.id
                  );


                return (

                  <TouchableOpacity
                    key={
                      product.id
                    }
                    style={[
                      styles.productCard,
                      {
                        backgroundColor:
                          colors.card,
                      },
                    ]}
                    activeOpacity={0.8}
                    onPress={() =>
                      router.push({
                        pathname:
                          '/product/[id]',
                        params: {
                          id:
                            product.id,
                        },
                      })
                    }
                  >

                    <View
                      style={[
                        styles.imageContainer,
                        {
                          backgroundColor:
                            isDark
                              ? '#292929'
                              : '#F1F1F1',
                        },
                      ]}
                    >

                      <Image
                        source={{
                          uri:
                            product.image,
                        }}
                        style={
                          styles.productImage
                        }
                      />


                      {/* WISHLIST */}

                      <TouchableOpacity
                        style={
                          styles.heartButton
                        }
                        activeOpacity={
                          0.7
                        }
                        onPress={(
                          event
                        ) => {

                          event.stopPropagation();

                          toggleFavorite(
                            product
                          );

                        }}
                      >

                        <Text
                          style={[

                            styles.heart,

                            isFavorite &&
                              styles.heartActive,

                          ]}
                        >

                          {isFavorite
                            ? '♥️'
                            : '♡'}

                        </Text>

                      </TouchableOpacity>

                    </View>


                    <View
                      style={
                        styles.productInfo
                      }
                    >

                      <Text
                        style={[
                          styles.productCategory,
                          {
                            color:
                              colors.secondaryText,
                          },
                        ]}
                      >
                        {
                          product.category
                        }
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
                        {
                          product.name
                        }
                      </Text>


                      <Text
                        style={[
                          styles.productPrice,
                          {
                            color:
                              colors.text,
                          },
                        ]}
                      >
                        {
                          product.price
                        }
                      </Text>

                    </View>

                  </TouchableOpacity>

                );

              }
            )}

          </View>

        ) : (

          /* ==================================================
             NO RESULTS
          ================================================== */

          <View
            style={[
              styles.noResults,
              {
                backgroundColor:
                  colors.card,

                borderColor:
                  colors.border,
              },
            ]}
          >

            <Text
              style={
                styles.noResultsIcon
              }
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
              No products found
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
              {products.length === 0
                ? 'No products have been added yet.'
                : 'Try searching for another product, color, category, gender, or style.'}
            </Text>


            <TouchableOpacity
              style={[
                styles.clearSearchButton,
                {
                  backgroundColor:
                    colors.primary,
                },
              ]}
              onPress={
                clearSearch
              }
            >

              <Text
                style={
                  styles.clearSearchButtonText
                }
              >
                Clear Search
              </Text>

            </TouchableOpacity>

          </View>

        )}


        {/* ==================================================
            AI STYLING
        ================================================== */}

        {searchText.trim() === '' && (

          <View
            style={[
              styles.aiSection,
              {
                backgroundColor:
                  colors.card,

                borderColor:
                  colors.border,
              },
            ]}
          >

            <Text
              style={
                styles.aiIcon
              }
            >
              ✨
            </Text>


            <View
              style={
                styles.aiContent
              }
            >

              <Text
                style={[
                  styles.aiTitle,
                  {
                    color:
                      colors.text,
                  },
                ]}
              >
                Need outfit inspiration?
              </Text>


              <Text
                style={[
                  styles.aiDescription,
                  {
                    color:
                      colors.secondaryText,
                  },
                ]}
              >
                Tell StyleIQ what you're
                looking for and our AI stylist
                will create a look for you.
              </Text>


              <TouchableOpacity
                style={[
                  styles.aiButton,
                  {
                    backgroundColor:
                      colors.primary,
                  },
                ]}
                onPress={() =>
                  router.push(
                    '/ai-stylist'
                  )
                }
              >

                <Text
                  style={
                    styles.aiButtonText
                  }
                >
                  Ask StyleIQ Ai
                </Text>

              </TouchableOpacity>

            </View>

          </View>

        )}


        <View
          style={{
            height: 30,
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

        <TouchableOpacity
          style={
            styles.navItem
          }
        >

          <Text
            style={[
              styles.navIconActive,
              {
                color:
                  colors.primary,
              },
            ]}
          >
            ⌂
          </Text>

          <Text
            style={[
              styles.navTextActive,
              {
                color:
                  colors.primary,
              },
            ]}
          >
            Home
          </Text>

        </TouchableOpacity>


        {/* CART */}

        <TouchableOpacity
          style={[
            styles.addButton,
            {
              backgroundColor:
                colors.primary,
            },
          ]}
          onPress={() =>
            router.push(
              '/cart'
            )
          }
        >

          <Text
            style={
              styles.cartIcon
            }
          >
            🛍️
          </Text>


          {cartCount > 0 && (

            <View
              style={[
                styles.cartBadge,
                {
                  borderColor:
                    colors.card,
                },
              ]}
            >

              <Text
                style={
                  styles.cartBadgeText
                }
              >
                {cartCount > 99
                  ? '99+'
                  : cartCount}
              </Text>

            </View>

          )}

        </TouchableOpacity>


        {/* PROFILE */}

        <TouchableOpacity
          style={
            styles.navItem
          }
          onPress={() =>
            router.push(
              '/profile'
            )
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

        </TouchableOpacity>

      </View>

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
    paddingBottom: 100,
  },


  // ==================================================
  // PREFERENCE
  // ==================================================

  preferenceCard: {
    borderRadius: 18,
    padding: 17,
    marginBottom: 25,
  },

  preferenceTitle: {
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 6,
  },

  preferenceText: {
    fontSize: 12,
    lineHeight: 19,
  },


  // ==================================================
  // HEADER
  // ==================================================

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 15,
    marginBottom: 20,
  },

  greeting: {
    fontSize: 13,
    marginBottom: 3,
  },

  logo: {
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -1,
  },

  profileButton: {
    width: 45,
    height: 45,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
  },

  profileIcon: {
    fontSize: 20,
  },


  // ==================================================
  // SEARCH
  // ==================================================

  searchContainer: {
    height: 52,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    marginBottom: 20,
    borderWidth: 1,
  },

  searchIcon: {
    fontSize: 17,
    marginHorizontal: 6,
  },

  searchInput: {
    flex: 1,
    fontSize: 14,
    paddingHorizontal: 5,
  },

  searchButton: {
    width: 38,
    height: 38,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },

  searchButtonText: {
    fontSize: 17,
    color: '#FFF',
  },

  clearButton: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 5,
  },

  clearText: {
    fontSize: 23,
    lineHeight: 25,
  },

  searchResultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 15,
  },

  searchResultText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
  },

  clearSearchText: {
    fontSize: 12,
    fontWeight: '800',
  },

  searchProductsHeader: {
    marginBottom: 14,
  },


  // ==================================================
  // BANNER
  // ==================================================

  banner: {
    borderRadius: 22,
    padding: 22,
    minHeight: 190,
    flexDirection: 'row',
    overflow: 'hidden',
    marginBottom: 28,
  },

  bannerText: {
    flex: 1,
    zIndex: 2,
  },

  bannerSmall: {
    color: '#BDBDBD',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.5,
    marginBottom: 8,
  },

  bannerTitle: {
    color: '#FFF',
    fontSize: 24,
    fontWeight: '800',
    lineHeight: 29,
    maxWidth: 230,
  },

  bannerDescription: {
    color: '#C7C7C7',
    fontSize: 12,
    lineHeight: 18,
    marginTop: 8,
    maxWidth: 230,
  },

  bannerEmoji: {
    position: 'absolute',
    right: 5,
    bottom: -15,
    fontSize: 110,
    opacity: 0.9,
  },

  exploreButton: {
    backgroundColor: '#FFF',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginTop: 14,
  },

  exploreText: {
    color: '#111',
    fontSize: 12,
    fontWeight: '700',
  },


  // ==================================================
  // SECTIONS
  // ==================================================

  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },

  sectionTitle: {
    fontSize: 19,
    fontWeight: '800',
  },

  sectionSubtitle: {
    fontSize: 12,
    marginTop: 3,
  },

  seeAll: {
    fontSize: 12,
    fontWeight: '700',
  },


  // ==================================================
  // CATEGORIES
  // ==================================================

  categoryList: {
    paddingBottom: 28,
  },

  categoryCard: {
    borderRadius: 15,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginRight: 10,
    alignItems: 'center',
    minWidth: 75,
    borderWidth: 1,
  },

  categoryEmoji: {
    fontSize: 20,
    marginBottom: 5,
  },

  categoryText: {
    fontSize: 11,
    fontWeight: '600',
  },


  // ==================================================
  // PRODUCTS
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
  },

  imageContainer: {
    height: 190,
    position: 'relative',
  },

  productImage: {
    width: '100%',
    height: '100%',
  },

  heartButton: {
    position: 'absolute',
    right: 10,
    top: 10,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor:
      'rgba(255,255,255,0.9)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  heart: {
    fontSize: 23,
    color: '#111',
  },

  heartActive: {
    color: '#FF0000',
  },

  productInfo: {
    padding: 11,
  },

  productCategory: {
    fontSize: 9,
    textTransform: 'uppercase',
    fontWeight: '700',
    marginBottom: 3,
  },

  productName: {
    fontSize: 13,
    fontWeight: '700',
  },

  productPrice: {
    fontSize: 14,
    fontWeight: '800',
    marginTop: 5,
  },


  // ==================================================
  // LOADING
  // ==================================================

  loadingProducts: {
    minHeight: 220,
    alignItems: 'center',
    justifyContent: 'center',
  },

  loadingText: {
    fontSize: 12,
    marginTop: 12,
  },


  // ==================================================
  // NO RESULTS
  // ==================================================

  noResults: {
    borderRadius: 20,
    paddingVertical: 45,
    paddingHorizontal: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 25,
    borderWidth: 1,
  },

  noResultsIcon: {
    fontSize: 40,
    marginBottom: 12,
  },

  noResultsTitle: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 7,
  },

  noResultsText: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
    maxWidth: 280,
  },

  clearSearchButton: {
    paddingHorizontal: 20,
    paddingVertical: 11,
    borderRadius: 20,
    marginTop: 18,
  },

  clearSearchButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },


  // ==================================================
  // AI SECTION
  // ==================================================

  aiSection: {
    borderRadius: 20,
    padding: 20,
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderWidth: 1,
  },

  aiIcon: {
    fontSize: 27,
    marginRight: 12,
  },

  aiContent: {
    flex: 1,
  },

  aiTitle: {
    fontSize: 17,
    fontWeight: '800',
    marginBottom: 5,
  },

  aiDescription: {
    fontSize: 12,
    lineHeight: 18,
  },

  aiButton: {
    alignSelf: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 18,
    marginTop: 12,
  },

  aiButtonText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
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


  // ==================================================
  // CART
  // ==================================================

  addButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -20,
  },

  cartIcon: {
    color: '#FFF',
    fontSize: 22,
    fontWeight: '300',
  },

  cartBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#FF0000',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    borderWidth: 2,
  },

  cartBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },

});