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
import { Bot, Camera, Sparkles, Stethoscope, Loader2 } from 'lucide-react';
import { useRef, useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Skeleton } from '@/components/ui/skeleton';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import Image from 'next/image';
import { useAuth } from '@/hooks/use-auth';
import { useFirestore } from '@/firebase';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { useLanguage } from '@/contexts/language-context';

const formSchema = z.object({
  question: z
    .string()
    .min(10, 'Please describe the issue in at least 10 characters.'),
});

// Helper function for client-side image processing
const resizeAndProcessImage = (file: File): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      if (!event.target?.result) {
        return reject(new Error('Failed to read file.'));
      }
      const img = document.createElement('img');
      img.src = event.target.result as string;
      img.onload = () => {
        const MAX_SIDE = 1024;
        let { width, height } = img;

        if (width > height) {
          if (width > MAX_SIDE) {
            height *= MAX_SIDE / width;
            width = MAX_SIDE;
          }
        } else {
          if (height > MAX_SIDE) {
            width *= MAX_SIDE / height;
            height = MAX_SIDE;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          return reject(new Error('Could not get canvas context.'));
        }
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              return reject(new Error('Canvas to Blob conversion failed.'));
            }
            resolve(blob);
          },
          'image/jpeg',
          0.8
        );
      };
      img.onerror = (err) => reject(err);
    };
    reader.onerror = (err) => reject(err);
  });
};


export default function FarmDoctorPage() {
  const { t } = useLanguage();
  const [diagnosis, setDiagnosis] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isImageProcessing, setIsImageProcessing] = useState(false);
  const [processedImage, setProcessedImage] = useState<Blob | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { user } = useAuth();
  const firestore = useFirestore();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      question: '',
    },
  });

  // Clean up the object URL to prevent memory leaks
  useEffect(() => {
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);


  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setIsImageProcessing(true);
      toast({ title: t('farmDoctor.imageProcessing.toast.title'), description: t('farmDoctor.imageProcessing.toast.description') });
      
      try {
        const blob = await resizeAndProcessImage(file);
        setProcessedImage(blob);

        if (imagePreview) {
          URL.revokeObjectURL(imagePreview);
        }
        setImagePreview(URL.createObjectURL(blob));
        
        toast({ title: t('farmDoctor.imageReady.toast.title'), description: t('farmDoctor.imageReady.toast.description') });
      } catch (error) {
        console.error("Image processing error:", error);
        toast({ variant: 'destructive', title: t('farmDoctor.imageError.toast.title'), description: t('farmDoctor.imageError.toast.description') });
        setProcessedImage(null);
        setImagePreview(null);
      } finally {
        setIsImageProcessing(false);
        // Reset file input to allow selecting the same file again
        if(fileInputRef.current) fileInputRef.current.value = "";
      }
    }
  };

  const blobToDataUrl = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    setDiagnosis('');

    try {
      let imageDataUri: string | undefined = undefined;
      if (processedImage) {
        imageDataUri = await blobToDataUrl(processedImage);
      }
      
      const result = await diagnoseFarmIssue({
        question: values.question,
        image: imageDataUri,
      });

      setDiagnosis(result);

      if (user && firestore && result) {
         try {
          await addDoc(collection(firestore, 'users', user.uid, 'diagnoses'), {
            userId: user.uid,
            question: values.question,
            diagnosis: result,
            createdAt: serverTimestamp(),
          });
        } catch (e) {
          console.error('Could not save diagnosis to Firestore', e);
        }
      }
    } catch (error: any) {
      console.error("Diagnosis submission error:", error);
      toast({
        variant: 'destructive',
        title: t('farmDoctor.diagnosisError.toast.title'),
        description: error.message || t('farmDoctor.diagnosisError.toast.description'),
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="flex items-center gap-2 text-3xl font-bold font-headline tracking-tight">
          <Stethoscope className="h-8 w-8 text-primary" /> {t('farmDoctor.title')}
        </h1>
        <p className="text-muted-foreground">
          {t('farmDoctor.description')}
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>{t('farmDoctor.submitCaseCard.title')}</CardTitle>
              <CardDescription>
                {t('farmDoctor.submitCaseCard.description')}
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
                        <FormLabel>{t('farmDoctor.submitCaseCard.issueLabel')}</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder={t('farmDoctor.submitCaseCard.issuePlaceholder')}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="space-y-2">
                    <FormLabel>{t('farmDoctor.submitCaseCard.photoLabel')}</FormLabel>
                    <input
                      type="file"
                      accept="image/*"
                      capture="environment"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      className="hidden"
                      disabled={isImageProcessing}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isImageProcessing}
                    >
                      {isImageProcessing ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Camera className="mr-2 h-4 w-4" />
                      )}
                      {isImageProcessing ? t('farmDoctor.submitCaseCard.processingButton') : t('farmDoctor.submitCaseCard.uploadButton')}
                    </Button>
                  </div>

                  {imagePreview && (
                    <div className="relative aspect-video w-full overflow-hidden rounded-md">
                      <Image
                        src={imagePreview}
                        alt={t('farmDoctor.submitCaseCard.imagePreviewAlt')}
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isLoading || isImageProcessing}
                  >
                    {isLoading ? (
                       <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ): null}
                    {isLoading ? t('farmDoctor.submitCaseCard.diagnosingButton') : t('farmDoctor.submitCaseCard.getDiagnosisButton')}
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
                {t('farmDoctor.diagnosisCard.title')}
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
                <div className="flex h-full min-h-[200px] flex-col items-center justify-center text-center text-muted-foreground">
                  <Bot className="mx-auto h-12 w-12" />
                  <p className="mt-4">{t('farmDoctor.diagnosisCard.placeholder')}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
