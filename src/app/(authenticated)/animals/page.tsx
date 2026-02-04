'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
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
import { format, parseISO } from 'date-fns';
import { Map, PlusCircle, Pencil, Trash2, Clock, CalendarCheck } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import { dummyAnimals } from '@/lib/dummy-data';
import { useLanguage } from '@/contexts/language-context';

const animalSchema = z.object({
  tagId: z.string().min(1, 'Tag ID is required'),
  animalType: z.string().min(1, 'Animal type is required'),
  healthStatus: z.string().min(1, 'Health status is required'),
  nextVaccinationDate: z.string().min(1, 'Next vaccination date is required'),
  feedingSchedule: z.string().optional(),
  locationLatitude: z.preprocess(
    (a) => (a === '' ? undefined : a),
    z.coerce.number().optional()
  ),
  locationLongitude: z.preprocess(
    (a) => (a === '' ? undefined : a),
    z.coerce.number().optional()
  ),
});

type AnimalFormData = z.infer<typeof animalSchema>;

// The component now uses this local type, which uses native Date objects.
type Animal = {
  id: string;
  tagId: string;
  animalType: string;
  healthStatus: string;
  nextVaccinationDate: Date;
  feedingSchedule?: string;
  locationLatitude?: number;
  locationLongitude?: number;
};

const healthStatuses = ['Healthy', 'Under Observation', 'Sick'];
const animalTypes = ['Cattle', 'Goat', 'Chicken', 'Pig', 'Sheep'];
const filterAnimalTypes = ['All', ...animalTypes];

// We map the raw dummy data into the format the component expects.
const mappedDummyAnimals: Animal[] = dummyAnimals.map(a => ({
  id: a.id,
  tagId: a.tagId,
  animalType: a.animalType,
  healthStatus: a.healthStatus,
  nextVaccinationDate: new Date(a.vaccinationSchedule.nextVaccinationAt),
  feedingSchedule: `${a.feedingSchedule.frequency} at ${a.feedingSchedule.time}`,
  locationLatitude: a.locationLatitude,
  locationLongitude: a.locationLongitude,
}));

