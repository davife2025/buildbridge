import type { Response } from 'express';

/**
 * Sets up SSE headers on the Express response.
 * Must be called before any SSE writes.
 */
export function initSSE(res: Response): void {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no'); // disable Nginx buffering
  res.flushHeaders();
}

/**
 * Writes a named SSE event with a JSON payload.
 */
export function sendSSEEvent(res: Response, event: string, data: unknown): void {
  res.write(`event: ${event}\n`);
  res.write(`data: ${JSON.stringify(data)}\n\n`);
  // Force flush if available (compression middleware wraps write)
  if (typeof (res as unknown as { flush?: () => void }).flush === 'function') {
    (res as unknown as { flush: () => void }).flush();
  }
}

/**
 * Writes a raw text chunk for streaming AI output.
 */
export function sendSSEChunk(res: Response, chunk: string): void {
  res.write(`event: chunk\n`);
  res.write(`data: ${JSON.stringify({ chunk })}\n\n`);
  if (typeof (res as unknown as { flush?: () => void }).flush === 'function') {
    (res as unknown as { flush: () => void }).flush();
  }
}

/**
 * Sends a terminal error event and ends the stream.
 */
export function sendSSEError(res: Response, message: string): void {
  sendSSEEvent(res, 'error', { error: message });
  res.end();
}

/**
 * Sends a completion event and ends the stream.
 */
export function sendSSEDone(res: Response, payload?: unknown): void {
  sendSSEEvent(res, 'done', payload ?? { ok: true });
  res.end();
}
