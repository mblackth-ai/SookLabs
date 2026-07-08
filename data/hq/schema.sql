-- HQ ops persistence (DigitalOcean Managed Postgres / any Postgres)
-- Applied automatically by lib/hq/ops-pg.js on first use; keep for manual ops.

CREATE TABLE IF NOT EXISTS hq_ops (
  id TEXT PRIMARY KEY,
  data JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Seed is created in-app from DEFAULT_OPS when the row is missing.
