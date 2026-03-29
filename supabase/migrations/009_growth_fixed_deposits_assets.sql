-- ============================================================
-- Growth: ودائع ثابتة، أصول ثابتة
-- ============================================================

CREATE TABLE IF NOT EXISTS fixed_deposits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name_ar TEXT NOT NULL,
  name_en TEXT NOT NULL,
  amount NUMERIC(12, 2) NOT NULL CHECK (amount >= 0),
  roi_percentage NUMERIC(6, 2) NOT NULL CHECK (roi_percentage >= 0),
  due_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'closed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS fixed_assets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name_ar TEXT NOT NULL,
  name_en TEXT NOT NULL,
  estimated_value NUMERIC(12, 2) NOT NULL CHECK (estimated_value >= 0),
  asset_type TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_fixed_deposits_user ON fixed_deposits (user_id);
CREATE INDEX IF NOT EXISTS idx_fixed_deposits_user_status ON fixed_deposits (user_id, status);
CREATE INDEX IF NOT EXISTS idx_fixed_assets_user ON fixed_assets (user_id);

ALTER TABLE fixed_deposits ENABLE ROW LEVEL SECURITY;
ALTER TABLE fixed_assets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own fixed deposits" ON fixed_deposits FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own fixed assets" ON fixed_assets FOR ALL USING (auth.uid() = user_id);
