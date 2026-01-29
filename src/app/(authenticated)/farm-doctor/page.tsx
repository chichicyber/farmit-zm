'use client';

import { diagnoseFarmIssue } from '@/ai/flows/diagnose-farm-issue';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { zodResolver } from '@hookform/resolvers/zod';
import { Bot, Camera, Sparkles, Stethoscope } from 'lucide-react';
import { useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Skeleton } from '@/components/ui/skeleton';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import Image from 'next/image';
import { useAuth } from '@/hooks/use-auth';
import { useFirestore } from '@/firebase';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';

const formSchema = z.object({
  question: z
    .string()
    .min(10, 'Please describe the issue in at least 10 characters.'),
  photoDataUri: z.string().optional(),
});

export default function FarmDoctorPage() {
  const [diagnosis, setDiagnosis] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { user } = useAuth();
  const firestore = useFirestore();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      question: '',
      photoDataUri: '',
    },
  });

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUri = reader.result as string;
        setImagePreview(dataUri);
        form.setValue('photoDataUri', dataUri);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    setDiagnosis('');

    try {
      const prompt = `You are an expert veterinarian and botanist, acting as a "Farm Doctor". A farmer needs your help. Based on their question and the provided image, provide a diagnosis and actionable recommendations.

Format your response using clear, easy-to-read markdown. Use headings, lists, and bold text for key information like diagnosis, treatment steps, and preventative measures.

Farmer's Question: "${values.question}"

Your Analysis:`;

      const result = await diagnoseFarmIssue(prompt, values.photoDataUri || null);
      setDiagnosis(result);

      if (user && firestore) {
        try {
          await addDoc(collection(firestore, 'users', user.uid, 'diagnoses'), {
            userId: user.uid,
            question: values.question,
            diagnosis: result,
            createdAt: serverTimestamp(),
          });
        } catch (e) {
          console.error('Could not save diagnosis', e);
          // We won't show a toast for this error to not bother the user
        }
      }
    } catch (error: any) {
      console.error(error);
      const description =
        error.message ||
        'There was a problem getting a diagnosis. Please try again.';
      toast({
        variant: 'destructive',
        title: 'Error Generating Diagnosis',
        description: description,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="flex items-center gap-2 text-3xl font-bold font-headline tracking-tight">
          <Stethoscope className="h-8 w-8 text-primary" /> Farm Doctor
        </h1>
        <p className="text-muted-foreground">
          Get expert advice for your sick crops or animals.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Submit a Case</CardTitle>
              <CardDescription>
                Describe the issue and add a photo.
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
                    name="question"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Describe the issue</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="e.g., 'My maize leaves have yellow spots' or 'My goat is not eating.'"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="space-y-2">
                    <FormLabel>Add a photo (optional)</FormLabel>
                    <input
                      type="file"
                      accept="image/*"
                      capture="environment"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Camera className="h-4 w-4" />
                      Take or Upload Photo
                    </Button>
                  </div>

                  {imagePreview && (
                    <div className="relative aspect-video w-full overflow-hidden rounded-md">
                      <Image
                        src={imagePreview}
                        alt="Selected preview"
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Diagnosing...' : 'Get Diagnosis'}
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
                AI-Powered Diagnosis
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              ) : diagnosis ? (
                <div className="prose prose-sm max-w-none text-foreground">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {diagnosis}
                  </ReactMarkdown>
                </div>
              ) : (
                <div className="py-10 text-center text-muted-foreground">
                  <Bot className="mx-auto h-12 w-12" />
                  <p className="mt-4">Your diagnosis will appear here.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
