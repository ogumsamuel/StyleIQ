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
  TextInput,
  View,
} from 'react-native';

import { router } from 'expo-router';

import {
  collection,
  addDoc,
  getDocs,
  serverTimestamp,
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
  priceValue?: number;
  category: string;
  gender?: 'Men' | 'Women' | 'Unisex';
  style: string[];
  color: string;
  description?: string;
  image: string;
};


// ==================================================
// CREATE LOOK
// ==================================================

export default function CreateLook() {

  // ==================================================
  // GLOBAL THEME
  // ==================================================

  const { colors } = useTheme();


  // ==================================================
  // STATE
  // ==================================================

  const [lookName, setLookName] =
    useState('');

  const [products, setProducts] =
    useState<Product[]>([]);

  const [selectedProducts, setSelectedProducts] =
    useState<string[]>([]);

  const [loadingProducts, setLoadingProducts] =
    useState(true);

  const [saving, setSaving] =
    useState(false);


  // ==================================================
  // LOAD PRODUCTS FROM FIRESTORE
  // ==================================================

  useEffect(() => {

    const loadProducts = async () => {

      try {

        setLoadingProducts(true);

        const productsRef =
          collection(db, 'products');

        const snapshot =
          await getDocs(productsRef);

        const firestoreProducts: Product[] =
          snapshot.docs.map((document) => {

            const data =
              document.data();

            return {
              id: document.id,

              name:
                data.name ?? '',

              price:
                data.price ?? '',

              priceValue:
                data.priceValue ?? 0,

              category:
                data.category ?? '',

              gender:
                data.gender,

              style:
                Array.isArray(data.style)
                  ? data.style
                  : [],

              color:
                data.color ?? '',

              description:
                data.description ?? '',

              image:
                data.image ?? '',
            };

          });

        setProducts(firestoreProducts);

      } catch (error) {

        console.error(
          'Load products error:',
          error
        );

        Alert.alert(
          'Unable to load products',
          'We could not load the available products. Please try again.'
        );

      } finally {

        setLoadingProducts(false);

      }

    };


    loadProducts();

  }, []);


  // ==================================================
  // SELECT / DESELECT PRODUCT
  // ==================================================

  const toggleProduct = (
    productId: string
  ) => {

    setSelectedProducts((previous) => {

      if (previous.includes(productId)) {

        return previous.filter(
          id => id !== productId
        );

      }

      return [
        ...previous,
        productId,
      ];

    });

  };


  // ==================================================
  // SAVE LOOK
  // ==================================================

  const saveLook = async () => {

    const user = auth.currentUser;


    // ----------------------------------------------
    // SIGN IN CHECK
    // ----------------------------------------------

    if (!user) {

      Alert.alert(
        'Sign in required',
        'Please sign in before saving a look.',
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


    // ----------------------------------------------
    // NAME CHECK
    // ----------------------------------------------

    const cleanedName =
      lookName.trim();

    if (!cleanedName) {

      Alert.alert(
        'Name your look',
        'Please give your outfit a name.'
      );

      return;
    }


    // ----------------------------------------------
    // PRODUCT CHECK
    // ----------------------------------------------

    if (
      selectedProducts.length === 0
    ) {

      Alert.alert(
        'Choose products',
        'Please select at least one product for your look.'
      );

      return;
    }


    try {

      setSaving(true);


      // --------------------------------------------
      // GET SELECTED PRODUCTS
      // --------------------------------------------

      const selectedProductObjects =
        products.filter(product =>
          selectedProducts.includes(
            product.id
          )
        );


      // --------------------------------------------
      // SAVE TO FIRESTORE
      // --------------------------------------------

      const outfitsRef = collection(
        db,
        'users',
        user.uid,
        'outfits'
      );


      await addDoc(
        outfitsRef,
        {
          name: cleanedName,

          productIds:
            selectedProductObjects.map(
              product => product.id
            ),

          products:
            selectedProductObjects.map(
              product => ({
                id: product.id,
                name: product.name,
                image: product.image,
                price: product.price,
              })
            ),

          createdAt:
            serverTimestamp(),
        }
      );


      // --------------------------------------------
      // SUCCESS
      // --------------------------------------------

      Alert.alert(
        'Look Saved ✨',
        `${cleanedName} has been saved to My Outfits.`,
        [
          {
            text: 'View My Looks',
            onPress: () =>
              router.replace(
                '/my-outfits'
              ),
          },
        ]
      );

    } catch (error) {

      console.log(
        'Save look error:',
        error
      );

      Alert.alert(
        'Error',
        'We could not save your look. Please try again.'
      );

    } finally {

      setSaving(false);

    }

  };


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
            style={[
              styles.backButton,
              {
                backgroundColor:
                  colors.card,
                borderColor:
                  colors.border,
              },
            ]}
            onPress={() =>
              router.back()
            }
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


          <View
            style={styles.headerCenter}
          >

            <Text
              style={[
                styles.headerTitle,
                {
                  color: colors.text,
                },
              ]}
            >
              Create Look
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
              Build your perfect outfit
            </Text>

          </View>


          <View
            style={styles.headerSpacer}
          />

        </View>


        {/* ==========================================
            LOOK NAME
        ========================================== */}

        <View
          style={styles.nameSection}
        >

          <Text
            style={[
              styles.sectionTitle,
              {
                color: colors.text,
              },
            ]}
          >
            Name your look
          </Text>

          <TextInput
            value={lookName}
            onChangeText={setLookName}
            placeholder="e.g. Weekend Casual"
            placeholderTextColor={
              colors.secondaryText
            }
            style={[
              styles.nameInput,
              {
                backgroundColor:
                  colors.input,
                borderColor:
                  colors.border,
                color:
                  colors.text,
              },
            ]}
            maxLength={40}
          />

        </View>


        {/* ==========================================
            SELECTED COUNT
        ========================================== */}

        <View
          style={styles.selectionHeader}
        >

          <View>

            <Text
              style={[
                styles.sectionTitle,
                {
                  color: colors.text,
                },
              ]}
            >
              Choose your pieces
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
              Select the products you want
              in this look.
            </Text>

          </View>


          <View
            style={[
              styles.countBadge,
              {
                backgroundColor:
                  colors.primary,
              },
            ]}
          >

            <Text
              style={[
                styles.countText,
                {
                  color: colors.white,
                },
              ]}
            >
              {selectedProducts.length}
            </Text>

          </View>

        </View>


        {/* ==========================================
            PRODUCTS
        ========================================== */}

        {loadingProducts ? (

          <View
            style={[
              styles.loadingProducts,
              {
                backgroundColor:
                  colors.card,
                borderColor:
                  colors.border,
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
              Loading products...
            </Text>

          </View>

        ) : products.length === 0 ? (

          <View
            style={[
              styles.emptyProducts,
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
                styles.emptyTitle,
                {
                  color:
                    colors.text,
                },
              ]}
            >
              No products available
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
              Products added from the StyleIQ Admin
              Dashboard will appear here.
            </Text>

          </View>

        ) : (

          <View
            style={styles.productGrid}
          >

            {products.map(product => {

              const selected =
                selectedProducts.includes(
                  product.id
                );


              return (

                <Pressable
                  key={product.id}
                  style={[
                    styles.productCard,
                    {
                      backgroundColor:
                        colors.card,
                      borderColor:
                        selected
                          ? colors.primary
                          : colors.border,
                    },
                  ]}
                  onPress={() =>
                    toggleProduct(
                      product.id
                    )
                  }
                >

                  {/* IMAGE */}

                  <View
                    style={[
                      styles.imageContainer,
                      {
                        backgroundColor:
                          colors.input,
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


                    {/* SELECTION */}

                    <View
                      style={[
                        styles.selectionCircle,
                        {
                          backgroundColor:
                            selected
                              ? colors.primary
                              : colors.card,
                          borderColor:
                            selected
                              ? colors.primary
                              : colors.border,
                        },
                      ]}
                    >

                      <Text
                        style={
                          styles.checkText
                        }
                      >
                        {selected
                          ? '✓'
                          : ''}
                      </Text>

                    </View>

                  </View>


                  {/* INFORMATION */}

                  <View
                    style={styles.productInfo}
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
                        styles.productPrice,
                        {
                          color:
                            colors.text,
                        },
                      ]}
                    >
                      {product.price}
                    </Text>

                  </View>

                </Pressable>

              );

            })}

          </View>

        )}


        {/* ==========================================
            SELECTED ITEMS
        ========================================== */}

        {selectedProducts.length > 0 && (

          <View
            style={styles.selectedSection}
          >

            <Text
              style={[
                styles.sectionTitle,
                {
                  color: colors.text,
                },
              ]}
            >
              Your selected pieces
            </Text>


            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={
                styles.selectedList
              }
            >

              {products
                .filter(product =>
                  selectedProducts.includes(
                    product.id
                  )
                )
                .map(product => (

                  <View
                    key={product.id}
                    style={
                      styles.selectedItem
                    }
                  >

                    <Image
                      source={{
                        uri: product.image,
                      }}
                      style={[
                        styles.selectedImage,
                        {
                          backgroundColor:
                            colors.input,
                        },
                      ]}
                    />

                    <Text
                      style={[
                        styles.selectedName,
                        {
                          color:
                            colors.secondaryText,
                        },
                      ]}
                      numberOfLines={1}
                    >
                      {product.name}
                    </Text>

                  </View>

                ))}

            </ScrollView>

          </View>

        )}


        {/* ==========================================
            SAVE BUTTON
        ========================================== */}

        <Pressable
          style={[
            styles.saveButton,
            {
              backgroundColor:
                colors.primary,
            },
            (
              saving ||
              selectedProducts.length === 0 ||
              !lookName.trim()
            ) &&
              styles.saveButtonDisabled,
          ]}
          disabled={
            saving ||
            selectedProducts.length === 0 ||
            !lookName.trim()
          }
          onPress={saveLook}
        >

          <Text
            style={[
              styles.saveButtonText,
              {
                color: colors.white,
              },
            ]}
          >
            {saving
              ? 'Saving...'
              : 'Save Look ✨'}
          </Text>

        </Pressable>


        <View
          style={{
            height: 40,
          }}
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
    paddingBottom: 30,
  },


  // ================================================
  // HEADER
  // ================================================

  header: {
    height: 75,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  backButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  backIcon: {
    fontSize: 38,
    fontWeight: '300',
    marginTop: -4,
  },

  headerCenter: {
    alignItems: 'center',
  },

  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
  },

  headerSubtitle: {
    fontSize: 11,
    marginTop: 3,
  },

  headerSpacer: {
    width: 42,
  },


  // ================================================
  // NAME
  // ================================================

  nameSection: {
    marginTop: 10,
    marginBottom: 28,
  },

  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
  },

  nameInput: {
    height: 52,
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 15,
    fontSize: 14,
    marginTop: 10,
  },


  // ================================================
  // SELECTION HEADER
  // ================================================

  selectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 15,
  },

  sectionSubtitle: {
    fontSize: 11,
    marginTop: 4,
  },

  countBadge: {
    width: 35,
    height: 35,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },

  countText: {
    fontSize: 13,
    fontWeight: '800',
  },


  // ================================================
  // PRODUCTS
  // ================================================

  productGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },

  productCard: {
    width: '48%',
    borderRadius: 17,
    overflow: 'hidden',
    marginBottom: 17,
    borderWidth: 2,
  },

  imageContainer: {
    height: 180,
    position: 'relative',
  },

  productImage: {
    width: '100%',
    height: '100%',
  },

  selectionCircle: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 29,
    height: 29,
    borderRadius: 15,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  checkText: {
    fontSize: 17,
    fontWeight: '800',
    color: '#FFFFFF',
  },

  productInfo: {
    padding: 11,
  },

  productCategory: {
    fontSize: 9,
    textTransform: 'uppercase',
    fontWeight: '700',
  },

  productName: {
    fontSize: 13,
    fontWeight: '700',
    marginTop: 3,
  },

  productPrice: {
    fontSize: 13,
    fontWeight: '800',
    marginTop: 5,
  },


  // ================================================
  // LOADING / EMPTY
  // ================================================

  loadingProducts: {
    minHeight: 220,
    borderRadius: 17,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },

  loadingText: {
    fontSize: 13,
    marginTop: 12,
  },

  emptyProducts: {
    minHeight: 180,
    borderRadius: 17,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 25,
    marginBottom: 20,
  },

  emptyTitle: {
    fontSize: 16,
    fontWeight: '800',
    textAlign: 'center',
  },

  emptyText: {
    fontSize: 12,
    lineHeight: 18,
    textAlign: 'center',
    marginTop: 8,
  },


  // ================================================
  // SELECTED
  // ================================================

  selectedSection: {
    marginTop: 12,
  },

  selectedList: {
    paddingTop: 12,
    paddingBottom: 5,
  },

  selectedItem: {
    width: 80,
    marginRight: 12,
  },

  selectedImage: {
    width: 80,
    height: 80,
    borderRadius: 14,
  },

  selectedName: {
    fontSize: 10,
    fontWeight: '600',
    marginTop: 5,
  },


  // ================================================
  // SAVE
  // ================================================

  saveButton: {
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 28,
  },

  saveButtonDisabled: {
    opacity: 0.45,
  },

  saveButtonText: {
    fontSize: 15,
    fontWeight: '800',
  },

});