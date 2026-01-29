'use client';

import { useUser, useAuth as useFirebaseAuth } from '@/firebase';
import { signOut as firebaseSignOut } from 'firebase/auth';

export const useAuth = () => {
  const { user, isUserLoading, userError } = useUser();
  const auth = useFirebaseAuth();

  const logout = async () => {
    if (auth) {
      await firebaseSignOut(auth);
    } else {
      console.error("Firebase auth instance not available for logout.");
    }
  };

  return { user, loading: isUserLoading, error: userError, logout };
};
