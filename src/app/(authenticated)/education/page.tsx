import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cropLessons, animalLessons } from './data';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';

export default function EducationPage() {
  const cropImage = PlaceHolderImages.find(p => p.id === 'crop-education');
  const animalImage = PlaceHolderImages.find(p => p.id === 'animal-education');

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold font-headline tracking-tight">Farmit Smart</h1>
        <p className="text-muted-foreground">
          Use smart guides and predictive models to optimize your farm.
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        <Card>
          <CardHeader>
            {cropImage && 
              <div className="relative h-48 w-full overflow-hidden rounded-lg">
                <Image src={cropImage.imageUrl} alt={cropImage.description} data-ai-hint={cropImage.imageHint} fill className="object-cover"/>
              </div>
            }
            <CardTitle className="pt-4 text-xl font-headline">Smart Crop Guides</CardTitle>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              {cropLessons.map((lesson, index) => (
                <AccordionItem value={`item-${index}`} key={index}>
                  <AccordionTrigger className="text-base">{lesson.title}</AccordionTrigger>
                  <AccordionContent className="prose prose-sm max-w-none text-muted-foreground">
                    <p>{lesson.content}</p>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            {animalImage && 
              <div className="relative h-48 w-full overflow-hidden rounded-lg">
                <Image src={animalImage.imageUrl} alt={animalImage.description} data-ai-hint={animalImage.imageHint} fill className="object-cover"/>
              </div>
            }
            <CardTitle className="pt-4 text-xl font-headline">Smart Animal Guides</CardTitle>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              {animalLessons.map((lesson, index) => (
                <AccordionItem value={`item-${index}`} key={index}>
                  <AccordionTrigger className="text-base">{lesson.title}</AccordionTrigger>
                  <AccordionContent className="prose prose-sm max-w-none text-muted-foreground">
                    <p>{lesson.content}</p>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
