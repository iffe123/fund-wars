/**
 * IC AI Service
 *
 * Provides AI-powered responses for IC meetings using the Claude API.
 * Includes retry logic and offline fallbacks.
 */

import { callAI, callAIWithConversation, isAIConfigured } from '../../../services/aiClient';

// ==================== CONFIGURATION ====================

const CONNECTION_CONFIG = {
  timeout: 30000,
  maxRetries: 3,
  retryDelays: [1000, 2000, 4000],
};

/**
 * Check if AI API is configured
 */
export const isGeminiApiConfigured = (): boolean => {
  return isAIConfigured();
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
        errorMessage.includes('invalid x-api-key') ||
        errorMessage.includes('authentication_error') ||
        errorMessage.includes('permission denied') ||
        errorMessage.includes('rate_limit') ||
        errorMessage.includes('quota exceeded') ||
        errorMessage.includes('403') ||
        errorMessage.includes('401')
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
  if (!isAIConfigured()) {
    throw new Error('AI API not configured');
  }

  // Convert Gemini-style history to Claude format
  const messages = history.map(msg => ({
    role: (msg.role === 'user' ? 'user' : 'assistant') as 'user' | 'assistant',
    content: msg.parts.map(p => p.text).join('\n'),
  }));

  const text = await withRetry(
    () => callAIWithConversation(systemPrompt, messages, userPrompt, 512),
    'IC Partner API call'
  );

  return text || 'I have no comment at this time.';
};

/**
 * Get IC evaluation
 */
export const getICEvaluation = async (evaluationPrompt: string): Promise<string> => {
  if (!isAIConfigured()) {
    throw new Error('AI API not configured');
  }

  const text = await withRetry(
    () => callAI({
      system: 'You are an IC evaluation engine for a private equity RPG. Output valid JSON only.',
      messages: [{ role: 'user', content: evaluationPrompt }],
      maxTokens: 1024,
      temperature: 0.3,
    }),
    'IC Evaluation API call'
  );

  return text || '{}';
};

/**
 * Generate IC partner response (non-streaming replacement for streaming)
 */
export const streamICPartnerResponse = async (
  systemPrompt: string,
  userPrompt: string,
  history: ChatMessage[],
  onChunk: (chunk: string) => void
): Promise<string> => {
  if (!isAIConfigured()) {
    throw new Error('AI API not configured');
  }

  // Convert Gemini-style history to Claude format
  const messages = history.map(msg => ({
    role: (msg.role === 'user' ? 'user' : 'assistant') as 'user' | 'assistant',
    content: msg.parts.map(p => p.text).join('\n'),
  }));

  try {
    const text = await callAIWithConversation(systemPrompt, messages, userPrompt, 512);
    // Simulate streaming by sending the full response as a single chunk
    onChunk(text);
    return text;
  } catch (error) {
    console.error('AI response error:', error);
    const fallback = 'I have no comment at this time.';
    onChunk(fallback);
    return fallback;
  }
};

// ==================== ERROR HANDLING ====================

export const classifyICError = (error: Error): { type: string; message: string } => {
  const msg = error.message.toLowerCase();

  if (msg.includes('api key') || msg.includes('authentication_error')) {
    return { type: 'auth', message: 'API authentication failed.' };
  }
  if (msg.includes('403') || msg.includes('401')) {
    return { type: 'permission', message: 'API access denied.' };
  }
  if (msg.includes('rate_limit') || msg.includes('quota') || msg.includes('overloaded')) {
    return { type: 'quota', message: 'API rate limit reached. Wait and try again.' };
  }
  if (msg.includes('timeout')) {
    return { type: 'timeout', message: 'Request timed out.' };
  }
  if (msg.includes('network')) {
    return { type: 'network', message: 'Network error.' };
  }

  return { type: 'unknown', message: 'An unexpected error occurred.' };
};
