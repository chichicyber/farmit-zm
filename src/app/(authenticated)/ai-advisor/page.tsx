'use client';

import { generateRecommendation } from '@/ai/flows/generate-growth-recommendations';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { zodResolver } from '@hookform/resolvers/zod';
import { Bot, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Skeleton } from '@/components/ui/skeleton';


const formSchema = z.object({
  cropType: z.string().min(1, 'Please select a crop type.'),
  growthStage: z.string().min(1, 'Please select a growth stage.'),
});

const cropTypes = ['Maize', 'Soyabeans', 'Wheat', 'Groundnuts', 'Cotton'];
const growthStages = ['Planting', 'Germination', 'Vegetative', 'Flowering', 'Harvesting'];


export default function AiAdvisorPage() {
  const [recommendation, setRecommendation] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    setRecommendation('');
    try {
      const prompt = `You are an expert agricultural advisor. Based on the crop type and its current growth stage, provide actionable recommendations to optimize farming practices and improve yield.

Crop Type: ${values.cropType}
Growth Stage: ${values.growthStage}

Recommendations:`;
      const result = await generateRecommendation(prompt);
      setRecommendation(result);
    } catch (error: any) {
      console.error(error);
      const description = error.message || 'There was a problem getting a recommendation. Please try again.';
      toast({
        variant: 'destructive',
        title: 'Error Generating Recommendation',
        description: description,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold font-headline tracking-tight flex items-center gap-2">
            <Bot className="h-8 w-8 text-primary"/> AI Growth Advisor
        </h1>
        <p className="text-muted-foreground">
          Get tailored suggestions to optimize your crop yield.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Get Advice</CardTitle>
              <CardDescription>
                Select your crop and its current stage.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-6"
                >
                  <FormField
                    control={form.control}
                    name="cropType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Crop Type</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a crop" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {cropTypes.map(crop => <SelectItem key={crop} value={crop}>{crop}</SelectItem>)}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="growthStage"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Growth Stage</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a stage" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                             {growthStages.map(stage => <SelectItem key={stage} value={stage}>{stage}</SelectItem>)}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? 'Generating...' : 'Get Recommendation'}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-2">
            <Card className="min-h-full">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-accent" />
                    AI-Powered Recommendation
                </CardTitle>
            </CardHeader>
            <CardContent>
                {isLoading ? (
                    <div className="space-y-4">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-3/4" />
                    </div>
                ) : recommendation ? (
                    <div className="prose prose-sm max-w-none text-foreground">
                        <p>{recommendation}</p>
                    </div>
                ) : (
                    <div className="text-center text-muted-foreground py-10">
                        <p>Your recommendation will appear here.</p>
                    </div>
                )}
            </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}
