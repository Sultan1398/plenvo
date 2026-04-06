-- ============================================================
-- Dynamic trial: free until 2026-06-30 UTC for signups on/before that date;
-- after that, 14 days from signup (auth.users.created_at).
-- ============================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, trial_ends_at, subscription_status)
  VALUES (
    NEW.id,
    CASE
      WHEN NEW.created_at <= TIMESTAMPTZ '2026-06-30 23:59:59+00'
        THEN TIMESTAMPTZ '2026-06-30 23:59:59+00'
      ELSE NEW.created_at + INTERVAL '14 days'
    END,
    'trialing'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- تمديد التجربة للمستخدمين الحاليين المسجّلين ضمن فترة العرض وما زالوا في حالة تجريبية
UPDATE public.profiles p
SET trial_ends_at = TIMESTAMPTZ '2026-06-30 23:59:59+00'
FROM auth.users u
WHERE p.id = u.id
  AND u.created_at <= TIMESTAMPTZ '2026-06-30 23:59:59+00'
  AND p.subscription_status = 'trialing'
  AND p.trial_ends_at < TIMESTAMPTZ '2026-06-30 23:59:59+00';
