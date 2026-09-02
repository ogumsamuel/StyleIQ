import React, {
  useCallback,
  useState,
} from 'react';

import {
  Alert,
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
  getDocs,
} from 'firebase/firestore';

import {
  signOut,
} from 'firebase/auth';

import {
  auth,
  db,
} from '../src/services/firebase';

import {
  useTheme,
} from '../src/theme/ThemeContext';


// ==================================================
// PROFILE SCREEN
// ==================================================

export default function ProfileScreen() {

  // ==================================================
  // THEME
  // ==================================================

  const {
    colors,
  } = useTheme();


  // ==================================================
  // COUNTS
  // ==================================================

  const [
    wishlistCount,
    setWishlistCount,
  ] = useState(0);

  const [
    ordersCount,
    setOrdersCount,
  ] = useState(0);

  const [
    savedLooksCount,
    setSavedLooksCount,
  ] = useState(0);


  // ==================================================
  // REFRESH COUNTS WHEN SCREEN OPENS
  // ==================================================

  useFocusEffect(
    useCallback(() => {

      loadWishlistCount();
      loadOrdersCount();
      loadSavedLooksCount();

    }, [])
  );


  // ==================================================
  // LOAD WISHLIST COUNT
  // ==================================================

  const loadWishlistCount = async () => {

    const user =
      auth.currentUser;

    if (!user) {
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

      setWishlistCount(
        snapshot.size
      );

    } catch (error) {

      console.log(
        'Wishlist count error:',
        error
      );

    }
  };


  // ==================================================
  // LOAD ORDERS COUNT
  // ==================================================

  const loadOrdersCount = async () => {

    const user =
      auth.currentUser;

    if (!user) {

      setOrdersCount(0);

      return;
    }

    try {

      const ordersRef =
        collection(
          db,
          'users',
          user.uid,
          'orders'
        );

      const snapshot =
        await getDocs(
          ordersRef
        );

      setOrdersCount(
        snapshot.size
      );

    } catch (error) {

      console.log(
        'Orders count error:',
        error
      );

      setOrdersCount(0);

    }
  };


  // ==================================================
  // LOAD SAVED LOOKS COUNT
  // ==================================================

  const loadSavedLooksCount =
    async () => {

      const user =
        auth.currentUser;

      if (!user) {

        setSavedLooksCount(0);

        return;
      }

      try {

        const looksRef =
          collection(
            db,
            'users',
            user.uid,
            'outfits'
          );

        const snapshot =
          await getDocs(
            looksRef
          );

        setSavedLooksCount(
          snapshot.size
        );

      } catch (error) {

        console.log(
          'Saved looks count error:',
          error
        );

        setSavedLooksCount(0);

      }
    };


  // ==================================================
  // SIGN OUT
  // ==================================================

  const handleSignOut =
    async () => {

      Alert.alert(
        'Sign out',
        'Are you sure you want to sign out?',
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },

          {
            text: 'Sign Out',
            style: 'destructive',

            onPress: async () => {

              try {

                await signOut(auth);

                router.replace(
                  '/signin'
                );

              } catch (error) {

                console.log(
                  'Sign out error:',
                  error
                );

                Alert.alert(
                  'Sign out failed',
                  'Something went wrong. Please try again.'
                );

              }

            },

          },

        ]
      );

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
        showsVerticalScrollIndicator={
          false
        }
        contentContainerStyle={
          styles.scroll
        }
      >

        {/* ==========================================
            HEADER
        ========================================== */}

        <View
          style={styles.header}
        >

          <Pressable
            onPress={() =>
              router.back()
            }
            style={styles.backButton}
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
            Profile
          </Text>


          <Pressable
            onPress={() =>
              router.push(
                '/settings'
              )
            }
            style={[
              styles.settingsButton,
              {
                backgroundColor:
                  colors.primaryLight,
              },
            ]}
          >

            <Text
              style={[
                styles.settingsIcon,
                {
                  color:
                    colors.text,
                },
              ]}
            >
              ⚙
            </Text>

          </Pressable>

        </View>


        {/* ==========================================
            PROFILE CARD
        ========================================== */}

        <View
          style={[
            styles.profileCard,
            {
              backgroundColor:
                colors.black,
            },
          ]}
        >

          <View
            style={[
              styles.avatar,
              {
                backgroundColor:
                  colors.primary,
              },
            ]}
          >

            <Text
              style={styles.avatarText}
            >
              {auth.currentUser?.email
                ? auth.currentUser.email
                    .charAt(0)
                    .toUpperCase()
                : 'S'}
            </Text>

          </View>


          <Text
            style={styles.name}
          >
            {auth.currentUser
              ?.displayName ||
              'StyleIQ User'}
          </Text>


          <Text
            style={styles.email}
          >
            {auth.currentUser?.email ||
              'Your email'}
          </Text>


          <Pressable
            style={[
              styles.editButton,
              {
                backgroundColor:
                  colors.white,
              },
            ]}
            onPress={() =>
              router.push(
                '/edit-profile'
              )
            }
          >

            <Text
              style={[
                styles.editButtonText,
                {
                  color:
                    colors.black,
                },
              ]}
            >
              Edit Profile
            </Text>

          </Pressable>

        </View>


        {/* ==========================================
            STYLEIQ STATS
        ========================================== */}

        <View
          style={[
            styles.stats,
            {
              backgroundColor:
                colors.card,
              borderColor:
                colors.border,
            },
          ]}
        >

          <View
            style={styles.statItem}
          >

            <Text
              style={[
                styles.statNumber,
                {
                  color:
                    colors.text,
                },
              ]}
            >
              {ordersCount}
            </Text>


            <Text
              style={[
                styles.statLabel,
                {
                  color:
                    colors.secondaryText,
                },
              ]}
            >
              Orders
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
            style={styles.statItem}
          >

            <Text
              style={[
                styles.statNumber,
                {
                  color:
                    colors.text,
                },
              ]}
            >
              {wishlistCount}
            </Text>


            <Text
              style={[
                styles.statLabel,
                {
                  color:
                    colors.secondaryText,
                },
              ]}
            >
              Wishlist
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
            style={styles.statItem}
          >

            <Text
              style={[
                styles.statNumber,
                {
                  color:
                    colors.text,
                },
              ]}
            >
              {savedLooksCount}
            </Text>


            <Text
              style={[
                styles.statLabel,
                {
                  color:
                    colors.secondaryText,
                },
              ]}
            >
              Looks
            </Text>

          </View>

        </View>


        {/* ==========================================
            MY STYLE
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
          My Style
        </Text>


        <View
          style={[
            styles.menuCard,
            {
              backgroundColor:
                colors.card,
              borderColor:
                colors.border,
            },
          ]}
        >

          {/* STYLE PREFERENCES */}

          <Pressable
            style={styles.menuItem}
            onPress={() =>
              router.push(
                '/style-preferences'
              )
            }
          >

            <View
              style={[
                styles.menuIcon,
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


            <View
              style={styles.menuContent}
            >

              <Text
                style={[
                  styles.menuTitle,
                  {
                    color:
                      colors.text,
                  },
                ]}
              >
                Style Preferences
              </Text>


              <Text
                style={[
                  styles.menuSubtitle,
                  {
                    color:
                      colors.secondaryText,
                  },
                ]}
              >
                Tell StyleIQ what you love
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


          <View
            style={[
              styles.menuDivider,
              {
                backgroundColor:
                  colors.border,
              },
            ]}
          />


          {/* MY OUTFITS */}

          <Pressable
            style={styles.menuItem}
            onPress={() =>
              router.push(
                '/my-outfits'
              )
            }
          >

            <View
              style={[
                styles.menuIcon,
                {
                  backgroundColor:
                    colors.primaryLight,
                },
              ]}
            >

              <Text>
                👗
              </Text>

            </View>


            <View
              style={styles.menuContent}
            >

              <Text
                style={[
                  styles.menuTitle,
                  {
                    color:
                      colors.text,
                  },
                ]}
              >
                My Outfits
              </Text>


              <Text
                style={[
                  styles.menuSubtitle,
                  {
                    color:
                      colors.secondaryText,
                  },
                ]}
              >
                View your saved looks
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


          <View
            style={[
              styles.menuDivider,
              {
                backgroundColor:
                  colors.border,
              },
            ]}
          />


          {/* WISHLIST */}

          <Pressable
            style={styles.menuItem}
            onPress={() =>
              router.push(
                '/wishlist'
              )
            }
          >

            <View
              style={[
                styles.menuIcon,
                {
                  backgroundColor:
                    colors.primaryLight,
                },
              ]}
            >

              <Text>
                ♥️
              </Text>

            </View>


            <View
              style={styles.menuContent}
            >

              <Text
                style={[
                  styles.menuTitle,
                  {
                    color:
                      colors.text,
                  },
                ]}
              >
                Wishlist
              </Text>


              <Text
                style={[
                  styles.menuSubtitle,
                  {
                    color:
                      colors.secondaryText,
                  },
                ]}
              >
                Items you've saved
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


        {/* ==========================================
            SHOPPING
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
          Shopping
        </Text>


        <View
          style={[
            styles.menuCard,
            {
              backgroundColor:
                colors.card,
              borderColor:
                colors.border,
            },
          ]}
        >

          {/* MY ORDERS */}

          <Pressable
            style={styles.menuItem}
            onPress={() =>
              router.push(
                '/orders'
              )
            }
          >

            <View
              style={[
                styles.menuIcon,
                {
                  backgroundColor:
                    colors.primaryLight,
                },
              ]}
            >

              <Text>
                📦
              </Text>

            </View>


            <View
              style={styles.menuContent}
            >

              <Text
                style={[
                  styles.menuTitle,
                  {
                    color:
                      colors.text,
                  },
                ]}
              >
                My Orders
              </Text>


              <Text
                style={[
                  styles.menuSubtitle,
                  {
                    color:
                      colors.secondaryText,
                  },
                ]}
              >
                Track your purchases
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


          <View
            style={[
              styles.menuDivider,
              {
                backgroundColor:
                  colors.border,
              },
            ]}
          />


          {/* PAYMENT METHODS */}

          <Pressable
            style={styles.menuItem}
            onPress={() =>
              router.push(
                '/payment-methods'
              )
            }
          >

            <View
              style={[
                styles.menuIcon,
                {
                  backgroundColor:
                    colors.primaryLight,
                },
              ]}
            >

              <Text>
                💳
              </Text>

            </View>


            <View
              style={styles.menuContent}
            >

              <Text
                style={[
                  styles.menuTitle,
                  {
                    color:
                      colors.text,
                  },
                ]}
              >
                Payment Methods
              </Text>


              <Text
                style={[
                  styles.menuSubtitle,
                  {
                    color:
                      colors.secondaryText,
                  },
                ]}
              >
                Manage your payment options
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


          <View
            style={[
              styles.menuDivider,
              {
                backgroundColor:
                  colors.border,
              },
            ]}
          />


          {/* DELIVERY ADDRESSES */}

          <Pressable
            style={styles.menuItem}
            onPress={() =>
              router.push(
                '/delivery-addresses'
              )
            }
          >

            <View
              style={[
                styles.menuIcon,
                {
                  backgroundColor:
                    colors.primaryLight,
                },
              ]}
            >

              <Text>
                📍
              </Text>

            </View>


            <View
              style={styles.menuContent}
            >

              <Text
                style={[
                  styles.menuTitle,
                  {
                    color:
                      colors.text,
                  },
                ]}
              >
                Delivery Addresses
              </Text>


              <Text
                style={[
                  styles.menuSubtitle,
                  {
                    color:
                      colors.secondaryText,
                  },
                ]}
              >
                Manage your addresses
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


        {/* ==========================================
            ACCOUNT
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
          Account
        </Text>


        <View
          style={[
            styles.menuCard,
            {
              backgroundColor:
                colors.card,
              borderColor:
                colors.border,
            },
          ]}
        >

          {/* NOTIFICATIONS */}

          <Pressable
            style={styles.menuItem}
            onPress={() =>
              router.push(
                '/notifications'
              )
            }
          >

            <View
              style={[
                styles.menuIcon,
                {
                  backgroundColor:
                    colors.primaryLight,
                },
              ]}
            >

              <Text>
                🔔
              </Text>

            </View>


            <View
              style={styles.menuContent}
            >

              <Text
                style={[
                  styles.menuTitle,
                  {
                    color:
                      colors.text,
                  },
                ]}
              >
                Notifications
              </Text>


              <Text
                style={[
                  styles.menuSubtitle,
                  {
                    color:
                      colors.secondaryText,
                  },
                ]}
              >
                Manage your notifications
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


          <View
            style={[
              styles.menuDivider,
              {
                backgroundColor:
                  colors.border,
              },
            ]}
          />


          {/* PRIVACY & SECURITY */}

          <Pressable
            style={styles.menuItem}
            onPress={() =>
              router.push(
                '/privacy-security'
              )
            }
          >

            <View
              style={[
                styles.menuIcon,
                {
                  backgroundColor:
                    colors.primaryLight,
                },
              ]}
            >

              <Text>
                🔒
              </Text>

            </View>


            <View
              style={styles.menuContent}
            >

              <Text
                style={[
                  styles.menuTitle,
                  {
                    color:
                      colors.text,
                  },
                ]}
              >
                Privacy & Security
              </Text>


              <Text
                style={[
                  styles.menuSubtitle,
                  {
                    color:
                      colors.secondaryText,
                  },
                ]}
              >
                Manage your account security
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


          <View
            style={[
              styles.menuDivider,
              {
                backgroundColor:
                  colors.border,
              },
            ]}
          />


          {/* HELP & SUPPORT */}

          <Pressable
            style={styles.menuItem}
            onPress={() =>
              router.push(
                '/help-support'
              )
            }
          >

            <View
              style={[
                styles.menuIcon,
                {
                  backgroundColor:
                    colors.primaryLight,
                },
              ]}
            >

              <Text>
                ❓
              </Text>

            </View>


            <View
              style={styles.menuContent}
            >

              <Text
                style={[
                  styles.menuTitle,
                  {
                    color:
                      colors.text,
                  },
                ]}
              >
                Help & Support
              </Text>


              <Text
                style={[
                  styles.menuSubtitle,
                  {
                    color:
                      colors.secondaryText,
                  },
                ]}
              >
                Get help with StyleIQ
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


        {/* ==========================================
            SIGN OUT
        ========================================== */}

        <Pressable
          style={[
            styles.signOutButton,
            {
              backgroundColor:
                colors.card,
              borderColor:
                colors.border,
            },
          ]}
          onPress={
            handleSignOut
          }
        >

          <Text
            style={
              styles.signOutText
            }
          >
            Sign Out
          </Text>

        </Pressable>


        {/* ==========================================
            VERSION
        ========================================== */}

        <Text
          style={[
            styles.version,
            {
              color:
                colors.secondaryText,
            },
          ]}
        >
          StyleIQ • Version 1.0.0
        </Text>


        <View
          style={{
            height: 30,
          }}
        />

      </ScrollView>

    </SafeAreaView>

  );

}


