'use server';

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { GEMINI_MODEL } from '../model';

const transcribeAudioFlow = ai.defineFlow(
  {
    name: 'transcribeAudioFlow',
    inputSchema: z.string(), // audio data URI
    outputSchema: z.string(),
  },
  async (audioDataUri) => {
    const prompt = `Transcribe the following audio recording. The user is asking a question about farming in Zambia, likely in English or a local Zambian language. Respond only with the transcribed text. Do not add any extra phrases like "Here is the transcription:". Just provide the raw text.`;

    const llmResponse = await ai.generate({
      model: GEMINI_MODEL,
      prompt: [
        { text: prompt },
        { media: { url: audioDataUri } },
      ],
      config: {
        temperature: 0.1, // Low temperature for more deterministic transcription
      },
    });

    return llmResponse.text;
  }
);

export async function transcribeAudio(audioDataUri: string): Promise<string> {
  return await transcribeAudioFlow(audioDataUri);
}
