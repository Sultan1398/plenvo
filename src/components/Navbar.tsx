'use client'

import type { ReactNode } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Languages } from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'
import { cn } from '@/lib/utils'

const navTextLinkClass =
  'shrink-0 whitespace-nowrap text-sm font-semibold text-slate-700 transition-colors hover:text-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40 focus-visible:ring-offset-2 rounded-lg px-1 py-1'

function NavTextLink({
  href,
  children,
  external,
}: {
  href: string
  children: ReactNode
  external?: boolean
}) {
  if (external || href.startsWith('mailto:')) {
    return (
      <a href={href} className={navTextLinkClass}>
        {children}
      </a>
    )
  }

  return (
    <Link href={href} className={navTextLinkClass} scroll>
      {children}
    </Link>
  )
}

const actionBtnBase =
  'inline-flex h-10 shrink-0 items-center justify-center gap-1.5 rounded-full px-4 text-sm font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40 focus-visible:ring-offset-2'

export function Navbar() {
  const { locale, toggleLocale, t } = useLanguage()

  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-50 flex justify-center px-4 pt-4 sm:px-6 sm:pt-5">
      <nav
        className={cn(
          'pointer-events-auto flex w-full max-w-6xl items-center justify-between gap-3 rounded-full border border-slate-200/90 bg-white/95 px-4 py-2.5 shadow-lg shadow-slate-900/[0.06] ring-1 ring-slate-900/[0.04] backdrop-blur-md',
          'sm:gap-4 sm:px-5 sm:py-3'
        )}
        aria-label={t('التنقل الرئيسي', 'Main navigation')}
      >
        {/* RTL: أول عنصر = اليمين — الشعار والاسم */}
        <Link
          href="/"
          className="flex shrink-0 items-center gap-2.5 sm:gap-3"
          aria-label={t('بلانورا — الصفحة الرئيسية', 'Planora — Home')}
        >
          <span
            className={cn(
              'relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white',
              'shadow-md shadow-brand/10 ring-1 ring-slate-200/80 sm:h-11 sm:w-11'
            )}
          >
            <Image
              src="/brand/Planora-logo.svg"
              alt=""
              width={256}
              height={256}
              sizes="40px"
              className="h-[82%] w-[82%] object-contain"
              priority
              unoptimized
            />
          </span>
          <span
            className={cn(
              'text-lg font-extrabold leading-tight text-brand antialiased sm:text-xl',
              locale === 'en' && 'tracking-tight'
            )}
          >
            {t('بلانورا', 'Planora')}
          </span>
        </Link>

        {/* المنتصف: روابط نصية فقط */}
        <div
          className={cn(
            'flex min-w-0 flex-1 items-center justify-center',
            'overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden'
          )}
        >
          <div className="flex shrink-0 items-center gap-4 sm:gap-6 lg:gap-8">
            <NavTextLink href="/how-it-works">{t('كيف يعمل بلانورا؟', 'How Planura Works?')}</NavTextLink>
            <NavTextLink href="/#features">{t('أقسام بلانورا', 'Planora sections')}</NavTextLink>
            <NavTextLink href="/blog">{t('المدونة', 'Blog')}</NavTextLink>
            <NavTextLink href="mailto:customerservice@planora.app" external>
              {t('تواصل معنا', 'Contact us')}
            </NavTextLink>
          </div>
        </div>

        {/* RTL: آخر عنصر = اليسار — اللغة + تسجيل الدخول */}
        <div className="flex shrink-0 items-center gap-3">
          <button
            type="button"
            onClick={toggleLocale}
            className={cn(
              actionBtnBase,
              'border border-slate-200 bg-slate-50/80 font-semibold text-slate-700 hover:border-brand/30 hover:bg-white hover:text-brand'
            )}
            aria-label={t('تبديل اللغة', 'Toggle language')}
          >
            <Languages className="h-4 w-4 shrink-0 text-brand" aria-hidden />
            <span className="hidden sm:inline">{locale === 'ar' ? 'English' : 'العربية'}</span>
            <span className="sm:hidden">{locale === 'ar' ? 'EN' : 'ع'}</span>
          </button>

          <Link
            href="/login"
            className={cn(
              actionBtnBase,
              'bg-brand text-white shadow-md shadow-brand/25 hover:bg-brand-dark'
            )}
          >
            {t('تسجيل الدخول', 'Sign in')}
          </Link>
        </div>
      </nav>
    </header>
  )
}
