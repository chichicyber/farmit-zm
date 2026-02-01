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
import { PlusCircle } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { format } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import { dummyCrops as initialCrops } from '@/lib/dummy-data';

const cropSchema = z.object({
  cropType: z.string().min(1, 'Crop type is required'),
  plantingDate: z.string().min(1, 'Planting date is required'),
  growthStage: z.string().min(1, 'Growth stage is required'),
  expectedHarvestDate: z.string().min(1, 'Expected harvest date is required'),
});

type Crop = z.infer<typeof cropSchema> & { 
  id: string; 
  userId: string;
  plantingDate: string;
  expectedHarvestDate: string;
};

const growthStages = ['Planting', 'Germination', 'Vegetative', 'Flowering', 'Harvesting'];

export default function CropsPage() {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [crops, setCrops] = useState<Crop[]>(initialCrops);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof cropSchema>>({
    resolver: zodResolver(cropSchema),
    defaultValues: {
      cropType: '',
      plantingDate: '',
      growthStage: '',
      expectedHarvestDate: '',
    },
  });

  const onSubmit = (values: z.infer<typeof cropSchema>) => {
    const newCrop = {
        ...values,
        id: Date.now().toString(),
        userId: 'dummy-user-id',
        plantingDate: new Date(values.plantingDate).toISOString(),
        expectedHarvestDate: new Date(values.expectedHarvestDate).toISOString(),
    };

    setCrops(prev => [newCrop, ...prev].sort((a,b) => new Date(b.plantingDate).getTime() - new Date(a.plantingDate).getTime()));

    toast({
      title: 'Success! (Demo)',
      description: `${values.cropType} added to your local records.`,
    });
    form.reset();
    setIsDialogOpen(false);
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
                    <Button type="submit">Save Record</Button>
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
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center">
                      <Skeleton className="h-8 w-full" />
                    </TableCell>
                  </TableRow>
                ) : crops && crops.length > 0 ? (
                  crops.map((crop) => (
                    <TableRow key={crop.id}>
                      <TableCell className="font-medium">{crop.cropType}</TableCell>
                      <TableCell>{format(new Date(crop.plantingDate), 'PPP')}</TableCell>
                      <TableCell>{crop.growthStage}</TableCell>
                      <TableCell>{format(new Date(crop.expectedHarvestDate), 'PPP')}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center">
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
