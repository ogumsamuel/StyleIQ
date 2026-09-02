import React, {
  useEffect,
  useState,
} from 'react';

import {
  ActivityIndicator,
  Alert,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';

import { router } from 'expo-router';

import {
  doc,
  getDoc,
  setDoc,
} from 'firebase/firestore';

import { auth, db } from '../src/services/firebase';

import {
  AppNotification,
  deleteNotification,
  markAllNotificationsAsRead,
  markNotificationAsRead,
  subscribeToNotifications,
} from '../src/services/notifications';

import { useTheme } from '../src/theme/ThemeContext';


// ==================================================
// NOTIFICATION SETTINGS TYPE
// ==================================================

type NotificationSettings = {
  orderUpdates: boolean;
  newArrivals: boolean;
  styleRecommendations: boolean;
  promotions: boolean;
  wishlistUpdates: boolean;
  appUpdates: boolean;
};


// ==================================================
// DEFAULT SETTINGS
// ==================================================

const defaultSettings: NotificationSettings = {
  orderUpdates: true,
  newArrivals: true,
  styleRecommendations: true,
  promotions: true,
  wishlistUpdates: true,
  appUpdates: true,
};


// ==================================================
// NOTIFICATIONS SCREEN
// ==================================================

export default function NotificationsScreen() {

  const { colors } = useTheme();


  // ==================================================
  // STATE
  // ==================================================

  const [settings, setSettings] =
    useState<NotificationSettings>(
      defaultSettings
    );

  const [notifications, setNotifications] =
    useState<AppNotification[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [notificationsLoading, setNotificationsLoading] =
    useState(true);

  const [savingKey, setSavingKey] =
    useState<keyof NotificationSettings | null>(
      null
    );

  const [processingId, setProcessingId] =
    useState<string | null>(null);


  // ==================================================
  // LOAD SETTINGS
  // ==================================================

  useEffect(() => {

    loadNotificationSettings();

  }, []);


  // ==================================================
  // LISTEN TO NOTIFICATIONS
  // ==================================================

  useEffect(() => {

    const user = auth.currentUser;

    if (!user) {

      setNotifications([]);
      setNotificationsLoading(false);

      return;
    }

    const unsubscribe =
      subscribeToNotifications(
        user.uid,
        data => {

          setNotifications(data);

          setNotificationsLoading(false);

        }
      );

    return unsubscribe;

  }, []);


  // ==================================================
  // LOAD NOTIFICATION SETTINGS
  // ==================================================

  const loadNotificationSettings = async () => {

    const user = auth.currentUser;

    if (!user) {

      setLoading(false);

      Alert.alert(
        'Sign in required',
        'Please sign in to manage your notification settings.',
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

      const settingsRef =
        doc(
          db,
          'users',
          user.uid,
          'notificationSettings',
          'preferences'
        );


      const snapshot =
        await getDoc(
          settingsRef
        );


      if (snapshot.exists()) {

        const data =
          snapshot.data();


        setSettings({

          orderUpdates:
            typeof data.orderUpdates === 'boolean'
              ? data.orderUpdates
              : true,

          newArrivals:
            typeof data.newArrivals === 'boolean'
              ? data.newArrivals
              : true,

          styleRecommendations:
            typeof data.styleRecommendations === 'boolean'
              ? data.styleRecommendations
              : true,

          promotions:
            typeof data.promotions === 'boolean'
              ? data.promotions
              : true,

          wishlistUpdates:
            typeof data.wishlistUpdates === 'boolean'
              ? data.wishlistUpdates
              : true,

          appUpdates:
            typeof data.appUpdates === 'boolean'
              ? data.appUpdates
              : true,

        });

      }

    } catch (error) {

      console.log(
        'Load notification settings error:',
        error
      );

      Alert.alert(
        'Error',
        'We could not load your notification settings.'
      );

    } finally {

      setLoading(false);

    }
  };


  // ==================================================
  // UPDATE SETTING
  // ==================================================

  const updateSetting = async (
    key: keyof NotificationSettings
  ) => {

    const user = auth.currentUser;

    if (!user) {

      Alert.alert(
        'Sign in required',
        'Please sign in to manage your notification settings.'
      );

      return;
    }


    const newValue =
      !settings[key];


    // ==============================================
    // UPDATE UI IMMEDIATELY
    // ==============================================

    setSettings(
      previous => ({
        ...previous,
        [key]: newValue,
      })
    );


    try {

      setSavingKey(key);


      const settingsRef =
        doc(
          db,
          'users',
          user.uid,
          'notificationSettings',
          'preferences'
        );


      await setDoc(
        settingsRef,
        {
          [key]: newValue,
          updatedAt: new Date(),
        },
        {
          merge: true,
        }
      );


    } catch (error) {

      console.log(
        'Save notification setting error:',
        error
      );


      // ============================================
      // REVERT UI
      // ============================================

      setSettings(
        previous => ({
          ...previous,
          [key]: !newValue,
        })
      );


      Alert.alert(
        'Error',
        'We could not save this notification setting. Please try again.'
      );


    } finally {

      setSavingKey(null);

    }
  };


  // ==================================================
  // MARK SINGLE NOTIFICATION AS READ
  // ==================================================

  const handleNotificationPress = async (
    notification: AppNotification
  ) => {

    const user = auth.currentUser;

    if (!user) {
      return;
    }


    if (!notification.read) {

      try {

        setProcessingId(
          notification.id
        );

        await markNotificationAsRead(
          user.uid,
          notification.id
        );

      } catch (error) {

        Alert.alert(
          'Error',
          'We could not update this notification.'
        );

      } finally {

        setProcessingId(null);

      }

    }


    // ==============================================
    // ORDER NOTIFICATIONS
    // ==============================================

    if (
      notification.orderId
    ) {

      router.push({
        pathname: '/orders',
      });

      return;
    }


    // ==============================================
    // PRODUCT NOTIFICATIONS
    // ==============================================

    if (
      notification.productId
    ) {

      router.push({
        pathname: '/product/[id]',
        params: {
          id: notification.productId,
        },
      });

    }

  };


  // ==================================================
  // MARK ALL AS READ
  // ==================================================

  const handleMarkAllAsRead = async () => {

    const user = auth.currentUser;

    if (!user) {
      return;
    }


    const unread =
      notifications.filter(
        notification =>
          !notification.read
      );


    if (unread.length === 0) {
      return;
    }


    try {

      setProcessingId('all');


      await markAllNotificationsAsRead(
        user.uid,
        notifications
      );


    } catch (error) {

      Alert.alert(
        'Error',
        'We could not mark all notifications as read.'
      );

    } finally {

      setProcessingId(null);

    }
  };


  // ==================================================
  // DELETE NOTIFICATION
  // ==================================================

  const handleDeleteNotification = (
    notification: AppNotification
  ) => {

    const user = auth.currentUser;

    if (!user) {
      return;
    }


    Alert.alert(
      'Delete notification',
      'Are you sure you want to delete this notification?',
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

              setProcessingId(
                notification.id
              );


              await deleteNotification(
                user.uid,
                notification.id
              );


            } catch (error) {

              Alert.alert(
                'Error',
                'We could not delete this notification.'
              );

            } finally {

              setProcessingId(null);

            }

          },
        },
      ]
    );
  };


  // ==================================================
  // FORMAT NOTIFICATION DATE
  // ==================================================

  const formatNotificationDate = (
    timestamp: any
  ) => {

    if (!timestamp) {
      return 'Just now';
    }


    try {

      const date =
        timestamp.toDate
          ? timestamp.toDate()
          : new Date(timestamp);


      const now =
        new Date();


      const difference =
        now.getTime() -
        date.getTime();


      const minute =
        60 * 1000;

      const hour =
        60 * minute;

      const day =
        24 * hour;


      if (difference < minute) {
        return 'Just now';
      }


      if (difference < hour) {

        const minutes =
          Math.floor(
            difference / minute
          );

        return `${minutes}m ago`;
      }


      if (difference < day) {

        const hours =
          Math.floor(
            difference / hour
          );

        return `${hours}h ago`;
      }


      if (difference < 7 * day) {

        const days =
          Math.floor(
            difference / day
          );

        return `${days}d ago`;
      }


      return date.toLocaleDateString();

    } catch {

      return '';
    }
  };


  // ==================================================
  // NOTIFICATION ICON
  // ==================================================

  const getNotificationIcon = (
    type: AppNotification['type']
  ) => {

    switch (type) {

      case 'order':
        return '📦';

      case 'payment':
        return '💳';

      case 'wishlist':
        return '❤️';

      case 'recommendation':
        return '✨';

      case 'promotion':
        return '🎉';

      case 'new_arrival':
        return '🛍️';

      case 'app_update':
        return '📢';

      default:
        return '🔔';
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
          Loading notifications...
        </Text>

      </SafeAreaView>

    );
  }


  // ==================================================
  // UNREAD COUNT
  // ==================================================

  const unreadCount =
    notifications.filter(
      notification =>
        !notification.read
    ).length;


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


          <View
            style={styles.headerTitleContainer}
          >

            <Text
              style={[
                styles.headerTitle,
                {
                  color:
                    colors.text,
                },
              ]}
            >
              Notifications
            </Text>


            {unreadCount > 0 && (

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
                      color:
                        colors.white,
                    },
                  ]}
                >
                  {unreadCount}
                </Text>

              </View>

            )}

          </View>


          <Pressable
            style={styles.markAllButton}
            onPress={
              handleMarkAllAsRead
            }
            disabled={
              unreadCount === 0 ||
              processingId === 'all'
            }
          >

            <Text
              style={[
                styles.markAllText,
                {
                  color:
                    unreadCount > 0
                      ? colors.primary
                      : colors.secondaryText,
                },
              ]}
            >
              {processingId === 'all'
                ? 'Updating...'
                : 'Mark all read'}
            </Text>

          </Pressable>

        </View>


        {/* ==========================================
            NOTIFICATIONS INTRO
        ========================================== */}

        <View
          style={styles.intro}
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
            Your notifications
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
            Stay updated with your StyleIQ
            activity, orders and recommendations.
          </Text>

        </View>


        {/* ==========================================
            NOTIFICATION LIST
        ========================================== */}

        {notificationsLoading ? (

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

            <ActivityIndicator
              size="small"
              color={
                colors.primary
              }
            />

            <Text
              style={[
                styles.emptyText,
                {
                  color:
                    colors.secondaryText,
                },
              ]}
            >
              Loading notifications...
            </Text>

          </View>

        ) : notifications.length === 0 ? (

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
              🔔
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
              No notifications yet
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
              When you receive StyleIQ updates,
              they will appear here.
            </Text>

          </View>

        ) : (

          <View
            style={[
              styles.notificationsCard,
              {
                backgroundColor:
                  colors.card,
                borderColor:
                  colors.border,
              },
            ]}
          >

            {notifications.map(
              (
                notification,
                index
              ) => (

                <View
                  key={
                    notification.id
                  }
                >

                  <Pressable
                    style={[
                      styles.notificationItem,

                      !notification.read && {
                        backgroundColor:
                          colors.primaryLight,
                      },
                    ]}
                    onPress={() =>
                      handleNotificationPress(
                        notification
                      )
                    }
                    disabled={
                      processingId ===
                      notification.id
                    }
                  >

                    {/* ICON */}

                    <View
                      style={[
                        styles.notificationIcon,
                        {
                          backgroundColor:
                            colors.iconBackground,
                        },
                      ]}
                    >

                      <Text
                        style={
                          styles.notificationIconText
                        }
                      >
                        {getNotificationIcon(
                          notification.type
                        )}
                      </Text>

                    </View>


                    {/* CONTENT */}

                    <View
                      style={
                        styles.notificationItemContent
                      }
                    >

                      <View
                        style={
                          styles.notificationTitleRow
                        }
                      >

                        <Text
                          style={[
                            styles.notificationItemTitle,
                            {
                              color:
                                colors.text,
                            },
                          ]}
                          numberOfLines={1}
                        >
                          {
                            notification.title
                          }
                        </Text>


                        {!notification.read && (

                          <View
                            style={[
                              styles.unreadDot,
                              {
                                backgroundColor:
                                  colors.primary,
                              },
                            ]}
                          />

                        )}

                      </View>


                      <Text
                        style={[
                          styles.notificationMessage,
                          {
                            color:
                              colors.secondaryText,
                          },
                        ]}
                      >
                        {
                          notification.message
                        }
                      </Text>


                      <Text
                        style={[
                          styles.notificationDate,
                          {
                            color:
                              colors.secondaryText,
                          },
                        ]}
                      >
                        {formatNotificationDate(
                          notification.createdAt
                        )}
                      </Text>

                    </View>


                    {/* DELETE */}

                    <Pressable
                      style={
                        styles.deleteButton
                      }
                      onPress={() =>
                        handleDeleteNotification(
                          notification
                        )
                      }
                      hitSlop={8}
                    >

                      <Text
                        style={[
                          styles.deleteText,
                          {
                            color:
                              colors.secondaryText,
                          },
                        ]}
                      >
                        ×
                      </Text>

                    </Pressable>

                  </Pressable>


                  {index <
                    notifications.length - 1 && (

                    <View
                      style={[
                        styles.divider,
                        {
                          backgroundColor:
                            colors.border,
                        },
                      ]}
                    />

                  )}

                </View>

              )
            )}

          </View>

        )}


        {/* ==========================================
            PREFERENCES SECTION
        ========================================== */}

        <View
          style={styles.preferencesHeader}
        >

          <Text
            style={[
              styles.preferencesTitle,
              {
                color:
                  colors.text,
              },
            ]}
          >
            Notification Preferences
          </Text>


          <Text
            style={[
              styles.preferencesDescription,
              {
                color:
                  colors.secondaryText,
              },
            ]}
          >
            Choose the types of notifications you
            want to receive from StyleIQ.
          </Text>

        </View>


        {/* ==========================================
            PREFERENCE CARD
        ========================================== */}

        <View
          style={[
            styles.card,
            {
              backgroundColor:
                colors.card,
              borderColor:
                colors.border,
            },
          ]}
        >

          <NotificationRow
            icon="📦"
            title="Order Updates"
            description="Get updates about payments, shipping and deliveries."
            value={
              settings.orderUpdates
            }
            disabled={
              savingKey ===
              'orderUpdates'
            }
            onPress={() =>
              updateSetting(
                'orderUpdates'
              )
            }
            colors={colors}
          />


          <View
            style={[
              styles.divider,
              {
                backgroundColor:
                  colors.border,
              },
            ]}
          />


          <NotificationRow
            icon="🛍️"
            title="New Arrivals"
            description="Be the first to know when new products are added."
            value={
              settings.newArrivals
            }
            disabled={
              savingKey ===
              'newArrivals'
            }
            onPress={() =>
              updateSetting(
                'newArrivals'
              )
            }
            colors={colors}
          />


          <View
            style={[
              styles.divider,
              {
                backgroundColor:
                  colors.border,
              },
            ]}
          />


          <NotificationRow
            icon="✨"
            title="StyleIQ Recommendations"
            description="Receive personalized fashion and product recommendations."
            value={
              settings.styleRecommendations
            }
            disabled={
              savingKey ===
              'styleRecommendations'
            }
            onPress={() =>
              updateSetting(
                'styleRecommendations'
              )
            }
            colors={colors}
          />


          <View
            style={[
              styles.divider,
              {
                backgroundColor:
                  colors.border,
              },
            ]}
          />


          <NotificationRow
            icon="🎉"
            title="Promotions & Offers"
            description="Get notified about discounts, deals and special offers."
            value={
              settings.promotions
            }
            disabled={
              savingKey ===
              'promotions'
            }
            onPress={() =>
              updateSetting(
                'promotions'
              )
            }
            colors={colors}
          />


          <View
            style={[
              styles.divider,
              {
                backgroundColor:
                  colors.border,
              },
            ]}
          />


          <NotificationRow
            icon="❤️"
            title="Wishlist Updates"
            description="Know when wishlist products have price or availability changes."
            value={
              settings.wishlistUpdates
            }
            disabled={
              savingKey ===
              'wishlistUpdates'
            }
            onPress={() =>
              updateSetting(
                'wishlistUpdates'
              )
            }
            colors={colors}
          />


          <View
            style={[
              styles.divider,
              {
                backgroundColor:
                  colors.border,
                },
            ]}
          />


          <NotificationRow
            icon="📢"
            title="App Updates"
            description="Receive important StyleIQ announcements and feature updates."
            value={
              settings.appUpdates
            }
            disabled={
              savingKey ===
              'appUpdates'
            }
            onPress={() =>
              updateSetting(
                'appUpdates'
              )
            }
            colors={colors}
          />

        </View>


        {/* ==========================================
            INFORMATION CARD
        ========================================== */}

        <View
          style={[
            styles.infoCard,
            {
              backgroundColor:
                colors.primaryLight,
            },
          ]}
        >

          <Text
            style={styles.infoIcon}
          >
            🔔
          </Text>


          <View
            style={styles.infoContent}
          >

            <Text
              style={[
                styles.infoTitle,
                {
                  color:
                    colors.text,
                },
              ]}
            >
              Notification preferences
            </Text>


            <Text
              style={[
                styles.infoText,
                {
                  color:
                    colors.secondaryText,
                },
              ]}
            >
              You can change these preferences at
              any time. Turning a notification off
              prevents StyleIQ from creating that type
              of notification for you.
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
// NOTIFICATION ROW
// ==================================================

