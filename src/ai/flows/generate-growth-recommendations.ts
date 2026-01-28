'use server';

/**
 * @fileOverview Generates AI-powered recommendations on crop management based on the crop type and its current growth stage.
 *
 * - generateGrowthRecommendations - a function that generates growth recommendations.
 */
import { ai } from '@/ai/genkit';
import { z } from 'zod';

const GenerateGrowthRecommendationsInputSchema = z.object({
  cropType: z.string().describe('The type of crop.'),
  growthStage: z.string().describe('The current growth stage of the crop.'),
});

type GenerateGrowthRecommendationsInput = z.infer<
  typeof GenerateGrowthRecommendationsInputSchema
>;

const GenerateGrowthRecommendationsOutputSchema = z.object({
  recommendations: z
    .string()
    .describe('AI-powered recommendations for crop management.'),
});

type GenerateGrowthRecommendationsOutput = z.infer<
  typeof GenerateGrowthRecommendationsOutputSchema
>;

export async function generateGrowthRecommendations(
  input: GenerateGrowthRecommendationsInput
): Promise<GenerateGrowthRecommendationsOutput> {
  return generateGrowthRecommendationsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateGrowthRecommendationsPrompt',
  model: 'gemini-pro',
  input: { schema: GenerateGrowthRecommendationsInputSchema },
  output: { schema: GenerateGrowthRecommendationsOutputSchema },
  prompt: `You are an expert agricultural advisor. Based on the crop type and its current growth stage, provide actionable recommendations to optimize farming practices and improve yield.

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
    const { output } = await prompt(input);
    if (!output) {
      throw new Error('No output from AI');
    }
    return output;
  }
);
