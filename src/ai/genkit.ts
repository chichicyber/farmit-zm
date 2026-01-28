import { genkit, configureGenkit } from 'genkit';
import { googleAI } from '@genkit-ai/googleai';

configureGenkit({
  plugins: [googleAI()],
  logLevel: 'debug',
});

export const ai = genkit;
