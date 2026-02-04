'use server';

export type WeatherForecast = {
  day: string;
  description: string;
  temp: string;
  condition: 'sunny' | 'cloudy' | 'rainy' | 'partly-cloudy';
};

export async function generateWeatherForecast(
  lat: number,
  lon: number
): Promise<WeatherForecast[]> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY environment variable is not set.');
  }

  const url =
    'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-preview:generateContent';

  const prompt = `You are a weather forecasting service. Based on the location (Latitude: ${lat}, Longitude: ${lon}), which is in Lusaka, Zambia, provide a realistic 3-day weather forecast.
  
  The first day should be "Today", the second "Tomorrow", and the third "Next Day".
  
  Include a short description (e.g., "Mostly Sunny"), temperature in Celsius (e.g., "32°C"), and a condition key from the following options: 'sunny', 'cloudy', 'rainy', 'partly-cloudy'.
  
  Respond with ONLY the raw JSON array of 3 forecast objects. Do not include markdown backticks like \`\`\`json or any other explanatory text.
  
  Example Response:
  [
    {"day": "Today", "description": "Mostly Sunny", "temp": "31°C", "condition": "sunny"},
    {"day": "Tomorrow", "description": "Partly Cloudy", "temp": "29°C", "condition": "partly-cloudy"},
    {"day": "Next Day", "description": "Chance of Showers", "temp": "27°C", "condition": "rainy"}
  ]
  `;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey,
      },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: {
          response_mime_type: 'application/json',
          temperature: 0.2,
        },
      }),
    });

    if (!response.ok) {
      const errorBody = await response.json();
      console.error('Gemini API error for weather:', errorBody);
      throw new Error(
        `API error ${response.status}: ${errorBody.error?.message}`
      );
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) {
      console.error('No text in weather response:', data);
      throw new Error('Failed to get weather forecast from AI.');
    }

    // The response should be a JSON string, so we parse it.
    return JSON.parse(text) as WeatherForecast[];
  } catch (error: any) {
    console.error('Weather Forecast Error:', error);
    // Return a default forecast on error to prevent UI crash
    return [
      {
        day: 'Today',
        description: 'Error loading',
        temp: '--°C',
        condition: 'cloudy',
      },
      {
        day: 'Tomorrow',
        description: 'Error loading',
        temp: '--°C',
        condition: 'cloudy',
      },
      {
        day: 'Next Day',
        description: 'Error loading',
        temp: '--°C',
        condition: 'cloudy',
      },
    ];
  }
}
