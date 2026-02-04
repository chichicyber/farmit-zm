'use server';

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const smartInsightFlow = ai.defineFlow(
  {
    name: 'smartInsightFlow',
    inputSchema: z.string(),
    outputSchema: z.string(),
  },
  async (userQuestion) => {
    const prompt = `You are Farmit Smart, an expert agricultural advisor for farmers in Zambia. A user has a question. Provide a clear, concise, and actionable answer based on agronomic best practices relevant to the region.

    Format your response using markdown.

    User Question: "${userQuestion}"

    Your Answer:`;

    const llmResponse = await ai.generate({
      model: 'googleai/gemini-1.5-pro-latest', // Upgraded model as requested
      prompt: prompt,
      config: {
        temperature: 0.7,
        maxOutputTokens: 1024,
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

export async function generateSmartInsight(userQuestion: string): Promise<string> {
  return await smartInsightFlow(userQuestion);
}
