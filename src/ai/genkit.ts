import { genkit, configureGenkit, defineFlow, run, definePrompt } from 'genkit';
import { googleAI, geminiPro } from '@genkit-ai/googleai';
import { z } from 'zod';

configureGenkit({
  plugins: [googleAI()],
  logLevel: 'debug',
});

export const ai = genkit;
export { defineFlow, run, definePrompt, geminiPro, z };
