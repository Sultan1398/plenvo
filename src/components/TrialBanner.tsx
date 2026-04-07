'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useLanguage } from '@/contexts/LanguageContext'
import type { SubscriptionStatus } from '@/types/database'

type TrialBannerProps = {
  userId: string
  subscriptionStatus: SubscriptionStatus | 'inactive'
  trialEndsAt: string | null
  onStatusChange?: (next: SubscriptionStatus | 'inactive') => void
}

const DAY_MS = 24 * 60 * 60 * 1000

export function TrialBanner({
  userId,
  subscriptionStatus,
  trialEndsAt,
  onStatusChange,
}: TrialBannerProps) {
  const { t } = useLanguage()
  const [isExpiring, setIsExpiring] = useState(false)
  const didExpireRef = useRef(false)

  const daysLeft = useMemo(() => {
    if (subscriptionStatus !== 'trialing' || !trialEndsAt) return null
    const endAt = new Date(trialEndsAt).getTime()
    if (Number.isNaN(endAt)) return null
    return Math.ceil((endAt - Date.now()) / DAY_MS)
  }, [subscriptionStatus, trialEndsAt])

  useEffect(() => {
    if (subscriptionStatus !== 'trialing' || daysLeft == null || daysLeft > 0 || didExpireRef.current) return

    didExpireRef.current = true
    setIsExpiring(true)

    const expireTrial = async () => {
      const supabase = createClient()
      const { error } = await supabase
        .from('profiles')
        .update({ subscription_status: 'expired' })
        .eq('id', userId)

      if (!error) {
        onStatusChange?.('expired')
      }
      setIsExpiring(false)
    }

    void expireTrial()
  }, [daysLeft, onStatusChange, subscriptionStatus, userId])

  if (subscriptionStatus !== 'trialing') return null

  const safeDays = Math.max(0, daysLeft ?? 0)

  return (
    <div className="border-b border-blue-200 bg-blue-50 px-4 py-3 sm:px-6">
      <div className="mx-auto flex w-full max-w-7xl flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
        <p className="text-sm font-medium text-blue-900 sm:text-base">
          {t(
            'أنت الآن على الخطة الترويجية المجانية الصالحة حتى 30 يونيو 2026',
            'You are on the free promotional plan valid until June 30, 2026'
          )}
          {' · '}
          {t('المتبقي', 'Remaining')}: <span className="font-bold">{safeDays}</span> {t('أيام.', 'days.')}
          {isExpiring && (
            <span className="ms-2 text-xs font-semibold text-blue-700">
              {t('... جارٍ تحديث الحالة', '... updating status')}
            </span>
          )}
        </p>
      </div>
    </div>
  )
}
