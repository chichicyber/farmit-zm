'use server';

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { GEMINI_MODEL } from '../model';

const diagnoseFarmIssueInputSchema = z.object({
  question: z.string(),
  image: z.string().optional(), // data URI
  isVoice: z.boolean().optional(),
});

const diagnoseFarmIssueFlow = ai.defineFlow(
  {
    name: 'diagnoseFarmIssueFlow',
    inputSchema: diagnoseFarmIssueInputSchema,
    outputSchema: z.string(),
  },
  async ({ question, image, isVoice }) => {
    const textPrompt = `You are an expert veterinarian and botanist, acting as a "Farm Doctor". A farmer needs your help. Based on their question and the provided image, provide a diagnosis and actionable recommendations.

    Format your response using clear, easy-to-read markdown. Use headings, lists, and bold text for key information like diagnosis, treatment steps, and preventative measures.

    Farmer's Question: "${question}"

    Your Analysis:`;
    
    const voicePrompt = `You are an expert veterinarian and botanist, acting as a "Farm Doctor". A farmer is asking for your help via voice. Your response will be read aloud, so it must be conversational, reassuring, and easy to follow.

    IMPORTANT: Structure your response exactly like this, speaking directly to the farmer:
    1.  **Reassurance:** Start with a calm and reassuring tone. For example: "Okay, thank you for sending that over. Let's take a look together, don't worry, we can figure this out."
    2.  **The Problem:** Clearly and simply explain what you think the problem is. For example: "It looks like your plant is suffering from..." or "From what you're describing, it sounds like the animal might have..."
    3.  **The Cause:** Briefly explain the likely cause in simple terms. For example: "This is often caused by too much moisture in the air..." or "This can happen when..."
    4.  **What to do Today:** Give immediate, actionable steps for today. For example: "The first thing you should do is carefully remove the affected leaves..."
    5.  **What to do in the Future:** Provide simple advice for prevention in the future. For example: "To help prevent this from happening again, try to..."

    Do not use markdown, headings, or lists. Just provide a natural, spoken response following these 5 points.

    Farmer's Question: "${question}"

    Your Spoken Analysis:`;

    const prompt = isVoice ? voicePrompt : textPrompt;

    const promptParts: any[] = [{ text: prompt }];
    if (image) {
      // Genkit's `media` helper is the correct way to pass images.
      promptParts.push({ media: { url: image } });
    }

    /**
     * MODEL LOCK:
     * This function MUST use gemini-2.5-flash.
     * Downgrading or switching models is NOT allowed.
     */
    const llmResponse = await ai.generate({
      model: GEMINI_MODEL,
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
      console.error('Diagnosis Error: No text returned from API.');
      return 'The AI did not return a response. This might be due to a content filter. Please try again with a different image or prompt.';
    }

    return llmResponse.text;
  }
);

export async function diagnoseFarmIssue(input: {
  question: string;
  image?: string;
  isVoice?: boolean;
}): Promise<string> {
  return await diagnoseFarmIssueFlow(input);
}
