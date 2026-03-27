import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { AppShell } from '@/components/layout/AppShell'
import { SubscriptionGate } from '@/components/SubscriptionGate'
import { PeriodProvider } from '@/contexts/PeriodContext'

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('period_start_day, period_start_month, subscription_status, trial_ends_at')
    .eq('id', user.id)
    .single()

  if (!profile?.period_start_day) {
    redirect('/onboarding')
  }

  const fiscalMonth =
    profile.period_start_month != null && profile.period_start_month >= 1 && profile.period_start_month <= 12
      ? profile.period_start_month
      : 1

  return (
    <PeriodProvider initialStartDay={profile.period_start_day} initialFiscalStartMonth={fiscalMonth}>
      <SubscriptionGate
        userId={user.id}
        initialStatus={profile.subscription_status ?? 'inactive'}
        trialEndsAt={profile.trial_ends_at ?? null}
      />
      <AppShell>{children}</AppShell>
    </PeriodProvider>
  )
}
