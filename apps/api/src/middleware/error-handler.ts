import type { ErrorRequestHandler } from 'express';
import { ZodError } from 'zod';

export interface AppError extends Error {
  statusCode?: number;
  code?: string;
}

export const errorHandler: ErrorRequestHandler = (err: AppError, _req, res, _next) => {
  // Zod validation errors → 400
  if (err instanceof ZodError) {
    res.status(400).json({
      error: 'Validation error',
      issues: err.flatten().fieldErrors,
    });
    return;
  }

  const statusCode = err.statusCode ?? 500;
  const message =
    process.env['NODE_ENV'] === 'production' && statusCode === 500
      ? 'Internal server error'
      : err.message;

  if (statusCode === 500) {
    console.error('[Error]', err);
  }

  res.status(statusCode).json({
    error: message,
    ...(process.env['NODE_ENV'] !== 'production' && { stack: err.stack }),
  });
};

/** Helper to create typed API errors */
export function createError(message: string, statusCode = 500): AppError {
  const err = new Error(message) as AppError;
  err.statusCode = statusCode;
  return err;
}
