'use client'

import Link from 'next/link'
import { useLanguage } from '@/contexts/LanguageContext'
import type { SubscriptionStatus } from '@/types/database'

type PaywallModalProps = {
  subscriptionStatus: SubscriptionStatus | 'inactive'
  subscribeHref?: string
}

export function PaywallModal({ subscriptionStatus, subscribeHref = '/settings' }: PaywallModalProps) {
  const { t } = useLanguage()

  if (subscriptionStatus !== 'expired') return null

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-950/70 p-4 sm:p-6">
      <div className="w-full max-w-2xl rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-2xl sm:p-10">
        <h2 className="text-2xl font-extrabold text-slate-900 sm:text-3xl">
          {t('انتهت الفترة التجريبية', 'Your trial has ended')}
        </h2>
        <p className="mt-4 text-sm leading-relaxed text-slate-600 sm:text-base">
          {t(
            'انتهت الفترة التجريبية. نأمل أنك استمتعت بإدارة أموالك مع بلانورا. اشترك الآن بـ 1.99$ شهرياً لاستعادة الوصول لبياناتك.',
            'Your trial has ended. We hope you enjoyed managing your finances with Planora. Subscribe now for $1.99/month to restore access to your data.'
          )}
        </p>

        <div className="mt-8">
          <Link
            href={subscribeHref}
            className="inline-flex w-full items-center justify-center rounded-xl bg-brand px-6 py-3 text-base font-bold text-white transition-colors hover:bg-brand-dark sm:w-auto sm:px-8"
          >
            {t('اشترك الآن', 'Subscribe now')}
          </Link>
        </div>
      </div>
    </div>
  )
}
