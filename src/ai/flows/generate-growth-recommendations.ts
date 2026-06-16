'use server';
/**
 * @fileOverview Growth Recommendations API Layer.
 * 
 * Flow: User Request → Auth Check → API Layer → AI Function → Response
 */

import { ensureAuthenticated } from '../auth-guard';
import { callOpenRouter } from '../openrouter-service';

/**
 * API Layer Entry Point
 */
export async function generateRecommendation(prompt: string): Promise<string> {
  // 1. Log Request Body (prompt)
  console.log('[API Layer] generateRecommendation - Prompt:', prompt);

  // 2. Auth Check
  const userId = await ensureAuthenticated();

  // 3. Log Auth details
  console.log('[API Layer] UserId existence:', !!userId);
  console.log('[API Layer] Auth token validity: Valid (Session verified)');

  // 4. Delegate to Pure AI Function
  return await performRecommendation(prompt);
}

/**
 * Pure AI Function (Stateless)
 */
async function performRecommendation(prompt: string): Promise<string> {
  return await callOpenRouter({
    model: 'google/gemma-4-31b-it:free',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.7,
  });
}
