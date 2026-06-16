'use server';
/**
 * @fileOverview Farmit Smart API Layer.
 * 
 * Flow: User Request → Auth Check → API Layer → AI Function → Response
 */

import { ensureAuthenticated } from '../auth-guard';
import { callOpenRouter } from '../openrouter-service';

/**
 * API Layer Entry Point
 */
export async function generateSmartInsight(input: {
  userQuestion: string;
  isVoice?: boolean;
}): Promise<string> {
  // 1. Log Request Body
  console.log('[API Layer] generateSmartInsight - Request Body:', input);

  // 2. Auth Check
  const userId = await ensureAuthenticated();

  // 3. Log Auth details
  console.log('[API Layer] UserId existence:', !!userId);
  console.log('[API Layer] Auth token validity: Valid (Session verified)');

  // 4. Delegate to Pure AI Function
  return await performSmartInsight(input);
}

/**
 * Pure AI Function (Stateless)
 */
async function performSmartInsight(input: {
  userQuestion: string;
  isVoice?: boolean;
}): Promise<string> {
  const { userQuestion, isVoice } = input;

  const textPrompt = `You are Farmit Smart, an expert agricultural advisor for farmers in Zambia. 
    Answer this question with clear, concise, and actionable advice.
    User Question: "${userQuestion}"`;

  const voicePrompt = `You are Farmit Smart, speaking to a farmer in Zambia. 
    Be conversational, reassuring, and provide one or two clear actionable steps.
    User Question: "${userQuestion}"`;

  const promptText = isVoice ? voicePrompt : textPrompt;

  return await callOpenRouter({
    model: 'google/gemma-4-31b-it:free',
    messages: [{ role: 'user', content: promptText }],
    temperature: 0.7,
  });
}
