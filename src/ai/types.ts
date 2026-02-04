import { z } from 'zod';

export const WeatherForecastSchema = z.object({
  day: z.string(),
  description: z.string(),
  temp: z.string(),
  condition: z.enum(['sunny', 'cloudy', 'rainy', 'partly-cloudy']),
});

export type WeatherForecast = z.infer<typeof WeatherForecastSchema>;
