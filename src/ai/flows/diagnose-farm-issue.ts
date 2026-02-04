"use server";

import { Buffer } from "buffer";

// Combined function to handle diagnosis, now accepting FormData
export async function diagnoseFarmIssue(formData: FormData) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY environment variable is not set.");
  }

  const url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-preview:generateContent";

  // --- Extract data from FormData ---
  const question = formData.get('question') as string;
  const imageFile = formData.get('image') as File | null;

  if (!question) {
    throw new Error("The 'question' field is missing from the form data.");
  }
  
  // --- Construct Gemini prompt ---
  const prompt = `You are an expert veterinarian and botanist, acting as a "Farm Doctor". A farmer needs your help. Based on their question and the provided image, provide a diagnosis and actionable recommendations.

Format your response using clear, easy-to-read markdown. Use headings, lists, and bold text for key information like diagnosis, treatment steps, and preventative measures.

Farmer's Question: "${question}"

Your Analysis:`;

  const parts: any[] = [{ text: prompt }];

  // --- Process image if it exists ---
  if (imageFile) {
    const imageBuffer = await imageFile.arrayBuffer();
    const imageBase64 = Buffer.from(imageBuffer).toString('base64');
    parts.push({
      inline_data: {
        mime_type: imageFile.type,
        data: imageBase64,
      },
    });
  }

  // --- API Call with Timeout and Error Handling ---
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000); // 30-second timeout

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": apiKey,
      },
      body: JSON.stringify({
        contents: [{ role: "user", parts }],
        generationConfig: {
          temperature: 0.4,
          maxOutputTokens: 2048,
        },
        safetySettings: [
          { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
          { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
          { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
          { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
        ],
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      if (response.status === 413) {
        throw new Error('Request Entity Too Large: The image file is too big, even after compression. Please use a smaller file.');
      }
      const errorBody = await response.json();
      console.error("Gemini API error:", errorBody);
      throw new Error(
        `API error ${response.status}: ${errorBody.error?.message}`
      );
    }

    const data = await response.json();

    if (!data.candidates || data.candidates.length === 0) {
      const reason = data.promptFeedback?.blockReason;
      if (reason) {
        console.error(`Diagnosis blocked by safety filter. Reason: ${reason}`);
        return `The AI could not provide a diagnosis because the request was blocked for safety reasons (${reason}). Please try a different image or description.`;
      }
      console.error("Diagnosis Error: No candidates returned from API.", data);
      return "The AI did not return a response. This might be due to a content filter. Please try again with a different image or prompt.";
    }

    return (
      data.candidates[0]?.content?.parts?.[0]?.text ??
      "No response from Gemini"
    );
  } catch (error: any) {
    clearTimeout(timeoutId); // Clear timeout on any error
    if (error.name === 'AbortError') {
      throw new Error('The request timed out after 30 seconds. Please check your connection and try again.');
    }
    console.error("Diagnosis Flow Error:", error);
    // Re-throw the original error or a new one
    throw error;
  }
}
