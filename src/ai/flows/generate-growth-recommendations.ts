'use server';

/**
 * @fileOverview Generates AI-powered recommendations on crop management based on the crop type and its current growth stage.
 *
 * - generateGrowthRecommendations - A function that generates growth recommendations.
 * - GenerateGrowthRecommendationsInput - The input type for the generateGrowthRecommendations function.
 * - GenerateGrowthRecommendationsOutput - The return type for the generateGrowthRecommendations function.
 */

import {ai} from '@/ai/genkit';
import { run } from 'genkit/flow';
import {z} from 'genkit';
import { geminiPro } from '@genkit-ai/googleai';

const GenerateGrowthRecommendationsInputSchema = z.object({
  cropType: z.string().describe('The type of crop.'),
  growthStage: z.string().describe('The current growth stage of the crop.'),
});

export type GenerateGrowthRecommendationsInput = z.infer<typeof GenerateGrowthRecommendationsInputSchema>;

const GenerateGrowthRecommendationsOutputSchema = z.object({
  recommendations: z.string().describe('AI-powered recommendations for crop management.'),
});

export type GenerateGrowthRecommendationsOutput = z.infer<typeof GenerateGrowthRecommendationsOutputSchema>;

export async function generateGrowthRecommendations(
  input: GenerateGrowthRecommendationsInput
): Promise<GenerateGrowthRecommendationsOutput> {
  return run(generateGrowthRecommendationsFlow, input);
}

const prompt = ai.definePrompt({
  name: 'generateGrowthRecommendationsPrompt',
  inputSchema: GenerateGrowthRecommendationsInputSchema,
  outputSchema: GenerateGrowthRecommendationsOutputSchema,
  model: geminiPro,
  template: `You are an expert agricultural advisor. Based on the crop type and its current growth stage, provide actionable recommendations to optimize farming practices and improve yield.

Crop Type: {{{cropType}}}
Growth Stage: {{{growthStage}}}

Recommendations:`,
});

const generateGrowthRecommendationsFlow = ai.defineFlow(
  {
    name: 'generateGrowthRecommendationsFlow',
    inputSchema: GenerateGrowthRecommendationsInputSchema,
    outputSchema: GenerateGrowthRecommendationsOutputSchema,
  },
  async input => {
    const llmResponse = await prompt.generate({input: input});
    const output = llmResponse.output();
    if (!output) {
        throw new Error("No output from AI");
    }
    return output;
  }
);
