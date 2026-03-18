export function getRequestId(request: Request): string {
  const incoming = request.headers.get('x-request-id')?.trim();
  if (incoming) {
    return incoming;
  }

  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }

  return `req-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

export function logWithRequestContext(
  level: 'info' | 'warn' | 'error',
  message: string,
  context: Record<string, unknown>
) {
  const logger = level === 'info' ? console.info : level === 'warn' ? console.warn : console.error;
  logger(message, context);
}
