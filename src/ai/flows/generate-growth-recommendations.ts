"use server";

import { genAI } from "@/lib/gemini";

export async function generateRecommendation(prompt: string) {
  const model = genAI.getGenerativeModel({
    model: "gemini-pro",
  });

  const result = await model.generateContent(prompt);
  return result.response.text();
}
