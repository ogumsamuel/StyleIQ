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
} from 'expo-router';

import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
} from 'firebase/firestore';

import { auth, db } from '../src/services/firebase';

// ==================================================
// THEME
// ==================================================

import { useTheme } from '../src/theme/ThemeContext';


// ==================================================
// OUTFIT TYPE
// ==================================================

type Outfit = {
  id: string;

  name: string;

  productIds: string[];

  products: {
    id: string;
    name: string;
    image: string;
    price?: string;
  }[];

  createdAt?: any;
};


// ==================================================
// MY OUTFITS
// ==================================================

export default function MyOutfits() {

  // ==================================================
  // GLOBAL THEME
  // ==================================================

  const { colors, isDark } = useTheme();


  // ==================================================
  // STATE
  // ==================================================

  const [outfits, setOutfits] =
    useState<Outfit[]>([]);

  const [loading, setLoading] =
    useState(true);


  // ==================================================
  // LOAD OUTFITS
  // ==================================================

  const loadOutfits = async () => {

    const user = auth.currentUser;

    if (!user) {

      setOutfits([]);

      setLoading(false);

      return;
    }

    try {

      setLoading(true);

      const outfitsRef = collection(
        db,
        'users',
        user.uid,
        'outfits'
      );

      const outfitsQuery = query(
        outfitsRef,
        orderBy('createdAt', 'desc')
      );

      const snapshot =
        await getDocs(outfitsQuery);

      const loadedOutfits: Outfit[] =
        snapshot.docs.map((item) => {

          const data = item.data();

          return {

            id: item.id,

            name:
              data.name ||
              'My Look',

            productIds:
              Array.isArray(data.productIds)
                ? data.productIds
                : [],

            products:
              Array.isArray(data.products)
                ? data.products
                : [],

            createdAt:
              data.createdAt,

          };
        });

      setOutfits(
        loadedOutfits
      );

    } catch (error) {

      console.log(
        'Error loading outfits:',
        error
      );

      Alert.alert(
        'Error',
        'We could not load your saved looks.'
      );

    } finally {

      setLoading(false);

    }
  };


  // ==================================================
  // REFRESH WHEN SCREEN OPENS
  // ==================================================

  useFocusEffect(
    useCallback(() => {

      loadOutfits();

    }, [])
  );


  // ==================================================
  // DELETE OUTFIT
  // ==================================================

  const deleteOutfit = async (
    outfitId: string
  ) => {

    const user = auth.currentUser;

    if (!user) {
      return;
    }

    Alert.alert(
      'Delete Look',
      'Are you sure you want to delete this look?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },

        {
          text: 'Delete',
          style: 'destructive',

          onPress: async () => {

            try {

              await deleteDoc(
                doc(
                  db,
                  'users',
                  user.uid,
                  'outfits',
                  outfitId
                )
              );

              setOutfits(
                previous =>
                  previous.filter(
                    outfit =>
                      outfit.id !== outfitId
                  )
              );

            } catch (error) {

              console.log(
                'Delete outfit error:',
                error
              );

              Alert.alert(
                'Error',
                'We could not delete this look.'
              );

            }
          },
        },
      ]
    );
  };


  // ==================================================
  // NOT SIGNED IN
  // ==================================================

  if (!auth.currentUser) {

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

        <View
          style={styles.emptyContainer}
        >

          <Text
            style={styles.emptyIcon}
          >
            👗
          </Text>


          <Text
            style={[
              styles.emptyTitle,
              {
                color: colors.text,
              },
            ]}
          >
            Sign in to see your looks
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
            Save your favorite outfit
            combinations and access them
            anytime.
          </Text>


          <Pressable
            style={[
              styles.primaryButton,
              {
                backgroundColor:
                  colors.primary,
              },
            ]}
            onPress={() =>
              router.push('/signin')
            }
          >

            <Text
              style={styles.primaryButtonText}
            >
              Sign In
            </Text>

          </Pressable>

        </View>

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
              My Outfits
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
              Your saved looks
            </Text>

          </View>


          <View
            style={styles.headerSpacer}
          />

        </View>


        {/* ==========================================
            CREATE LOOK
        ========================================== */}

        <Pressable
          style={({ pressed }) => [

            styles.createButton,

            {
              backgroundColor:
                isDark
                  ? colors.card
                  : colors.black,
            },

            pressed &&
              styles.buttonPressed,

          ]}
          onPress={() =>
            router.push('/create-look')
          }
        >

          <Text
            style={[
              styles.createIcon,
              {
                backgroundColor:
                  colors.white,
                color:
                  colors.black,
              },
            ]}
          >
            +
          </Text>


          <View>

            <Text
              style={styles.createTitle}
            >
              Create New Look
            </Text>


            <Text
              style={[
                styles.createSubtitle,
                {
                  color:
                    isDark
                      ? colors.secondaryText
                      : '#BDBDBD',
                },
              ]}
            >
              Build an outfit from your
              favorite pieces
            </Text>

          </View>

        </Pressable>


        {/* ==========================================
            TITLE
        ========================================== */}

        <View
          style={styles.sectionHeader}
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
              Your Looks
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

              {outfits.length}{' '}

              {outfits.length === 1
                ? 'saved look'
                : 'saved looks'}

            </Text>

          </View>

        </View>


        {/* ==========================================
            LOADING
        ========================================== */}

        {loading ? (

          <View
            style={styles.loadingContainer}
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
              Loading your looks...
            </Text>

          </View>

        ) : outfits.length === 0 ? (

          /* ========================================
             EMPTY STATE
          ======================================== */

          <View
            style={[
              styles.emptyCard,
              {
                backgroundColor:
                  colors.card,

                borderColor:
                  colors.border,
              },
            ]}
          >

            <Text
              style={styles.emptyIcon}
            >
              ✨
            </Text>


            <Text
              style={[
                styles.emptyTitle,
                {
                  color:
                    colors.text,
                },
              ]}
            >
              No saved looks yet
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
              Create your first outfit and
              save it here for easy access
              later.
            </Text>


            <Pressable
              style={[
                styles.primaryButton,
                {
                  backgroundColor:
                    colors.primary,
                },
              ]}
              onPress={() =>
                router.push('/create-look')
              }
            >

              <Text
                style={
                  styles.primaryButtonText
                }
              >
                Create Your First Look
              </Text>

            </Pressable>

          </View>

        ) : (

          /* ========================================
             SAVED OUTFITS
          ======================================== */

          <View
            style={styles.outfitList}
          >

            {outfits.map((outfit) => (

              <View
                key={outfit.id}
                style={[
                  styles.outfitCard,
                  {
                    backgroundColor:
                      colors.card,

                    borderColor:
                      colors.border,
                  },
                ]}
              >

                {/* PRODUCT IMAGES */}

                <View
                  style={styles.imageGrid}
                >

                  {outfit.products
                    .slice(0, 4)
                    .map((product) => (

                      <Image
                        key={product.id}
                        source={{
                          uri:
                            product.image,
                        }}
                        style={
                          styles.outfitImage
                        }
                      />

                    ))}

                </View>


                {/* INFO */}

                <View
                  style={styles.outfitInfo}
                >

                  <View
                    style={
                      styles.outfitTitleRow
                    }
                  >

                    <View
                      style={
                        styles.outfitTitleContainer
                      }
                    >

                      <Text
                        style={[
                          styles.outfitName,
                          {
                            color:
                              colors.text,
                          },
                        ]}
                        numberOfLines={1}
                      >
                        {outfit.name}
                      </Text>


                      <Text
                        style={[
                          styles.itemCount,
                          {
                            color:
                              colors.secondaryText,
                          },
                        ]}
                      >

                        {outfit.products.length}{' '}

                        {outfit.products.length === 1
                          ? 'item'
                          : 'items'}

                      </Text>

                    </View>


                    {/* DELETE */}

                    <Pressable
                      onPress={() =>
                        deleteOutfit(
                          outfit.id
                        )
                      }
                      style={[
                        styles.deleteButton,
                        {
                          backgroundColor:
                            colors.input,
                        },
                      ]}
                    >

                      <Text
                        style={
                          styles.deleteText
                        }
                      >
                        🗑️
                      </Text>

                    </Pressable>

                  </View>


                  {/* VIEW LOOK */}

                  <Pressable
                    style={[
                      styles.viewButton,
                      {
                        backgroundColor:
                          colors.primary,
                      },
                    ]}
                    onPress={() =>
                      Alert.alert(
                        outfit.name,
                        'Outfit details will be connected next.'
                      )
                    }
                  >

                    <Text
                      style={
                        styles.viewButtonText
                      }
                    >
                      View Look
                    </Text>

                  </Pressable>

                </View>

              </View>

            ))}

          </View>

        )}


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
    paddingBottom: 40,
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
  // CREATE
  // ================================================

  createButton: {
    borderRadius: 20,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 28,
  },


  createIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    fontSize: 28,
    textAlign: 'center',
    lineHeight: 40,
    marginRight: 13,
  },


  createTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },


  createSubtitle: {
    fontSize: 11,
    marginTop: 4,
  },


  buttonPressed: {
    opacity: 0.8,
  },


  // ================================================
  // SECTION
  // ================================================

  sectionHeader: {
    marginBottom: 15,
  },


  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
  },


  sectionSubtitle: {
    fontSize: 12,
    marginTop: 3,
  },


  // ================================================
  // LOADING
  // ================================================

  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 70,
  },


  loadingText: {
    fontSize: 13,
    marginTop: 12,
  },


  // ================================================
  // EMPTY
  // ================================================

  emptyCard: {
    borderRadius: 22,
    paddingHorizontal: 25,
    paddingVertical: 50,
    alignItems: 'center',
    borderWidth: 1,
  },


  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 30,
  },


  emptyIcon: {
    fontSize: 45,
    marginBottom: 15,
  },


  emptyTitle: {
    fontSize: 20,
    fontWeight: '800',
    textAlign: 'center',
  },


  emptyText: {
    fontSize: 13,
    lineHeight: 20,
    textAlign: 'center',
    marginTop: 8,
    maxWidth: 300,
  },


  primaryButton: {
    borderRadius: 16,
    paddingHorizontal: 22,
    paddingVertical: 13,
    marginTop: 20,
  },


  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },


  // ================================================
  // OUTFITS
  // ================================================

  outfitList: {
    gap: 18,
  },


  outfitCard: {
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
  },


  imageGrid: {
    height: 210,
    flexDirection: 'row',
    flexWrap: 'wrap',
    backgroundColor: '#F1F1F1',
  },


  outfitImage: {
    width: '50%',
    height: '50%',
  },


  outfitInfo: {
    padding: 15,
  },


  outfitTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },


  outfitTitleContainer: {
    flex: 1,
    marginRight: 10,
  },


  outfitName: {
    fontSize: 17,
    fontWeight: '800',
  },


  itemCount: {
    fontSize: 11,
    marginTop: 4,
  },


  deleteButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },


  deleteText: {
    fontSize: 17,
  },


  viewButton: {
    height: 44,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 14,
  },


  viewButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },

});