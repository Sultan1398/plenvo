-- ==========================================================
-- Subscription trial support (14 days)
-- ==========================================================

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS trial_ends_at TIMESTAMPTZ;

ALTER TABLE public.profiles
  ALTER COLUMN trial_ends_at SET DEFAULT (NOW() + INTERVAL '14 days');

-- Ensure subscription_status exists and defaults to trialing for new users.
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS subscription_status TEXT;

ALTER TABLE public.profiles
  ALTER COLUMN subscription_status SET DEFAULT 'trialing';

-- Drop old constraint if it exists
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'profiles_subscription_status_check'
      AND conrelid = 'public.profiles'::regclass
  ) THEN
    ALTER TABLE public.profiles
      DROP CONSTRAINT profiles_subscription_status_check;
  END IF;
END $$;

-- 🌟 [الـحـل هـنـا: تحديث المستخدمين الحاليين أولاً قبل فرض الشروط] 🌟
UPDATE public.profiles
SET 
  trial_ends_at = NOW() + INTERVAL '14 days',
  subscription_status = 'trialing'
WHERE subscription_status IS NULL OR subscription_status NOT IN ('trialing', 'active', 'expired', 'canceled');

-- 🌟 [الآن يمكننا فرض الشرط بأمان لأن كل المستخدمين لديهم حالة صحيحة] 🌟
ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_subscription_status_check
  CHECK (subscription_status IN ('trialing', 'active', 'expired', 'canceled'));

-- Guarantee non-null values after backfill.
ALTER TABLE public.profiles
  ALTER COLUMN trial_ends_at SET NOT NULL;

ALTER TABLE public.profiles
  ALTER COLUMN subscription_status SET NOT NULL;