'use client';

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
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { BrainCircuit, Sprout, AlertTriangle, Sparkles } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { generateSmartInsight } from '@/ai/flows/generate-smart-insights';
import { useLanguage } from '@/contexts/language-context';


const formSchema = z.object({
  question: z.string().min(10, 'Please ask a more detailed question.'),
});

export default function FarmitSmartPage() {
  const { t } = useLanguage();
  const [welcomeText, setWelcomeText] = useState('');
  
  const [insight, setInsight] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      question: '',
    },
  });

  useEffect(() => {
    let i = 0;
    const welcomeMessage = t('farmitSmart.welcome');
    setWelcomeText(''); // Reset before starting
    const typingInterval = setInterval(() => {
      if (i < welcomeMessage.length) {
        setWelcomeText(prev => prev + welcomeMessage.charAt(i));
        i++;
      } else {
        clearInterval(typingInterval);
      }
    }, 50);

    return () => clearInterval(typingInterval);
  }, [t]);


  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    setInsight('');
    try {
      const result = await generateSmartInsight(values.question);
      setInsight(result);
    } catch (error: any) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: t('farmitSmart.error.title'),
        description: error.message || t('farmitSmart.error.description'),
      });
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="flex items-center gap-2 text-3xl font-bold font-headline tracking-tight">
          <BrainCircuit className="h-8 w-8 text-primary" />
          {t('farmitSmart.title')}
        </h1>
        <p className="h-5 text-muted-foreground">{welcomeText}</p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>{t('farmitSmart.askCard.title')}</CardTitle>
          <CardDescription>
            {t('farmitSmart.askCard.description')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="question"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('farmitSmart.askCard.questionLabel')}</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder={t('farmitSmart.askCard.questionPlaceholder')}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isLoading}>
                {isLoading ? t('farmitSmart.askCard.gettingInsightsButton') : t('farmitSmart.askCard.getInsightsButton')}
              </Button>
            </form>
          </Form>
        </CardContent>
        {(isLoading || insight) && (
          <CardContent>
            <div className="mt-4 rounded-lg border bg-card p-4">
              <h4 className="flex items-center gap-2 font-semibold">
                 <Sparkles className="h-5 w-5 text-accent" />
                 {t('farmitSmart.askCard.aiInsightTitle')}
              </h4>
              <div className="mt-2 text-sm text-muted-foreground">
              {isLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-5/6" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              ) : (
                <div className="prose prose-sm max-w-none text-foreground">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{insight}</ReactMarkdown>
                </div>
              )}
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Card>
          <CardHeader className="flex-row items-center gap-4 space-y-0">
            <div className="rounded-full bg-primary/10 p-3">
              <Sprout className="h-6 w-6 text-primary" />
            </div>
            <CardTitle>{t('farmitSmart.agronomicInsights.title')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg border bg-card p-4">
              <h4 className="font-semibold">{t('farmitSmart.agronomicInsights.cropRotation.title')}</h4>
              <p className="text-sm text-muted-foreground">
                {t('farmitSmart.agronomicInsights.cropRotation.description')}
              </p>
            </div>
            <div className="rounded-lg border bg-card p-4">
              <h4 className="font-semibold">{t('farmitSmart.agronomicInsights.plantingTime.title')}</h4>
              <p className="text-sm text-muted-foreground">
                {t('farmitSmart.agronomicInsights.plantingTime.description')}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-center gap-4 space-y-0">
            <div className="rounded-full bg-destructive/10 p-3">
              <AlertTriangle className="h-6 w-6 text-destructive" />
            </div>
            <CardTitle>{t('farmitSmart.riskAlerts.title')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg border border-destructive/50 bg-destructive/5 p-4">
              <h4 className="font-semibold text-destructive">
                {t('farmitSmart.riskAlerts.fallArmyworm.title')}
              </h4>
              <p className="text-sm text-muted-foreground">
                {t('farmitSmart.riskAlerts.fallArmyworm.description')}
              </p>
            </div>
             <div className="rounded-lg border border-accent/50 bg-accent/5 p-4">
              <h4 className="font-semibold text-accent-foreground/80">
                {t('farmitSmart.riskAlerts.newcastleDisease.title')}
              </h4>
              <p className="text-sm text-muted-foreground">
                {t('farmitSmart.riskAlerts.newcastleDisease.description')}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

       <Card>
        <CardHeader>
            <CardTitle>{t('farmitSmart.howItWorks.title')}</CardTitle>
        </CardHeader>
        <CardContent>
            <CardDescription>
                {t('farmitSmart.howItWorks.description')}
            </CardDescription>
        </CardContent>
       </Card>

    </div>
  );
}
