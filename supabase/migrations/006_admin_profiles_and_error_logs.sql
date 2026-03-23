-- ============================================================
-- Admin dashboard: منصات الاستخدام، حالة الاشتراك، سجل الأخطاء
-- ============================================================

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS used_web BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS used_android BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS used_ios BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS subscription_status TEXT NOT NULL DEFAULT 'active';

COMMENT ON COLUMN profiles.used_web IS 'Whether the user has used the web app';
COMMENT ON COLUMN profiles.used_android IS 'Whether the user has used the Android app';
COMMENT ON COLUMN profiles.used_ios IS 'Whether the user has used the iOS app';
COMMENT ON COLUMN profiles.subscription_status IS 'Subscription / account billing status for admin';

CREATE TABLE IF NOT EXISTS app_error_logs (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  message     TEXT NOT NULL,
  details     JSONB,
  user_id     UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_app_error_logs_created_at ON app_error_logs (created_at DESC);

ALTER TABLE app_error_logs ENABLE ROW LEVEL SECURITY;
