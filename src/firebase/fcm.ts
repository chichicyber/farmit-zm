'use client';
import { getMessaging, getToken, isSupported } from 'firebase/messaging';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { initializeFirebase } from '@/firebase';

// This function can be called from a client component to request notification permission and save the token.
export const requestNotificationPermissionAndSaveToken = async (userId: string) => {
  // First, check if messaging is supported by the browser.
  const supported = await isSupported();
  if (!supported) {
    console.log('Firebase Messaging is not supported in this browser.');
    return;
  }
  
  const { firebaseApp, firestore } = initializeFirebase();
  const messaging = getMessaging(firebaseApp);

  try {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;
      if (!vapidKey || vapidKey === "YOUR_FIREBASE_MESSAGING_VAPID_KEY") {
          console.error("VAPID key not configured. Please add NEXT_PUBLIC_FIREBASE_VAPID_KEY to your .env file.");
          return;
      }
      
      const currentToken = await getToken(messaging, { vapidKey });

      if (currentToken) {
        console.log('FCM Token:', currentToken);
        const deviceRef = doc(firestore, 'users', userId, 'devices', currentToken);
        await setDoc(deviceRef, {
          token: currentToken,
          createdAt: serverTimestamp(),
        });
        console.log('FCM token saved to Firestore.');
      } else {
        console.log('No registration token available. Request permission to generate one.');
      }
    } else {
      console.log('Unable to get permission to notify.');
    }
  } catch (err) {
    console.error('An error occurred while retrieving token or permission. ', err);
  }
};
