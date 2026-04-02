/**
 * AI Client — Frontend interface for AI calls
 *
 * All requests go through /api/ai (Vercel serverless function)
 * which holds the API key server-side. No secrets in client JS.
 */

const AI_ENDPOINT = '/api/ai';
const AI_TIMEOUT_MS = 20000;

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

/**
 * Check if the AI proxy is available.
 * On first call, pings the endpoint. Caches the result.
 */
let _aiConfigured: boolean | null = null;

export const isAIConfigured = (): boolean => {
  // In production with the proxy route, AI is always available.
  // The proxy returns 503 if ANTHROPIC_API_KEY isn't set server-side.
  // We optimistically assume it's configured; errors are handled per-call.
  if (_aiConfigured !== null) return _aiConfigured;

  // Default to true — the proxy exists, whether the key is set is a runtime check.
  // If the first call fails with 503, we'll set this to false.
  _aiConfigured = true;
  return true;
};

export const callAI = async (options: AICallOptions): Promise<string> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), AI_TIMEOUT_MS);

  try {
    const response = await fetch(AI_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system: options.system,
        messages: options.messages,
        maxTokens: options.maxTokens || 1024,
        temperature: options.temperature ?? 0.8,
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));

      // If the server says AI isn't configured, cache that
      if (response.status === 503) {
        _aiConfigured = false;
        throw new Error('AI not configured');
      }

      throw new Error(error?.error || `AI call failed: ${response.status}`);
    }

    const data = await response.json();
    if (!data.text) {
      throw new Error('Unexpected AI response format');
    }
    return data.text;
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
