'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { BrainCircuit, Sprout, AlertTriangle } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function FarmitSmartPage() {
  const [welcomeText, setWelcomeText] = useState('');
  const welcomeMessage = 'Welcome to Farm Smart, your intelligent farming partner.';

  useEffect(() => {
    let i = 0;
    const typingInterval = setInterval(() => {
      if (i < welcomeMessage.length) {
        setWelcomeText((prev) => welcomeMessage.substring(0, i + 1));
        i++;
      } else {
        clearInterval(typingInterval);
      }
    }, 50);

    return () => clearInterval(typingInterval);
  }, []);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="flex items-center gap-2 text-3xl font-bold font-headline tracking-tight">
          <BrainCircuit className="h-8 w-8 text-primary" />
          Farmit Smart
        </h1>
        <p className="h-5 text-muted-foreground">{welcomeText}</p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Card>
          <CardHeader className="flex-row items-center gap-4 space-y-0">
            <div className="rounded-full bg-primary/10 p-3">
              <Sprout className="h-6 w-6 text-primary" />
            </div>
            <CardTitle>Agronomic Insights</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg border bg-card p-4">
              <h4 className="font-semibold">Crop Rotation</h4>
              <p className="text-sm text-muted-foreground">
                Rotate your crops each season to improve soil health and reduce
                pest and disease buildup. For example, follow maize with a
                legume like soyabeans to naturally add nitrogen to the soil.
              </p>
            </div>
            <div className="rounded-lg border bg-card p-4">
              <h4 className="font-semibold">Planting Time</h4>
              <p className="text-sm text-muted-foreground">
                Early planting at the onset of rains can help your crops
                establish a strong root system before the dry spells,
                significantly boosting potential yield.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-center gap-4 space-y-0">
            <div className="rounded-full bg-destructive/10 p-3">
              <AlertTriangle className="h-6 w-6 text-destructive" />
            </div>
            <CardTitle>Risk Alerts</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg border border-destructive/50 bg-destructive/5 p-4">
              <h4 className="font-semibold text-destructive">
                Fall Armyworm Advisory
              </h4>
              <p className="text-sm text-muted-foreground">
                Reports indicate high Fall Armyworm activity. Scout your maize
                fields (especially young plants) for signs of damage like
                "windowpane" feeding and apply recommended pesticides if
                necessary.
              </p>
            </div>
             <div className="rounded-lg border border-accent/50 bg-accent/5 p-4">
              <h4 className="font-semibold text-accent-foreground/80">
                Newcastle Disease
              </h4>
              <p className="text-sm text-muted-foreground">
                Ensure your poultry's vaccination schedule for Newcastle Disease is up to date. Biosecurity is key: limit visitor access and disinfect footwear before entering the coop.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

       <Card>
        <CardHeader>
            <CardTitle>How Farmit Smart Works</CardTitle>
        </CardHeader>
        <CardContent>
            <CardDescription>
                This system uses rule-based logic based on agronomic best practices. When you add a new crop or animal and provide key dates (like planting or vaccination dates), Farmit Smart automatically populates your "Reminders" page with a schedule of crucial tasks. This helps you stay on track with fertilizing, weeding, vaccinations, and more, ensuring you never miss a critical step in your farming operations.
            </CardDescription>
        </CardContent>
       </Card>
    </div>
  );
}
