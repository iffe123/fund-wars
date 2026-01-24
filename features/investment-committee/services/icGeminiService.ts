/**
 * IC Gemini Service
 *
 * Provides AI-powered responses for IC meetings using the Gemini API.
 * Includes retry logic and offline fallbacks.
 */

import { GoogleGenAI } from '@google/genai';

// ==================== CONFIGURATION ====================

const CONNECTION_CONFIG = {
  timeout: 30000,
  maxRetries: 3,
  retryDelays: [1000, 2000, 4000],
};

// Get API key from environment
// @ts-ignore
const API_KEY = (typeof import.meta !== 'undefined' && import.meta.env)
  ? import.meta.env.VITE_API_KEY
  : undefined;

// Lazy-initialized client
let _aiClient: GoogleGenAI | null = null;

const getAiClient = (): GoogleGenAI | null => {
  if (!API_KEY) return null;
  if (!_aiClient) {
    _aiClient = new GoogleGenAI({ apiKey: API_KEY });
  }
  return _aiClient;
};

/**
 * Check if Gemini API is configured
 */
export const isGeminiApiConfigured = (): boolean => {
  return !!API_KEY;
};

// ==================== RETRY WRAPPER ====================

const withRetry = async <T>(
  operation: () => Promise<T>,
  operationName: string
): Promise<T> => {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= CONNECTION_CONFIG.maxRetries; attempt++) {
    try {
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => {
          reject(new Error(`${operationName} timed out after ${CONNECTION_CONFIG.timeout}ms`));
        }, CONNECTION_CONFIG.timeout);
      });

      return await Promise.race([operation(), timeoutPromise]);
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      const errorMessage = lastError.message.toLowerCase();
      if (
        errorMessage.includes('invalid api key') ||
        errorMessage.includes('api key not valid') ||
        errorMessage.includes('permission denied') ||
        errorMessage.includes('referrer') ||
        errorMessage.includes('quota exceeded') ||
        errorMessage.includes('403')
      ) {
        throw lastError;
      }

      if (attempt < CONNECTION_CONFIG.maxRetries) {
        const delay = CONNECTION_CONFIG.retryDelays[attempt] || 4000;
        console.warn(
          `${operationName} failed (attempt ${attempt + 1}): ${lastError.message}. Retrying in ${delay}ms...`
        );
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError || new Error(`${operationName} failed after retries`);
};

// ==================== IC API METHODS ====================

interface ChatMessage {
  role: 'user' | 'model';
  parts: { text: string }[];
}

/**
 * Get IC partner response
 */
export const getICPartnerResponse = async (
  systemPrompt: string,
  userPrompt: string,
  history: ChatMessage[]
): Promise<string> => {
  const ai = getAiClient();
  if (!ai) {
    throw new Error('Gemini API not configured');
  }

  const chat = ai.chats.create({
    model: 'gemini-2.5-flash',
    config: {
      systemInstruction: systemPrompt,
    },
    history,
  });

  const response = await withRetry(
    () => chat.sendMessage({ message: userPrompt }),
    'IC Partner API call'
  );

  return response.text || 'I have no comment at this time.';
};

/**
 * Get IC evaluation
 */
export const getICEvaluation = async (evaluationPrompt: string): Promise<string> => {
  const ai = getAiClient();
  if (!ai) {
    throw new Error('Gemini API not configured');
  }

  const response = await withRetry(
    async () => {
      const r = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [{ role: 'user', parts: [{ text: evaluationPrompt }] }],
      } as any);
      return r;
    },
    'IC Evaluation API call'
  );

  return (response as any)?.text || '{}';
};

/**
 * Generate IC partner question with streaming
 */
export const streamICPartnerResponse = async (
  systemPrompt: string,
  userPrompt: string,
  history: ChatMessage[],
  onChunk: (chunk: string) => void
): Promise<string> => {
  const ai = getAiClient();
  if (!ai) {
    throw new Error('Gemini API not configured');
  }

  const chat = ai.chats.create({
    model: 'gemini-2.5-flash',
    config: {
      systemInstruction: systemPrompt,
    },
    history,
  });

  let fullResponse = '';

  try {
    const response = await chat.sendMessageStream({ message: userPrompt });

    for await (const chunk of response) {
      const text = chunk.text || '';
      fullResponse += text;
      onChunk(text);
    }
  } catch (error) {
    console.error('Streaming error:', error);
    // Fall back to non-streaming
    const response = await chat.sendMessage({ message: userPrompt });
    fullResponse = response.text || '';
    onChunk(fullResponse);
  }

  return fullResponse;
};

// ==================== ERROR HANDLING ====================

export const classifyICError = (error: Error): { type: string; message: string } => {
  const msg = error.message.toLowerCase();

  if (msg.includes('api key')) {
    return { type: 'auth', message: 'API authentication failed.' };
  }
  if (msg.includes('referrer') || msg.includes('403')) {
    return { type: 'referrer', message: 'API access blocked by referrer policy.' };
  }
  if (msg.includes('quota')) {
    return { type: 'quota', message: 'API quota exceeded. Wait and try again.' };
  }
  if (msg.includes('timeout')) {
    return { type: 'timeout', message: 'Request timed out.' };
  }
  if (msg.includes('network')) {
    return { type: 'network', message: 'Network error.' };
  }

  return { type: 'unknown', message: 'An unexpected error occurred.' };
};
