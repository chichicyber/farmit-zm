
'use server';

/**
 * @fileOverview Pure, stateless OpenRouter service.
 * This function handles only the API communication. It does NOT handle authentication.
 */

const OPENROUTER_KEY = process.env.OPENROUTER_API_KEY || '';

export async function callOpenRouter(payload: {
  model: string;
  messages: any[];
  temperature?: number;
}): Promise<string> {
  if (!process.env.OPENROUTER_API_KEY || process.env.OPENROUTER_API_KEY.includes('YOUR_OPENROUTER_KEY')) {
    console.error('OPENROUTER_API_KEY is missing or invalid in environment variables.');
  }

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'http://localhost:3000',
        'X-Title': 'Farmit ZM Platform',
      },
      body: JSON.stringify({
        model: payload.model,
        messages: payload.messages,
        temperature: payload.temperature ?? 0.7,
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error?.message || 'Failed to fetch from OpenRouter');
    }

    return data.choices?.[0]?.message?.content || 'No response generated.';
  } catch (error: any) {
    console.error('OpenRouter Service Error:', error);
    throw new Error(`AI communication failed: ${error.message}`);
  }
}
