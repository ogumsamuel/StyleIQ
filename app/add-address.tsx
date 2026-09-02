import React, { useEffect, useState } from 'react';

import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Keyboard,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';

import { router, useLocalSearchParams } from 'expo-router';

import {
  collection,
  doc,
  getDoc,
  getDocs,
  serverTimestamp,
  setDoc,
  updateDoc,
  writeBatch,
} from 'firebase/firestore';

import { auth, db } from '../src/services/firebase';

import { useTheme } from '../src/theme/ThemeContext';


// ==================================================
// ADD / EDIT ADDRESS SCREEN
// ==================================================

export default function AddAddressScreen() {

  // ==================================================
  // GLOBAL THEME
  // ==================================================

  const { colors } = useTheme();


  // ==================================================
  // PARAMS
  // ==================================================

  const params =
    useLocalSearchParams<{
      addressId?: string;
    }>();

  const addressId =
    typeof params.addressId === 'string'
      ? params.addressId
      : null;


  const isEditing =
    !!addressId;


  // ==================================================
  // STATE
  // ==================================================

  const [fullName, setFullName] =
    useState('');

  const [phone, setPhone] =
    useState('');

  const [address, setAddress] =
    useState('');

  const [city, setCity] =
    useState('');

  const [state, setState] =
    useState('');

  const [postalCode, setPostalCode] =
    useState('');

  const [country, setCountry] =
    useState('');

  const [isDefault, setIsDefault] =
    useState(false);

  const [loading, setLoading] =
    useState(isEditing);

  const [saving, setSaving] =
    useState(false);


  // ==================================================
  // LOAD ADDRESS WHEN EDITING
  // ==================================================

  useEffect(() => {

    if (isEditing) {
      loadAddress();
    }

  }, [addressId]);


  const loadAddress = async () => {

    const user =
      auth.currentUser;


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


    if (!addressId) {

      setLoading(false);

      return;
    }


    try {

      const addressRef =
        doc(
          db,
          'users',
          user.uid,
          'deliveryAddresses',
          addressId
        );


      const snapshot =
        await getDoc(addressRef);


      if (!snapshot.exists()) {

        Alert.alert(
          'Address not found',
          'This delivery address could not be found.',
          [
            {
              text: 'OK',
              onPress: () =>
                router.back(),
            },
          ]
        );

        return;
      }


      const data =
        snapshot.data();


      setFullName(
        data.fullName || ''
      );

      setPhone(
        data.phone || ''
      );

      setAddress(
        data.address || ''
      );

      setCity(
        data.city || ''
      );

      setState(
        data.state || ''
      );

      setPostalCode(
        data.postalCode || ''
      );

      setCountry(
        data.country || ''
      );

      setIsDefault(
        data.isDefault === true
      );

    } catch (error) {

      console.log(
        'Load address error:',
        error
      );


      Alert.alert(
        'Error',
        'We could not load this delivery address.'
      );

    } finally {

      setLoading(false);

    }
  };


  // ==================================================
  // VALIDATE FORM
  // ==================================================

  const validateForm = () => {

    if (!fullName.trim()) {

      Alert.alert(
        'Missing information',
        'Please enter your full name.'
      );

      return false;
    }


    if (!phone.trim()) {

      Alert.alert(
        'Missing information',
        'Please enter your phone number.'
      );

      return false;
    }


    if (!address.trim()) {

      Alert.alert(
        'Missing information',
        'Please enter your street address.'
      );

      return false;
    }


    if (!city.trim()) {

      Alert.alert(
        'Missing information',
        'Please enter your city.'
      );

      return false;
    }


    if (!state.trim()) {

      Alert.alert(
        'Missing information',
        'Please enter your state.'
      );

      return false;
    }


    if (!country.trim()) {

      Alert.alert(
        'Missing information',
        'Please enter your country.'
      );

      return false;
    }


    return true;
  };


  // ==================================================
  // SET OTHER ADDRESSES AS NON-DEFAULT
  // ==================================================

  const removeOtherDefaults = async (
    userId: string
  ) => {

    const addressesRef =
      collection(
        db,
        'users',
        userId,
        'deliveryAddresses'
      );


    const snapshot =
      await getDocs(addressesRef);


    const batch =
      writeBatch(db);


    snapshot.docs.forEach(
      (addressDoc) => {

        if (
          !addressId ||
          addressDoc.id !== addressId
        ) {

          batch.update(
            addressDoc.ref,
            {
              isDefault: false,
              updatedAt: serverTimestamp(),
            }
          );

        }

      }
    );


    await batch.commit();

  };


  // ==================================================
  // SAVE ADDRESS
  // ==================================================

  const handleSave = async () => {

    Keyboard.dismiss();


    if (!validateForm()) {
      return;
    }


    const user =
      auth.currentUser;


    if (!user) {

      Alert.alert(
        'Sign in required',
        'Please sign in to save a delivery address.'
      );

      return;
    }


    try {

      setSaving(true);


      // ==================================================
      // EDIT EXISTING ADDRESS
      // ==================================================

      if (isEditing && addressId) {

        const addressRef =
          doc(
            db,
            'users',
            user.uid,
            'deliveryAddresses',
            addressId
          );


        await updateDoc(
          addressRef,
          {
            fullName:
              fullName.trim(),

            phone:
              phone.trim(),

            address:
              address.trim(),

            city:
              city.trim(),

            state:
              state.trim(),

            postalCode:
              postalCode.trim(),

            country:
              country.trim(),

            isDefault,

            updatedAt:
              serverTimestamp(),
          }
        );


        if (isDefault) {

          await removeOtherDefaults(
            user.uid
          );

        }


        Alert.alert(
          'Address Updated',
          'Your delivery address has been updated successfully.',
          [
            {
              text: 'OK',
              onPress: () =>
                router.back(),
            },
          ]
        );


        return;
      }


      // ==================================================
      // CREATE NEW ADDRESS
      // ==================================================

      const addressesRef =
        collection(
          db,
          'users',
          user.uid,
          'deliveryAddresses'
        );


      const newAddressRef =
        doc(addressesRef);


      // ==================================================
      // CHECK WHETHER USER HAS AN ADDRESS
      // ==================================================

      const existingSnapshot =
        await getDocs(addressesRef);


      const shouldBeDefault =
        existingSnapshot.empty
          ? true
          : isDefault;


      // ==================================================
      // IF NEW ADDRESS IS DEFAULT
      // REMOVE DEFAULT FROM OTHER ADDRESSES
      // ==================================================

      if (shouldBeDefault) {

        const batch =
          writeBatch(db);


        existingSnapshot.docs.forEach(
          (addressDoc) => {

            batch.update(
              addressDoc.ref,
              {
                isDefault: false,
                updatedAt: serverTimestamp(),
              }
            );

          }
        );


        await batch.commit();

      }


      // ==================================================
      // SAVE NEW ADDRESS
      // ==================================================

      await setDoc(
        newAddressRef,
        {
          fullName:
            fullName.trim(),

          phone:
            phone.trim(),

          address:
            address.trim(),

          city:
            city.trim(),

          state:
            state.trim(),

          postalCode:
            postalCode.trim(),

          country:
            country.trim(),

          isDefault:
            shouldBeDefault,

          createdAt:
            serverTimestamp(),

          updatedAt:
            serverTimestamp(),
        }
      );


      Alert.alert(
        'Address Saved',
        shouldBeDefault
          ? 'Your address has been saved as your default delivery address.'
          : 'Your delivery address has been saved successfully.',
        [
          {
            text: 'OK',
            onPress: () =>
              router.back(),
          },
        ]
      );

    } catch (error) {

      console.log(
        'Save address error:',
        error
      );


      Alert.alert(
        'Error',
        'We could not save your delivery address. Please try again.'
      );

    } finally {

      setSaving(false);

    }
  };


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
          Loading address...
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
        style={
          styles.keyboardContainer
        }

        behavior={
          Platform.OS === 'ios'
            ? 'padding'
            : undefined
        }
      >

        {/* HEADER */}

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
            {isEditing
              ? 'Edit Address'
              : 'Add Address'}
          </Text>


          <View
            style={
              styles.headerSpacer
            }
          />

        </View>


        {/* FORM */}

        <ScrollView

          showsVerticalScrollIndicator={
            false
          }

          keyboardShouldPersistTaps="handled"

          contentContainerStyle={
            styles.scroll
          }

        >

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
              {isEditing
                ? 'Update your address'
                : 'Add a delivery address'}
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
              {isEditing
                ? 'Update the information below for this delivery address.'
                : 'Save an address to make checkout faster and easier.'}
            </Text>

          </View>


          {/* FULL NAME */}

          <View
            style={
              styles.inputGroup
            }
          >

            <Text
              style={[
                styles.label,
                {
                  color:
                    colors.text,
                },
              ]}
            >
              Full Name
            </Text>


            <TextInput
              value={
                fullName
              }

              onChangeText={
                setFullName
              }

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

              autoCapitalize="words"

              returnKeyType="next"
            />

          </View>


          {/* PHONE */}

          <View
            style={
              styles.inputGroup
            }
          >

            <Text
              style={[
                styles.label,
                {
                  color:
                    colors.text,
                },
              ]}
            >
              Phone Number
            </Text>


            <TextInput
              value={
                phone
              }

              onChangeText={
                setPhone
              }

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

              returnKeyType="next"
            />

          </View>


          {/* STREET ADDRESS */}

          <View
            style={
              styles.inputGroup
            }
          >

            <Text
              style={[
                styles.label,
                {
                  color:
                    colors.text,
                },
              ]}
            >
              Street Address
            </Text>


            <TextInput
              value={
                address
              }

              onChangeText={
                setAddress
              }

              placeholder="House number, street name"

              placeholderTextColor={
                colors.secondaryText
              }

              style={[
                styles.input,
                styles.multilineInput,
                {
                  backgroundColor:
                    colors.input,
                  borderColor:
                    colors.border,
                  color:
                    colors.text,
                },
              ]}

              multiline

              numberOfLines={
                2
              }

              textAlignVertical="top"

              returnKeyType="next"
            />

          </View>


          {/* CITY */}

          <View
            style={
              styles.inputGroup
            }
          >

            <Text
              style={[
                styles.label,
                {
                  color:
                    colors.text,
                },
              ]}
            >
              City
            </Text>


            <TextInput
              value={
                city
              }

              onChangeText={
                setCity
              }

              placeholder="Enter your city"

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

              autoCapitalize="words"

              returnKeyType="next"
            />

          </View>


          {/* STATE */}

          <View
            style={
              styles.inputGroup
            }
          >

            <Text
              style={[
                styles.label,
                {
                  color:
                    colors.text,
                },
              ]}
            >
              State
            </Text>


            <TextInput
              value={
                state
              }

              onChangeText={
                setState
              }

              placeholder="Enter your state"

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

              autoCapitalize="words"

              returnKeyType="next"
            />

          </View>


          {/* POSTAL CODE */}

          <View
            style={
              styles.inputGroup
            }
          >

            <Text
              style={[
                styles.label,
                {
                  color:
                    colors.text,
                },
              ]}
            >
              Postal Code

              <Text
                style={[
                  styles.optional,
                  {
                    color:
                      colors.secondaryText,
                  },
                ]}
              >
                {' '} (Optional)
              </Text>

            </Text>


            <TextInput
              value={
                postalCode
              }

              onChangeText={
                setPostalCode
              }

              placeholder="Enter postal code"

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

              keyboardType="number-pad"

              returnKeyType="next"
            />

          </View>


          {/* COUNTRY */}

          <View
            style={
              styles.inputGroup
            }
          >

            <Text
              style={[
                styles.label,
                {
                  color:
                    colors.text,
                },
              ]}
            >
              Country
            </Text>


            <TextInput
              value={
                country
              }

              onChangeText={
                setCountry
              }

              placeholder="Enter your country"

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

              autoCapitalize="words"

              returnKeyType="done"
            />

          </View>


          {/* DEFAULT ADDRESS */}

          <View
            style={[
              styles.defaultCard,
              {
                backgroundColor:
                  colors.card,
                borderColor:
                  colors.border,
              },
            ]}
          >

            <View
              style={
                styles.defaultContent
              }
            >

              <Text
                style={[
                  styles.defaultTitle,
                  {
                    color:
                      colors.text,
                  },
                ]}
              >
                Use as default address
              </Text>


              <Text
                style={[
                  styles.defaultText,
                  {
                    color:
                      colors.secondaryText,
                  },
                ]}
              >
                This address will be selected
                automatically during checkout.
              </Text>

            </View>


            <Switch
              value={
                isDefault
              }

              onValueChange={
                setIsDefault
              }

              trackColor={{
                false:
                  colors.border,

                true:
                  colors.primaryLight,
              }}

              thumbColor={
                isDefault
                  ? colors.primary
                  : colors.white
              }
            />

          </View>


          {/* SAVE BUTTON */}

          <Pressable

            disabled={
              saving
            }

            style={[
              styles.saveButton,

              {
                backgroundColor:
                  colors.primary,
              },

              saving &&
                styles.saveButtonDisabled,
            ]}

            onPress={
              handleSave
            }

          >

            {saving ? (

              <ActivityIndicator
                color={
                  colors.white
                }
              />

            ) : (

              <Text
                style={[
                  styles.saveButtonText,
                  {
                    color:
                      colors.white,
                  },
                ]}
              >
                {isEditing
                  ? 'Save Changes'
                  : 'Save Address'}
              </Text>

            )}

          </Pressable>


          {/* CANCEL */}

          <Pressable

            disabled={
              saving
            }

            style={
              styles.cancelButton
            }

            onPress={() =>
              router.back()
            }

          >

            <Text
              style={[
                styles.cancelButtonText,
                {
                  color:
                    colors.secondaryText,
                },
              ]}
            >
              Cancel
            </Text>

          </Pressable>


          <View
            style={{
              height: 40,
            }}
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
  // SCROLL
  // ==================================================

  scroll: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },


  // ==================================================
  // INTRO
  // ==================================================

  intro: {
    marginTop: 18,
    marginBottom: 24,
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
  // INPUTS
  // ==================================================

  inputGroup: {
    marginBottom: 17,
  },

  label: {
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 7,
  },

  optional: {
    fontWeight: '400',
  },

  input: {
    borderWidth: 1,
    borderRadius: 13,
    height: 52,
    paddingHorizontal: 14,
    fontSize: 14,
  },

  multilineInput: {
    height: 78,
    paddingTop: 13,
  },


  // ==================================================
  // DEFAULT ADDRESS
  // ==================================================

  defaultCard: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 3,
    marginBottom: 22,
  },

  defaultContent: {
    flex: 1,
    paddingRight: 12,
  },

  defaultTitle: {
    fontSize: 14,
    fontWeight: '800',
  },

  defaultText: {
    fontSize: 12,
    lineHeight: 18,
    marginTop: 4,
  },


  // ==================================================
  // SAVE
  // ==================================================

  saveButton: {
    height: 54,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },

  saveButtonDisabled: {
    opacity: 0.7,
  },

  saveButtonText: {
    fontSize: 15,
    fontWeight: '800',
  },


  // ==================================================
  // CANCEL
  // ==================================================

  cancelButton: {
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
  },

  cancelButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },

});