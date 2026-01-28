'use server';

import { genAI } from '@/lib/gemini';

/**
 * @fileOverview Generates AI-powered recommendations on crop management.
 *
 * - generateGrowthRecommendations - a function that generates growth recommendations from a prompt.
 */

const model = genAI.getGenerativeModel({
  model: 'gemini-1.5-flash-001',
});

export async function generateGrowthRecommendations(prompt: string): Promise<string> {
    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text();
    } catch (error: any) {
        console.error("AI recommendation generation failed:", error);
        // Re-throw a more user-friendly error to be displayed in the UI.
        throw new Error(`AI service failed: ${error.message}`);
    }
}
