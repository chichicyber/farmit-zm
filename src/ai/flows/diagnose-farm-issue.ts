"use server";

export async function diagnoseFarmIssue(
  prompt: string,
  imageDataUri: string | null
) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY environment variable is not set.");
  }

  // ✅ Stable Gemini 2.5 Flash model
  const url =
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";

  const parts: any[] = [{ text: prompt }];

  if (imageDataUri) {
    const match = imageDataUri.match(/^data:(image\/\w+);base64,(.+)$/);
    if (match) {
      parts.push({
        inline_data: {
          mime_type: match[1],
          data: match[2],
        },
      });
    }
  }

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": apiKey,
      },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts,
          },
        ],
        generationConfig: {
          temperature: 0.4,
          maxOutputTokens: 2048,
        },
        safetySettings: [
          {
            category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
            threshold: 'BLOCK_NONE',
          },
          {
            category: 'HARM_CATEGORY_HATE_SPEECH',
            threshold: 'BLOCK_NONE',
          },
          {
            category: 'HARM_CATEGORY_HARASSMENT',
            threshold: 'BLOCK_NONE',
          },
          {
            category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
            threshold: 'BLOCK_NONE',
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorBody = await response.json();
      console.error("Gemini API error:", errorBody);
      throw new Error(
        `API error ${response.status}: ${errorBody.error?.message}`
      );
    }

    const data = await response.json();

    // Check if the response was blocked by safety filters
    if (!data.candidates || data.candidates.length === 0) {
      if (data.promptFeedback?.blockReason) {
        const reason = data.promptFeedback.blockReason;
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
    console.error("Diagnosis Error:", error);
    throw error;
  }
}
