-- ============================================================
-- Growth: Fixed deposits security refactor
-- Adds new business fields while keeping backward compatibility.
-- ============================================================

ALTER TABLE fixed_deposits
  ADD COLUMN IF NOT EXISTS name TEXT,
  ADD COLUMN IF NOT EXISTS security_type TEXT,
  ADD COLUMN IF NOT EXISTS duration_months INTEGER,
  ADD COLUMN IF NOT EXISTS interest_rate NUMERIC(6, 2),
  ADD COLUMN IF NOT EXISTS return_type TEXT,
  ADD COLUMN IF NOT EXISTS closing_amount NUMERIC(12, 2),
  ADD COLUMN IF NOT EXISTS closing_date DATE;

-- Backfill from old schema so existing records work immediately.
UPDATE fixed_deposits
SET
  name = COALESCE(NULLIF(name, ''), NULLIF(name_ar, ''), NULLIF(name_en, ''), 'Security'),
  security_type = COALESCE(security_type, 'bank_deposit'),
  duration_months = COALESCE(
    duration_months,
    GREATEST(
      1,
      (
        (EXTRACT(YEAR FROM age(COALESCE(due_date, start_date), start_date))::int * 12)
        + EXTRACT(MONTH FROM age(COALESCE(due_date, start_date), start_date))::int
      )
    )
  ),
  interest_rate = COALESCE(interest_rate, roi_percentage, 0),
  return_type = COALESCE(return_type, 'fixed')
WHERE
  name IS NULL
  OR security_type IS NULL
  OR duration_months IS NULL
  OR interest_rate IS NULL
  OR return_type IS NULL;

-- Defaults + basic data integrity checks for new fields.
ALTER TABLE fixed_deposits
  ALTER COLUMN name SET DEFAULT 'Security',
  ALTER COLUMN security_type SET DEFAULT 'bank_deposit',
  ALTER COLUMN duration_months SET DEFAULT 1,
  ALTER COLUMN interest_rate SET DEFAULT 0,
  ALTER COLUMN return_type SET DEFAULT 'fixed';

ALTER TABLE fixed_deposits
  ALTER COLUMN name SET NOT NULL,
  ALTER COLUMN security_type SET NOT NULL,
  ALTER COLUMN duration_months SET NOT NULL,
  ALTER COLUMN interest_rate SET NOT NULL,
  ALTER COLUMN return_type SET NOT NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'fixed_deposits_security_type_check'
  ) THEN
    ALTER TABLE fixed_deposits
      ADD CONSTRAINT fixed_deposits_security_type_check
      CHECK (security_type IN ('bank_deposit', 'bonds', 'sukuk'));
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'fixed_deposits_return_type_check'
  ) THEN
    ALTER TABLE fixed_deposits
      ADD CONSTRAINT fixed_deposits_return_type_check
      CHECK (return_type IN ('fixed', 'variable'));
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'fixed_deposits_duration_months_check'
  ) THEN
    ALTER TABLE fixed_deposits
      ADD CONSTRAINT fixed_deposits_duration_months_check
      CHECK (duration_months > 0);
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'fixed_deposits_interest_rate_check'
  ) THEN
    ALTER TABLE fixed_deposits
      ADD CONSTRAINT fixed_deposits_interest_rate_check
      CHECK (interest_rate >= 0);
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'fixed_deposits_closing_amount_check'
  ) THEN
    ALTER TABLE fixed_deposits
      ADD CONSTRAINT fixed_deposits_closing_amount_check
      CHECK (closing_amount IS NULL OR closing_amount >= 0);
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'fixed_deposits_closed_fields_check'
  ) THEN
    ALTER TABLE fixed_deposits
      ADD CONSTRAINT fixed_deposits_closed_fields_check
      CHECK (
        status <> 'closed'
        OR (closing_amount IS NOT NULL AND closing_date IS NOT NULL)
      );
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_fixed_deposits_user_status_created
  ON fixed_deposits (user_id, status, created_at DESC);
