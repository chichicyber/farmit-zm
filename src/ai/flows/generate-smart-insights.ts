'use server';

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { GEMINI_MODEL } from '../model';

const smartInsightInputSchema = z.object({
  userQuestion: z.string(),
  isVoice: z.boolean().optional(),
});

const smartInsightFlow = ai.defineFlow(
  {
    name: 'smartInsightFlow',
    inputSchema: smartInsightInputSchema,
    outputSchema: z.string(),
  },
  async ({ userQuestion, isVoice }) => {
    const textPrompt = `You are Farmit Smart, an expert agricultural advisor for farmers in Zambia. A user has a question. Provide a clear, concise, and actionable answer based on agronomic best practices relevant to the region.

    Format your response using markdown.

    User Question: "${userQuestion}"

    Your Answer:`;

    const voicePrompt = `You are Farmit Smart, an expert agricultural advisor for farmers in Zambia. A farmer is asking for your help via voice. Your response will be read aloud, so it must be conversational, reassuring, and easy to follow.

    IMPORTANT: Structure your response exactly like this, speaking directly to the farmer:
    1.  **Reassurance:** Start with a calm and reassuring tone. For example: "That's a very good question. Let's break it down."
    2.  **The Main Point:** Give the most important part of the answer first, clearly and simply. For example: "The short answer is yes, you should..." or "The main thing to remember is..."
    3.  **The 'Why':** Briefly explain the reason behind your advice in simple terms. For example: "This is because..." or "The reason this is important is..."
    4.  **Actionable Step:** Give one or two clear, actionable steps. For example: "So, what you can do right now is..." or "A good first step would be to..."
    5.  **Encouragement:** End with a positive and encouraging note. For example: "Keep up the great work on your farm!" or "You're on the right track."

    Do not use markdown, headings, or lists. Just provide a natural, spoken response following these 5 points.

    User's Question: "${userQuestion}"

    Your Spoken Answer:`;

    const prompt = isVoice ? voicePrompt : textPrompt;

    /**
     * MODEL LOCK:
     * This function MUST use gemini-2.5-flash.
     * Downgrading or switching models is NOT allowed.
     */
    const llmResponse = await ai.generate({
      model: GEMINI_MODEL,
      prompt: prompt,
      config: {
        temperature: 0.7,
        maxOutputTokens: 1024,
        safetySettings: [
          { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
          { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
          { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
          { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
        ],
      },
    });

    return llmResponse.text;
  }
);

export async function generateSmartInsight(input: {
  userQuestion: string;
  isVoice?: boolean;
}): Promise<string> {
  return await smartInsightFlow(input);
}
