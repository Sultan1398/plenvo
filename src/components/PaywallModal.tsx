'use client'

import type { SubscriptionStatus } from '@/types/database'

type PaywallModalProps = {
  subscriptionStatus: SubscriptionStatus | 'inactive'
}

export function PaywallModal({ subscriptionStatus }: PaywallModalProps) {
  if (subscriptionStatus === 'trialing' || subscriptionStatus === 'active') {
    return null
  }

  // TODO (Soft Launch — re-enable before 30 June 2026):
  // This paywall modal is intentionally disabled for the soft-launch period so users are not blocked
  // or prompted to subscribe inside the web app. Before 2026-06-30, restore the previous behavior:
  // when `subscriptionStatus === 'expired'`, render a full-screen modal that prevents using the app
  // until the user completes subscription (or equivalent product flow).
  if (subscriptionStatus === 'expired') {
    return null
  }

  // TODO: When the paywall is re-enabled, handle `canceled` the same as `expired` (same blocking modal).
  if (subscriptionStatus === 'canceled') {
    return null
  }

  return null
}
