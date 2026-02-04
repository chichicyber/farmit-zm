'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import {
  Bell,
  Tractor,
  Rabbit,
  PlusCircle,
  Sun,
  Cloud,
  CloudRain,
  HeartPulse,
} from 'lucide-react';
import Link from 'next/link';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import {
  useAuth,
  useCollection,
  useFirestore,
  useMemoFirebase,
} from '@/firebase';
import { collection, query, where } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import { useMemo, useState, useEffect } from 'react';
import { format, addMonths } from 'date-fns';
import { generateWeatherForecast } from '@/ai/flows/generate-weather-forecast';
import type { WeatherForecast } from '@/ai/types';

type Crop = {
  id: string;
  userId: string;
  cropType: string;
  plantingDate: string;
  expectedHarvestDate: string;
};

const chartConfig = {
  desktop: {
    label: 'Crops',
    color: 'hsl(var(--primary))',
  },
} satisfies ChartConfig;

const weatherIcons: { [key: string]: React.ElementType } = {
  sunny: Sun,
  cloudy: Cloud,
  rainy: CloudRain,
  'partly-cloudy': Cloud,
};

export default function DashboardPage() {
  const farmImage = PlaceHolderImages.find((p) => p.id === 'hero-farm');
  const { user } = useAuth();
  const firestore = useFirestore();

  const [forecast, setForecast] = useState<WeatherForecast[] | null>(null);
  const [isForecastLoading, setIsForecastLoading] = useState(true);

  useEffect(() => {
    const fetchWeather = async () => {
      setIsForecastLoading(true);
      // Hardcoded Lusaka coordinates for now
      const lat = -15.416667;
      const lon = 28.283333;
      try {
        const weatherData = await generateWeatherForecast(lat, lon);
        setForecast(weatherData);
      } catch (error) {
        console.error('Failed to fetch weather forecast:', error);
        setForecast([
          {
            day: 'Today',
            description: 'Could not load',
            temp: '--°C',
            condition: 'cloudy',
          },
          {
            day: 'Tomorrow',
            description: 'Could not load',
            temp: '--°C',
            condition: 'cloudy',
          },
          {
            day: 'Next Day',
            description: 'Could not load',
            temp: '--°C',
            condition: 'cloudy',
          },
        ]);
      } finally {
        setIsForecastLoading(false);
      }
    };
    fetchWeather();
  }, []);

  const cropsQuery = useMemoFirebase(
    () =>
      user && firestore
        ? collection(firestore, 'users', user.uid, 'crop_tracking')
        : null,
    [user, firestore]
  );
  const { data: crops, isLoading: areCropsLoading } =
    useCollection<Crop>(cropsQuery);

  const animalsQuery = useMemoFirebase(
    () =>
      user && firestore
        ? collection(firestore, 'users', user.uid, 'animal_tracking')
        : null,
    [user, firestore]
  );
  const { data: animals, isLoading: areAnimalsLoading } =
    useCollection(animalsQuery);

  const remindersQuery = useMemoFirebase(
    () =>
      user && firestore
        ? query(
            collection(firestore, 'users', user.uid, 'reminders'),
            where('isCompleted', '==', false)
          )
        : null,
    [user, firestore]
  );
  const { data: reminders, isLoading: areRemindersLoading } =
    useCollection(remindersQuery);

  const isLoading =
    areCropsLoading || areAnimalsLoading || areRemindersLoading;

  const yieldChartData = useMemo(() => {
    if (!crops || crops.length === 0) {
      return [];
    }

    const now = new Date();
    const nextSixMonths = Array.from({ length: 6 }, (_, i) =>
      addMonths(now, i)
    );

    const monthlyHarvests: { [key: string]: number } = nextSixMonths.reduce(
      (acc, date) => {
        acc[format(date, 'MMM')] = 0;
        return acc;
      },
      {} as { [key: string]: number }
    );

    crops.forEach((crop) => {
      try {
        const harvestDate = new Date(crop.expectedHarvestDate);
        if (harvestDate >= now && harvestDate < addMonths(now, 6)) {
          const month = format(harvestDate, 'MMM');
          if (month in monthlyHarvests) {
            monthlyHarvests[month]++;
          }
        }
      } catch (e) {
        console.error('Invalid date for crop:', crop);
      }
    });

    return Object.entries(monthlyHarvests).map(([month, count]) => ({
      month,
      desktop: count,
    }));
  }, [crops]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold font-headline tracking-tight">
          Farm Dashboard
        </h1>
        <p className="text-muted-foreground">
          Welcome back! Here&apos;s a summary of your farm&apos;s activities.
        </p>
      </div>

      <Link href="/farm-doctor" passHref>
        <Button
          variant="destructive"
          className="w-full animate-shake md:w-auto"
        >
          <HeartPulse /> Farm Doctor
        </Button>
      </Link>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Crops</CardTitle>
            <Tractor className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <>
                <div className="text-2xl font-bold">
                  {crops?.length ?? 0} Fields
                </div>
                <p className="text-xs text-muted-foreground">
                  Tracked in your account
                </p>
              </>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Livestock Count
            </CardTitle>
            <Rabbit className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <>
                <div className="text-2xl font-bold">
                  {animals?.length ?? 0} Animals
                </div>
                <p className="text-xs text-muted-foreground">
                  Across all your herds
                </p>
              </>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Upcoming Tasks
            </CardTitle>
            <Bell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <>
                <div className="text-2xl font-bold">
                  {reminders?.length ?? 0} Reminders
                </div>
                <p className="text-xs text-muted-foreground">
                  Pending in your schedule
                </p>
              </>
            )}
          </CardContent>
        </Card>
        <div className="flex flex-col gap-4">
          <Link href="/crops" passHref>
            <Button className="w-full">
              <PlusCircle /> Add New Crop
            </Button>
          </Link>
          <Link href="/animals" passHref>
            <Button variant="secondary" className="w-full">
              <PlusCircle /> Add New Animal
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Yield Projection</CardTitle>
            <CardDescription>
              Crops scheduled for harvest in the next 6 months.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-[250px] w-full" />
            ) : yieldChartData.length > 0 &&
              yieldChartData.some((d) => d.desktop > 0) ? (
              <ChartContainer config={chartConfig} className="h-[250px] w-full">
                <BarChart accessibilityLayer data={yieldChartData}>
                  <CartesianGrid vertical={false} />
                  <XAxis
                    dataKey="month"
                    tickLine={false}
                    tickMargin={10}
                    axisLine={false}
                  />
                  <YAxis allowDecimals={false} />
                  <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent hideLabel />}
                  />
                  <Bar
                    dataKey="desktop"
                    fill="var(--color-desktop)"
                    radius={8}
                  />
                </BarChart>
              </ChartContainer>
            ) : (
              <div className="flex h-[250px] w-full items-center justify-center text-center text-muted-foreground">
                <p>
                  No crop data available. <br /> Add a crop to see your yield
                  projection.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Weather Forecast</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {isForecastLoading ? (
                <>
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-6 w-24" />
                    <Skeleton className="h-6 w-12" />
                  </div>
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-6 w-24" />
                    <Skeleton className="h-6 w-12" />
                  </div>
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-6 w-24" />
                    <Skeleton className="h-6 w-12" />
                  </div>
                </>
              ) : (
                forecast?.map((weather) => {
                  const Icon = weatherIcons[weather.condition] || Cloud;
                  return (
                    <div
                      key={weather.day}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <Icon className="h-6 w-6 text-accent" />
                        <span>{weather.day}</span>
                      </div>
                      <span className="font-medium">{weather.temp}</span>
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>
          {farmImage && (
            <div className="relative h-full min-h-[150px] w-full overflow-hidden rounded-lg">
              <Image
                src={farmImage.imageUrl}
                alt={farmImage.description}
                data-ai-hint={farmImage.imageHint}
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
              <div className="absolute bottom-4 left-4 text-primary-foreground">
                <h3 className="font-bold">Your Farm</h3>
                <p className="text-sm">A beautiful view</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
