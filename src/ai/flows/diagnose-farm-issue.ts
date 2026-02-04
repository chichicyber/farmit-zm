'use server';

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const diagnoseFarmIssueInputSchema = z.object({
  question: z.string(),
  image: z.string().optional(), // data URI
});

const diagnoseFarmIssueFlow = ai.defineFlow(
  {
    name: 'diagnoseFarmIssueFlow',
    inputSchema: diagnoseFarmIssueInputSchema,
    outputSchema: z.string(),
  },
  async ({ question, image }) => {
    const prompt = `You are an expert veterinarian and botanist, acting as a "Farm Doctor". A farmer needs your help. Based on their question and the provided image, provide a diagnosis and actionable recommendations.

    Format your response using clear, easy-to-read markdown. Use headings, lists, and bold text for key information like diagnosis, treatment steps, and preventative measures.

    Farmer's Question: "${question}"

    Your Analysis:`;

    const promptParts: any[] = [{ text: prompt }];
    if (image) {
      // Genkit's `media` helper is the correct way to pass images.
      promptParts.push({ media: { url: image } });
    }

    const llmResponse = await ai.generate({
      model: 'googleai/gemini-1.5-pro-latest', // Pro model for better diagnosis
      prompt: promptParts,
      config: {
        temperature: 0.4,
        maxOutputTokens: 2048,
      },
      safetySettings: [
        { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
        { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
        { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
        { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
      ],
    });

    if (!llmResponse.text) {
         const reason = llmResponse.finishReason;
         if (reason && reason !== 'STOP') {
             console.error(`Diagnosis blocked. Reason: ${reason}`);
             return `The AI could not provide a diagnosis because the request was blocked for safety reasons (${reason}). Please try a different image or description.`;
         }
         console.error("Diagnosis Error: No text returned from API.");
         return "The AI did not return a response. This might be due to a content filter. Please try again with a different image or prompt.";
    }

    return llmResponse.text;
  }
);

export async function diagnoseFarmIssue(input: {
  question: string;
  image?: string;
}): Promise<string> {
  return await diagnoseFarmIssueFlow(input);
}
