"use server";

export async function diagnoseFarmIssue(prompt: string, imageDataUri: string | null) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY environment variable is not set.");
  }

  // 1. Updated Model: gemini-3-flash-preview
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent`;

  const parts: any[] = [{ text: prompt }];

  if (imageDataUri) {
    const match = imageDataUri.match(/^data:(image\/\w+);base64,(.+)$/);
    if (match) {
      const mimeType = match[1];
      const base64Data = match[2];
      parts.push({
        inline_data: {
          mime_type: mimeType,
          data: base64Data,
        }
      });
    }
  }

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": apiKey, // Use header for security
      },
      body: JSON.stringify({
        contents: [{ parts }],
        generationConfig: {
          // 2. Updated Media Resolution Format
          mediaResolution: { level: "MEDIA_RESOLUTION_HIGH" }, 
          // 3. New Gemini 3 "Thinking" parameter
          thinkingConfig: { thinkingLevel: "low" }
        }
      }),
    });

    if (!response.ok) {
      const errorBody = await response.json();
      throw new Error(`API error ${response.status}: ${errorBody.error?.message}`);
    }

    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text;
  } catch (error: any) {
    console.error("Diagnosis Error:", error);
    throw error;
  }
}