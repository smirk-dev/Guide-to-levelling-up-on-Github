import {
  RequestValidationError,
  getOptionalIdempotencyKey,
} from '../request-validation';

describe('getOptionalIdempotencyKey', () => {
  it('returns undefined when header is missing', () => {
    const headers = new Headers();

    expect(getOptionalIdempotencyKey(headers)).toBeUndefined();
  });

  it('returns value when key is valid', () => {
    const headers = new Headers({
      'Idempotency-Key': 'quest-claim:abc12345',
    });

    expect(getOptionalIdempotencyKey(headers)).toBe('quest-claim:abc12345');
  });

  it('throws request validation error when key is invalid', () => {
    const headers = new Headers({
      'Idempotency-Key': 'bad',
    });

    expect(() => getOptionalIdempotencyKey(headers)).toThrow(RequestValidationError);
  });
});
