import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';
import * as compatOai from '@genkit-ai/compat-oai';

/**
 * @fileOverview Genkit initialization and plugin configuration for OpenRouter.
 * 
 * This configuration uses ALIASES for models to prevent the native Google AI 
 * plugin from hijacking requests that contain 'google/...' in the name.
 */

// ============================================================================
// 1. OPENROUTER API KEY (REPLACE THE STRING BELOW)
// ============================================================================
const MY_OPENROUTER_KEY = process.env.OPENROUTER_API_KEY || ''; 

const getOpenAiPlugin = () => {
  const mod = compatOai as any;
  if (typeof mod.openai === 'function') return mod.openai;
  if (mod.default && typeof mod.default.openai === 'function') return mod.default.openai;
  if (mod.openai?.openai) return mod.openai.openai;
  if (typeof mod.default === 'function') return mod.default;
  if (typeof mod === 'function') return mod;
  return null;
};

const openaiPlugin = getOpenAiPlugin();

/**
 * OpenRouter Plugin Initialization
 * We use unique aliases (vision-free, text-free, etc.) to ensure Genkit routes 
 * requests correctly through this specific plugin instance.
 */
const openRouter = openaiPlugin ? openaiPlugin({
  name: 'openrouter',
  apiKey: MY_OPENROUTER_KEY,
  baseURL: 'https://openrouter.ai/api/v1',
  configuration: {
    // Explicit header binding to bypass sandbox stripping
    defaultHeaders: {
      'Authorization': `Bearer ${MY_OPENROUTER_KEY}`,
      'HTTP-Referer': 'http://localhost:3000',
      'X-Title': 'Farmit-ZM App',
    }
  },
  models: [
    {
      name: 'vision-free',
      id: 'nvidia/nemotron-nano-12b-v2-vl:free',
    },
    {
      name: 'llama-free',
      id: 'google/gemma-4-31b-it:free',
    },
    {
      name: 'qwen-free',
      id: 'liquid/lfm-2.5-1.2b-instruct:free',
    },
  ],
}) : null;

/**
 * Primary Genkit Instance (OpenRouter)
 */
export const ai = genkit({
  plugins: openRouter ? [openRouter] : [],
});

/**
 * Native Google AI Instance (Audio/TTS/Transcription ONLY)
 * Kept strictly separate.
 */
export const googleAi = genkit({
  plugins: [googleAI({ apiKey: process.env.GOOGLE_GENAI_API_KEY })],
});
