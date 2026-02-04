'use client';

import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useLanguage } from '@/contexts/language-context';

const AnimalMap = dynamic(() => import('@/components/animal-map'), {
  ssr: false,
  loading: () => {
    const { t } = useLanguage();
    return (
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-3xl font-bold font-headline tracking-tight">{t('animalMap.title')}</h1>
          <p className="text-muted-foreground">
            {t('animalMap.loading')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1 flex flex-col gap-6">
            <Card>
              <CardHeader>
                <CardTitle>{t('animalMap.controls.title')}</CardTitle>
                <CardDescription>{t('animalMap.controls.description')}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Skeleton className="h-10 w-full" />
              </CardContent>
            </Card>
          </div>

          <div className="md:col-span-2">
            <Card className="h-[70vh]">
              <CardContent className="p-0 h-full rounded-lg overflow-hidden flex items-center justify-center bg-muted">
                <p className="text-muted-foreground">{t('animalMap.loadingMap')}</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }
});

export default function AnimalMapPage() {
  return <AnimalMap />;
}