// ==================================================
// STYLES
// ==================================================

const styles =
  StyleSheet.create({

    container: {
      flex: 1,
    },


    scroll: {
      paddingHorizontal: 20,
      paddingBottom: 30,
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
      fontSize: 21,
      fontWeight: '800',
    },


    settingsButton: {
      width: 42,
      height: 42,
      borderRadius: 21,
      alignItems: 'center',
      justifyContent: 'center',
    },


    settingsIcon: {
      fontSize: 19,
    },


    // ==================================================
    // PROFILE CARD
    // ==================================================

    profileCard: {
      borderRadius: 24,
      padding: 25,
      alignItems: 'center',
      marginTop: 10,
    },


    avatar: {
      width: 80,
      height: 80,
      borderRadius: 40,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 12,
    },


    avatarText: {
      color: '#FFF',
      fontSize: 32,
      fontWeight: '800',
    },


    name: {
      color: '#FFF',
      fontSize: 21,
      fontWeight: '800',
    },


    email: {
      color: '#AAA',
      fontSize: 13,
      marginTop: 5,
    },


    editButton: {
      paddingHorizontal: 18,
      paddingVertical: 9,
      borderRadius: 20,
      marginTop: 15,
    },


    editButtonText: {
      fontSize: 12,
      fontWeight: '700',
    },


    // ==================================================
    // STATS
    // ==================================================

    stats: {
      borderRadius: 18,
      height: 85,
      marginTop: 15,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-around',
      borderWidth: 1,
    },


    statItem: {
      alignItems: 'center',
      flex: 1,
    },


    statNumber: {
      fontSize: 19,
      fontWeight: '800',
    },


    statLabel: {
      fontSize: 11,
      marginTop: 4,
    },


    divider: {
      width: 1,
      height: 35,
    },


    // ==================================================
    // SECTIONS
    // ==================================================

    sectionTitle: {
      fontSize: 17,
      fontWeight: '800',
      marginTop: 28,
      marginBottom: 10,
    },


    menuCard: {
      borderRadius: 18,
      borderWidth: 1,
      overflow: 'hidden',
    },


    menuItem: {
      minHeight: 70,
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 15,
    },


    menuIcon: {
      width: 40,
      height: 40,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 13,
    },


    menuContent: {
      flex: 1,
    },


    menuTitle: {
      fontSize: 14,
      fontWeight: '700',
    },


    menuSubtitle: {
      fontSize: 11,
      marginTop: 3,
    },


    arrow: {
      fontSize: 25,
      fontWeight: '300',
    },


    menuDivider: {
      height: 1,
      marginLeft: 68,
    },


    // ==================================================
    // SIGN OUT
    // ==================================================

    signOutButton: {
      height: 54,
      borderRadius: 15,
      borderWidth: 1,
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 28,
    },


    signOutText: {
      color: '#D32F2F',
      fontSize: 14,
      fontWeight: '700',
    },


    // ==================================================
    // VERSION
    // ==================================================

    version: {
      textAlign: 'center',
      fontSize: 11,
      marginTop: 15,
    },

  });