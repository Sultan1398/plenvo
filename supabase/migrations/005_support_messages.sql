-- ============================================================
-- Support messages (رسائل الدعم) — تخزين طلبات التواصل من المستخدمين
-- ============================================================

CREATE TABLE IF NOT EXISTS support_messages (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email       TEXT NOT NULL,
  message     TEXT NOT NULL CHECK (char_length(message) >= 1 AND char_length(message) <= 8000),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE support_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users insert own support messages"
  ON support_messages FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users view own support messages"
  ON support_messages FOR SELECT
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_support_messages_user_created
  ON support_messages (user_id, created_at DESC);
