-- =============================================================
-- PIP.EXE — Supabase Database Migration
--
-- This file is applied via the Supabase CLI:
--   supabase db push     (or supabase db reset for a fresh start)
--
-- Tables:
--   - guestbook_entries  : persistent visitor messages (read-only to anon)
--   - visits             : idempotent visit records keyed by hashed session ID
--   - visitor_count      : maintained by AFTER INSERT trigger for fast reads
-- =============================================================

-- ── Guestbook entries ──
CREATE TABLE IF NOT EXISTS guestbook_entries (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nickname   TEXT NOT NULL,
    message    TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    status     TEXT NOT NULL DEFAULT 'published' CHECK (status IN ('published', 'hidden'))
);

-- Enforce length constraints
ALTER TABLE guestbook_entries DROP CONSTRAINT IF EXISTS guestbook_nickname_length;
ALTER TABLE guestbook_entries
    ADD CONSTRAINT guestbook_nickname_length
    CHECK (LENGTH(TRIM(nickname)) BETWEEN 1 AND 24);

ALTER TABLE guestbook_entries DROP CONSTRAINT IF EXISTS guestbook_message_length;
ALTER TABLE guestbook_entries
    ADD CONSTRAINT guestbook_message_length
    CHECK (LENGTH(TRIM(message)) BETWEEN 1 AND 180);

-- Index for sorting newest-first
CREATE INDEX IF NOT EXISTS idx_guestbook_created_at_desc ON guestbook_entries (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_guestbook_status ON guestbook_entries (status);

-- ── Visits (idempotent) ──
CREATE TABLE IF NOT EXISTS visits (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_hash  TEXT NOT NULL UNIQUE,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for fast deduplication lookups
CREATE INDEX IF NOT EXISTS idx_visits_session_hash ON visits (session_hash);
CREATE INDEX IF NOT EXISTS idx_visits_created_at ON visits (created_at DESC);

-- ── Visitor count (maintained by trigger) ──
CREATE TABLE IF NOT EXISTS visitor_count (
    id         TEXT PRIMARY KEY CHECK (id = 'total'),
    count      BIGINT NOT NULL DEFAULT 0,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO visitor_count (id, count) VALUES ('total', 0)
    ON CONFLICT (id) DO NOTHING;

-- Trigger: increment counter on each new visit (atomic, concurrency-safe)
CREATE OR REPLACE FUNCTION increment_visitor_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    UPDATE visitor_count SET count = count + 1, updated_at = now() WHERE id = 'total';
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_increment_visitor_count ON visits;
CREATE TRIGGER trg_increment_visitor_count
    AFTER INSERT ON visits
    FOR EACH ROW
    EXECUTE FUNCTION increment_visitor_count();

-- ── Row Level Security ──

-- Guestbook: anyone can read published entries
ALTER TABLE guestbook_entries ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can read published guestbook entries" ON guestbook_entries;
CREATE POLICY "Public can read published guestbook entries"
    ON guestbook_entries
    FOR SELECT
    USING (status = 'published');

-- No anonymous insert/update/delete on guestbook — only Edge Functions with service_role
-- RLS policies implicitly deny by default; explicit deny for clarity
DROP POLICY IF EXISTS "Deny anon insert on guestbook" ON guestbook_entries;
CREATE POLICY "Deny anon insert on guestbook"
    ON guestbook_entries
    FOR INSERT
    WITH CHECK (false);

DROP POLICY IF EXISTS "Deny anon update on guestbook" ON guestbook_entries;
CREATE POLICY "Deny anon update on guestbook"
    ON guestbook_entries
    FOR UPDATE
    USING (false);

DROP POLICY IF EXISTS "Deny anon delete on guestbook" ON guestbook_entries;
CREATE POLICY "Deny anon delete on guestbook"
    ON guestbook_entries
    FOR DELETE
    USING (false);

-- Visits: no anonymous access at all — only Edge Functions with service_role
ALTER TABLE visits ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Deny anon all on visits" ON visits;
CREATE POLICY "Deny anon all on visits"
    ON visits
    FOR ALL
    USING (false)
    WITH CHECK (false);

-- Visitor count: anyone can read
ALTER TABLE visitor_count ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can read visitor count" ON visitor_count;
CREATE POLICY "Public can read visitor count"
    ON visitor_count
    FOR SELECT
    USING (true);

-- Deny writes to anon
DROP POLICY IF EXISTS "Deny anon insert on visitor_count" ON visitor_count;
CREATE POLICY "Deny anon insert on visitor_count"
    ON visitor_count
    FOR INSERT
    WITH CHECK (false);

DROP POLICY IF EXISTS "Deny anon update on visitor_count" ON visitor_count;
CREATE POLICY "Deny anon update on visitor_count"
    ON visitor_count
    FOR UPDATE
    USING (false);

DROP POLICY IF EXISTS "Deny anon delete on visitor_count" ON visitor_count;
CREATE POLICY "Deny anon delete on visitor_count"
    ON visitor_count
    FOR DELETE
    USING (false);
