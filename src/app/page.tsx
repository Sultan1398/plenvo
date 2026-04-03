'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Footer } from '@/components/Footer'
import { Navbar } from '@/components/Navbar'
import { useLanguage } from '@/contexts/LanguageContext'
import { cn } from '@/lib/utils'

/**
 * مسارات لقطات الشاشة في public/screenshots
 */
function screenshotPath(locale: 'ar' | 'en', key: keyof typeof SHOT_FILES): string {
  return `/screenshots/${locale}/${SHOT_FILES[key]}`
}

const SHOT_FILES = {
  hero: 'dashboarda.png',
  analytics: 'dashboardb.png',
  yearStats: 'dashboardc.png',
  income: 'income.png',
  expenses: 'expenses.png',
  investings: 'investings.png',
  savings: 'savings.png',
} as const

function LandingImage({
  src,
  alt,
  priority,
  className,
}: {
  src: string
  alt: string
  priority?: boolean
  className?: string
}) {
  return (
    <div className={cn('relative w-full overflow-hidden rounded-xl border border-slate-200 shadow-xl', className)}>
      <Image
        src={src}
        alt={alt}
        width={1200}
        height={750}
        sizes="(max-width: 1024px) 100vw, 50vw"
        className="h-auto w-full object-cover object-top"
        priority={priority}
      />
    </div>
  )
}

