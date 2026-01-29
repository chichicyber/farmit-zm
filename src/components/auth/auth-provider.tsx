'use client';

import { AuthProvider as FirebaseAuthProvider } from '@/hooks/use-auth';
import type { ReactNode } from 'react';

export function AuthProvider({ children }: { children: ReactNode }) {
  return <FirebaseAuthProvider>{children}</FirebaseAuthProvider>;
}
