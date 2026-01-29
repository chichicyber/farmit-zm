'use client';

import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const AnimalMap = dynamic(() => import('@/components/animal-map'), {
  ssr: false,
  loading: () => (
    <div className="flex flex-col gap-6">
       <div>
        <h1 className="text-3xl font-bold font-headline tracking-tight">Animal Map View</h1>
        <p className="text-muted-foreground">
            Loading map...
        </p>
      </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1 flex flex-col gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Map Controls</CardTitle>
                        <CardDescription>Select a field and manage the view.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader>
                        <CardTitle>Last Update</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Skeleton className="h-8 w-1/2" />
                        <Skeleton className="h-4 w-3/4 mt-2" />
                    </CardContent>
                </Card>
            </div>

            <div className="md:col-span-2">
                 <Card className="h-[70vh]">
                    <CardContent className="p-0 h-full rounded-lg overflow-hidden flex items-center justify-center bg-muted">
                        <p className="text-muted-foreground">Loading Map...</p>
                    </CardContent>
                </Card>
            </div>
        </div>
    </div>
  )
});

export default function AnimalMapPage() {
  return <AnimalMap />;
}
