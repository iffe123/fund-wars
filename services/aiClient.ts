const ANTHROPIC_API_KEY = (typeof import.meta !== 'undefined' && import.meta.env)
  ? import.meta.env.VITE_ANTHROPIC_API_KEY
  : undefined;

const MODEL = 'claude-sonnet-4-20250514';

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
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error?.error?.message || `AI call failed: ${response.status}`);
  }

  const data = await response.json();
  return data.content?.[0]?.text || '';
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
