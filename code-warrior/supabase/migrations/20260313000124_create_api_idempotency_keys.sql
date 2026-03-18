CREATE TABLE IF NOT EXISTS api_idempotency_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  github_id TEXT NOT NULL,
  action TEXT NOT NULL,
  idempotency_key VARCHAR(128) NOT NULL,
  status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'COMPLETED', 'FAILED')),
  response_status INTEGER,
  response_body JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '24 hours'),
  UNIQUE (github_id, action, idempotency_key)
);

CREATE INDEX IF NOT EXISTS idx_api_idempotency_keys_expires_at
  ON api_idempotency_keys(expires_at);

CREATE INDEX IF NOT EXISTS idx_api_idempotency_keys_lookup
  ON api_idempotency_keys(github_id, action, idempotency_key);

CREATE TRIGGER update_api_idempotency_keys_updated_at
  BEFORE UPDATE ON api_idempotency_keys
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE api_idempotency_keys ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE api_idempotency_keys FROM anon, authenticated;
GRANT ALL ON TABLE api_idempotency_keys TO service_role;
