const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export class RequestValidationError extends Error {
  status: number;

  constructor(message: string, status = 400) {
    super(message);
    this.name = 'RequestValidationError';
    this.status = status;
  }
}

export async function getRequiredUuidField(
  request: Request,
  fieldName: string,
  label = fieldName
): Promise<string> {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    throw new RequestValidationError('Invalid JSON request body');
  }

  if (!body || typeof body !== 'object') {
    throw new RequestValidationError('Request body must be a JSON object');
  }

  const value = (body as Record<string, unknown>)[fieldName];

  if (typeof value !== 'string' || !UUID_PATTERN.test(value)) {
    throw new RequestValidationError(`${label} must be a valid UUID`);
  }

  return value;
}