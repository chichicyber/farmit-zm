'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Bell, Tractor, Rabbit, PlusCircle, Sun, Cloud, CloudRain } from 'lucide-react';
import Link from 'next/link';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts"
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';

const chartData = [
  { month: "January", desktop: 186 },
  { month: "February", desktop: 305 },
  { month: "March", desktop: 237 },
  { month: "April", desktop: 273 },
  { month: "May", desktop: 209 },
  { month: "June", desktop: 214 },
]

const chartConfig = {
  desktop: {
    label: "Yield",
    color: "hsl(var(--primary))",
  },
} satisfies ChartConfig

const reminders = [
  { id: 1, title: 'Vaccinate cattle herd', due: 'In 3 days' },
  { id: 2, title: 'Apply fertilizer to maize field', due: 'In 1 week' },
  { id: 3, title: 'Check irrigation system', due: 'Tomorrow' },
];

const weatherForecast = [
  { day: 'Today', icon: Sun, temp: '32°C' },
  { day: 'Tomorrow', icon: Cloud, temp: '29°C' },
  { day: 'Next Day', icon: CloudRain, temp: '26°C' },
];

export default function DashboardPage() {
  const farmImage = PlaceHolderImages.find(p => p.id === 'hero-farm');

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold font-headline tracking-tight">Farm Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back! Here&apos;s a summary of your farm&apos;s activities.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Crops</CardTitle>
            <Tractor className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">5 Fields</div>
            <p className="text-xs text-muted-foreground">+2 from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Livestock Count</CardTitle>
            <Rabbit className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">78 Animals</div>
            <p className="text-xs text-muted-foreground">+10% since last count</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Tasks</CardTitle>
            <Bell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3 Reminders</div>
            <p className="text-xs text-muted-foreground">1 due tomorrow</p>
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
      
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Yield Projection</CardTitle>
            <CardDescription>Monthly estimated yield based on current data.</CardDescription>
          </CardHeader>
          <CardContent>
             <ChartContainer config={chartConfig} className="h-[250px] w-full">
              <BarChart accessibilityLayer data={chartData}>
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="month"
                  tickLine={false}
                  tickMargin={10}
                  axisLine={false}
                />
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent hideLabel />}
                />
                <Bar dataKey="desktop" fill="var(--color-desktop)" radius={8} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Weather Forecast</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {weatherForecast.map((weather) => (
                <div key={weather.day} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <weather.icon className="h-6 w-6 text-accent" />
                    <span>{weather.day}</span>
                  </div>
                  <span className="font-medium">{weather.temp}</span>
                </div>
              ))}
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
