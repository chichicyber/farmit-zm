'use server';

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { GEMINI_MODEL } from '../model';

const transcribeAudioInputSchema = z.object({
  audioDataUri: z.string().describe('The audio data to transcribe, as a data URI.'),
  languageName: z.string().describe('The name of the language being spoken (e.g., "Bemba", "English").'),
});

const transcribeAudioFlow = ai.defineFlow(
  {
    name: 'transcribeAudioFlow',
    inputSchema: transcribeAudioInputSchema,
    outputSchema: z.string(),
  },
  async ({ audioDataUri, languageName }) => {
    const prompt = `Transcribe the following audio recording. The user is asking a question about farming in Zambia. The user is speaking ${languageName}. Respond only with the transcribed text. Do not add any extra phrases like "Here is the transcription:". Just provide the raw text.`;

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

export async function transcribeAudio(input: { audioDataUri: string; languageName: string; }): Promise<string> {
  return await transcribeAudioFlow(input);
}