export default function AnimalsPage() {
  const { t } = useLanguage();
  const [animals, setAnimals] = useState<Animal[]>(mappedDummyAnimals);
  const isLoading = false; // Data is loaded locally
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingAnimal, setEditingAnimal] = useState<Animal | null>(null);
  const [filterType, setFilterType] = useState('All');
  const { toast } = useToast();

  const form = useForm<AnimalFormData>({
    resolver: zodResolver(animalSchema),
    defaultValues: {
      tagId: '',
      animalType: '',
      healthStatus: '',
      nextVaccinationDate: '',
      feedingSchedule: '',
      locationLatitude: undefined,
      locationLongitude: undefined,
    },
  });

  const onAddSubmit = async (values: AnimalFormData) => {
    const newAnimal: Animal = {
      id: new Date().toISOString(), // Simple unique ID for local state
      tagId: values.tagId,
      animalType: values.animalType,
      healthStatus: values.healthStatus,
      nextVaccinationDate: parseISO(values.nextVaccinationDate),
      feedingSchedule: values.feedingSchedule,
      locationLatitude: values.locationLatitude,
      locationLongitude: values.locationLongitude,
    };
    
    setAnimals(prev => [newAnimal, ...prev]);

    toast({
        title: t('animalTracking.toast.addSuccess.title'),
        description: t('animalTracking.toast.addSuccess.description', { tagId: values.tagId }),
    });

    form.reset();
    setIsAddDialogOpen(false);
  };
  
  const handleEditOpen = (animal: Animal) => {
    setEditingAnimal(animal);
    const formattedDate = format(animal.nextVaccinationDate, 'yyyy-MM-dd');
      
    form.reset({ 
      tagId: animal.tagId,
      animalType: animal.animalType,
      healthStatus: animal.healthStatus,
      nextVaccinationDate: formattedDate,
      feedingSchedule: animal.feedingSchedule || '',
      locationLatitude: animal.locationLatitude,
      locationLongitude: animal.locationLongitude,
    });
    setIsEditDialogOpen(true);
  };

  const onEditSubmit = async (values: AnimalFormData) => {
    if (!editingAnimal) return;

    const updatedAnimal: Animal = {
      ...editingAnimal,
      ...values,
      nextVaccinationDate: parseISO(values.nextVaccinationDate),
    };

    setAnimals(prev => prev.map(a => a.id === editingAnimal.id ? updatedAnimal : a));

    toast({
        title: t('animalTracking.toast.editSuccess.title'),
        description: t('animalTracking.toast.editSuccess.description', { tagId: values.tagId }),
    });
    setIsEditDialogOpen(false);
    setEditingAnimal(null);
    form.reset();
  };

  const handleDelete = async (animal: Animal) => {
    setAnimals(prev => prev.filter(a => a.id !== animal.id));
    toast({
      title: t('animalTracking.toast.deleteSuccess.title'),
      description: t('animalTracking.toast.deleteSuccess.description', { tagId: animal.tagId }),
    });
  }

  const filteredAnimals = animals?.filter(
    (animal) => filterType === 'All' || animal.animalType === filterType
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-headline tracking-tight">
            {t('animalTracking.title')}
          </h1>
          <p className="text-muted-foreground">
            {t('animalTracking.description')}
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
           <Link href="/animals/map" passHref>
            <Button variant="outline" className="w-full">
              <Map /> {t('animalTracking.viewMapButton')}
            </Button>
          </Link>
          <Dialog open={isAddDialogOpen} onOpenChange={(isOpen) => {
            if(!isOpen) form.reset();
            setIsAddDialogOpen(isOpen);
          }}>
            <DialogTrigger asChild>
              <Button className="w-full">
                <PlusCircle /> {t('animalTracking.addAnimalButton')}
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>{t('animalTracking.addDialog.title')}</DialogTitle>
                <DialogDescription>
                  {t('animalTracking.addDialog.description')}
                </DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onAddSubmit)}
                  className="space-y-4 py-4"
                >
                  <FormField
                    control={form.control}
                    name="tagId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('animalTracking.form.tagId.label')}</FormLabel>
                        <FormControl>
                          <Input placeholder={t('animalTracking.form.tagId.placeholder')} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                   <FormField
                    control={form.control}
                    name="animalType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('animalTracking.form.animalType.label')}</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder={t('animalTracking.form.animalType.placeholder')} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {animalTypes.map(type => (
                               <SelectItem key={type} value={type}>{t(`animalTypes.${type.toLowerCase()}`)}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="healthStatus"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('animalTracking.form.healthStatus.label')}</FormLabel>
                         <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder={t('animalTracking.form.healthStatus.placeholder')} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {healthStatuses.map(status => (
                               <SelectItem key={status} value={status}>{t(`animalHealth.${status.replace(' ', '').toLowerCase()}`)}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="nextVaccinationDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('animalTracking.form.nextVaccinationDate.label')}</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="feedingSchedule"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('animalTracking.form.feedingSchedule.label')}</FormLabel>
                        <FormControl>
                          <Textarea placeholder={t('animalTracking.form.feedingSchedule.placeholder')} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="locationLatitude"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('animalTracking.form.latitude.label')}</FormLabel>
                          <FormControl>
                            <Input type="number" step="any" placeholder="-15.416" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="locationLongitude"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('animalTracking.form.longitude.label')}</FormLabel>
                          <FormControl>
                            <Input type="number" step="any" placeholder="28.283" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
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
            <div className="flex items-center justify-between">
                <CardTitle>{t('animalTracking.livestockCard.title')}</CardTitle>
                <div className="w-48">
                    <Select value={filterType} onValueChange={setFilterType}>
                        <SelectTrigger id="animal-type-filter" aria-label={t('animalTracking.livestockCard.filterAriaLabel')}>
                            <SelectValue placeholder={t('animalTracking.livestockCard.filterPlaceholder')} />
                        </SelectTrigger>
                        <SelectContent>
                            {filterAnimalTypes.map(type => (
                                <SelectItem key={type} value={type}>{type === 'All' ? t('common.all') : t(`animalTypes.${type.toLowerCase()}`)}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('animalTracking.table.header.tagId')}</TableHead>
                  <TableHead>{t('animalTracking.table.header.type')}</TableHead>
                  <TableHead>{t('animalTracking.table.header.healthStatus')}</TableHead>
                  <TableHead>{t('animalTracking.table.header.schedules')}</TableHead>
                  <TableHead className="text-right">{t('animalTracking.table.header.actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({length: 3}).map((_, i) => (
                    <TableRow key={i}><TableCell colSpan={5}><Skeleton className="w-full h-8" /></TableCell></TableRow>
                  ))
                ) : filteredAnimals && filteredAnimals.length > 0 ? (
                  filteredAnimals.map((animal) => (
                    <TableRow key={animal.id}>
                      <TableCell className="font-medium">{animal.tagId}</TableCell>
                      <TableCell>{t(`animalTypes.${animal.animalType.toLowerCase()}`)}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            animal.healthStatus === 'Healthy'
                              ? 'default'
                              : animal.healthStatus === 'Sick'
                              ? 'destructive'
                              : 'secondary'
                          }
                          className={animal.healthStatus === 'Healthy' ? 'bg-primary/20 text-primary-foreground border-primary/50' : ''}
                        >
                          {t(`animalHealth.${animal.healthStatus.replace(' ', '').toLowerCase()}`)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-2">
                          {animal.feedingSchedule && (
                            <Badge variant="outline" className="text-xs w-fit">
                              <Clock className="mr-1 h-3 w-3" />
                              {t('animalTracking.table.feed')}: {animal.feedingSchedule}
                            </Badge>
                          )}
                          {animal.nextVaccinationDate && (
                            <Badge variant="outline" className="text-xs w-fit">
                              <CalendarCheck className="mr-1 h-3 w-3" />
                              {t('animalTracking.table.vax')}: {format(animal.nextVaccinationDate, 'PPP')}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => handleEditOpen(animal)}>
                            <Pencil />
                            <span className="sr-only">{t('animalTracking.table.editSr')}</span>
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <Trash2 className="text-destructive" />
                              <span className="sr-only">{t('animalTracking.table.deleteSr')}</span>
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>{t('common.areYouSure')}</AlertDialogTitle>
                              <AlertDialogDescription>
                                {t('animalTracking.deleteDialog.description', {tagId: animal.tagId})}
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDelete(animal)}>{t('common.delete')}</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                      <TableCell colSpan={5} className="h-24 text-center">
                          {t('animalTracking.table.noAnimalsFound')}
                      </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      
      {/* Edit Animal Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={(isOpen) => {
            if(!isOpen) form.reset();
            setIsEditDialogOpen(isOpen);
            if (!isOpen) setEditingAnimal(null);
        }}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{t('animalTracking.editDialog.title')}</DialogTitle>
            <DialogDescription>
              {t('animalTracking.editDialog.description')}
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onEditSubmit)}
              className="space-y-4 py-4"
            >
              <FormField
                control={form.control}
                name="tagId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('animalTracking.form.tagId.label')}</FormLabel>
                    <FormControl>
                      <Input placeholder={t('animalTracking.form.tagId.placeholder')} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="animalType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('animalTracking.form.animalType.label')}</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={t('animalTracking.form.animalType.placeholder')} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {animalTypes.map(type => (
                           <SelectItem key={type} value={type}>{t(`animalTypes.${type.toLowerCase()}`)}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="healthStatus"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('animalTracking.form.healthStatus.label')}</FormLabel>
                     <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={t('animalTracking.form.healthStatus.placeholder')} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {healthStatuses.map(status => (
                           <SelectItem key={status} value={status}>{t(`animalHealth.${status.replace(' ', '').toLowerCase()}`)}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="nextVaccinationDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('animalTracking.form.nextVaccinationDate.label')}</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                  control={form.control}
                  name="feedingSchedule"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('animalTracking.form.feedingSchedule.label')}</FormLabel>
                      <FormControl>
                        <Textarea placeholder={t('animalTracking.form.feedingSchedule.placeholder')} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="locationLatitude"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('animalTracking.form.latitude.label')}</FormLabel>
                          <FormControl>
                            <Input type="number" step="any" placeholder="-15.416" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="locationLongitude"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('animalTracking.form.longitude.label')}</FormLabel>
                          <FormControl>
                            <Input type="number" step="any" placeholder="28.283" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button type="button" variant="secondary" onClick={() => { setIsEditDialogOpen(false); setEditingAnimal(null); form.reset(); }}>{t('common.cancel')}</Button>
                </DialogClose>
                <Button type="submit" disabled={form.formState.isSubmitting}>
                  {form.formState.isSubmitting ? t('common.saving') : t('common.saveChanges')}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
