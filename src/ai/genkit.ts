import { genkit, type Genkit } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';

let aiInstance: Genkit | undefined;
let initError: Error | null = null;

try {
  // This can throw an error if the API key is not configured.
  aiInstance = genkit({
    plugins: [googleAI()],
  });
} catch (e: any) {
  console.error("Genkit initialization failed. This is likely due to a missing GEMINI_API_KEY environment variable.", e.message);
  initError = new Error("AI service failed to initialize. A likely cause is a missing API key. Please check the server logs for more details.");
}

// We export a proxy object. If initialization failed, any attempt to use the 'ai' object
// will throw a descriptive error that will be caught by the server action handler.
export const ai = new Proxy({} as Genkit, {
  get(target, prop, receiver) {
    if (initError) {
      throw initError;
    }
    if (aiInstance) {
      return Reflect.get(aiInstance, prop, receiver);
    }
    // This case should ideally not be hit if initError is handled correctly.
    throw new Error('AI service is not initialized, and no initialization error was caught.');
  }
});
