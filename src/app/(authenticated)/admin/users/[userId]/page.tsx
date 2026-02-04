
'use client';

import {
  useCollection,
  useDoc,
  useFirestore,
  useMemoFirebase,
} from '@/firebase';
import { collection, doc, Timestamp } from 'firebase/firestore';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import {
  Tractor,
  Rabbit,
  Bot,
  Stethoscope,
  Activity,
  Calendar,
  ShieldCheck,
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useMemo } from 'react';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip } from 'recharts';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { format } from 'date-fns';
import { useLanguage } from '@/contexts/language-context';

type UserProfile = {
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  createdAt?: Timestamp;
};

type Animal = { id: string; healthStatus: string };
type Crop = { id: string };
type Advice = { id: string };
type Diagnosis = { id: string };

export default function UserStatisticsPage({
  params,
}: {
  params: { userId: string };
}) {
  const { t } = useLanguage();
  const { userId } = params;
  const firestore = useFirestore();

  const userRef = useMemoFirebase(
    () => (firestore ? doc(firestore, 'users', userId) : null),
    [firestore, userId]
  );
  const { data: user, isLoading: isUserLoading, error: userError } = useDoc<UserProfile>(userRef);

  const cropsQuery = useMemoFirebase(
    () =>
      firestore
        ? collection(firestore, 'users', userId, 'crop_tracking')
        : null,
    [firestore, userId]
  );
  const { data: crops, isLoading: areCropsLoading } =
    useCollection<Crop>(cropsQuery);

  const animalsQuery = useMemoFirebase(
    () =>
      firestore
        ? collection(firestore, 'users', userId, 'animal_tracking')
        : null,
    [firestore, userId]
  );
  const { data: animals, isLoading: areAnimalsLoading } =
    useCollection<Animal>(animalsQuery);

  const advicesQuery = useMemoFirebase(
    () =>
      firestore
        ? collection(firestore, 'users', userId, 'advices')
        : null,
    [firestore, userId]
  );
  const { data: advices, isLoading: areAdvicesLoading } =
    useCollection<Advice>(advicesQuery);

  const diagnosesQuery = useMemoFirebase(
    () =>
      firestore
        ? collection(firestore, 'users', userId, 'diagnoses')
        : null,
    [firestore, userId]
  );
  const { data: diagnoses, isLoading: areDiagnosesLoading } =
    useCollection<Diagnosis>(diagnosesQuery);

  const animalHealthStats = useMemo(() => {
    if (!animals)
      return { healthy: 0, observation: 0, sick: 0, total: 0 };
    const stats = animals.reduce(
      (acc, animal) => {
        if (animal.healthStatus === 'Healthy') acc.healthy++;
        else if (animal.healthStatus === 'Under Observation')
          acc.observation++;
        else if (animal.healthStatus === 'Sick') acc.sick++;
        return acc;
      },
      { healthy: 0, observation: 0, sick: 0 }
    );

    return { ...stats, total: animals.length };
  }, [animals]);

  const healthChartData = [
    {
      status: t('animalHealth.healthy'),
      count: animalHealthStats.healthy,
      fill: 'hsl(var(--primary))',
    },
    {
      status: t('animalHealth.observation'),
      count: animalHealthStats.observation,
      fill: 'hsl(var(--accent))',
    },
    {
      status: t('animalHealth.sick'),
      count: animalHealthStats.sick,
      fill: 'hsl(var(--destructive))',
    },
  ];
  
  if (isUserLoading) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-solid border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (userError) {
      return (
          <div className="flex flex-col items-center justify-center h-full text-center">
              <Card className="w-full max-w-md">
                  <CardHeader>
                      <CardTitle className="text-destructive">{t('userStats.error.title')}</CardTitle>
                      <CardDescription>{t('userStats.error.description')}</CardDescription>
                  </CardHeader>
                  <CardContent>
                      <p className="text-sm text-muted-foreground">{t('userStats.error.checkConsole')}</p>
                      <Button asChild variant="outline" className="mt-4">
                          <Link href="/admin">{t('userStats.backButton')}</Link>
                      </Button>
                  </CardContent>
              </Card>
          </div>
      )
  }

  if (!user) {
     return (
          <div className="flex flex-col items-center justify-center h-full text-center">
              <Card className="w-full max-w-md">
                  <CardHeader>
                      <CardTitle>{t('userStats.notFound.title')}</CardTitle>
                      <CardDescription>{t('userStats.notFound.description')}</CardDescription>
                  </CardHeader>
                  <CardContent>
                      <Button asChild variant="outline" className="mt-4">
                          <Link href="/admin">{t('userStats.backButton')}</Link>
                      </Button>
                  </CardContent>
              </Card>
          </div>
      )
  }

  const userInitial = user
    ? `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`
    : '?';
  const isLoading =
    areCropsLoading ||
    areAnimalsLoading ||
    areAdvicesLoading ||
    areDiagnosesLoading;

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center gap-4">
        <Avatar className="h-20 w-20 border">
          <AvatarFallback className="text-2xl">{userInitial}</AvatarFallback>
        </Avatar>
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-bold font-headline tracking-tight">
            {user?.firstName} {user?.lastName}
          </h1>
          <div className="flex items-center gap-2">
            <p className="text-muted-foreground">{user?.email}</p>
            <Badge variant="secondary" className="capitalize">
              {t(`roles.${user?.role}`)}
            </Badge>
          </div>
        </div>
      </div>

      <div className="flex justify-start">
        <Button asChild variant="outline">
          <Link href="/admin">{t('userStats.backButton')}</Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title={t('userStats.statCards.trackedCrops.title')}
          value={crops?.length}
          icon={Tractor}
          isLoading={isLoading}
          unit={t('userStats.statCards.trackedCrops.unit')}
        />
        <StatCard
          title={t('userStats.statCards.trackedAnimals.title')}
          value={animals?.length}
          icon={Rabbit}
          isLoading={isLoading}
          unit={t('userStats.statCards.trackedAnimals.unit')}
        />
        <StatCard
          title={t('userStats.statCards.aiAdvisorUses.title')}
          value={advices?.length}
          icon={Bot}
          isLoading={isLoading}
          unit={t('userStats.statCards.aiAdvisorUses.unit')}
        />
        <StatCard
          title={t('userStats.statCards.aiDoctorUses.title')}
          value={diagnoses?.length}
          icon={Stethoscope}
          isLoading={isLoading}
          unit={t('userStats.statCards.aiDoctorUses.unit')}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>{t('userStats.healthSummary.title')}</CardTitle>
            <CardDescription>
              {t('userStats.healthSummary.description')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-64 w-full" />
            ) : animalHealthStats.total > 0 ? (
              <ChartContainer
                config={{}}
                className="h-[250px] w-full"
              >
                <BarChart data={healthChartData} layout="vertical" margin={{ left: -10 }}>
                  <CartesianGrid horizontal={false} />
                  <YAxis type="category" dataKey="status" tickLine={false} axisLine={false} />
                  <XAxis type="number" hide />
                   <ChartTooltip
                      cursor={false}
                      content={<ChartTooltipContent hideLabel />}
                    />
                  <Bar dataKey="count" radius={5} />
                </BarChart>
              </ChartContainer>
            ) : (
              <div className="flex h-[250px] items-center justify-center text-center text-muted-foreground">
                <p>{t('userStats.healthSummary.noData')}</p>
              </div>
            )}
          </CardContent>
        </Card>
        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle>{t('userStats.userDetails.title')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {isLoading ? (
                <>
                  <Skeleton className="h-6 w-full" />
                  <Skeleton className="h-6 w-3/4" />
                </>
              ) : (
                <>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      {t('userStats.userDetails.registered')}:{' '}
                      {user?.createdAt ? (
                        format(user.createdAt.toDate(), 'PPP')
                      ) : (
                        <span className="text-muted-foreground">
                          {t('common.notAvailable')}
                        </span>
                      )}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-muted-foreground" />
                     <span className="text-sm capitalize">{t('userStats.userDetails.role')}: {t(`roles.${user?.role}`)}</span>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>{t('userStats.performance.title')}</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-full" />
              ) : (
                <div className="flex items-center justify-center text-center text-muted-foreground py-4">
                  <p>{t('userStats.performance.comingSoon')}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  icon: Icon,
  isLoading,
  unit
}: {
  title: string;
  value?: number;
  icon: React.ElementType;
  isLoading: boolean;
  unit: string
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-8 w-1/2" />
        ) : (
          <div className="text-2xl font-bold">{value ?? 0} {unit}</div>
        )}
      </CardContent>
    </Card>
  );
}
