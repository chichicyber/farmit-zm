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
import { format } from 'date-fns';
import { Map, PlusCircle, Pencil, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useAuth, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, addDoc, updateDoc, deleteDoc, doc, serverTimestamp, query, orderBy } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';

const animalSchema = z.object({
  tagId: z.string().min(1, 'Tag ID is required'),
  animalType: z.string().min(1, 'Animal type is required'),
  healthStatus: z.string().min(1, 'Health status is required'),
  nextVaccinationDate: z.string().min(1, 'Next vaccination date is required'),
  feedingSchedule: z.string().optional(),
});

type Animal = z.infer<typeof animalSchema> & { id: string };

const healthStatuses = ['Healthy', 'Under Observation', 'Sick'];
const animalTypes = ['Cattle', 'Goat', 'Chicken', 'Pig', 'Sheep'];
const filterAnimalTypes = ['All', ...animalTypes];
const LUSAKA_CENTER = { lat: -15.416667, lng: 28.283333 };

export default function AnimalsPage() {
  const { user } = useAuth();
  const firestore = useFirestore();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingAnimal, setEditingAnimal] = useState<Animal | null>(null);
  const [filterType, setFilterType] = useState('All');
  const { toast } = useToast();

  const animalsQuery = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return query(collection(firestore, 'users', user.uid, 'animal_tracking'), orderBy('tagId'));
  }, [user, firestore]);

  const { data: animals, isLoading } = useCollection<Animal>(animalsQuery);

  const form = useForm<z.infer<typeof animalSchema>>({
    resolver: zodResolver(animalSchema),
    defaultValues: {
      tagId: '',
      animalType: '',
      healthStatus: '',
      nextVaccinationDate: '',
      feedingSchedule: '',
    },
  });

  const onAddSubmit = (values: z.infer<typeof animalSchema>) => {
    if (!user || !firestore) return;

    const animalCollectionRef = collection(firestore, 'users', user.uid, 'animal_tracking');
    const remindersCollectionRef = collection(firestore, 'users', user.uid, 'reminders');

    // Close dialog immediately and reset form
    setIsAddDialogOpen(false);
    form.reset();

    addDoc(animalCollectionRef, {
        ...values,
        userId: user.uid,
        createdAt: serverTimestamp(),
        locationLatitude: LUSAKA_CENTER.lat,
        locationLongitude: LUSAKA_CENTER.lng,
    })
    .then(newAnimalRef => {
        // Once the animal is added, create the reminder.
        addDoc(remindersCollectionRef, {
            userId: user.uid,
            task: `Vaccinate ${values.animalType} (Tag: ${values.tagId})`,
            dueDate: new Date(values.nextVaccinationDate),
            isCompleted: false,
            category: 'Animals',
            priority: 'High',
            relatedDocId: newAnimalRef.id,
        }).catch(error => {
            console.error("Error adding reminder:", error);
            toast({ title: 'Reminder Failed', description: 'Animal was added, but could not set vaccination reminder.', variant: 'destructive' });
        });

        toast({
            title: 'Success!',
            description: `Animal with tag ${values.tagId} has been added and a vaccination reminder has been set.`,
        });
    })
    .catch(error => {
        console.error("Error adding animal: ", error);
        toast({ title: 'Error', description: 'Could not add animal.', variant: 'destructive' });
    });
  };
  
  const handleEditOpen = (animal: any) => {
    setEditingAnimal(animal);
    const formattedDate = animal.nextVaccinationDate instanceof Date 
      ? format(animal.nextVaccinationDate, 'yyyy-MM-dd')
      : animal.nextVaccinationDate.split('T')[0];

    form.reset({ ...animal, nextVaccinationDate: formattedDate });
    setIsEditDialogOpen(true);
  };

  const onEditSubmit = (values: z.infer<typeof animalSchema>) => {
    if (!editingAnimal || !user || !firestore) return;

    const animalRef = doc(firestore, 'users', user.uid, 'animal_tracking', editingAnimal.id);
    
    // Close dialog and reset state immediately
    setIsEditDialogOpen(false);
    setEditingAnimal(null);
    form.reset();

    updateDoc(animalRef, {
      ...values,
      nextVaccinationDate: new Date(values.nextVaccinationDate).toISOString(),
    })
    .then(() => {
        toast({
            title: 'Success!',
            description: `Animal with tag ${values.tagId} has been updated.`,
        });
    })
    .catch((error) => {
        console.error("Error updating animal: ", error);
        toast({ title: 'Error', description: 'Could not update animal.', variant: 'destructive' });
    });
  };

  const handleDelete = (animal: Animal) => {
    if (!user || !firestore) return;

    deleteDoc(doc(firestore, 'users', user.uid, 'animal_tracking', animal.id))
      .then(() => {
        toast({
          title: 'Animal record deleted.',
          description: `The record for tag ${animal.tagId} has been removed.`,
          variant: "destructive"
        });
      })
      .catch((error) => {
        console.error("Error deleting animal: ", error);
        toast({ title: 'Error', description: 'Could not delete animal.', variant: 'destructive' });
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
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
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
                  <DialogFooter>
                    <DialogClose asChild>
                      <Button type="button" variant="secondary">Cancel</Button>
                    </DialogClose>
                    <Button type="submit">
                      Save Record
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
                  <TableHead>Next Vaccination</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow><TableCell colSpan={5}><Skeleton className="w-full h-8" /></TableCell></TableRow>
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
                        {format(new Date(animal.nextVaccinationDate), 'PPP')}
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
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
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
              <DialogFooter>
                <DialogClose asChild>
                  <Button type="button" variant="secondary" onClick={() => { setIsEditDialogOpen(false); setEditingAnimal(null); form.reset(); }}>Cancel</Button>
                </DialogClose>
                <Button type="submit">
                  Save Changes
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
