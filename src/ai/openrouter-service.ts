
'use server';

/**
 * @fileOverview Pure, stateless OpenRouter service.
 * This function handles only the API communication. It does NOT handle authentication.
 */

export async function callOpenRouter(payload: {
  model: string;
  messages: any[];
  temperature?: number;
}): Promise<string> {
  const apiKey = process.env.OPENROUTER_API_KEY || '';
  if (!apiKey || apiKey.includes('YOUR_OPENROUTER_KEY')) {
    console.error('OPENROUTER_API_KEY is missing or invalid in environment variables.');
  }

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
        model: payload.model,
        messages: payload.messages,
        temperature: payload.temperature ?? 0.7,
      }),
    });

    const data = await response.json();
    if (!response.ok || data.error) {
      throw new Error(data.error?.message || data.error || 'Failed to fetch from OpenRouter');
    }

    return data.choices?.[0]?.message?.content || 'No response generated.';
  } catch (error: any) {
    console.error('OpenRouter Service Error:', error);
    throw new Error(`AI communication failed: ${error.message}`);
  }
}
