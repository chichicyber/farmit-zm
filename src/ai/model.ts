/**
 * AI Model Identifiers
 * 
 * We use the aliases defined in genkit.ts. Prefixing with 'openrouter/' 
 * ensures the request is handled by our custom-configured provider.
 */

// OpenRouter Aliases (Points to OpenRouter Free Tier)
export const VISION_MODEL = 'openrouter/vision-free';
export const DEEPSEEK_MODEL = 'openrouter/llama-free';
export const QWEN_MODEL = 'openrouter/qwen-free';

// Native Google AI Model (Used ONLY for native Audio/Transcription tasks)
import { googleAI } from '@genkit-ai/google-genai';
export const GEMINI_MODEL = googleAI.model('gemini-1.5-flash');
