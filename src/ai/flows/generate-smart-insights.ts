"use server";

export async function generateSmartInsight(userQuestion: string) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY environment variable is not set.");
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-preview:generateContent`;

  const prompt = `You are Farmit Smart, an expert agricultural advisor for farmers in Zambia. A user has a question. Provide a clear, concise, and actionable answer based on agronomic best practices relevant to the region.

Format your response using markdown.

User Question: "${userQuestion}"

Your Answer:`;

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
            parts: [{ text: prompt }],
          },
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 1024,
        },
        safetySettings: [
          { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
          { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
          { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
          { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
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
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) {
      console.error("No text found in API response:", data);
      throw new Error("Failed to extract insight from API response.");
    }
    
    return text;
  } catch (error: any) {
    console.error("Error in generateSmartInsight flow:", error);
    throw error;
  }
}
