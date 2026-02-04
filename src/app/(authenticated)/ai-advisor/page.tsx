
'use client';

import { generateRecommendation } from '@/ai/flows/generate-growth-recommendations';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { zodResolver } from '@hookform/resolvers/zod';
import { Bot, History, Save, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Skeleton } from '@/components/ui/skeleton';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useAuth } from '@/hooks/use-auth';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import {
  Timestamp,
  addDoc,
  collection,
  orderBy,
  query,
  serverTimestamp,
} from 'firebase/firestore';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { format } from 'date-fns';
import { useLanguage } from '@/contexts/language-context';

const formSchema = z.object({
  cropType: z.string().min(1, 'Please select a crop type.'),
  growthStage: z.string().min(1, 'Please select a growth stage.'),
});

type Advice = {
  id: string;
  userId: string;
  cropType: string;
  growthStage: string;
  recommendation: string;
  createdAt: Timestamp;
};

const cropTypes = ['Maize', 'Soyabeans', 'Wheat', 'Groundnuts', 'Cotton'];
const growthStages = [
  'Planting',
  'Germination',
  'Vegetative',
  'Flowering',
  'Harvesting',
];

export default function AiAdvisorPage() {
  const { t } = useLanguage();
  const [recommendation, setRecommendation] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [currentRecommendationSaved, setCurrentRecommendationSaved] =
    useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const firestore = useFirestore();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      cropType: '',
      growthStage: '',
    },
  });

  const advicesQuery = useMemoFirebase(() => {
    if (!user?.uid || !firestore) return null;
    return query(
      collection(firestore, 'users', user.uid, 'advices'),
      orderBy('createdAt', 'desc')
    );
  }, [user?.uid, firestore]);

  const { data: advices, isLoading: isLoadingHistory } =
    useCollection<Advice>(advicesQuery);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    setRecommendation('');
    setCurrentRecommendationSaved(false);
    try {
      const prompt = `You are an expert agricultural advisor. Based on the crop type and its current growth stage, provide actionable recommendations to optimize farming practices and improve yield.

Format your response using markdown for clarity, including headings, lists, and bold text where appropriate.

Crop Type: ${values.cropType}
Growth Stage: ${values.growthStage}

Recommendations:`;
      const result = await generateRecommendation(prompt);
      setRecommendation(result);
    } catch (error: any) {
      console.error(error);
      const description =
        error.message ||
        t('aiAdvisor.error.description');
      toast({
        variant: 'destructive',
        title: t('aiAdvisor.error.title'),
        description: description,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveAdvice = async () => {
    const formValues = form.getValues();
    if (!recommendation || !formValues.cropType || !user?.uid || !firestore) {
      toast({
        variant: 'destructive',
        title: t('aiAdvisor.saveError.title'),
        description: t('aiAdvisor.saveError.description'),
      });
      return;
    }
    setIsSaving(true);
    try {
      const adviceData = {
        userId: user.uid,
        cropType: formValues.cropType,
        growthStage: formValues.growthStage,
        recommendation: recommendation,
        createdAt: serverTimestamp(),
      };
      await addDoc(
        collection(firestore, 'users', user.uid, 'advices'),
        adviceData
      );
      toast({
        title: t('aiAdvisor.saveSuccess.title'),
        description: t('aiAdvisor.saveSuccess.description'),
      });
      setCurrentRecommendationSaved(true);
    } catch (error) {
      console.error('Error saving advice:', error);
      toast({
        variant: 'destructive',
        title: t('aiAdvisor.saveFailed.title'),
        description: t('aiAdvisor.saveFailed.description'),
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="flex items-center gap-2 text-3xl font-bold font-headline tracking-tight">
          <Bot className="h-8 w-8 text-primary" /> {t('aiAdvisor.title')}
        </h1>
        <p className="text-muted-foreground">{t('aiAdvisor.description')}</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>{t('aiAdvisor.getAdviceCard.title')}</CardTitle>
              <CardDescription>
                {t('aiAdvisor.getAdviceCard.description')}
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
                        <FormLabel>{t('aiAdvisor.getAdviceCard.cropTypeLabel')}</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder={t('aiAdvisor.getAdviceCard.cropTypePlaceholder')} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {cropTypes.map((crop) => (
                              <SelectItem key={crop} value={crop}>
                                {t(`cropTypes.${crop.toLowerCase()}`)}
                              </SelectItem>
                            ))}
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
                        <FormLabel>{t('aiAdvisor.getAdviceCard.growthStageLabel')}</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder={t('aiAdvisor.getAdviceCard.growthStagePlaceholder')} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {growthStages.map((stage) => (
                              <SelectItem key={stage} value={stage}>
                                {t(`growthStages.${stage.toLowerCase()}`)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? t('aiAdvisor.getAdviceCard.generatingButton') : t('aiAdvisor.getAdviceCard.getRecommendationButton')}
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
                {t('aiAdvisor.recommendationCard.title')}
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
                <>
                  <div className="prose prose-sm max-w-none text-foreground">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {recommendation}
                    </ReactMarkdown>
                  </div>
                  <div className="mt-6 flex justify-end">
                    <Button
                      onClick={handleSaveAdvice}
                      disabled={isSaving || currentRecommendationSaved}
                    >
                      <Save className="h-4 w-4" />
                      {isSaving
                        ? t('aiAdvisor.recommendationCard.savingButton')
                        : currentRecommendationSaved
                        ? t('aiAdvisor.recommendationCard.savedButton')
                        : t('aiAdvisor.recommendationCard.saveButton')}
                    </Button>
                  </div>
                </>
              ) : (
                <div className="py-10 text-center text-muted-foreground">
                  <p>{t('aiAdvisor.recommendationCard.placeholder')}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5 text-primary" />
            {t('aiAdvisor.historyCard.title')}
          </CardTitle>
          <CardDescription>
            {t('aiAdvisor.historyCard.description')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingHistory ? (
            <div className="space-y-4">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : advices && advices.length > 0 ? (
            <Accordion type="single" collapsible className="w-full">
              {advices.map((advice) => (
                <AccordionItem value={advice.id} key={advice.id}>
                  <AccordionTrigger>
                    <div className="flex w-full items-center justify-between pr-4">
                      <span className="font-medium">
                        {t(`cropTypes.${advice.cropType.toLowerCase()}`)} - {t(`growthStages.${advice.growthStage.toLowerCase()}`)}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {advice.createdAt
                          ? format(advice.createdAt.toDate(), 'PPP')
                          : t('common.dateUnavailable')}
                      </span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="prose prose-sm max-w-none pt-2 text-foreground">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {advice.recommendation}
                    </ReactMarkdown>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          ) : (
            <div className="py-10 text-center text-muted-foreground">
              <p>{t('aiAdvisor.historyCard.noHistory')}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
