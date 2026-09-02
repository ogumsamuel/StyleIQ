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
  collection,
  deleteDoc,
  doc,
  getDocs,
  serverTimestamp,
  writeBatch,
} from 'firebase/firestore';

import { auth, db } from '../src/services/firebase';

import { useTheme } from '../src/theme/ThemeContext';


// ==================================================
// DELIVERY ADDRESS TYPE
// ==================================================

type DeliveryAddress = {
  id: string;
  fullName: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
};


// ==================================================
// DELIVERY ADDRESSES SCREEN
// ==================================================

export default function DeliveryAddressesScreen() {

  // ==================================================
  // GLOBAL THEME
  // ==================================================

  const { colors } = useTheme();


  // ==================================================
  // STATE
  // ==================================================

  const [addresses, setAddresses] =
    useState<DeliveryAddress[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [deletingId, setDeletingId] =
    useState<string | null>(null);


  // ==================================================
  // LOAD ADDRESSES
  // ==================================================

  useEffect(() => {
    loadAddresses();
  }, []);


  const loadAddresses = async () => {

    const user = auth.currentUser;

    if (!user) {

      setLoading(false);

      Alert.alert(
        'Sign in required',
        'Please sign in to manage your delivery addresses.',
        [
          {
            text: 'Sign In',
            onPress: () =>
              router.replace('/signin'),
          },
        ]
      );

      return;
    }


    try {

      const addressesRef =
        collection(
          db,
          'users',
          user.uid,
          'deliveryAddresses'
        );


      const snapshot =
        await getDocs(addressesRef);


      const loadedAddresses =
        snapshot.docs.map((item) => {

          const data =
            item.data();

          return {
            id: item.id,

            fullName:
              data.fullName || '',

            phone:
              data.phone || '',

            address:
              data.address || '',

            city:
              data.city || '',

            state:
              data.state || '',

            postalCode:
              data.postalCode || '',

            country:
              data.country || '',

            isDefault:
              data.isDefault === true,

          };

        });


      // Put default address first

      loadedAddresses.sort(
        (a, b) =>
          Number(b.isDefault) -
          Number(a.isDefault)
      );


      setAddresses(
        loadedAddresses
      );

    } catch (error) {

      console.log(
        'Load delivery addresses error:',
        error
      );


      Alert.alert(
        'Error',
        'We could not load your delivery addresses.'
      );

    } finally {

      setLoading(false);

    }

  };


  // ==================================================
  // SET DEFAULT ADDRESS
  // ==================================================

  const handleSetDefault = async (
    addressId: string
  ) => {

    const user = auth.currentUser;

    if (!user) {
      return;
    }


    try {

      const addressesRef =
        collection(
          db,
          'users',
          user.uid,
          'deliveryAddresses'
        );


      const snapshot =
        await getDocs(addressesRef);


      const batch =
        writeBatch(db);


      snapshot.docs.forEach(
        (addressDoc) => {

          batch.update(
            addressDoc.ref,
            {
              isDefault:
                addressDoc.id === addressId,

              updatedAt:
                serverTimestamp(),
            }
          );

        }
      );


      await batch.commit();


      setAddresses(
        (previous) =>
          previous
            .map((address) => ({
              ...address,

              isDefault:
                address.id === addressId,
            }))
            .sort(
              (a, b) =>
                Number(b.isDefault) -
                Number(a.isDefault)
            )
      );


      Alert.alert(
        'Default Address Updated',
        'This address will now be used automatically during checkout.'
      );

    } catch (error) {

      console.log(
        'Set default address error:',
        error
      );


      Alert.alert(
        'Error',
        'We could not update your default address.'
      );

    }

  };


  // ==================================================
  // DELETE ADDRESS
  // ==================================================

  const handleDelete = (
    address: DeliveryAddress
  ) => {

    Alert.alert(
      'Delete Address',

      'Are you sure you want to delete this delivery address?',

      [
        {
          text: 'Cancel',
          style: 'cancel',
        },

        {
          text: 'Delete',
          style: 'destructive',

          onPress:
            async () => {

              const user =
                auth.currentUser;

              if (!user) {
                return;
              }


              try {

                setDeletingId(
                  address.id
                );


                await deleteDoc(
                  doc(
                    db,
                    'users',
                    user.uid,
                    'deliveryAddresses',
                    address.id
                  )
                );


                setAddresses(
                  (previous) =>
                    previous.filter(
                      (item) =>
                        item.id !==
                        address.id
                    )
                );


                Alert.alert(
                  'Address Deleted',
                  'The delivery address has been removed.'
                );

              } catch (error) {

                console.log(
                  'Delete address error:',
                  error
                );


                Alert.alert(
                  'Error',
                  'We could not delete this address.'
                );

              } finally {

                setDeletingId(null);

              }

            },
        },
      ]
    );

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
          Loading addresses...
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
          style={
            styles.header
          }
        >

          <Pressable

            onPress={() =>
              router.back()
            }

            style={
              styles.backButton
            }

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
            Delivery Addresses
          </Text>


          <View
            style={
              styles.headerSpacer
            }
          />

        </View>


        {/* ==========================================
            INTRO
        ========================================== */}

        <View
          style={
            styles.intro
          }
        >

          <Text
            style={[
              styles.introTitle,
              {
                color:
                  colors.text,
              },
            ]}
          >
            Your delivery addresses
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
            Manage the addresses you use when
            shopping on StyleIQ.
          </Text>

        </View>


        {/* ==========================================
            EMPTY STATE
        ========================================== */}

        {addresses.length === 0 ? (

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

            <View
              style={[
                styles.addressIcon,
                {
                  backgroundColor:
                    colors.iconBackground,
                },
              ]}
            >

              <Text
                style={
                  styles.addressIconText
                }
              >
                📍
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
              No delivery addresses yet
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
              Add a delivery address to make
              checkout faster and easier.
            </Text>

          </View>

        ) : (

          /* ==========================================
             SAVED ADDRESSES
          ========================================== */

          <View>

            {addresses.map(
              (address) => (

                <View

                  key={
                    address.id
                  }

                  style={[
                    styles.addressCard,
                    {
                      backgroundColor:
                        colors.card,

                      borderColor:
                        colors.border,
                    },
                  ]}

                >

                  {/* ADDRESS HEADER */}

                  <View
                    style={
                      styles.addressHeader
                    }
                  >

                    <View
                      style={
                        styles.addressTitleRow
                      }
                    >

                      <View
                        style={[
                          styles.smallIcon,
                          {
                            backgroundColor:
                              colors.iconBackground,
                          },
                        ]}
                      >

                        <Text>
                          📍
                        </Text>

                      </View>


                      <Text
                        style={[
                          styles.addressName,
                          {
                            color:
                              colors.text,
                          },
                        ]}
                      >
                        {address.fullName}
                      </Text>

                    </View>


                    {address.isDefault && (

                      <View
                        style={[
                          styles.defaultBadge,
                          {
                            backgroundColor:
                              colors.primaryLight,
                          },
                        ]}
                      >

                        <Text
                          style={[
                            styles.defaultBadgeText,
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


                  {/* ADDRESS DETAILS */}

                  <Text
                    style={[
                      styles.addressText,
                      {
                        color:
                          colors.secondaryText,
                      },
                    ]}
                  >
                    {address.address}
                  </Text>


                  <Text
                    style={[
                      styles.addressText,
                      {
                        color:
                          colors.secondaryText,
                      },
                    ]}
                  >
                    {address.city},{' '}
                    {address.state}
                    {address.postalCode
                      ? ` ${address.postalCode}`
                      : ''}
                  </Text>


                  <Text
                    style={[
                      styles.addressText,
                      {
                        color:
                          colors.secondaryText,
                      },
                    ]}
                  >
                    {address.country}
                  </Text>


                  <Text
                    style={[
                      styles.phoneText,
                      {
                        color:
                          colors.secondaryText,
                      },
                    ]}
                  >
                    📞 {address.phone}
                  </Text>


                  {/* ACTIONS */}

                  <View
                    style={[
                      styles.actions,
                      {
                        borderTopColor:
                          colors.border,
                      },
                    ]}
                  >

                    {!address.isDefault && (

                      <Pressable

                        style={[
                          styles.defaultButton,
                          {
                            backgroundColor:
                              colors.text,
                          },
                        ]}

                        onPress={() =>
                          handleSetDefault(
                            address.id
                          )
                        }

                      >

                        <Text
                          style={[
                            styles.defaultButtonText,
                            {
                              color:
                                colors.background,
                            },
                          ]}
                        >
                          Set as Default
                        </Text>

                      </Pressable>

                    )}


                    <Pressable

                      style={[
                        styles.editButton,
                        {
                          backgroundColor:
                            colors.input,
                        },
                      ]}

                      onPress={() =>
                        router.push({
                          pathname:
                            '/add-address',

                          params: {
                            addressId:
                              address.id,
                          },
                        })
                      }

                    >

                      <Text
                        style={[
                          styles.editButtonText,
                          {
                            color:
                              colors.text,
                          },
                        ]}
                      >
                        Edit
                      </Text>

                    </Pressable>


                    <Pressable

                      style={
                        styles.deleteButton
                      }

                      disabled={
                        deletingId ===
                        address.id
                      }

                      onPress={() =>
                        handleDelete(
                          address
                        )
                      }

                    >

                      <Text
                        style={
                          styles.deleteButtonText
                        }
                      >
                        {deletingId ===
                        address.id
                          ? 'Deleting...'
                          : 'Delete'}
                      </Text>

                    </Pressable>

                  </View>

                </View>

              )
            )}

          </View>

        )}


        {/* ==========================================
            ADD ADDRESS BUTTON
        ========================================== */}

        <Pressable

          style={[
            styles.addButton,
            {
              backgroundColor:
                colors.text,
            },
          ]}

          onPress={() =>
            router.push(
              '/add-address'
            )
          }

        >

          <Text
            style={[
              styles.addButtonText,
              {
                color:
                  colors.background,
              },
            ]}
          >
            + Add New Address
          </Text>

        </Pressable>


        {/* ==========================================
            SECURITY
        ========================================== */}

        <View
          style={[
            styles.securityCard,
            {
              backgroundColor:
                colors.primaryLight,
            },
          ]}
        >

          <Text
            style={
              styles.securityIcon
            }
          >
            🔒
          </Text>


          <View
            style={
              styles.securityContent
            }
          >

            <Text
              style={[
                styles.securityTitle,
                {
                  color:
                    colors.text,
                },
              ]}
            >
              Your address information is secure
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
              Your delivery information is stored
              securely with your StyleIQ account
              and is only used to process your orders.
            </Text>

          </View>

        </View>


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
    marginBottom: 18,
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
  // EMPTY STATE
  // ==================================================

  emptyCard: {
    borderRadius: 22,
    borderWidth: 1,
    padding: 30,
    alignItems: 'center',
  },


  addressIcon: {
    width: 70,
    height: 70,
    borderRadius: 35,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
  },


  addressIconText: {
    fontSize: 32,
  },


  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
    textAlign: 'center',
  },


  emptyText: {
    fontSize: 13,
    lineHeight: 20,
    textAlign: 'center',
    marginTop: 8,
    maxWidth: 290,
  },


  // ==================================================
  // ADDRESS CARD
  // ==================================================

  addressCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 18,
    marginBottom: 14,
  },


  addressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 13,
  },


  addressTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },


  smallIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 9,
  },


  addressName: {
    fontSize: 15,
    fontWeight: '800',
  },


  defaultBadge: {
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 8,
  },


  defaultBadgeText: {
    fontSize: 9,
    fontWeight: '800',
  },


  addressText: {
    fontSize: 13,
    lineHeight: 20,
  },


  phoneText: {
    fontSize: 12,
    marginTop: 8,
  },


  // ==================================================
  // ACTIONS
  // ==================================================

  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginTop: 17,
    paddingTop: 14,
    borderTopWidth: 1,
  },


  defaultButton: {
    paddingVertical: 9,
    paddingHorizontal: 12,
    borderRadius: 10,
    marginRight: 8,
  },


  defaultButtonText: {
    fontSize: 11,
    fontWeight: '700',
  },


  editButton: {
    paddingVertical: 9,
    paddingHorizontal: 13,
    borderRadius: 10,
    marginRight: 8,
  },


  editButtonText: {
    fontSize: 11,
    fontWeight: '700',
  },


  deleteButton: {
    paddingVertical: 9,
    paddingHorizontal: 13,
    borderRadius: 10,
    backgroundColor: '#FFF0F0',
  },


  deleteButtonText: {
    color: '#D92D20',
    fontSize: 11,
    fontWeight: '700',
  },


  // ==================================================
  // ADD BUTTON
  // ==================================================

  addButton: {
    height: 54,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },


  addButtonText: {
    fontSize: 15,
    fontWeight: '800',
  },


  // ==================================================
  // SECURITY
  // ==================================================

  securityCard: {
    borderRadius: 18,
    padding: 17,
    flexDirection: 'row',
    marginTop: 20,
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