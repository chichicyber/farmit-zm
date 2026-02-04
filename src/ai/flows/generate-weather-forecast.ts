'use server';

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { GEMINI_MODEL } from '../model';
import { WeatherForecastSchema, type WeatherForecast } from '@/ai/types';

const weatherFlow = ai.defineFlow(
  {
    name: 'weatherFlow',
    inputSchema: z.object({ lat: z.number(), lon: z.number() }),
    outputSchema: z.array(WeatherForecastSchema),
  },
  async ({ lat, lon }) => {
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

    /**
     * MODEL LOCK:
     * This function MUST use gemini-2.5-flash.
     * Downgrading or switching models is NOT allowed.
     */
    const llmResponse = await ai.generate({
      model: GEMINI_MODEL,
      prompt: prompt,
      config: {
        temperature: 0.2,
        responseMimeType: 'application/json',
      },
    });

    return llmResponse.output() as WeatherForecast[];
  }
);

export async function generateWeatherForecast(
  lat: number,
  lon: number
): Promise<WeatherForecast[]> {
  try {
    return await weatherFlow({ lat, lon });
  } catch (error) {
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
