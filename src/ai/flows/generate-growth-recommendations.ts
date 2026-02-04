'use server';

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const recommendationFlow = ai.defineFlow(
  {
    name: 'recommendationFlow',
    inputSchema: z.string(),
    outputSchema: z.string(),
  },
  async (prompt) => {
    const llmResponse = await ai.generate({
      model: 'googleai/gemini-1.5-flash-latest',
      prompt: prompt,
      config: {
        temperature: 0.7,
        maxOutputTokens: 2048,
      },
      safetySettings: [
        { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
        { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
        { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
        { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
      ],
    });

    return llmResponse.text;
  }
);

export async function generateRecommendation(prompt: string): Promise<string> {
  return await recommendationFlow(prompt);
}
