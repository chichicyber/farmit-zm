'use server';
/**
 * @fileOverview AI Diagnosis API Layer.
 * 
 * Flow: User Request → Auth Check → API Layer → AI Function → Response
 */

import { ensureAuthenticated } from '../auth-guard';
import { callOpenRouter } from '../openrouter-service';

/**
 * API Layer Entry Point
 * Handles Auth Check and Input Validation.
 */
export async function diagnoseFarmIssue(input: {
  question: string;
  image?: string;
  isVoice?: boolean;
}): Promise<string> {
  // 1. Log Request Body
  console.log('[API Layer] diagnoseFarmIssue - Request Body:', {
    ...input,
    image: input.image ? `[Base64 Image: ${input.image.substring(0, 30)}...]` : 'none',
  });

  // 2. Auth Check (Must happen before AI execution)
  const userId = await ensureAuthenticated();

  // 3. Log Auth details
  console.log('[API Layer] UserId existence:', !!userId);
  console.log('[API Layer] Auth token validity: Valid (Session verified)');

  // 4. Input Validation
  if (!input.question || input.question.trim().length < 10) {
    throw new Error('Invalid input: A detailed question is required.');
  }

  // 5. Delegate to Pure AI Function
  return await performDiagnosis(input);
}

/**
 * Pure AI Function (Stateless)
 * Handles ONLY the OpenRouter request and prompt construction.
 * DOES NOT handle auth, userId, or database calls.
 */
async function performDiagnosis(input: {
  question: string;
  image?: string;
  isVoice?: boolean;
}): Promise<string> {
  const { question, image, isVoice } = input;

  const textPrompt = `You are "Farm Doctor," an expert AI diagnostic agent specializing in tropical and sub-Saharan agriculture, smart farming, and livestock health. Your goal is to provide accurate, actionable, and culturally relevant diagnostics based on user-submitted symptoms, environmental conditions, or data.

Analyze the provided input and structure your response clearly using the following format:

### 1. Primary Diagnosis & Confidence Level
* State the most likely disease, pest infestation, or nutrient deficiency.
* Provide a confidence rating (e.g., High, Medium, Low) with a brief reason why.

### 2. Key Symptoms Identified
* Bullet points listing the identifying markers or anomalies found in the description or image.

### 3. Immediate Action Plan (Control Measures)
* **Organic/Cultural Practices:** Non-chemical steps the farmer can take immediately (e.g., pruning infected leaves, isolating livestock).
* **Chemical/Targeted Treatments:** If necessary, specify safe, locally accessible treatments or active ingredients, emphasizing correct dosages.

### 4. Long-Term Prevention & Monitoring
* Smart farming recommendations (e.g., crop rotation, biosecurity protocols) to prevent recurrence.

Farmer's Input: "${question}"`;

  const voicePrompt = `You are "Farm Doctor," an expert AI diagnostic agent speaking to a farmer. 
Keep it conversational, natural, and spoken. Speak directly to the farmer.
Farmer's Question: "${question}"`;

  const promptText = isVoice ? voicePrompt : textPrompt;
  const content: any[] = [{ type: 'text', text: promptText }];
  
  if (image) {
    content.push({
      type: 'image_url',
      image_url: { url: image },
    });
  }

  return await callOpenRouter({
    model: 'nvidia/nemotron-nano-12b-v2-vl:free',
    messages: [{ role: 'user', content }],
    temperature: 0.4,
  });
}
