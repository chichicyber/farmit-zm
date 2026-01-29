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
    return (
      data.candidates?.[0]?.content?.parts?.[0]?.text ??
      "No response from Gemini"
    );
  } catch (error: any) {
    console.error("Diagnosis Error:", error);
    throw error;
  }
}
