
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
        title: 'Success!',
        description: `Animal with tag ${values.tagId} has been added to the local list.`,
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
        title: 'Success!',
        description: `Animal with tag ${values.tagId} has been updated in the local list.`,
    });
    setIsEditDialogOpen(false);
    setEditingAnimal(null);
    form.reset();
  };

  const handleDelete = async (animal: Animal) => {
    setAnimals(prev => prev.filter(a => a.id !== animal.id));
    toast({
      title: 'Animal record deleted.',
      description: `The record for tag ${animal.tagId} has been removed from the local list.`,
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
            Animal Tracking
          </h1>
          <p className="text-muted-foreground">
            Keep records of your livestock's health and status.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
           <Link href="/animals/map" passHref>
            <Button variant="outline" className="w-full">
              <Map /> View Map
            </Button>
          </Link>
          <Dialog open={isAddDialogOpen} onOpenChange={(isOpen) => {
            if(!isOpen) form.reset();
            setIsAddDialogOpen(isOpen);
          }}>
            <DialogTrigger asChild>
              <Button className="w-full">
                <PlusCircle /> Add Animal
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Add New Animal Record</DialogTitle>
                <DialogDescription>
                  Enter the details for the new animal you want to track.
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
                        <FormLabel>Tag ID</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., ZM-C-003" {...field} />
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
                        <FormLabel>Animal Type</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {animalTypes.map(type => (
                               <SelectItem key={type} value={type}>{type}</SelectItem>
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
                        <FormLabel>Health Status</FormLabel>
                         <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {healthStatuses.map(status => (
                               <SelectItem key={status} value={status}>{status}</SelectItem>
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
                        <FormLabel>Next Vaccination Date</FormLabel>
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
                        <FormLabel>Feeding Schedule</FormLabel>
                        <FormControl>
                          <Textarea placeholder="e.g., 'Twice daily with high-protein feed.'" {...field} />
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
                          <FormLabel>Latitude</FormLabel>
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
                          <FormLabel>Longitude</FormLabel>
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
                      <Button type="button" variant="secondary">Cancel</Button>
                    </DialogClose>
                    <Button type="submit" disabled={form.formState.isSubmitting}>
                      {form.formState.isSubmitting ? 'Saving...' : 'Save Record'}
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
                <CardTitle>Your Livestock</CardTitle>
                <div className="w-48">
                    <Select value={filterType} onValueChange={setFilterType}>
                        <SelectTrigger id="animal-type-filter" aria-label="Select animal type">
                            <SelectValue placeholder="Filter by type..." />
                        </SelectTrigger>
                        <SelectContent>
                            {filterAnimalTypes.map(type => (
                                <SelectItem key={type} value={type}>{type}</SelectItem>
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
                  <TableHead>Tag ID</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Health Status</TableHead>
                  <TableHead>Schedules</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
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
                      <TableCell>{animal.animalType}</TableCell>
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
                          {animal.healthStatus}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-2">
                          {animal.feedingSchedule && (
                            <Badge variant="outline" className="text-xs w-fit">
                              <Clock className="mr-1 h-3 w-3" />
                              Feed: {animal.feedingSchedule}
                            </Badge>
                          )}
                          {animal.nextVaccinationDate && (
                            <Badge variant="outline" className="text-xs w-fit">
                              <CalendarCheck className="mr-1 h-3 w-3" />
                              Vax: {format(animal.nextVaccinationDate, 'PPP')}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => handleEditOpen(animal)}>
                            <Pencil />
                            <span className="sr-only">Edit Animal</span>
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <Trash2 className="text-destructive" />
                              <span className="sr-only">Delete Animal</span>
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete the animal record for tag {animal.tagId}.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDelete(animal)}>Delete</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                      <TableCell colSpan={5} className="h-24 text-center">
                          No animals of this type found.
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
            <DialogTitle>Edit Animal Record</DialogTitle>
            <DialogDescription>
              Update the details for the selected animal.
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
                    <FormLabel>Tag ID</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., ZM-C-003" {...field} />
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
                    <FormLabel>Animal Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {animalTypes.map(type => (
                           <SelectItem key={type} value={type}>{type}</SelectItem>
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
                    <FormLabel>Health Status</FormLabel>
                     <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {healthStatuses.map(status => (
                           <SelectItem key={status} value={status}>{status}</SelectItem>
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
                    <FormLabel>Next Vaccination Date</FormLabel>
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
                      <FormLabel>Feeding Schedule</FormLabel>
                      <FormControl>
                        <Textarea placeholder="e.g., 'Twice daily with high-protein feed.'" {...field} />
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
                          <FormLabel>Latitude</FormLabel>
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
                          <FormLabel>Longitude</FormLabel>
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
                  <Button type="button" variant="secondary" onClick={() => { setIsEditDialogOpen(false); setEditingAnimal(null); form.reset(); }}>Cancel</Button>
                </DialogClose>
                <Button type="submit" disabled={form.formState.isSubmitting}>
                  {form.formState.isSubmitting ? 'Saving...' : 'Save Changes'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

    