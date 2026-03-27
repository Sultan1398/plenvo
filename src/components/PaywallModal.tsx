'use client'

import Link from 'next/link'
import { Apple, Play } from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'
import type { SubscriptionStatus } from '@/types/database'

type PaywallModalProps = {
  subscriptionStatus: SubscriptionStatus | 'inactive'
}

type StoreBadgeProps = {
  href: string
  icon: 'apple' | 'google'
  topText: string
  bottomText: string
}

function StoreBadge({ href, icon, topText, bottomText }: StoreBadgeProps) {
  return (
    <Link
      href={href}
      className="inline-flex min-h-16 items-center gap-3 rounded-xl border border-black/80 bg-black px-4 py-3 text-white shadow-md transition-transform hover:-translate-y-0.5 hover:bg-black/90"
      aria-label={bottomText}
    >
      <span className="shrink-0">
        {icon === 'apple' ? <Apple className="h-7 w-7" aria-hidden /> : <Play className="h-7 w-7" aria-hidden />}
      </span>
      <span className="flex flex-col items-start leading-tight">
        <span className="text-[11px] font-medium text-white/80">{topText}</span>
        <span className="text-base font-semibold">{bottomText}</span>
      </span>
    </Link>
  )
}

export function PaywallModal({ subscriptionStatus }: PaywallModalProps) {
  const { t } = useLanguage()

  if (subscriptionStatus !== 'expired') return null

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-950/70 p-4 sm:p-6">
      <div className="w-full max-w-2xl rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-2xl sm:p-10">
        <h2 className="text-2xl font-extrabold text-slate-900 sm:text-3xl">
          {t('انتهت الفترة التجريبية. استمر في السيطرة على أموالك!', 'Your trial has ended. Stay in control of your money!')}
        </h2>
        <p className="mt-4 text-sm leading-relaxed text-slate-600 sm:text-base">
          {t(
            'لترقية حسابك إلى (بلانورا برو) واستعادة الوصول لبياناتك، يرجى إتمام عملية الاشتراك عبر تطبيقنا على الجوال.',
            'To upgrade to Planora Pro and restore access to your data, please complete your subscription using our mobile app.'
          )}
        </p>

        <div className="mt-8 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6">
          <p className="text-sm font-medium text-slate-500">
            {t('مكان مخصص لرمز QR قريباً', 'QR code placeholder')}
          </p>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <StoreBadge
            href="#"
            icon="apple"
            topText={t('حمّل التطبيق من', 'Download on the')}
            bottomText="App Store"
          />
          <StoreBadge
            href="#"
            icon="google"
            topText={t('حمّل التطبيق من', 'Get it on')}
            bottomText="Google Play"
          />
        </div>
      </div>
    </div>
  )
}
