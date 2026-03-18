import { NextResponse } from 'next/server';
import type { ApiErrorCode, ApiErrorResponse } from '@/types/api';

interface ErrorResponseOptions {
  status: number;
  code: ApiErrorCode;
  message: string;
  details?: string;
  retryable?: boolean;
  retryAfter?: number;
  headers?: Record<string, string>;
}

export function errorResponse({
  status,
  code,
  message,
  details,
  retryable,
  retryAfter,
  headers,
}: ErrorResponseOptions) {
  const payload: ApiErrorResponse = {
    success: false,
    error: message,
    message,
    code,
    ...(details ? { details } : {}),
    ...(typeof retryable === 'boolean' ? { retryable } : {}),
    ...(typeof retryAfter === 'number' ? { retryAfter } : {}),
  };

  return NextResponse.json(payload, {
    status,
    headers: {
      ...(headers || {}),
      ...(typeof retryAfter === 'number'
        ? {
            'Retry-After': String(retryAfter),
          }
        : {}),
    },
  });
}

export function internalServerError(message = 'Internal server error') {
  return errorResponse({
    status: 500,
    code: 'INTERNAL_ERROR',
    message,
    retryable: true,
  });
}
