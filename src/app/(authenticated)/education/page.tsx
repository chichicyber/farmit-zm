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
import {
  BrainCircuit,
  Sparkles,
  Volume2,
  Loader2,
  Sprout,
  AlertTriangle,
  Mic,
  StopCircle,
} from 'lucide-react';
import { useEffect, useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { generateSmartInsight } from '@/ai/flows/generate-smart-insights';
import { useLanguage } from '@/contexts/language-context';
import { generateSpeech } from '@/ai/flows/generate-speech';
import { transcribeAudio } from '@/ai/flows/transcribe-audio';

const formSchema = z.object({
  question: z.string().min(10, 'Please ask a more detailed question.'),
});

export default function FarmitSmartPage() {
  const { t } = useLanguage();
  const [welcomeText, setWelcomeText] = useState('');

  const [insight, setInsight] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const [isGeneratingSpeech, setIsGeneratingSpeech] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);

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
        setWelcomeText((prev) => prev + welcomeMessage.charAt(i));
        i++;
      } else {
        clearInterval(typingInterval);
      }
    }, 50);

    return () => clearInterval(typingInterval);
  }, [t]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setInsight('');
    setAudioUrl(null);
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
  }

  const handleListen = async () => {
    if (!insight) return;
    setIsGeneratingSpeech(true);
    setAudioUrl(null);
    try {
      const { audioUrl } = await generateSpeech(insight);
      setAudioUrl(audioUrl);
    } catch (error: any) {
      console.error('Audio generation failed:', error);
      toast({
        variant: 'destructive',
        title: t('farmitSmart.listenError.toast.title'),
        description:
          error.message || t('farmitSmart.listenError.toast.description'),
      });
    } finally {
      setIsGeneratingSpeech(false);
    }
  };

  const handleVoiceSearch = async () => {
    if (isRecording) {
      mediaRecorderRef.current?.stop();
      setIsRecording(false);
      // The onstop event will handle the transcription
    } else {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        toast({
          variant: 'destructive',
          title: t('farmitSmart.voiceSearch.notSupported.title'),
          description: t('farmitSmart.voiceSearch.notSupported.description'),
        });
        return;
      }

      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        setIsRecording(true);
        const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
        mediaRecorderRef.current = mediaRecorder;
        const audioChunks: Blob[] = [];

        mediaRecorder.ondataavailable = (event) => {
          audioChunks.push(event.data);
        };

        mediaRecorder.onstop = async () => {
          const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
          const reader = new FileReader();
          reader.readAsDataURL(audioBlob);
          reader.onloadend = async () => {
            const base64Audio = reader.result as string;
            setIsTranscribing(true);
            try {
              const transcript = await transcribeAudio(base64Audio);
              form.setValue('question', transcript, { shouldValidate: true });
            } catch (error: any) {
              console.error(error);
              toast({
                variant: 'destructive',
                title: t('farmitSmart.voiceSearch.transcriptionError.title'),
                description:
                  error.message ||
                  t('farmitSmart.voiceSearch.transcriptionError.description'),
              });
            } finally {
              setIsTranscribing(false);
            }
          };
           // Stop all tracks to release the microphone
          stream.getTracks().forEach(track => track.stop());
        };

        mediaRecorder.start();
      } catch (err) {
        console.error('Error accessing microphone:', err);
        toast({
          variant: 'destructive',
          title: t('farmitSmart.voiceSearch.micPermissionError.title'),
          description: t('farmitSmart.voiceSearch.micPermissionError.description'),
        });
        setIsRecording(false);
      }
    }
  };

  useEffect(() => {
    if (audioUrl && audioRef.current) {
      audioRef.current.play();
    }
  }, [audioUrl]);

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
                    <FormLabel>
                      {t('farmitSmart.askCard.questionLabel')}
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder={t(
                          'farmitSmart.askCard.questionPlaceholder'
                        )}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex items-center gap-2">
                 <Button
                  type="submit"
                  disabled={isLoading || isRecording || isTranscribing}
                >
                  {isLoading
                    ? t('farmitSmart.askCard.gettingInsightsButton')
                    : t('farmitSmart.askCard.getInsightsButton')}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={handleVoiceSearch}
                  disabled={isLoading || isTranscribing}
                  title={isRecording ? t('farmitSmart.voiceSearch.stopRecording') : t('farmitSmart.voiceSearch.startRecording')}
                >
                  {isRecording ? (
                    <StopCircle className="h-5 w-5 animate-pulse text-destructive" />
                  ) : isTranscribing ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <Mic className="h-5 w-5" />
                  )}
                  <span className="sr-only">
                    {isRecording
                      ? t('farmitSmart.voiceSearch.stopRecording')
                      : t('farmitSmart.voiceSearch.startRecording')}
                  </span>
                </Button>
              </div>
            </form>
          </Form>

          {(isLoading || insight) && (
            <div className="mt-6 rounded-lg border bg-card p-4">
              <div className="flex items-center justify-between">
                <h4 className="flex items-center gap-2 font-semibold">
                  <Sparkles className="h-5 w-5 text-accent" />
                  {t('farmitSmart.askCard.aiInsightTitle')}
                </h4>
                {insight && !isLoading && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleListen}
                    disabled={isGeneratingSpeech}
                  >
                    {isGeneratingSpeech ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Volume2 className="h-4 w-4" />
                    )}
                    {isGeneratingSpeech
                      ? t('farmitSmart.listenButton.loading')
                      : t('farmitSmart.listenButton.default')}
                  </Button>
                )}
              </div>
              <div className="mt-2 text-sm text-muted-foreground">
                {isLoading ? (
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-5/6" />
                    <Skeleton className="h-4 w-3/4" />
                  </div>
                ) : (
                  <div className="prose prose-sm max-w-none text-foreground">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {insight}
                    </ReactMarkdown>
                  </div>
                )}
              </div>
              {audioUrl && (
                <audio
                  ref={audioRef}
                  src={audioUrl}
                  className="mt-4 w-full"
                  controls
                />
              )}
            </div>
          )}
        </CardContent>
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
              <h4 className="font-semibold">
                {t('farmitSmart.agronomicInsights.cropRotation.title')}
              </h4>
              <p className="text-sm text-muted-foreground">
                {t('farmitSmart.agronomicInsights.cropRotation.description')}
              </p>
            </div>
            <div className="rounded-lg border bg-card p-4">
              <h4 className="font-semibold">
                {t('farmitSmart.agronomicInsights.plantingTime.title')}
              </h4>
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