type NotificationRowProps = {
  icon: string;
  title: string;
  description: string;
  value: boolean;
  disabled: boolean;
  onPress: () => void;
  colors: ReturnType<typeof useTheme>['colors'];
};


function NotificationRow({
  icon,
  title,
  description,
  value,
  disabled,
  onPress,
  colors,
}: NotificationRowProps) {

  return (

    <Pressable
      style={styles.notificationRow}
      onPress={onPress}
      disabled={disabled}
    >

      <View
        style={[
          styles.iconContainer,
          {
            backgroundColor:
              colors.iconBackground,
          },
        ]}
      >

        <Text
          style={styles.iconText}
        >
          {icon}
        </Text>

      </View>


      <View
        style={
          styles.notificationContent
        }
      >

        <Text
          style={[
            styles.notificationTitle,
            {
              color:
                colors.text,
            },
          ]}
        >
          {title}
        </Text>


        <Text
          style={[
            styles.notificationDescription,
            {
              color:
                colors.secondaryText,
            },
          ]}
        >
          {description}
        </Text>

      </View>


      <Switch
        value={value}
        onValueChange={onPress}
        disabled={disabled}
        trackColor={{
          false:
            colors.border,
          true:
            colors.primaryLight,
        }}
        thumbColor={
          value
            ? colors.primary
            : colors.white
        }
      />

    </Pressable>
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
  // SCROLL
  // ==================================================

  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },


  // ==================================================
  // HEADER
  // ==================================================

  header: {
    minHeight: 65,
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

  headerTitleContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  headerTitle: {
    fontSize: 21,
    fontWeight: '800',
  },

  countBadge: {
    minWidth: 21,
    height: 21,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 7,
    paddingHorizontal: 5,
  },

  countText: {
    fontSize: 11,
    fontWeight: '800',
  },

  markAllButton: {
    width: 85,
    alignItems: 'flex-end',
  },

  markAllText: {
    fontSize: 10,
    fontWeight: '700',
  },


  // ==================================================
  // INTRO
  // ==================================================

  intro: {
    marginTop: 15,
    marginBottom: 20,
  },

  introTitle: {
    fontSize: 23,
    fontWeight: '800',
  },

  introText: {
    fontSize: 13,
    lineHeight: 19,
    marginTop: 6,
  },


  // ==================================================
  // NOTIFICATIONS
  // ==================================================

  notificationsCard: {
    borderRadius: 20,
    borderWidth: 1,
    overflow: 'hidden',
  },

  notificationItem: {
    minHeight: 105,
    paddingHorizontal: 14,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
  },

  notificationIcon: {
    width: 45,
    height: 45,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  notificationIconText: {
    fontSize: 21,
  },

  notificationItemContent: {
    flex: 1,
    paddingRight: 8,
  },

  notificationTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  notificationItemTitle: {
    flex: 1,
    fontSize: 13,
    fontWeight: '800',
  },

  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: 6,
  },

  notificationMessage: {
    fontSize: 11,
    lineHeight: 16,
    marginTop: 5,
  },

  notificationDate: {
    fontSize: 9.5,
    marginTop: 6,
  },

  deleteButton: {
    width: 28,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },

  deleteText: {
    fontSize: 25,
    fontWeight: '300',
  },

  emptyCard: {
    minHeight: 150,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 25,
  },

  emptyIcon: {
    fontSize: 30,
    marginBottom: 10,
  },

  emptyTitle: {
    fontSize: 15,
    fontWeight: '800',
  },

  emptyText: {
    fontSize: 11,
    lineHeight: 17,
    textAlign: 'center',
    marginTop: 6,
  },


  // ==================================================
  // PREFERENCES
  // ==================================================

  preferencesHeader: {
    marginTop: 30,
    marginBottom: 16,
  },

  preferencesTitle: {
    fontSize: 20,
    fontWeight: '800',
  },

  preferencesDescription: {
    fontSize: 12,
    lineHeight: 18,
    marginTop: 5,
  },

  card: {
    borderRadius: 20,
    borderWidth: 1,
    overflow: 'hidden',
  },

  notificationRow: {
    minHeight: 92,
    paddingHorizontal: 15,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
  },

  iconContainer: {
    width: 45,
    height: 45,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  iconText: {
    fontSize: 21,
  },

  notificationContent: {
    flex: 1,
    paddingRight: 10,
  },

  notificationTitle: {
    fontSize: 13,
    fontWeight: '800',
  },

  notificationDescription: {
    fontSize: 10.5,
    lineHeight: 15,
    marginTop: 4,
  },

  divider: {
    height: 1,
    marginLeft: 72,
  },


  // ==================================================
  // INFO CARD
  // ==================================================

  infoCard: {
    marginTop: 20,
    borderRadius: 18,
    padding: 16,
    flexDirection: 'row',
  },

  infoIcon: {
    fontSize: 22,
    marginRight: 12,
  },

  infoContent: {
    flex: 1,
  },

  infoTitle: {
    fontSize: 13,
    fontWeight: '800',
  },

  infoText: {
    fontSize: 11,
    lineHeight: 17,
    marginTop: 5,
  },

});