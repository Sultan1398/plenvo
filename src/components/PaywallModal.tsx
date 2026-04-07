'use client'

import type { SubscriptionStatus } from '@/types/database'

type PaywallModalProps = {
  subscriptionStatus: SubscriptionStatus | 'inactive'
}

export function PaywallModal({ subscriptionStatus }: PaywallModalProps) {
  // Soft-launch mode: no in-app paywall prompts.
  if (subscriptionStatus === 'expired' || subscriptionStatus === 'trialing' || subscriptionStatus === 'active') {
    return null
  }
  return null
}
