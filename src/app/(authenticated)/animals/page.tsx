'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
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
import { Map, PlusCircle } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

const animalSchema = z.object({
  tagId: z.string().min(1, 'Tag ID is required'),
  type: z.string().min(1, 'Animal type is required'),
  healthStatus: z.string().min(1, 'Health status is required'),
  lastVaccination: z.string().min(1, 'Last vaccination date is required'),
});

type Animal = z.infer<typeof animalSchema> & { id: string };

const initialAnimals: Animal[] = [
  {
    id: '1',
    tagId: 'ZM-C-001',
    type: 'Cattle',
    healthStatus: 'Healthy',
    lastVaccination: new Date('2024-03-20').toISOString(),
  },
  {
    id: '2',
    tagId: 'ZM-G-015',
    type: 'Goat',
    healthStatus: 'Under Observation',
    lastVaccination: new Date('2024-05-10').toISOString(),
  },
   {
    id: '3',
    tagId: 'ZM-P-120',
    type: 'Chicken',
    healthStatus: 'Healthy',
    lastVaccination: new Date('2024-06-01').toISOString(),
  },
];

const healthStatuses = ['Healthy', 'Under Observation', 'Sick'];
const animalTypes = ['Cattle', 'Goat', 'Chicken', 'Pig', 'Sheep'];

export default function AnimalsPage() {
  const [animals, setAnimals] = useState<Animal[]>(initialAnimals);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof animalSchema>>({
    resolver: zodResolver(animalSchema),
    defaultValues: {
      tagId: '',
      type: '',
      healthStatus: '',
      lastVaccination: '',
    },
  });

  const onSubmit = (values: z.infer<typeof animalSchema>) => {
    const newAnimal: Animal = {
      id: (animals.length + 1).toString(),
      ...values,
    };
    setAnimals([...animals, newAnimal]);
    toast({
      title: 'Success!',
      description: `Animal with tag ${values.tagId} has been added.`,
    });
    form.reset();
    setIsDialogOpen(false);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-headline tracking-tight">
            Animal Tracking
          </h1>
          <p className="text-muted-foreground">
            Keep records of your livestock&apos;s health and status.
          </p>
        </div>
        <div className="flex flex-shrink-0 gap-2">
           <Link href="/animals/map" passHref>
            <Button variant="outline">
              <Map className="mr-2 h-4 w-4" /> View Map
            </Button>
          </Link>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <PlusCircle className="mr-2 h-4 w-4" /> Add Animal
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
                  onSubmit={form.handleSubmit(onSubmit)}
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
                    name="type"
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
                    name="lastVaccination"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Last Vaccination Date</FormLabel>
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
                    <Button type="submit">Save Record</Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tag ID</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Health Status</TableHead>
                <TableHead>Last Vaccination</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {animals.map((animal) => (
                <TableRow key={animal.id}>
                  <TableCell className="font-medium">{animal.tagId}</TableCell>
                  <TableCell>{animal.type}</TableCell>
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
                    {format(new Date(animal.lastVaccination), 'PPP')}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
