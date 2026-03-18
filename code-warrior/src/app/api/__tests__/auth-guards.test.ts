import { beforeEach, describe, expect, it, vi } from 'vitest';

process.env.GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID || 'test-github-client-id';
process.env.GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET || 'test-github-client-secret';
process.env.NEXTAUTH_SECRET = process.env.NEXTAUTH_SECRET || 'test-nextauth-secret';

const mockGetServerSession = vi.fn();
const mockGetServiceSupabase = vi.fn();

vi.mock('next-auth', () => ({
  default: vi.fn(() => vi.fn()),
  getServerSession: mockGetServerSession,
}));

vi.mock('@/lib/supabase', () => ({
  getServiceSupabase: mockGetServiceSupabase,
}));

function createJsonRequest(url: string, body: string, extraHeaders?: Record<string, string>) {
  return new Request(url, {
    method: 'POST',
    headers: { 'content-type': 'application/json', ...(extraHeaders || {}) },
    body,
  });
}

function createGetRequest(url: string) {
  return new Request(url, {
    method: 'GET',
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  mockGetServiceSupabase.mockImplementation(() => {
    throw new Error('Supabase mock intentionally throws for baseline path tests');
  });
});

describe('API auth guards', () => {
  it('returns 401 for unauthorized POST /api/sync with normalized shape', async () => {
    const { POST } = await import('../sync/route');
    mockGetServerSession.mockResolvedValue(null);

    const response = await POST(createJsonRequest('http://localhost/api/sync', '{}'));
    const body = await response.json();

    expect(response.status).toBe(401);
    expect(body.success).toBe(false);
    expect(body.code).toBe('UNAUTHORIZED');
    expect(body.error).toBe('Unauthorized');
    expect(body.message).toBe('Unauthorized');
  });

  it('reaches business path for authorized POST /api/sync', async () => {
    const { POST } = await import('../sync/route');
    mockGetServerSession.mockResolvedValue({ user: {} });

    const response = await POST(createJsonRequest('http://localhost/api/sync', '{}'));

    expect(response.status).toBe(500);
    expect(response.status).not.toBe(401);
  });

  it('returns 401 for unauthorized GET /api/sync with normalized shape', async () => {
    const { GET } = await import('../sync/route');
    mockGetServerSession.mockResolvedValue(null);

    const response = await GET(createGetRequest('http://localhost/api/sync'));
    const body = await response.json();

    expect(response.status).toBe(401);
    expect(body.success).toBe(false);
    expect(body.code).toBe('UNAUTHORIZED');
  });

  it('reaches business path for authorized GET /api/sync', async () => {
    const { GET } = await import('../sync/route');
    mockGetServerSession.mockResolvedValue({ user: {} });

    const response = await GET(createGetRequest('http://localhost/api/sync'));

    expect(response.status).toBe(500);
    expect(response.status).not.toBe(401);
  });

  it('returns 401 for unauthorized GET /api/quests', async () => {
    const { GET } = await import('../quests/route');
    mockGetServerSession.mockResolvedValue(null);

    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(401);
    expect(body.code).toBe('UNAUTHORIZED');
  });

  it('reaches business path for authorized GET /api/quests', async () => {
    const { GET } = await import('../quests/route');
    mockGetServerSession.mockResolvedValue({ user: { id: 'github-123' } });

    const response = await GET();

    expect(response.status).toBe(500);
    expect(response.status).not.toBe(401);
  });

  it('returns 401 for unauthorized POST /api/quests', async () => {
    const { POST } = await import('../quests/route');
    mockGetServerSession.mockResolvedValue(null);

    const response = await POST();
    const body = await response.json();

    expect(response.status).toBe(401);
    expect(body.code).toBe('UNAUTHORIZED');
  });

  it('reaches business path for authorized POST /api/quests', async () => {
    const { POST } = await import('../quests/route');
    mockGetServerSession.mockResolvedValue({ user: { id: 'github-123' } });

    const response = await POST();

    expect(response.status).toBe(500);
    expect(response.status).not.toBe(401);
  });

  it('returns 401 for unauthorized POST /api/quests/claim', async () => {
    const { POST } = await import('../quests/claim/route');
    mockGetServerSession.mockResolvedValue(null);

    const response = await POST(createJsonRequest('http://localhost/api/quests/claim', '{}'));
    const body = await response.json();

    expect(response.status).toBe(401);
    expect(body.code).toBe('UNAUTHORIZED');
  });

  it('returns normalized bad request for authorized POST /api/quests/claim invalid payload', async () => {
    const { POST } = await import('../quests/claim/route');
    mockGetServerSession.mockResolvedValue({ user: { id: 'github-123' } });

    const response = await POST(createJsonRequest('http://localhost/api/quests/claim', '{}'));
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(response.status).not.toBe(401);
    expect(body.success).toBe(false);
    expect(body.code).toBe('BAD_REQUEST');
    expect(body.error).toBe('Quest ID must be a valid UUID');
  });

  it('returns normalized bad request for invalid idempotency key header', async () => {
    const { POST } = await import('../quests/claim/route');
    mockGetServerSession.mockResolvedValue({ user: { id: 'github-123' } });

    const response = await POST(
      createJsonRequest(
        'http://localhost/api/quests/claim',
        '{"questId":"123e4567-e89b-12d3-a456-426614174000"}',
        { 'Idempotency-Key': 'bad' }
      )
    );
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.success).toBe(false);
    expect(body.code).toBe('BAD_REQUEST');
    expect(body.error).toContain('Idempotency-Key header');
  });

  it('returns 401 for unauthorized POST /api/badges/equip', async () => {
    const { POST } = await import('../badges/equip/route');
    mockGetServerSession.mockResolvedValue(null);

    const response = await POST(createJsonRequest('http://localhost/api/badges/equip', '{}'));
    const body = await response.json();

    expect(response.status).toBe(401);
    expect(body.code).toBe('UNAUTHORIZED');
  });

  it('returns normalized bad request for authorized POST /api/badges/equip invalid payload', async () => {
    const { POST } = await import('../badges/equip/route');
    mockGetServerSession.mockResolvedValue({ user: { id: 'github-123' } });

    const response = await POST(createJsonRequest('http://localhost/api/badges/equip', '{}'));
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(response.status).not.toBe(401);
    expect(body.code).toBe('BAD_REQUEST');
    expect(body.error).toBe('Badge ID must be a valid UUID');
  });

  it('returns 401 for unauthorized POST /api/badges/unequip', async () => {
    const { POST } = await import('../badges/unequip/route');
    mockGetServerSession.mockResolvedValue(null);

    const response = await POST(createJsonRequest('http://localhost/api/badges/unequip', '{}'));
    const body = await response.json();

    expect(response.status).toBe(401);
    expect(body.code).toBe('UNAUTHORIZED');
  });

  it('returns normalized bad request for authorized POST /api/badges/unequip invalid payload', async () => {
    const { POST } = await import('../badges/unequip/route');
    mockGetServerSession.mockResolvedValue({ user: { id: 'github-123' } });

    const response = await POST(createJsonRequest('http://localhost/api/badges/unequip', '{}'));
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(response.status).not.toBe(401);
    expect(body.code).toBe('BAD_REQUEST');
    expect(body.error).toBe('Badge ID must be a valid UUID');
  });
});
