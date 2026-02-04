'use server';

import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/google-genai';

// The googleAI() plugin will automatically look for a GEMINI_API_KEY
// environment variable.
export const ai = genkit({
  plugins: [
    googleAI(),
  ],
  enableTracingAndMetrics: true,
});
