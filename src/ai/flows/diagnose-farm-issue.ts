"use server";

export async function diagnoseFarmIssue(prompt: string, imageDataUri: string | null) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY environment variable is not set.");
  }

  // Using gemini-1.5-flash which is multimodal. Using v1beta as it has better multimodal support.
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent`;

  const parts: any[] = [{ text: prompt }];

  if (imageDataUri) {
    // data URI format: 'data:<mimetype>;base64,<encoded_data>'
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
    } else {
        console.error("Invalid data URI format. Could not include image in prompt.");
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
        contents: [ { parts } ],
      }),
    });

    if (!response.ok) {
      const errorBody = await response.json();
      console.error("Google AI API Error:", errorBody);
      const errorMessage = errorBody.error?.message || 'Unknown API error';
      throw new Error(`API request failed with status ${response.status}: ${errorMessage}`);
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) {
      console.error("No text found in API response:", data);
      throw new Error("Failed to extract diagnosis from API response.");
    }
    
    return text;
  } catch (error: any) {
    console.error("Error in diagnoseFarmIssue flow:", error);
    throw error;
  }
}
