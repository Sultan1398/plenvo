'use client'

import type { ReactNode } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Instagram, Linkedin, Twitter } from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'
import { cn } from '@/lib/utils'

function FooterHeading({ children }: { children: ReactNode }) {
  return <h3 className="text-sm font-bold uppercase tracking-wide text-slate-900">{children}</h3>
}

function FooterLink({
  href,
  children,
  external,
}: {
  href: string
  children: ReactNode
  external?: boolean
}) {
  const className =
    'text-sm text-slate-600 transition-colors hover:text-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/30 focus-visible:ring-offset-2 rounded-sm'

  if (external || href.startsWith('mailto:') || href === '#') {
    return (
      <a href={href} className={className}>
        {children}
      </a>
    )
  }

  return (
    <Link href={href} className={className} scroll>
      {children}
    </Link>
  )
}

export function Footer() {
  const { locale, t } = useLanguage()

  return (
    <footer className="border-t border-slate-200 bg-gray-50">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:py-14">
        <div
          className={cn(
            'grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-12',
            locale === 'ar' ? 'text-right' : 'text-left'
          )}
        >
          {/* العمود 1: العلامة */}
          <div className="space-y-4">
            <Link href="/" className="inline-flex items-center gap-3" aria-label={t('بلينفو — الرئيسية', 'Plenvo — Home')}>
              <span className="relative flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white shadow-md shadow-brand/10 ring-1 ring-slate-200/80">
                <Image
                  src="/brand/Plenvo-logo.svg"
                  alt=""
                  width={256}
                  height={256}
                  sizes="44px"
                  className="h-[82%] w-[82%] object-contain"
                  unoptimized
                />
              </span>
              <span
                className={cn(
                  'text-xl font-extrabold text-brand',
                  locale === 'en' && 'tracking-tight'
                )}
              >
                {t('بلينفو', 'Plenvo')}
              </span>
            </Link>
            <p className="max-w-xs text-sm leading-relaxed text-slate-600">
              {t('تحكم في مستقبلك المالي بذكاء.', 'Take control of your financial future—intelligently.')}
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <a
                href="#"
                className="rounded-full p-2.5 text-slate-500 transition-colors hover:bg-white hover:text-brand hover:shadow-sm"
                aria-label="Twitter"
              >
                <Twitter className="h-5 w-5" aria-hidden />
              </a>
              <a
                href="#"
                className="rounded-full p-2.5 text-slate-500 transition-colors hover:bg-white hover:text-brand hover:shadow-sm"
                aria-label="LinkedIn"
              >
                <Linkedin className="h-5 w-5" aria-hidden />
              </a>
              <a
                href="#"
                className="rounded-full p-2.5 text-slate-500 transition-colors hover:bg-white hover:text-brand hover:shadow-sm"
                aria-label="Instagram"
              >
                <Instagram className="h-5 w-5" aria-hidden />
              </a>
            </div>
          </div>

          {/* العمود 2: التطبيق */}
          <div className="space-y-4">
            <FooterHeading>{t('التطبيق', 'App')}</FooterHeading>
            <ul className="space-y-3">
              <li>
                <FooterLink href="/how-it-works">{t('كيف يعمل بلينفو؟', 'How Plenvo Works?')}</FooterLink>
              </li>
              <li>
                <FooterLink href="/#features">{t('المميزات', 'Features')}</FooterLink>
              </li>
              <li>
                <FooterLink href="/#pricing">{t('الأسعار', 'Pricing')}</FooterLink>
              </li>
            </ul>
          </div>

          {/* العمود 3: الموارد */}
          <div className="space-y-4">
            <FooterHeading>{t('الموارد', 'Resources')}</FooterHeading>
            <ul className="space-y-3">
              <li>
                <FooterLink href="mailto:support@plenvoapp.com" external>
                  {t('تواصل معنا', 'Contact us')}
                </FooterLink>
              </li>
            </ul>
          </div>

          {/* العمود 4: قانوني */}
          <div className="space-y-4">
            <FooterHeading>{t('قانوني', 'Legal')}</FooterHeading>
            <ul className="space-y-3">
              <li>
                <FooterLink href="/privacy">{t('سياسة الخصوصية', 'Privacy policy')}</FooterLink>
              </li>
              <li>
                <FooterLink href="/terms">{t('شروط الاستخدام', 'Terms of use')}</FooterLink>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-slate-200 pt-8 text-center">
          <p className="text-sm text-slate-500">
            {t('© 2026 بلينفو. جميع الحقوق محفوظة.', '© 2026 Plenvo. All rights reserved.')}
          </p>
        </div>
      </div>
    </footer>
  )
}
