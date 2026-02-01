'use client';
import { useEffect } from 'react';
import { useAuth as useAppAuth } from '@/hooks/use-auth';
import { requestNotificationPermissionAndSaveToken } from '@/firebase/fcm';
import { useMessaging } from '@/firebase';
import { onMessage } from 'firebase/messaging';
import { useToast } from '@/hooks/use-toast';

export function FcmHandler() {
  const { user } = useAppAuth();
  const messaging = useMessaging();
  const { toast } = useToast();

  useEffect(() => {
    // This effect should only run on the client
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator && user && messaging) {
      requestNotificationPermissionAndSaveToken(user.uid);

      const unsubscribe = onMessage(messaging, (payload) => {
        console.log('Foreground message received.', payload);
        toast({
          title: payload.notification?.title,
          description: payload.notification?.body,
        });
      });

      return () => {
        unsubscribe();
      };
    }
  }, [user, messaging, toast]);

  return null; // This component does not render anything.
}
