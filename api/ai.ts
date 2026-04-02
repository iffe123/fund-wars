/**
 * Vercel Serverless Function — AI Proxy
 *
 * Proxies AI requests from the frontend to the Anthropic API.
 * The API key is read from process.env.ANTHROPIC_API_KEY (server-side only),
 * so it is never exposed in client-side JavaScript.
 *
 * Frontend calls POST /api/ai with the request body.
 * This function forwards it to the Anthropic Messages API and returns the response.
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';
const ANTHROPIC_VERSION = '2023-06-01';
const DEFAULT_MODEL = 'claude-sonnet-4-20250514';
const MAX_TOKENS_LIMIT = 4096;
const REQUEST_TIMEOUT_MS = 30000;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Check API key is configured
  if (!ANTHROPIC_API_KEY) {
    return res.status(503).json({
      error: 'AI service not configured',
      message: 'The ANTHROPIC_API_KEY environment variable is not set.',
    });
  }

  try {
    const { system, messages, maxTokens, temperature, model } = req.body;

    // Validate required fields
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'messages array is required' });
    }
    if (!system || typeof system !== 'string') {
      return res.status(400).json({ error: 'system prompt is required' });
    }

    // Sanitize parameters
    const safeMaxTokens = Math.min(Math.max(1, maxTokens || 1024), MAX_TOKENS_LIMIT);
    const safeTemperature = Math.min(Math.max(0, temperature ?? 0.8), 1);
    const safeModel = model || DEFAULT_MODEL;

    // Create abort controller for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    const response = await fetch(ANTHROPIC_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': ANTHROPIC_VERSION,
      },
      body: JSON.stringify({
        model: safeModel,
        max_tokens: safeMaxTokens,
        temperature: safeTemperature,
        system,
        messages,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({}));
      const status = response.status;

      // Map Anthropic errors to appropriate HTTP status codes
      if (status === 401) {
        return res.status(503).json({ error: 'AI service authentication failed' });
      }
      if (status === 429) {
        return res.status(429).json({ error: 'AI rate limit exceeded. Try again shortly.' });
      }

      return res.status(502).json({
        error: errorBody?.error?.message || `AI service returned ${status}`,
      });
    }

    const data = await response.json();

    // Return only the text content (don't expose internal API details)
    if (!data.content || !Array.isArray(data.content) || !data.content[0]?.text) {
      return res.status(502).json({ error: 'Unexpected response from AI service' });
    }

    return res.status(200).json({
      text: data.content[0].text,
      model: data.model,
      usage: data.usage,
    });
  } catch (err: unknown) {
    if (err instanceof Error && err.name === 'AbortError') {
      return res.status(504).json({ error: 'AI request timed out' });
    }
    console.error('AI proxy error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
