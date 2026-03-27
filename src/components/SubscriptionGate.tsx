'use client'

import { useState } from 'react'
import { TrialBanner } from '@/components/TrialBanner'
import { PaywallModal } from '@/components/PaywallModal'
import type { SubscriptionStatus } from '@/types/database'

type SubscriptionGateProps = {
  userId: string
  initialStatus: SubscriptionStatus | 'inactive'
  trialEndsAt: string | null
  subscribeHref?: string
}

export function SubscriptionGate({
  userId,
  initialStatus,
  trialEndsAt,
  subscribeHref = '/settings',
}: SubscriptionGateProps) {
  const [status, setStatus] = useState<SubscriptionStatus | 'inactive'>(initialStatus)

  return (
    <>
      <TrialBanner
        userId={userId}
        subscriptionStatus={status}
        trialEndsAt={trialEndsAt}
        subscribeHref={subscribeHref}
        onStatusChange={setStatus}
      />
      <PaywallModal subscriptionStatus={status} subscribeHref={subscribeHref} />
    </>
  )
}
