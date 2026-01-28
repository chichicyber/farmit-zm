'use client';

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
import { PlusCircle } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { format } from 'date-fns';

const cropSchema = z.object({
  name: z.string().min(1, 'Crop name is required'),
  plantingDate: z.string().min(1, 'Planting date is required'),
  growthStage: z.string().min(1, 'Growth stage is required'),
  expectedHarvest: z.string().min(1, 'Expected harvest date is required'),
});

type Crop = z.infer<typeof cropSchema> & { id: string };

const initialCrops: Crop[] = [
  {
    id: '1',
    name: 'Maize Field A',
    plantingDate: new Date('2023-11-15').toISOString(),
    growthStage: 'Vegetative',
    expectedHarvest: new Date('2024-04-10').toISOString(),
  },
  {
    id: '2',
    name: 'Soyabeans Plot 3',
    plantingDate: new Date('2023-12-01').toISOString(),
    growthStage: 'Flowering',
    expectedHarvest: new Date('2024-05-01').toISOString(),
  },
];

const growthStages = ['Planting', 'Germination', 'Vegetative', 'Flowering', 'Harvesting'];

export default function CropsPage() {
  const [crops, setCrops] = useState<Crop[]>(initialCrops);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof cropSchema>>({
    resolver: zodResolver(cropSchema),
    defaultValues: {
      name: '',
      plantingDate: '',
      growthStage: '',
      expectedHarvest: '',
    },
  });

  const onSubmit = (values: z.infer<typeof cropSchema>) => {
    const newCrop: Crop = {
      id: (crops.length + 1).toString(),
      ...values,
    };
    setCrops([...crops, newCrop]);
    toast({
      title: 'Success!',
      description: `${values.name} has been added to your records.`,
    });
    form.reset();
    setIsDialogOpen(false);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-headline tracking-tight">
            Crop Tracking
          </h1>
          <p className="text-muted-foreground">
            Manage your crop cycles from planting to harvest.
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
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
                  name="name"
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
                  name="expectedHarvest"
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
                  <Button type="submit">Save Record</Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Planting Date</TableHead>
                <TableHead>Growth Stage</TableHead>
                <TableHead>Expected Harvest</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {crops.map((crop) => (
                <TableRow key={crop.id}>
                  <TableCell className="font-medium">{crop.name}</TableCell>
                  <TableCell>{format(new Date(crop.plantingDate), 'PPP')}</TableCell>
                  <TableCell>{crop.growthStage}</TableCell>
                  <TableCell>{format(new Date(crop.expectedHarvest), 'PPP')}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
