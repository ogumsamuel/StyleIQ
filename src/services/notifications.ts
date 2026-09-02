import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  writeBatch,
} from 'firebase/firestore';

import {
  auth,
  db,
} from './firebase';


// ==================================================
// NOTIFICATION TYPES
// ==================================================

export type NotificationType =
  | 'order'
  | 'payment'
  | 'wishlist'
  | 'recommendation'
  | 'promotion'
  | 'new_arrival'
  | 'app_update';


// ==================================================
// NOTIFICATION PREFERENCE KEYS
// ==================================================

type NotificationPreferenceKey =
  | 'orderUpdates'
  | 'newArrivals'
  | 'styleRecommendations'
  | 'promotions'
  | 'wishlistUpdates'
  | 'appUpdates';


// ==================================================
// NOTIFICATION DOCUMENT
// ==================================================

export type AppNotification = {
  id: string;

  title: string;

  message: string;

  type: NotificationType;

  read: boolean;

  createdAt: any;

  orderId?: string;

  productId?: string;
};


// ==================================================
// CREATE NOTIFICATION PARAMETERS
// ==================================================

type CreateNotificationParams = {
  title: string;

  message: string;

  type: NotificationType;

  orderId?: string;

  productId?: string;

  userId?: string;
};


// ==================================================
// MAP NOTIFICATION TYPE
// TO USER PREFERENCE
// ==================================================

const getPreferenceKey = (
  type: NotificationType
): NotificationPreferenceKey => {

  switch (type) {

    case 'order':
    case 'payment':
      return 'orderUpdates';

    case 'new_arrival':
      return 'newArrivals';

    case 'recommendation':
      return 'styleRecommendations';

    case 'promotion':
      return 'promotions';

    case 'wishlist':
      return 'wishlistUpdates';

    case 'app_update':
      return 'appUpdates';

    default:
      return 'appUpdates';
  }
};


// ==================================================
// CHECK NOTIFICATION PREFERENCE
// ==================================================

const isNotificationEnabled = async (
  userId: string,
  type: NotificationType
): Promise<boolean> => {

  try {

    const settingsRef =
      doc(
        db,
        'users',
        userId,
        'notificationSettings',
        'preferences'
      );


    const snapshot =
      await getDoc(
        settingsRef
      );


    // ==============================================
    // DEFAULT
    // ==============================================

    if (!snapshot.exists()) {
      return true;
    }


    const data =
      snapshot.data();


    const preferenceKey =
      getPreferenceKey(type);


    const value =
      data[preferenceKey];


    // ==============================================
    // ONLY EXPLICIT FALSE DISABLES
    // ==============================================

    return value !== false;

  } catch (error) {

    console.error(
      'Notification preference error:',
      error
    );


    // ==============================================
    // FAIL OPEN
    //
    // Important notifications should not disappear
    // simply because preference checking failed.
    // ==============================================

    return true;
  }
};


// ==================================================
// CREATE NOTIFICATION
// ==================================================

export const createNotification = async ({
  title,
  message,
  type,
  orderId,
  productId,
  userId,
}: CreateNotificationParams) => {

  // ==============================================
  // DETERMINE USER
  //
  // userId can be supplied when creating a
  // notification for another authenticated user.
  //
  // Otherwise use the currently signed-in user.
  // ==============================================

  const targetUserId =
    userId ||
    auth.currentUser?.uid;


  if (!targetUserId) {

    console.log(
      'Cannot create notification: no user ID available.'
    );

    return null;
  }


  try {

    // ============================================
    // CHECK PREFERENCE
    // ============================================

    const enabled =
      await isNotificationEnabled(
        targetUserId,
        type
      );


    if (!enabled) {

      console.log(
        `Notification skipped because ${type} notifications are disabled.`
      );

      return null;
    }


    // ============================================
    // NOTIFICATIONS COLLECTION
    // ============================================

    const notificationsRef =
      collection(
        db,
        'users',
        targetUserId,
        'notifications'
      );


    // ============================================
    // NOTIFICATION DATA
    // ============================================

    const notificationData = {

      title:
        title.trim(),

      message:
        message.trim(),

      type,

      read:
        false,

      createdAt:
        serverTimestamp(),

      ...(orderId
        ? { orderId }
        : {}),

      ...(productId
        ? { productId }
        : {}),
    };


    // ============================================
    // SAVE
    // ============================================

    const notification =
      await addDoc(
        notificationsRef,
        notificationData
      );


    console.log(
      'Notification created:',
      notification.id
    );


    return notification.id;

  } catch (error) {

    console.error(
      'Create notification error:',
      error
    );

    return null;
  }
};


// ==================================================
// SUBSCRIBE TO USER NOTIFICATIONS
// ==================================================

export const subscribeToNotifications = (
  userId: string,
  callback: (
    notifications: AppNotification[]
  ) => void
) => {

  const notificationsRef =
    collection(
      db,
      'users',
      userId,
      'notifications'
    );


  const notificationsQuery =
    query(
      notificationsRef,
      orderBy(
        'createdAt',
        'desc'
      )
    );


  const unsubscribe =
    onSnapshot(
      notificationsQuery,

      (snapshot) => {

        const notifications =
          snapshot.docs.map(
            (notificationDoc) => {

              const data =
                notificationDoc.data();


              return {

                id:
                  notificationDoc.id,

                title:
                  typeof data.title === 'string'
                    ? data.title
                    : '',

                message:
                  typeof data.message === 'string'
                    ? data.message
                    : '',

                type:
                  data.type as NotificationType,

                read:
                  data.read === true,

                createdAt:
                  data.createdAt || null,

                ...(data.orderId
                  ? {
                      orderId:
                        String(
                          data.orderId
                        ),
                    }
                  : {}),

                ...(data.productId
                  ? {
                      productId:
                        String(
                          data.productId
                        ),
                    }
                  : {}),
              };

            }
          );


        callback(
          notifications
        );

      },

      (error) => {

        console.error(
          'Notification listener error:',
          error
        );


        // Return an empty list rather than
        // crashing the notification screen.

        callback([]);
      }
    );


  return unsubscribe;
};


// ==================================================
// MARK SINGLE NOTIFICATION AS READ
// ==================================================

export const markNotificationAsRead = async (
  userId: string,
  notificationId: string
) => {

  const notificationRef =
    doc(
      db,
      'users',
      userId,
      'notifications',
      notificationId
    );


  await updateDoc(
    notificationRef,
    {
      read: true,
    }
  );
};


// ==================================================
// MARK ALL NOTIFICATIONS AS READ
// ==================================================

export const markAllNotificationsAsRead = async (
  userId: string,
  notifications: AppNotification[]
) => {

  const unreadNotifications =
    notifications.filter(
      notification =>
        !notification.read
    );


  if (
    unreadNotifications.length === 0
  ) {

    return;
  }


  const batch =
    writeBatch(db);


  unreadNotifications.forEach(
    (notification) => {

      const notificationRef =
        doc(
          db,
          'users',
          userId,
          'notifications',
          notification.id
        );


      batch.update(
        notificationRef,
        {
          read: true,
        }
      );

    }
  );


  await batch.commit();
};


// ==================================================
// DELETE NOTIFICATION
// ==================================================

export const deleteNotification = async (
  userId: string,
  notificationId: string
) => {

  const notificationRef =
    doc(
      db,
      'users',
      userId,
      'notifications',
      notificationId
    );


  await deleteDoc(
    notificationRef
  );
};