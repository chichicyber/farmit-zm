"use server";

export async function generateRecommendation(prompt: string) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY environment variable is not set.");
  }

  // 1. Update to v1beta and the Gemini 3 Flash model string
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // 2. Use the x-goog-api-key header for Gemini 3 series
        "x-goog-api-key": apiKey,
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: prompt }],
          },
        ],
        // 3. Optional: Add Gemini 3 specific configuration
        generationConfig: {
          temperature: 1.0,
          // Gemini 3 Flash supports thinkingLevel: "minimal", "low", "medium", or "high"
          thinkingConfig: { thinkingLevel: "low" } 
        }
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
      throw new Error("Failed to extract recommendation from API response.");
    }
    
    return text;
  } catch (error: any) {
    console.error("Error in generateRecommendation flow:", error);
    throw error;
  }
}