'use client';

import {
  useCollection,
  useDoc,
  useFirestore,
  useMemoFirebase,
} from '@/firebase';
import { collection, doc } from 'firebase/firestore';
import { notFound } from 'next/navigation';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Tractor, Rabbit } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

type UserProfile = {
  firstName: string;
  lastName: string;
  email: string;
  role: string;
};

type Animal = { id: string };
type Crop = { id: string };

export default function UserStatisticsPage({
  params,
}: {
  params: { userId: string };
}) {
  const { userId } = params;
  const firestore = useFirestore();

  const userRef = useMemoFirebase(
    () => (firestore ? doc(firestore, 'users', userId) : null),
    [firestore, userId]
  );
  const { data: user, isLoading: isUserLoading } = useDoc<UserProfile>(userRef);

  const cropsQuery = useMemoFirebase(
    () =>
      firestore
        ? collection(firestore, 'users', userId, 'crop_tracking')
        : null,
    [firestore, userId]
  );
  const { data: crops, isLoading: areCropsLoading } = useCollection<Crop>(cropsQuery);

  const animalsQuery = useMemoFirebase(
    () =>
      firestore
        ? collection(firestore, 'users', userId, 'animal_tracking')
        : null,
    [firestore, userId]
  );
  const { data: animals, isLoading: areAnimalsLoading } = useCollection<Animal>(animalsQuery);

  if (!isUserLoading && !user) {
    notFound();
  }

  const userInitial = user
    ? `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`
    : '?';

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        {isUserLoading ? (
          <Skeleton className="h-20 w-20 rounded-full" />
        ) : (
          <Avatar className="h-20 w-20 border">
            <AvatarFallback className="text-2xl">
              {userInitial}
            </AvatarFallback>
          </Avatar>
        )}
        <div className="flex flex-col gap-1">
          {isUserLoading ? (
            <>
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-6 w-32" />
            </>
          ) : (
            <>
              <h1 className="text-3xl font-bold font-headline tracking-tight">
                {user?.firstName} {user?.lastName}
              </h1>
              <div className="flex items-center gap-2">
                <p className="text-muted-foreground">{user?.email}</p>
                <Badge variant="secondary" className="capitalize">
                  {user?.role}
                </Badge>
              </div>
            </>
          )}
        </div>
      </div>

       <div className='flex justify-start'>
         <Button asChild variant="outline">
          <Link href="/admin">
            Back to User List
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Tracked Crops
            </CardTitle>
            <Tractor className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {areCropsLoading ? (
              <Skeleton className="h-8 w-1/2" />
            ) : (
              <div className="text-2xl font-bold">
                {crops?.length ?? 0} Fields
              </div>
            )}
            <p className="text-xs text-muted-foreground">
              Total number of crop fields being tracked.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Tracked Animals
            </CardTitle>
            <Rabbit className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {areAnimalsLoading ? (
              <Skeleton className="h-8 w-1/2" />
            ) : (
              <div className="text-2xl font-bold">
                {animals?.length ?? 0} Animals
              </div>
            )}
            <p className="text-xs text-muted-foreground">
              Total number of livestock in the system.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
