
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
import { useAuth, useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, addDoc, serverTimestamp, Timestamp } from 'firebase/firestore';


const cropSchema = z.object({
  cropType: z.string().min(1, 'Crop type is required'),
  plantingDate: z.string().min(1, 'Planting date is required'),
  growthStage: z.string().min(1, 'Growth stage is required'),
  expectedHarvestDate: z.string().min(1, 'Expected harvest date is required'),
});

type Crop = {
  id: string;
  userId: string;
  cropType: string;
  plantingDate: Timestamp;
  expectedHarvestDate: Timestamp;
  growthStage: string;
  createdAt: Timestamp;
};

const growthStages = ['Planting', 'Germination', 'Vegetative', 'Flowering', 'Harvesting'];

export default function CropsPage() {
  const { toast } = useToast();
  const { user } = useAuth();
  const firestore = useFirestore();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const cropsQuery = useMemoFirebase(
    () => (user && firestore ? collection(firestore, 'users', user.uid, 'crop_tracking') : null),
    [user, firestore]
  );
  const { data: crops, isLoading } = useCollection<Crop>(cropsQuery);

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
    if (!user || !firestore) return;

    try {
      const plantingDate = parseISO(values.plantingDate);
      const expectedHarvestDate = parseISO(values.expectedHarvestDate);

      // 1. Save the new crop
      await addDoc(collection(firestore, 'users', user.uid, 'crop_tracking'), {
        ...values,
        userId: user.uid,
        plantingDate: Timestamp.fromDate(plantingDate),
        expectedHarvestDate: Timestamp.fromDate(expectedHarvestDate),
        createdAt: serverTimestamp(),
      });

      // 2. Create rule-based reminders
      const reminderCollection = collection(firestore, 'users', user.uid, 'reminders');

      // Weeding reminder (14 days after planting)
      const weedingDate = addDays(plantingDate, 14);
      await addDoc(reminderCollection, {
        userId: user.uid,
        task: `Weed ${values.cropType}`,
        dueDate: Timestamp.fromDate(weedingDate),
        isCompleted: false,
        category: 'Crops',
        priority: 'Medium',
        createdAt: serverTimestamp(),
      });

      // Fertilizer reminder (28 days after planting)
      const fertilizerDate = addDays(plantingDate, 28);
      await addDoc(reminderCollection, {
        userId: user.uid,
        task: `Apply top dressing fertilizer to ${values.cropType}`,
        dueDate: Timestamp.fromDate(fertilizerDate),
        isCompleted: false,
        category: 'Crops',
        priority: 'High',
        createdAt: serverTimestamp(),
      });

      // Pest scouting reminder (42 days after planting)
      const scoutingDate = addDays(plantingDate, 42);
      await addDoc(reminderCollection, {
        userId: user.uid,
        task: `Scout for pests and diseases in ${values.cropType}`,
        dueDate: Timestamp.fromDate(scoutingDate),
        isCompleted: false,
        category: 'Crops',
        priority: 'Medium',
        createdAt: serverTimestamp(),
      });

      toast({
        title: 'Success!',
        description: `${values.cropType} added and reminders have been scheduled.`,
      });
      form.reset();
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Error adding crop:', error);
      toast({
        title: 'Error',
        description: 'Could not add crop. Please try again.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-headline tracking-tight">
            Crop Tracking
          </h1>
          <p className="text-muted-foreground">
            Manage your crop cycles from planting to harvest.
          </p>
        </div>
        <div className="flex w-full sm:w-auto">
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="w-full">
                <PlusCircle /> Add Crop
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Add New Crop Record</DialogTitle>
                <DialogDescription>
                  Enter the details for the new crop or field you want to track.
                </DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
                  <FormField
                    control={form.control}
                    name="cropType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Crop/Field Name</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Maize Field B" {...field} />
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
                        <FormLabel>Planting Date</FormLabel>
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
                        <FormLabel>Current Growth Stage</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a stage" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {growthStages.map(stage => (
                              <SelectItem key={stage} value={stage}>{stage}</SelectItem>
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
                        <FormLabel>Expected Harvest Date</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
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
          <CardTitle>Your Crops</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Planting Date</TableHead>
                  <TableHead>Growth Stage</TableHead>
                  <TableHead>Expected Harvest</TableHead>
                  <TableHead>Upcoming Tasks</TableHead>
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
                    const plantingDate = crop.plantingDate.toDate();
                    return (
                    <TableRow key={crop.id}>
                      <TableCell className="font-medium">{crop.cropType}</TableCell>
                      <TableCell>{format(plantingDate, 'PPP')}</TableCell>
                      <TableCell>{crop.growthStage}</TableCell>
                      <TableCell>{format(crop.expectedHarvestDate.toDate(), 'PPP')}</TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-2">
                            <Badge variant="outline" className="text-xs w-fit">
                                <Grab className="mr-1 h-3 w-3" />
                                Weed by: {format(addDays(plantingDate, 14), 'PPP')}
                            </Badge>
                           <Badge variant="outline" className="text-xs w-fit">
                                <Leaf className="mr-1 h-3 w-3" />
                                Fertilize by: {format(addDays(plantingDate, 28), 'PPP')}
                            </Badge>
                           <Badge variant="outline" className="text-xs w-fit">
                                <SprayCan className="mr-1 h-3 w-3" />
                                Scout by: {format(addDays(plantingDate, 42), 'PPP')}
                            </Badge>
                        </div>
                      </TableCell>
                    </TableRow>
                  )})
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                      No crops found. Add your first crop record to get started.
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
