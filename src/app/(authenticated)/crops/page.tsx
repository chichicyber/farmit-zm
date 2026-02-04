
'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { zodResolver } from '@hookform/resolvers/zod';
import { PlusCircle, Leaf, Grab, SprayCan } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { format, addDays, parseISO } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { dummyCrops } from '@/lib/dummy-data';
import { useLanguage } from '@/contexts/language-context';

const cropSchema = z.object({
  cropType: z.string().min(1, 'Crop type is required'),
  plantingDate: z.string().min(1, 'Planting date is required'),
  growthStage: z.string().min(1, 'Growth stage is required'),
  expectedHarvestDate: z.string().min(1, 'Expected harvest date is required'),
});

// Component's local Crop type definition using native Date objects
type Crop = {
  id: string;
  cropType: string;
  plantingDate: Date;
  expectedHarvestDate: Date;
  growthStage: string;
};

const growthStages = ['Planting', 'Germination', 'Vegetative', 'Flowering', 'Harvesting'];

// Map the raw dummy data to the format the component expects
const mappedDummyCrops: Crop[] = dummyCrops.map(c => ({
  id: c.id,
  cropType: c.cropType,
  plantingDate: new Date(c.plantingDate),
  expectedHarvestDate: new Date(c.expectedHarvestDate),
  growthStage: c.growthStage,
}));

export default function CropsPage() {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [crops, setCrops] = useState<Crop[]>(mappedDummyCrops);
  const isLoading = false; // Data is loaded locally
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const form = useForm<z.infer<typeof cropSchema>>({
    resolver: zodResolver(cropSchema),
    defaultValues: {
      cropType: '',
      plantingDate: '',
      growthStage: '',
      expectedHarvestDate: '',
    },
  });

  const onSubmit = async (values: z.infer<typeof cropSchema>) => {
    const newCrop: Crop = {
      id: new Date().toISOString(),
      cropType: values.cropType,
      plantingDate: parseISO(values.plantingDate),
      expectedHarvestDate: parseISO(values.expectedHarvestDate),
      growthStage: values.growthStage,
    };
    
    setCrops(prev => [newCrop, ...prev]);

    toast({
      title: t('cropTracking.toast.addSuccess.title'),
      description: t('cropTracking.toast.addSuccess.description', { cropType: values.cropType }),
    });
    form.reset();
    setIsDialogOpen(false);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-headline tracking-tight">
            {t('cropTracking.title')}
          </h1>
          <p className="text-muted-foreground">
            {t('cropTracking.description')}
          </p>
        </div>
        <div className="flex w-full sm:w-auto">
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="w-full">
                <PlusCircle /> {t('cropTracking.addCropButton')}
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>{t('cropTracking.addDialog.title')}</DialogTitle>
                <DialogDescription>
                  {t('cropTracking.addDialog.description')}
                </DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
                  <FormField
                    control={form.control}
                    name="cropType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('cropTracking.form.cropType.label')}</FormLabel>
                        <FormControl>
                          <Input placeholder={t('cropTracking.form.cropType.placeholder')} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="plantingDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('cropTracking.form.plantingDate.label')}</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="growthStage"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('cropTracking.form.growthStage.label')}</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder={t('cropTracking.form.growthStage.placeholder')} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {growthStages.map(stage => (
                              <SelectItem key={stage} value={stage}>{t(`growthStages.${stage.toLowerCase()}`)}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="expectedHarvestDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('cropTracking.form.expectedHarvestDate.label')}</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <DialogFooter>
                    <DialogClose asChild>
                      <Button type="button" variant="secondary">{t('common.cancel')}</Button>
                    </DialogClose>
                    <Button type="submit" disabled={form.formState.isSubmitting}>
                      {form.formState.isSubmitting ? t('common.saving') : t('common.saveRecord')}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('cropTracking.yourCropsCard.title')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('cropTracking.table.header.name')}</TableHead>
                  <TableHead>{t('cropTracking.table.header.plantingDate')}</TableHead>
                  <TableHead>{t('cropTracking.table.header.growthStage')}</TableHead>
                  <TableHead>{t('cropTracking.table.header.expectedHarvest')}</TableHead>
                  <TableHead>{t('cropTracking.table.header.upcomingTasks')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({length: 3}).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell colSpan={5} className="h-12 text-center">
                        <Skeleton className="h-8 w-full" />
                      </TableCell>
                    </TableRow>
                  ))
                ) : crops && crops.length > 0 ? (
                  crops.map((crop) => {
                    const plantingDate = crop.plantingDate;
                    return (
                    <TableRow key={crop.id}>
                      <TableCell className="font-medium">{crop.cropType}</TableCell>
                      <TableCell>{format(plantingDate, 'PPP')}</TableCell>
                      <TableCell>{t(`growthStages.${crop.growthStage.toLowerCase()}`)}</TableCell>
                      <TableCell>{format(crop.expectedHarvestDate, 'PPP')}</TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-2">
                            <Badge variant="outline" className="text-xs w-fit">
                                <Grab className="mr-1 h-3 w-3" />
                                {t('cropTracking.table.task.weedBy')}: {format(addDays(plantingDate, 14), 'PPP')}
                            </Badge>
                           <Badge variant="outline" className="text-xs w-fit">
                                <Leaf className="mr-1 h-3 w-3" />
                                {t('cropTracking.table.task.fertilizeBy')}: {format(addDays(plantingDate, 28), 'PPP')}
                            </Badge>
                           <Badge variant="outline" className="text-xs w-fit">
                                <SprayCan className="mr-1 h-3 w-3" />
                                {t('cropTracking.table.task.scoutBy')}: {format(addDays(plantingDate, 42), 'PPP')}
                            </Badge>
                        </div>
                      </TableCell>
                    </TableRow>
                  )})
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                      {t('cropTracking.table.noCropsFound')}
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
