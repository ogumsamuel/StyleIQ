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

import { router, useLocalSearchParams } from 'expo-router';

import {
  doc,
  getDoc,
  Timestamp,
} from 'firebase/firestore';

import { auth, db } from '../src/services/firebase';

// IMPORT GLOBAL THEME
import { useTheme } from '../src/theme/ThemeContext';


// ==================================================
// TYPES
// ==================================================

type OrderItem = {
  id: string;
  name: string;
  price: string;
  category?: string;
  color?: string;
  image: string;
  quantity: number;
};

type Order = {
  id: string;
  total: number;
  paymentMethod: string;
  paymentStatus: string;
  orderStatus: string;
  customerName: string;
  phone: string;
  address: string;
  items: OrderItem[];
  createdAt?: Timestamp | any;
};


// ==================================================
// SCREEN
// ==================================================

export default function OrderDetailsScreen() {

  const { orderId } =
    useLocalSearchParams<{
      orderId: string;
    }>();

  // GLOBAL THEME
  const { colors } = useTheme();


  // ------------------------------------------------
  // STATE
  // ------------------------------------------------

  const [order, setOrder] =
    useState<Order | null>(null);

  const [loading, setLoading] =
    useState(true);


  // ==================================================
  // LOAD ORDER
  // ==================================================

  useEffect(() => {
    loadOrder();
  }, [orderId]);


  const loadOrder = async () => {

    const user = auth.currentUser;

    if (!user) {

      setLoading(false);

      Alert.alert(
        'Sign in required',
        'Please sign in to view your order.',
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


    if (!orderId) {

      setLoading(false);

      Alert.alert(
        'Order not found',
        'No order ID was provided.'
      );

      return;
    }


    try {

      const orderRef = doc(
        db,
        'users',
        user.uid,
        'orders',
        orderId
      );


      const snapshot =
        await getDoc(orderRef);


      if (!snapshot.exists()) {

        Alert.alert(
          'Order not found',
          'We could not find this order.'
        );

        setOrder(null);

        return;
      }


      const data = snapshot.data();


      setOrder({
        id: snapshot.id,

        total:
          typeof data.total === 'number'
            ? data.total
            : Number(data.total || 0),

        paymentMethod:
          data.paymentMethod ||
          'Unknown',

        paymentStatus:
          data.paymentStatus ||
          'Pending',

        orderStatus:
          data.orderStatus ||
          'Processing',

        customerName:
          data.customerName ||
          '',

        phone:
          data.phone ||
          '',

        address:
          data.address ||
          '',

        items:
          Array.isArray(data.items)
            ? data.items
            : [],

        createdAt:
          data.createdAt,
      });

    } catch (error) {

      console.log(
        'Order details error:',
        error
      );

      Alert.alert(
        'Error',
        'We could not load the order details.'
      );

    } finally {

      setLoading(false);

    }
  };


  // ==================================================
  // DATE
  // ==================================================

  const formatDate = (
    createdAt: any
  ) => {

    if (!createdAt) {
      return 'Date unavailable';
    }


    try {

      const date =
        createdAt instanceof Timestamp
          ? createdAt.toDate()
          : createdAt?.toDate
            ? createdAt.toDate()
            : new Date(createdAt);


      return date.toLocaleDateString(
        'en-US',
        {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        }
      );

    } catch {

      return 'Date unavailable';

    }
  };


  // ==================================================
  // TIME
  // ==================================================

  const formatTime = (
    createdAt: any
  ) => {

    if (!createdAt) {
      return '';
    }


    try {

      const date =
        createdAt instanceof Timestamp
          ? createdAt.toDate()
          : createdAt?.toDate
            ? createdAt.toDate()
            : new Date(createdAt);


      return date.toLocaleTimeString(
        'en-US',
        {
          hour: 'numeric',
          minute: '2-digit',
        }
      );

    } catch {

      return '';

    }
  };


  // ==================================================
  // PAYMENT STATUS
  // ==================================================

  const getPaymentStatusStyle = () => {

    if (
      order?.paymentStatus
        ?.toLowerCase()
        .includes('paid')
    ) {

      return {
        backgroundColor: colors.primaryLight,
      };

    }

    return {
      backgroundColor: colors.input,
    };
  };


  // ==================================================
  // ORDER STATUS
  // ==================================================

  const getOrderStatusStyle = () => {

    const status =
      order?.orderStatus
        ?.toLowerCase();


    if (
      status === 'delivered'
    ) {

      return {
        backgroundColor: colors.primaryLight,
      };

    }


    if (
      status === 'cancelled'
    ) {

      return {
        backgroundColor: colors.input,
      };

    }


    return {
      backgroundColor: colors.iconBackground,
    };
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
            backgroundColor: colors.background,
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
              color: colors.secondaryText,
            },
          ]}
        >
          Loading order...
        </Text>

      </SafeAreaView>

    );
  }


  // ==================================================
  // ORDER NOT FOUND
  // ==================================================

  if (!order) {

    return (

      <SafeAreaView
        style={[
          styles.container,
          {
            backgroundColor: colors.background,
          },
        ]}
      >

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
                styles.backIcon,
                {
                  color: colors.text,
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
                color: colors.text,
              },
            ]}
          >
            Order Details
          </Text>


          <View
            style={styles.headerSpace}
          />

        </View>


        <View
          style={
            styles.emptyContainer
          }
        >

          <Text
            style={styles.emptyIcon}
          >
            📦
          </Text>

          <Text
            style={[
              styles.emptyTitle,
              {
                color: colors.text,
              },
            ]}
          >
            Order not found
          </Text>

          <Text
            style={[
              styles.emptyText,
              {
                color: colors.secondaryText,
              },
            ]}
          >
            This order may have been removed
            or is no longer available.
          </Text>


          <Pressable
            style={[
              styles.backHomeButton,
              {
                backgroundColor: colors.primary,
              },
            ]}
            onPress={() =>
              router.back()
            }
          >

            <Text
              style={[
                styles.backHomeText,
                {
                  color: colors.white,
                },
              ]}
            >
              Go Back
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
          backgroundColor: colors.background,
        },
      ]}
    >

      {/* ============================================
          HEADER
      ============================================ */}

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
              styles.backIcon,
              {
                color: colors.text,
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
              color: colors.text,
            },
          ]}
        >
          Order Details
        </Text>


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
          styles.scrollContent
        }
      >

        {/* ==========================================
            ORDER HEADER
        ========================================== */}

        <View
          style={[
            styles.orderHeader,
            {
              backgroundColor: colors.black,
            },
          ]}
        >

          <View>

            <Text
              style={[
                styles.orderNumberLabel,
                {
                  color: colors.secondaryText,
                },
              ]}
            >
              ORDER NUMBER
            </Text>


            <Text
              style={[
                styles.orderNumber,
                {
                  color: colors.white,
                },
              ]}
            >
              #{order.id}
            </Text>

          </View>


          <View
            style={[
              styles.packageIcon,
              {
                backgroundColor: colors.iconBackground,
              },
            ]}
          >
            <Text>
              📦
            </Text>
          </View>

        </View>


        {/* ==========================================
            DATE
        ========================================== */}

        <View
          style={[
            styles.dateCard,
            {
              backgroundColor: colors.card,
              borderColor: colors.border,
            },
          ]}
        >

          <Text
            style={[
              styles.dateLabel,
              {
                color: colors.secondaryText,
              },
            ]}
          >
            Order Date
          </Text>


          <View>

            <Text
              style={[
                styles.dateValue,
                {
                  color: colors.text,
                },
              ]}
            >
              {formatDate(
                order.createdAt
              )}
            </Text>


            <Text
              style={[
                styles.timeValue,
                {
                  color: colors.secondaryText,
                },
              ]}
            >
              {formatTime(
                order.createdAt
              )}
            </Text>

          </View>

        </View>


        {/* ==========================================
            ORDER STATUS
        ========================================== */}

        <View
          style={styles.section}
        >

          <Text
            style={[
              styles.sectionTitle,
              {
                color: colors.text,
              },
            ]}
          >
            Order Status
          </Text>


          <View
            style={[
              styles.statusCard,
              {
                backgroundColor: colors.card,
                borderColor: colors.border,
              },
            ]}
          >

            <View
              style={
                styles.statusTimeline
              }
            >

              <View
                style={[
                  styles.statusDot,
                  styles.statusDotActive,
                  {
                    backgroundColor: colors.primary,
                  },
                ]}
              />

              <View
                style={[
                  styles.statusLine,
                  {
                    backgroundColor: colors.border,
                  },
                ]}
              />

              <View
                style={[
                  styles.statusDot,
                  {
                    backgroundColor: colors.border,
                  },
                ]}
              />

              <View
                style={[
                  styles.statusLine,
                  {
                    backgroundColor: colors.border,
                  },
                ]}
              />

              <View
                style={[
                  styles.statusDot,
                  {
                    backgroundColor: colors.border,
                  },
                ]}
              />

            </View>


            <View
              style={
                styles.statusContent
              }
            >

              <View
                style={
                  styles.statusRow
                }
              >

                <Text
                  style={[
                    styles.statusMainTitle,
                    {
                      color: colors.text,
                    },
                  ]}
                >
                  Order placed
                </Text>

                <Text
                  style={[
                    styles.statusCheck,
                    {
                      color: colors.primary,
                    },
                  ]}
                >
                  ✓
                </Text>

              </View>


              <Text
                style={[
                  styles.statusDescription,
                  {
                    color: colors.secondaryText,
                  },
                ]}
              >
                Your order has been received.
              </Text>


              <View
                style={
                  styles.statusMiddle
                }
              >

                <Text
                  style={[
                    styles.statusMiddleTitle,
                    {
                      color: colors.secondaryText,
                    },
                  ]}
                >
                  Processing
                </Text>

              </View>


              <Text
                style={[
                  styles.statusBottom,
                  {
                    color: colors.secondaryText,
                  },
                ]}
              >
                {order.orderStatus}
              </Text>

            </View>

          </View>

        </View>


        {/* ==========================================
            PRODUCTS
        ========================================== */}

        <View
          style={styles.section}
        >

          <Text
            style={[
              styles.sectionTitle,
              {
                color: colors.text,
              },
            ]}
          >
            Items
          </Text>


          {order.items.map(
            (item, index) => (

              <View
                key={
                  item.id ||
                  `${item.name}-${index}`
                }
                style={[
                  styles.productCard,
                  {
                    backgroundColor: colors.card,
                    borderColor: colors.border,
                  },
                ]}
              >

                <Image
                  source={{
                    uri: item.image,
                  }}
                  style={[
                    styles.productImage,
                    {
                      backgroundColor: colors.input,
                    },
                  ]}
                />


                <View
                  style={
                    styles.productInfo
                  }
                >

                  <Text
                    style={[
                      styles.productName,
                      {
                        color: colors.text,
                      },
                    ]}
                    numberOfLines={2}
                  >
                    {item.name}
                  </Text>


                  {item.color && (

                    <Text
                      style={[
                        styles.productColor,
                        {
                          color: colors.secondaryText,
                        },
                      ]}
                    >
                      Color: {item.color}
                    </Text>

                  )}


                  <Text
                    style={[
                      styles.productQuantity,
                      {
                        color: colors.secondaryText,
                      },
                    ]}
                  >
                    Quantity: {
                      item.quantity ||
                      1
                    }
                  </Text>

                </View>


                <Text
                  style={[
                    styles.productPrice,
                    {
                      color: colors.text,
                    },
                  ]}
                >
                  $
                  {(
                    Number(
                      String(
                        item.price
                      )
                        .replace(
                          '$',
                          ''
                        )
                        .replace(
                          ',',
                          ''
                        )
                    ) *
                    (
                      item.quantity ||
                      1
                    )
                  ).toFixed(2)}
                </Text>

              </View>

            )
          )}

        </View>


        {/* ==========================================
            PAYMENT INFORMATION
        ========================================== */}

        <View
          style={styles.section}
        >

          <Text
            style={[
              styles.sectionTitle,
              {
                color: colors.text,
              },
            ]}
          >
            Payment
          </Text>


          <View
            style={[
              styles.infoCard,
              {
                backgroundColor: colors.card,
                borderColor: colors.border,
              },
            ]}
          >

            <View
              style={
                styles.infoRow
              }
            >

              <Text
                style={[
                  styles.infoLabel,
                  {
                    color: colors.secondaryText,
                  },
                ]}
              >
                Payment Method
              </Text>


              <Text
                style={[
                  styles.infoValue,
                  {
                    color: colors.text,
                  },
                ]}
              >
                {order.paymentMethod}
              </Text>

            </View>


            <View
              style={[
                styles.infoDivider,
                {
                  backgroundColor: colors.border,
                },
              ]}
            />


            <View
              style={
                styles.infoRow
              }
            >

              <Text
                style={[
                  styles.infoLabel,
                  {
                    color: colors.secondaryText,
                  },
                ]}
              >
                Payment Status
              </Text>


              <View
                style={[
                  styles.statusBadge,
                  getPaymentStatusStyle(),
                ]}
              >

                <Text
                  style={[
                    styles.statusBadgeText,
                    {
                      color: colors.text,
                    },
                  ]}
                >
                  {order.paymentStatus}
                </Text>

              </View>

            </View>

          </View>

        </View>


        {/* ==========================================
            DELIVERY INFORMATION
        ========================================== */}

        <View
          style={styles.section}
        >

          <Text
            style={[
              styles.sectionTitle,
              {
                color: colors.text,
              },
            ]}
          >
            Delivery Information
          </Text>


          <View
            style={[
              styles.infoCard,
              {
                backgroundColor: colors.card,
                borderColor: colors.border,
              },
            ]}
          >

            <Text
              style={[
                styles.deliveryName,
                {
                  color: colors.text,
                },
              ]}
            >
              {order.customerName}
            </Text>


            <Text
              style={[
                styles.deliveryPhone,
                {
                  color: colors.secondaryText,
                },
              ]}
            >
              {order.phone}
            </Text>


            <Text
              style={[
                styles.deliveryAddress,
                {
                  color: colors.secondaryText,
                },
              ]}
            >
              {order.address}
            </Text>

          </View>

        </View>


        {/* ==========================================
            ORDER SUMMARY
        ========================================== */}

        <View
          style={[
            styles.summary,
            {
              backgroundColor: colors.card,
              borderColor: colors.border,
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
                  color: colors.secondaryText,
                },
              ]}
            >
              Items
            </Text>


            <Text
              style={[
                styles.summaryValue,
                {
                  color: colors.text,
                },
              ]}
            >
              {order.items.reduce(
                (
                  sum,
                  item
                ) =>
                  sum +
                  (
                    item.quantity ||
                    1
                  ),
                0
              )}
            </Text>

          </View>


          <View
            style={styles.summaryRow}
          >

            <Text
              style={[
                styles.summaryLabel,
                {
                  color: colors.secondaryText,
                },
              ]}
            >
              Delivery
            </Text>


            <Text
              style={[
                styles.freeText,
                {
                  color: colors.primary,
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
                backgroundColor: colors.border,
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
              ${order.total.toFixed(2)}
            </Text>

          </View>

        </View>


        <View
          style={{ height: 30 }}
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


  // ==================================================
  // SCROLL
  // ==================================================

  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },


  // ==================================================
  // ORDER HEADER
  // ==================================================

  orderHeader: {
    borderRadius: 18,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
    marginBottom: 12,
  },


  orderNumberLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
  },


  orderNumber: {
    fontSize: 15,
    fontWeight: '800',
    marginTop: 5,
  },


  packageIcon: {
    width: 45,
    height: 45,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },


  // ==================================================
  // DATE
  // ==================================================

  dateCard: {
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    marginBottom: 24,
  },


  dateLabel: {
    fontSize: 13,
  },


  dateValue: {
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'right',
  },


  timeValue: {
    fontSize: 11,
    marginTop: 3,
    textAlign: 'right',
  },


  // ==================================================
  // SECTION
  // ==================================================

  section: {
    marginBottom: 24,
  },


  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 13,
  },


  // ==================================================
  // STATUS
  // ==================================================

  statusCard: {
    borderRadius: 17,
    padding: 18,
    flexDirection: 'row',
    borderWidth: 1,
  },


  statusTimeline: {
    width: 24,
    alignItems: 'center',
  },


  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },


  statusDotActive: {
    // background color supplied by theme
  },


  statusLine: {
    width: 2,
    height: 30,
  },


  statusContent: {
    flex: 1,
    paddingLeft: 8,
  },


  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },


  statusMainTitle: {
    fontSize: 13,
    fontWeight: '800',
  },


  statusCheck: {
    fontWeight: '800',
  },


  statusDescription: {
    fontSize: 11,
    marginTop: 4,
  },


  statusMiddle: {
    marginTop: 24,
  },


  statusMiddleTitle: {
    fontSize: 13,
    fontWeight: '700',
  },


  statusBottom: {
    fontSize: 11,
    marginTop: 24,
  },


  // ==================================================
  // PRODUCTS
  // ==================================================

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


  // ==================================================
  // INFORMATION CARD
  // ==================================================

  infoCard: {
    borderRadius: 16,
    padding: 17,
    borderWidth: 1,
  },


  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },


  infoLabel: {
    fontSize: 12,
  },


  infoValue: {
    fontSize: 12,
    fontWeight: '700',
    maxWidth: '55%',
    textAlign: 'right',
  },


  infoDivider: {
    height: 1,
    marginVertical: 14,
  },


  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },


  statusBadgeText: {
    fontSize: 10,
    fontWeight: '800',
  },


  // ==================================================
  // DELIVERY
  // ==================================================

  deliveryName: {
    fontSize: 14,
    fontWeight: '800',
  },


  deliveryPhone: {
    fontSize: 12,
    marginTop: 5,
  },


  deliveryAddress: {
    fontSize: 12,
    lineHeight: 18,
    marginTop: 8,
  },


  // ==================================================
  // SUMMARY
  // ==================================================

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


  // ==================================================
  // EMPTY
  // ==================================================

  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },


  emptyIcon: {
    fontSize: 48,
    marginBottom: 15,
  },


  emptyTitle: {
    fontSize: 20,
    fontWeight: '800',
  },


  emptyText: {
    textAlign: 'center',
    fontSize: 13,
    lineHeight: 20,
    marginTop: 8,
  },


  backHomeButton: {
    marginTop: 22,
    paddingHorizontal: 28,
    height: 48,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },


  backHomeText: {
    fontSize: 14,
    fontWeight: '800',
  },

});