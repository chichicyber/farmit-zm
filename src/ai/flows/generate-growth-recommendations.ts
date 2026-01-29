"use server";

export async function generateRecommendation(prompt: string) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY environment variable is not set.");
  }

  // Explicitly use the v1 endpoint with the gemini-pro model
  const url = `https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${apiKey}`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: prompt }],
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorBody = await response.json();
      console.error("Google AI API Error:", errorBody);
      const errorMessage = errorBody.error?.message || 'Unknown API error';
      throw new Error(`API request failed with status ${response.status}: ${errorMessage}`);
    }

    const data = await response.json();
    // Safely access the response text
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) {
      console.error("No text found in API response:", data);
      throw new Error("Failed to extract recommendation from API response.");
    }
    
    return text;
  } catch (error: any) {
    console.error("Error in generateRecommendation flow:", error);
    // Re-throw the original error to be caught by the UI's error handler
    throw error;
  }
}
