import React, { useEffect, useState } from 'react';

import {
  ActivityIndicator,
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
  getDocs,
} from 'firebase/firestore';

import { auth, db } from '../src/services/firebase';

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
  image?: string;
  quantity: number;
};

type Order = {
  id: string;
  orderNumber: string;
  items: OrderItem[];
  total: number;
  totalQuantity: number;
  customerName: string;
  phone: string;
  address: string;
  paymentMethod: string;
  paymentStatus: string;
  orderStatus: string;
  deliveryStatus: string;
  paystackReference?: string | null;
  createdAt?: any;
  updatedAt?: any;
};


// ==================================================
// ORDERS SCREEN
// ==================================================

export default function OrdersScreen() {

  const { colors } = useTheme();

  const [orders, setOrders] =
    useState<Order[]>([]);

  const [loading, setLoading] =
    useState(true);


  // ==================================================
  // LOAD USER ORDERS
  // ==================================================

  useEffect(() => {
    loadOrders();
  }, []);


  const loadOrders = async () => {

    const user = auth.currentUser;

    if (!user) {

      setLoading(false);

      return;
    }

    try {

      const ordersRef = collection(
        db,
        'users',
        user.uid,
        'orders'
      );

      const snapshot =
        await getDocs(ordersRef);


      const loadedOrders =
        snapshot.docs.map((orderDoc) => {

          const data =
            orderDoc.data();

          return {
            id: orderDoc.id,

            orderNumber:
              data.orderNumber ||
              'Unknown Order',

            items:
              Array.isArray(data.items)
                ? data.items
                : [],

            total:
              typeof data.total === 'number'
                ? data.total
                : Number(data.total || 0),

            totalQuantity:
              typeof data.totalQuantity === 'number'
                ? data.totalQuantity
                : 0,

            customerName:
              data.customerName || '',

            phone:
              data.phone || '',

            address:
              data.address || '',

            paymentMethod:
              data.paymentMethod || 'Unknown',

            paymentStatus:
              data.paymentStatus || 'Pending',

            orderStatus:
              data.orderStatus || 'Processing',

            deliveryStatus:
              data.deliveryStatus || 'Pending',

            paystackReference:
              data.paystackReference || null,

            createdAt:
              data.createdAt,

            updatedAt:
              data.updatedAt,

          };

        }) as Order[];


      // ==================================================
      // NEWEST FIRST
      // ==================================================

      loadedOrders.sort((a, b) => {

        const aTime =
          a.createdAt?.toMillis?.() || 0;

        const bTime =
          b.createdAt?.toMillis?.() || 0;

        return bTime - aTime;

      });


      setOrders(
        loadedOrders
      );

    } catch (error) {

      console.log(
        'Order history error:',
        error
      );

    } finally {

      setLoading(false);

    }

  };


  // ==================================================
  // DATE
  // ==================================================

  const formatDate = (
    timestamp: any
  ) => {

    if (!timestamp?.toDate) {
      return 'Date unavailable';
    }

    try {

      return timestamp
        .toDate()
        .toLocaleDateString(
          'en-US',
          {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          }
        );

    } catch {

      return 'Date unavailable';

    }

  };


  // ==================================================
  // PAYMENT STATUS
  // ==================================================

  const getPaymentStatusStyle = (
    status: string
  ) => {

    if (
      status?.toLowerCase() === 'paid'
    ) {

      return {
        backgroundColor:
          colors.iconBackground,
      };

    }

    return {
      backgroundColor:
        colors.input,
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
          Loading your orders...
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

      {/* HEADER */}

      <View
        style={styles.header}
      >

        <Pressable
          style={styles.backButton}
          onPress={() =>
            router.back()
          }
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


        <Text
          style={[
            styles.headerTitle,
            {
              color:
                colors.text,
            },
          ]}
        >
          My Orders
        </Text>


        <View
          style={styles.headerSpace}
        />

      </View>


      {/* EMPTY */}

      {orders.length === 0 ? (

        <View
          style={
            styles.emptyContainer
          }
        >

          <View
            style={[
              styles.emptyIcon,
              {
                backgroundColor:
                  colors.iconBackground,
              },
            ]}
          >

            <Text
              style={
                styles.emptyIconText
              }
            >
              🛍️
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
            No orders yet
          </Text>


          <Text
            style={[
              styles.emptySubtitle,
              {
                color:
                  colors.secondaryText,
              },
            ]}
          >
            Your orders will appear here.
          </Text>


          <Pressable
            style={[
              styles.shopButton,
              {
                backgroundColor:
                  colors.primary,
              },
            ]}
            onPress={() =>
              router.replace('/(tabs)')
            }
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
              Start Shopping
            </Text>

          </Pressable>

        </View>

      ) : (

        <ScrollView
          showsVerticalScrollIndicator={
            false
          }
          contentContainerStyle={
            styles.scrollContent
          }
        >

          {/* ORDER COUNT */}

          <View
            style={[
              styles.orderCountCard,
              {
                backgroundColor:
                  colors.card,

                borderColor:
                  colors.border,
              },
            ]}
          >

            <View>

              <Text
                style={[
                  styles.orderCountTitle,
                  {
                    color:
                      colors.text,
                  },
                ]}
              >
                Your Orders
              </Text>

              <Text
                style={[
                  styles.orderCountSubtitle,
                  {
                    color:
                      colors.secondaryText,
                  },
                ]}
              >
                {orders.length}{' '}
                {orders.length === 1
                  ? 'order'
                  : 'orders'}
              </Text>

            </View>

            <Text
              style={
                styles.orderCountIcon
              }
            >
              📦
            </Text>

          </View>


          {/* ORDERS */}

          {orders.map((order) => (

            <Pressable
              key={order.id}

              style={[
                styles.orderCard,
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
                    '/order-details',

                  params: {
                    orderId:
                      order.id,
                  },
                })
              }
            >

              {/* HEADER */}

              <View
                style={
                  styles.orderHeader
                }
              >

                <View>

                  <Text
                    style={[
                      styles.orderNumber,
                      {
                        color:
                          colors.text,
                      },
                    ]}
                  >
                    {order.orderNumber}
                  </Text>

                  <Text
                    style={[
                      styles.orderDate,
                      {
                        color:
                          colors.secondaryText,
                      },
                    ]}
                  >
                    {formatDate(
                      order.createdAt
                    )}
                  </Text>

                </View>


                <View
                  style={[
                    styles.statusBadge,
                    {
                      backgroundColor:
                        colors.primaryLight,
                    },
                  ]}
                >

                  <Text
                    style={[
                      styles.statusText,
                      {
                        color:
                          colors.primary,
                      },
                    ]}
                  >
                    {order.orderStatus}
                  </Text>

                </View>

              </View>


              {/* PRODUCTS */}

              <View
                style={
                  styles.productsPreview
                }
              >

                {order.items
                  ?.slice(0, 3)
                  .map((item, index) => (

                    <Image
                      key={`${item.id}-${index}`}
                      source={{
                        uri:
                          item.image || '',
                      }}
                      style={[
                        styles.productImage,
                        {
                          backgroundColor:
                            colors.input,
                        },
                      ]}
                    />

                  ))}

              </View>


              {/* INFO */}

              <View
                style={[
                  styles.orderInfo,
                  {
                    borderTopColor:
                      colors.border,
                  },
                ]}
              >

                <View>

                  <Text
                    style={[
                      styles.itemCount,
                      {
                        color:
                          colors.text,
                      },
                    ]}
                  >
                    {order.totalQuantity}{' '}
                    {order.totalQuantity === 1
                      ? 'item'
                      : 'items'}
                  </Text>


                  <View
                    style={
                      styles.paymentRow
                    }
                  >

                    <Text
                      style={[
                        styles.paymentMethod,
                        {
                          color:
                            colors.secondaryText,
                        },
                      ]}
                    >
                      {order.paymentMethod}
                    </Text>


                    <View
                      style={
                        getPaymentStatusStyle(
                          order.paymentStatus
                        )
                      }
                    >

                      <Text
                        style={[
                          styles.paymentStatusText,
                          {
                            color:
                              colors.secondaryText,
                          },
                        ]}
                      >
                        {order.paymentStatus}
                      </Text>

                    </View>

                  </View>

                </View>


                <Text
                  style={[
                    styles.total,
                    {
                      color:
                        colors.primary,
                    },
                  ]}
                >
                  $
                  {Number(
                    order.total || 0
                  ).toFixed(2)}
                </Text>

              </View>


              {/* DETAILS */}

              <View
                style={[
                  styles.detailsRow,
                  {
                    borderTopColor:
                      colors.border,
                  },
                ]}
              >

                <Text
                  style={[
                    styles.detailsText,
                    {
                      color:
                        colors.text,
                    },
                  ]}
                >
                  View Order Details
                </Text>

                <Text
                  style={[
                    styles.detailsArrow,
                    {
                      color:
                        colors.primary,
                    },
                  ]}
                >
                  ›
                </Text>

              </View>

            </Pressable>

          ))}


          <View
            style={{ height: 30 }}
          />

        </ScrollView>

      )}

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

  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },

  emptyIcon: {
    width: 85,
    height: 85,
    borderRadius: 42,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },

  emptyIconText: {
    fontSize: 36,
  },

  emptyTitle: {
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 8,
  },

  emptySubtitle: {
    textAlign: 'center',
    fontSize: 14,
    lineHeight: 21,
    marginBottom: 25,
  },

  shopButton: {
    height: 52,
    paddingHorizontal: 30,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },

  shopButtonText: {
    fontSize: 14,
    fontWeight: '800',
  },

  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },

  orderCountCard: {
    borderRadius: 18,
    padding: 18,
    marginTop: 8,
    marginBottom: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
  },

  orderCountTitle: {
    fontSize: 17,
    fontWeight: '800',
  },

  orderCountSubtitle: {
    fontSize: 12,
    marginTop: 4,
  },

  orderCountIcon: {
    fontSize: 28,
  },

  orderCard: {
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
  },

  orderHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },

  orderNumber: {
    fontSize: 14,
    fontWeight: '800',
  },

  orderDate: {
    fontSize: 11,
    marginTop: 4,
  },

  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
  },

  statusText: {
    fontSize: 10,
    fontWeight: '800',
  },

  productsPreview: {
    flexDirection: 'row',
    marginBottom: 15,
  },

  productImage: {
    width: 58,
    height: 65,
    borderRadius: 10,
    marginRight: 8,
  },

  orderInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    paddingTop: 13,
  },

  itemCount: {
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 7,
  },

  paymentRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  paymentMethod: {
    fontSize: 11,
    marginRight: 8,
  },

  paymentStatusText: {
    fontSize: 9,
    fontWeight: '800',
  },

  total: {
    fontSize: 19,
    fontWeight: '800',
  },

  detailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    marginTop: 14,
    paddingTop: 12,
  },

  detailsText: {
    fontSize: 12,
    fontWeight: '700',
  },

  detailsArrow: {
    fontSize: 22,
  },

});