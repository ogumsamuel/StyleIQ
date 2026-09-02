import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import {
  doc,
  setDoc,
} from 'firebase/firestore';

import {
  auth,
  db,
} from './firebase';


// ==================================================
// NOTIFICATION BEHAVIOR
// ==================================================
//
// This controls what happens when a notification
// arrives while StyleIQ is open.
//
// The notification will still be stored in
// Firestore separately by our notification service.
//

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});


// ==================================================
// REGISTER FOR PUSH NOTIFICATIONS
// ==================================================

export async function registerForPushNotificationsAsync(): Promise<
  string | null
> {

  try {

    // ==================================================
    // USER
    // ==================================================

    const user =
      auth.currentUser;

    if (!user) {

      console.log(
        'Push notification registration skipped: no signed-in user.'
      );

      return null;
    }


    // ==================================================
    // PHYSICAL DEVICE CHECK
    // ==================================================

    if (!Device.isDevice) {

      console.log(
        'Push notifications require a physical device.'
      );

      return null;
    }


    // ==================================================
    // ANDROID NOTIFICATION CHANNEL
    // ==================================================

    if (Device.osName === 'Android') {

      await Notifications.setNotificationChannelAsync(
        'default',
        {
          name: 'default',
          importance:
            Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          sound: 'default',
          lockscreenVisibility:
            Notifications.AndroidNotificationVisibility.PUBLIC,
        }
      );

    }


    // ==================================================
    // CHECK EXISTING PERMISSION
    // ==================================================

    const {
      status: existingStatus,
    } =
      await Notifications.getPermissionsAsync();


    let finalStatus =
      existingStatus;


    // ==================================================
    // REQUEST PERMISSION
    // ==================================================

    if (
      existingStatus !==
      Notifications.PermissionStatus.GRANTED
    ) {

      const {
        status,
      } =
        await Notifications.requestPermissionsAsync();

      finalStatus =
        status;

    }


    // ==================================================
    // PERMISSION DENIED
    // ==================================================

    if (
      finalStatus !==
      Notifications.PermissionStatus.GRANTED
    ) {

      console.log(
        'Push notification permission was not granted.'
      );

      return null;
    }


    // ==================================================
    // PROJECT ID
    // ==================================================

    const projectId =
      Constants.expoConfig?.extra?.eas?.projectId;


    if (!projectId) {

      console.error(
        'Expo EAS project ID is missing.'
      );

      return null;
    }


    // ==================================================
    // GET EXPO PUSH TOKEN
    // ==================================================

    const tokenResponse =
      await Notifications.getExpoPushTokenAsync({
        projectId,
      });


    const pushToken =
      tokenResponse.data;


    console.log(
      'Expo Push Token:',
      pushToken
    );


    // ==================================================
    // SAVE TOKEN TO FIRESTORE
    // ==================================================

    await setDoc(
      doc(
        db,
        'users',
        user.uid
      ),
      {
        pushToken,
        pushTokenUpdatedAt:
          new Date(),
      },
      {
        merge: true,
      }
    );


    console.log(
      'Push token saved to Firestore.'
    );


    return pushToken;

  } catch (error) {

    console.error(
      'Push notification registration error:',
      error
    );

    return null;
  }
}


// ==================================================
// REMOVE PUSH TOKEN
// ==================================================

export async function removePushToken() {

  const user =
    auth.currentUser;

  if (!user) {
    return;
  }


  try {

    await setDoc(
      doc(
        db,
        'users',
        user.uid
      ),
      {
        pushToken: null,
        pushTokenUpdatedAt:
          new Date(),
      },
      {
        merge: true,
      }
    );


    console.log(
      'Push token removed from Firestore.'
    );

  } catch (error) {

    console.error(
      'Remove push token error:',
      error
    );

  }
}