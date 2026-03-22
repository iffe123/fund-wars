const ANTHROPIC_API_KEY = (typeof import.meta !== 'undefined' && import.meta.env)
  ? import.meta.env.VITE_ANTHROPIC_API_KEY
  : undefined;

const MODEL = 'claude-sonnet-4-20250514';
const AI_TIMEOUT_MS = 15000;

interface AIMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface AICallOptions {
  system: string;
  messages: AIMessage[];
  maxTokens?: number;
  temperature?: number;
}

export const isAIConfigured = (): boolean => !!ANTHROPIC_API_KEY;

export const callAI = async (options: AICallOptions): Promise<string> => {
  if (!ANTHROPIC_API_KEY) {
    throw new Error('AI not configured');
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), AI_TIMEOUT_MS);

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true',
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: options.maxTokens || 1024,
        temperature: options.temperature ?? 0.8,
        system: options.system,
        messages: options.messages,
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error?.error?.message || `AI call failed: ${response.status}`);
    }

    const data = await response.json();
    if (!data.content || !Array.isArray(data.content) || !data.content[0]?.text) {
      throw new Error('Unexpected AI response format');
    }
    return data.content[0].text;
  } catch (err: unknown) {
    if (err instanceof DOMException && err.name === 'AbortError') {
      throw new Error('AI request timed out. Please try again.');
    }
    throw err;
  } finally {
    clearTimeout(timeoutId);
  }
};

export const callAIWithConversation = async (
  system: string,
  history: AIMessage[],
  newMessage: string,
  maxTokens?: number,
): Promise<string> => {
  return callAI({
    system,
    messages: [...history, { role: 'user', content: newMessage }],
    maxTokens,
  });
};
