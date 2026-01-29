'use client';

import {
  useCollection,
  useFirestore,
  useMemoFirebase,
  useAuth,
  useDoc,
} from '@/firebase';
import { collection, doc } from 'firebase/firestore';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Shield } from 'lucide-react';

type UserProfile = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'admin' | 'farmer' | 'student' | 'user';
};

type CurrentUser = {
  role: string;
};

export default function AdminPage() {
  const firestore = useFirestore();
  const auth = useAuth();
  const router = useRouter();

  const currentUserRef = useMemoFirebase(() => {
    if (!auth.currentUser?.uid || !firestore) return null;
    return doc(firestore, 'users', auth.currentUser.uid);
  }, [auth.currentUser, firestore]);

  const { data: currentUser, isLoading: isAuthLoading } =
    useDoc<CurrentUser>(currentUserRef);

  const isAdmin =
    currentUser?.role === 'admin' ||
    auth.currentUser?.email === 'henrychemba@gmail.com';

  useEffect(() => {
    if (!isAuthLoading && !isAdmin) {
      router.replace('/dashboard');
    }
  }, [isAdmin, isAuthLoading, router]);

  const usersQuery = useMemoFirebase(
    () => (firestore ? collection(firestore, 'users') : null),
    [firestore]
  );
  const { data: users, isLoading } = useCollection<UserProfile>(usersQuery);

  if (isAuthLoading || !isAdmin) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-solid border-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="flex items-center gap-2 text-3xl font-bold font-headline tracking-tight">
          <Shield className="h-8 w-8 text-primary" /> User Management
        </h1>
        <p className="text-muted-foreground">
          View and manage all users in the system.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>All Users</CardTitle>
          <CardDescription>
            A list of all users who have registered on the platform.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <>
                    <TableRow>
                      <TableCell colSpan={3}>
                        <Skeleton className="h-8 w-full" />
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell colSpan={3}>
                        <Skeleton className="h-8 w-full" />
                      </TableCell>
                    </TableRow>
                  </>
                ) : users && users.length > 0 ? (
                  users.map((user) => (
                    <TableRow key={user.id} className="hover:bg-muted/50">
                      <TableCell className="font-medium">
                        <Link
                          href={`/admin/users/${user.id}`}
                          className="text-primary hover:underline"
                        >
                          {user.firstName} {user.lastName}
                        </Link>
                      </TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            user.role === 'admin' ? 'destructive' : 'secondary'
                          }
                          className="capitalize"
                        >
                          {user.role}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={3} className="h-24 text-center">
                      No users found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
