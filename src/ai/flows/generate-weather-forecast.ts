'use server';

import { WeatherForecastSchema, type WeatherForecast } from '@/ai/types';

export async function generateWeatherForecast(
  lat: number,
  lon: number
): Promise<WeatherForecast[]> {
  const apiKey = process.env.OPENROUTER_API_KEY || '';
  const prompt = `You are a weather service. Provide a 3-day forecast for (Lat: ${lat}, Lon: ${lon}).
    First day: "Today", second: "Tomorrow", third: "Next Day".
    Respond ONLY with a raw JSON array of objects.
    Format: [{"day": "Today", "description": "Sunny", "temp": "31°C", "condition": "sunny"}]
    Conditions: 'sunny', 'cloudy', 'rainy', 'partly-cloudy'.`;

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'http://localhost:3000',
        'X-Title': 'Farmit ZM Platform',
      },
      body: JSON.stringify({
        model: 'google/gemma-4-31b-it:free',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.2,
      }),
    });

    const data = await response.json();
    if (!response.ok || data.error) {
      throw new Error(data.error?.message || data.error || 'Failed to fetch from OpenRouter');
    }

    const text = data.choices?.[0]?.message?.content || '[]';
    const cleanJson = text.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleanJson) as WeatherForecast[];
  } catch (error) {
    console.error('Weather Forecast Error:', error);
    return [
      { day: 'Today', description: 'Unavailable', temp: '--°C', condition: 'cloudy' },
      { day: 'Tomorrow', description: 'Unavailable', temp: '--°C', condition: 'cloudy' },
      { day: 'Next Day', description: 'Unavailable', temp: '--°C', condition: 'cloudy' },
    ];
  }
}