export default function LandingPage() {
  const { locale, t } = useLanguage()
  const l = locale

  return (
    <div
      className="min-h-screen bg-slate-50 font-sans text-slate-900"
      dir={locale === 'ar' ? 'rtl' : 'ltr'}
    >
      <Navbar />

      <main className="pt-[5.5rem] sm:pt-24">
        {/* Hero */}
        <section className="mx-auto max-w-4xl px-4 py-16 text-center sm:px-6 sm:py-20 md:py-24">
          <div className="mb-6 flex flex-col items-center justify-center gap-5 sm:mb-8 sm:flex-row sm:gap-6 md:gap-8">
            <span
              className={cn(
                'relative flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-white',
                'shadow-lg shadow-brand/15 ring-1 ring-slate-200/80',
                'sm:h-20 sm:w-20 md:h-24 md:w-24 md:rounded-[1.25rem] md:shadow-xl md:ring-black/[0.06]'
              )}
              aria-hidden
            >
              <Image
                src="/brand/Plenvo-logo.svg"
                alt=""
                width={512}
                height={512}
                sizes="(max-width: 640px) 64px, (max-width: 768px) 80px, 96px"
                className="h-[82%] w-[82%] object-contain"
                priority
                unoptimized
              />
            </span>
            <h1 className="max-w-3xl text-center text-3xl font-extrabold leading-tight sm:text-start sm:text-4xl md:text-5xl lg:text-6xl">
              {t(
                'تحكم في مستقبلك المالي بذكاء مع بلينفو',
                'Take control of your financial future with Plenvo'
              )}
            </h1>
          </div>
          <p className="mx-auto mb-10 max-w-2xl text-base leading-relaxed text-slate-600 sm:text-lg md:text-xl">
            {t(
              'تتبع نفقاتك، أدر التزاماتك، وراقب نمو استثماراتك من لوحة تحكم واحدة مصممة لتمنحك حرية مالية أوضح.',
              'Track spending, manage obligations, and watch your investments grow from one dashboard built for financial clarity.'
            )}
          </p>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/signup"
              className="rounded-xl bg-brand px-8 py-4 text-lg font-bold text-white shadow-lg shadow-brand/25 transition-all hover:bg-brand-dark"
            >
              {t('ابدأ تجربتك المجانية (14 يوماً)', 'Start your 14-day free trial')}
            </Link>
          </div>
          <div className="relative mx-auto mt-12 max-w-5xl sm:mt-16">
            <LandingImage
              src={screenshotPath(l, 'hero')}
              alt={t('لمحة من لوحة المحفظة', 'Hub dashboard preview')}
              priority
              className="rounded-2xl shadow-2xl"
            />
          </div>
        </section>

        <div id="features" className="scroll-mt-28 sm:scroll-mt-32">
          {/* مركز القيادة — تحليل */}
          <section className="border-y border-slate-200 bg-white py-16 sm:py-20 md:py-24">
            <div className="mx-auto max-w-6xl px-4 sm:px-6">
              <h2 className="mb-12 text-center text-2xl font-bold sm:mb-16 sm:text-3xl md:text-4xl">
                {t(
                  'مركز القيادة المالية: رؤية شاملة، تحليل دقيق',
                  'Your financial command center: full picture, sharp analysis'
                )}
              </h2>
              <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-16">
                <div className="space-y-10 sm:space-y-12">
                  <div className="flex gap-4">
                    <div className="text-3xl" aria-hidden>
                      📊
                    </div>
                    <div>
                      <h3 className="mb-2 text-xl font-bold">
                        {t('ثروتك في لحظة', 'Your wealth at a glance')}
                      </h3>
                      <p className="leading-relaxed text-slate-600">
                        {t(
                          'تابع صافي ثروتك، أداء استثماراتك، وتدفقاتك النقدية من لوحة تفاعلية تمنحك إجابات واضحة بسرعة.',
                          'See net worth, investment performance, and cash flow in one interactive view that answers what matters—fast.'
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="text-3xl" aria-hidden>
                      📈
                    </div>
                    <div>
                      <h3 className="mb-2 text-xl font-bold">
                        {t('تحليل الأداء', 'Performance analytics')}
                      </h3>
                      <p className="leading-relaxed text-slate-600">
                        {t(
                          'لا تكتفِ بالأرقام الصماء: رسوم بيانية ومؤشرات سنوية تساعدك على فهم سلوكك المالي وأين تنمو أموالك.',
                          'Go beyond static numbers—charts and yearly KPIs help you understand habits, spending, and growth over time.'
                        )}
                      </p>
                    </div>
                  </div>
                </div>
                <div>
                  <LandingImage
                    src={screenshotPath(l, 'analytics')}
                    alt={t('تحليل مالي', 'Financial analytics')}
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Zig-zag: الدخل، المصروفات، الادخار، الاستثمارات، إحصاءات العام */}
          <FeatureZigZag
            index={0}
            title={t('دخلك، منظم وواضح', 'Income, organized and clear')}
            body={t(
              'سجّل مصادر الدخل الثابتة والمتغيرة ضمن فترتك المالية واعرف ماذا يدخل محفظتك في كل دورة.',
              'Record fixed and variable income for each financial period so you always know what hits your wallet each cycle.'
            )}
            src={screenshotPath(l, 'income')}
            alt={t('شاشة الدخل', 'Income screen')}
          />
          <FeatureZigZag
            index={1}
            title={t('مصروفاتك والتزاماتك تحت السيطرة', 'Spending and obligations under control')}
            body={t(
              'تتبع المصروفات العامة وسداد الالتزامات مع تنبيهات ودية تساعدك على الحفاظ على السيولة.',
              'Track general expenses and obligation payments—with gentle reminders to protect your liquidity.'
            )}
            src={screenshotPath(l, 'expenses')}
            alt={t('شاشة المصروفات', 'Expenses screen')}
          />
          <FeatureZigZag
            index={2}
            title={t('الادخار نحو أهدافك', 'Savings toward your goals')}
            body={t(
              'عرّف أهداف ادخار وتابع التقدم مع إيداعات وسحوبات مرتبطة بفترتك المالية.',
              'Define savings goals and follow progress with deposits and withdrawals tied to your period.'
            )}
            src={screenshotPath(l, 'savings')}
            alt={t('شاشة الادخار', 'Savings screen')}
          />
          <FeatureZigZag
            index={3}
            title={t('استثماراتك في صورة واحدة', 'Investments in one place')}
            body={t(
              'أدر الصفقات، المحفظة الداخلية، والربح المحقق مع تتبع واضح لحركة رأس المال.',
              'Manage deals, internal wallet, and realized P/L with a clear view of capital movement.'
            )}
            src={screenshotPath(l, 'investings')}
            alt={t('شاشة الاستثمارات', 'Investments screen')}
          />
          <FeatureZigZag
            index={4}
            title={t('إحصاءات العام: سنة مالية كاملة', 'Year statistics: the full fiscal year')}
            body={t(
              'جدول ملخص لاثني عشر فترة يجمع الدخل، المصروفات، الالتزامات، والادخار والاستثمار في نظرة واحدة.',
              'A twelve-period table that rolls up income, expenses, obligations, savings, and investments in one view.'
            )}
            src={screenshotPath(l, 'yearStats')}
            alt={t('إحصاءات العام', 'Year statistics')}
            mutedBg
          />
        </div>

        {/* Pricing */}
        <section
          id="pricing"
          className="scroll-mt-28 border-t border-slate-200 bg-slate-50 py-16 sm:scroll-mt-32 sm:py-20 md:py-24"
        >
          <div className="mx-auto max-w-6xl px-4 text-center sm:px-6">
            <h2 className="mb-10 text-2xl font-bold sm:text-3xl md:mb-12 md:text-4xl">
              {t('استثمار بسيط في مستقبلك المالي', 'A simple investment in your financial future')}
            </h2>

            <div className="mx-auto max-w-xl rounded-2xl border border-slate-200 bg-white p-8 shadow-xl shadow-slate-200/60 sm:p-10">
              <p className="text-5xl font-extrabold tracking-tight text-brand sm:text-6xl">1.99$</p>
              <p className="mt-2 text-base font-medium text-slate-600 sm:text-lg">{t('شهرياً', 'per month')}</p>
              <p className="mt-6 text-base font-semibold text-slate-800 sm:text-lg">
                {t('أول 14 يوماً مجاناً، ألغِ اشتراكك في أي وقت.', 'First 14 days free, cancel anytime.')}
              </p>
              <div className="mt-8">
                <Link
                  href="/signup"
                  className="inline-flex w-full items-center justify-center rounded-xl bg-brand px-6 py-3 text-base font-bold text-white shadow-lg shadow-brand/25 transition-all hover:bg-brand-dark sm:text-lg"
                >
                  {t('اشترك الآن', 'Subscribe Now')}
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Bottom CTA */}
        <section className="border-t border-slate-200 bg-brand/10 py-14 sm:py-16">
          <div className="mx-auto flex max-w-5xl flex-col items-center gap-5 px-4 text-center sm:px-6">
            <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl">
              {t('جاهز للسيطرة على أموالك؟', 'Ready to take control of your finances?')}
            </h2>
            <Link
              href="/signup"
              className="rounded-xl bg-brand px-8 py-4 text-lg font-bold text-white shadow-lg shadow-brand/25 transition-all hover:bg-brand-dark"
            >
              {t('ابدأ تجربتك المجانية (14 يوماً)', 'Start your 14-day free trial')}
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}

function FeatureZigZag({
  index,
  title,
  body,
  src,
  alt,
  mutedBg,
}: {
  index: number
  title: string
  body: string
  src: string
  alt: string
  mutedBg?: boolean
}) {
  const reverse = index % 2 === 1
  return (
    <section
      className={cn(
        'py-14 sm:py-16 md:py-20',
        mutedBg ? 'border-y border-slate-200 bg-white' : 'bg-slate-50'
      )}
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div
          className={cn(
            'flex flex-col items-center gap-10 lg:gap-16',
            'lg:flex-row lg:items-center',
            reverse && 'lg:flex-row-reverse'
          )}
        >
          <div className="w-full flex-1 space-y-4">
            <h2 className="text-2xl font-bold sm:text-3xl">{title}</h2>
            <p className="text-base leading-relaxed text-slate-600 sm:text-lg">{body}</p>
          </div>
          <div className="w-full flex-1">
            <LandingImage src={src} alt={alt} />
          </div>
        </div>
      </div>
    </section>
  )
}
