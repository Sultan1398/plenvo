'use client'

import Link from 'next/link'
import { Footer } from '@/components/Footer'
import { Navbar } from '@/components/Navbar'
import { useLanguage } from '@/contexts/LanguageContext'
import { cn } from '@/lib/utils'

interface ModuleDetail {
  subtitle: string
  text: string
}

interface AppModule {
  icon: string
  title: string
  desc: string
  details: ModuleDetail[]
}

interface ContentLocale {
  pageTitle: string
  goal: { heading: string; text: string }
  periods: {
    heading: string
    text: string
    whyHeading: string
    whyBullets: string[]
    setupHeading: string
    setupText: string
  }
  modulesSection: {
    heading: string
    intro: string
    items: AppModule[]
  }
}

interface Content {
  ar: ContentLocale
  en: ContentLocale
}

const content: Content = {
  ar: {
    pageTitle: 'كيف يعمل بلانورا؟',
    goal: {
      heading: 'الهدف من بلانورا',
      text: 'لا يكتفي بلانورا بكونه أداةً لتسجيل عملياتك المالية، بل يذهب أبعد من ذلك. فلسفة بلانورا تقوم على مبدأ واحد: تبسيط إدارة أموالك حتى تستعيد السيطرة الكاملة عليها. نؤمن بأن الإدارة المالية الجيدة لا تعني تعقيداً أو جداول مرهقة، بل تعني وضوح الرؤية وسهولة التنفيذ — وهذا بالضبط ما يقدمه بلانورا.',
    },
    periods: {
      heading: 'الفترات المالية',
      text: "يرتكز بلانورا على مفهوم محوري يُميّزه: 'الفترات المالية'. وهي دورات زمنية منتظمة — شهرية في الغالب — تُشكّل الإطار الزمني لتنظيم جميع معاملاتك المالية وتتبعها.",
      whyHeading: 'لماذا الفترات المالية؟',
      whyBullets: [
        'ربط كل معاملة مالية بسياقها الزمني الصحيح.',
        'مقارنة الأداء المالي بين الفترات بدقة وموضوعية.',
        'ملخص سنوي متكامل يجمع ١٢ فترة في جدول واحد.',
        'رصد الاتجاهات المالية وتحليلها على المدى البعيد.',
      ],
      setupHeading: 'كيفية إعداد الفترات المالية',
      setupText:
        'من قسم الإعدادات، يمكنك تحديد يوم وشهر بداية فترتك المالية الأولى. ويُنصح باختيار تاريخ استلام راتبك الشهري إن كان ثابتاً — إذ يُمثّل هذا التاريخ بداية دورة مالية منطقية وطبيعية لك. وبمجرد تحديد هذا التاريخ، يُعيد بلانورا جدولة نفسه تلقائياً ليبدأ كل فترة في اليوم ذاته من كل شهر.',
    },
    modulesSection: {
      heading: 'أقسام التطبيق',
      intro: 'يتكون بلانورا من ستة أقسام رئيسية، كل منها مصمَّم بعناية لتغطية جانب محدد من حياتك المالية:',
      items: [
        {
          icon: '💼',
          title: '١ — المحفظة',
          desc: 'تُمثّل المحفظة مركز القيادة في بلانورا، وتنقسم إلى ثلاثة تبويبات متكاملة:',
          details: [
            {
              subtitle: 'النظرة العامة:',
              text: 'لمحة لحظية فورية عن مجمل أوضاعك المالية بأرقام مباشرة.',
            },
            {
              subtitle: 'التحليل:',
              text: 'رسوم بيانية ومؤشرات تضيء وضعك المالي لتيسير التخطيط.',
            },
            {
              subtitle: 'إحصاءات العام:',
              text: 'جدول موحد يعرض عملياتك لـ ١٢ فترة، كملخص سنوي فريد بنظرة واحدة.',
            },
          ],
        },
        {
          icon: '📥',
          title: '٢ — الدخل',
          desc: 'يُبسّط بلانورا عملية تسجيل إيراداتك من خلال نهج قائم على الوضوح:',
          details: [
            {
              subtitle: 'الدخل الثابت:',
              text: 'كالراتب الشهري — وهو الأساس الذي تُبنى عليه خططك والتزاماتك.',
            },
            {
              subtitle: 'الدخل المتغير:',
              text: 'كالعمولات والمكافآت — يُوثَّق بشكل منفصل لا يُربك حساباتك الثابتة.',
            },
          ],
        },
        {
          icon: '📤',
          title: '٣ — المصروف',
          desc: 'نهج مرن يبتعد عن الميزانيات المعقدة، يعتمد على نوعين:',
          details: [
            {
              subtitle: 'المصروفات العامة (نظام البنود):',
              text: 'تقسيم المصروفات لبنود رئيسية وتحديد مبلغ إجمالي يُخصم من الإيرادات، مما يبقي الأمور تحت السيطرة.',
            },
            {
              subtitle: 'الالتزامات المالية:',
              text: 'تسجيل الفواتير والأقساط للفترة الحالية أو المستقبلية، وخصمها عند السداد.',
            },
          ],
        },
        {
          icon: '🏦',
          title: '٤ — المدخرات',
          desc: 'يتبنى التطبيق مبدأ الادخار الموجَّه بالأهداف لبناء عادات صحية:',
          details: [
            {
              subtitle: 'آلية العمل:',
              text: 'يُحدد المستخدم هدفاً ادخارياً (كصندوق طوارئ أو رحلة)، ثم يستقطع المبالغ من محفظته ويودعها في صندوق الهدف بأبسط صورة ممكنة.',
            },
          ],
        },
        {
          icon: '📈',
          title: '٥ — الاستثمارات',
          desc: 'نموذج مبسَّط لتسجيل العمليات الاستثمارية عبر ٤ مسارات (الأسهم، الفوركس، العقار، المشاريع):',
          details: [
            {
              subtitle: 'تسجيل الصفقات:',
              text: 'يُسجّل المستخدم قيمة فتح وإغلاق الصفقة، ويتولى بلانورا تلقائياً حساب الربح أو الخسارة المحققة.',
            },
          ],
        },
        {
          icon: '⚙️',
          title: '٦ — الإعدادات',
          desc: 'أدوات التحكم الشاملة:',
          details: [
            {
              subtitle: 'التخصيص:',
              text: 'يمنحك قسم الإعدادات التحكم الكامل في حسابك، من تحديد بداية الفترة المالية إلى إدارة خيارات التطبيق الأساسية.',
            },
          ],
        },
      ],
    },
  },
  en: {
    pageTitle: 'How Planura Works?',
    goal: {
      heading: 'The Goal of Planura',
      text: 'Planura is not just a tool for recording your financial transactions; it goes much further. The philosophy of Planura is based on a single principle: simplifying the management of your money so you can regain full control over it. We believe that good financial management does not mean complexity or cumbersome spreadsheets, but rather clarity of vision and ease of execution—and this is exactly what Planura offers.',
    },
    periods: {
      heading: 'Financial Periods',
      text: "Planura is anchored by a core concept that sets it apart: 'Financial Periods'. These are regular time cycles—mostly monthly—that form the timeframe for organizing and tracking all your financial transactions.",
      whyHeading: 'Why Financial Periods?',
      whyBullets: [
        'Connect each transaction to its correct chronological context.',
        'Compare financial performance between periods accurately.',
        'A comprehensive annual summary combining 12 periods in one table.',
        'Monitor and analyze long-term financial trends.',
      ],
      setupHeading: 'How to set up Financial Periods',
      setupText:
        "From settings, select the day and month your first period begins. It's recommended to choose your fixed salary date—representing a natural financial cycle. Once set, Planura automatically reschedules to start each period on the exact same day every month.",
    },
    modulesSection: {
      heading: 'App Sections',
      intro: 'Planura consists of six main sections, each carefully designed to cover a specific aspect of your financial life:',
      items: [
        {
          icon: '💼',
          title: '1 — Portfolio',
          desc: 'The command center of Planura, divided into three integrated tabs:',
          details: [
            { subtitle: 'Overview:', text: 'An instant real-time glimpse of your overall finances.' },
            { subtitle: 'Analysis:', text: 'Charts and indicators that illuminate your financial status for better planning.' },
            {
              subtitle: 'Annual Stats:',
              text: 'A unified table displaying 12 periods for a comprehensive yearly review.',
            },
          ],
        },
        {
          icon: '📥',
          title: '2 — Income',
          desc: 'Simplifies revenue tracking through a clarity-driven approach:',
          details: [
            {
              subtitle: 'Fixed Income:',
              text: 'Like your monthly salary—the foundation for your plans and commitments.',
            },
            {
              subtitle: 'Variable Income:',
              text: 'Commissions and bonuses—documented separately to keep fixed accounts stable.',
            },
          ],
        },
        {
          icon: '📤',
          title: '3 — Expenses',
          desc: 'A flexible approach away from rigid budgets, based on two types:',
          details: [
            {
              subtitle: 'General Expenses:',
              text: 'Divide expenses into major categories with an overall budget, keeping things controlled.',
            },
            {
              subtitle: 'Financial Commitments:',
              text: 'Record bills and loans for current or future periods, deducted upon payment.',
            },
          ],
        },
        {
          icon: '🏦',
          title: '4 — Savings',
          desc: 'Adopts goal-directed savings to build healthy habits:',
          details: [
            {
              subtitle: 'How it works:',
              text: "Set a saving goal (emergency or trip), then easily allocate funds from your portfolio directly to the goal's box.",
            },
          ],
        },
        {
          icon: '📈',
          title: '5 — Investments',
          desc: 'A simplified model across 4 paths (Stocks, Forex, Real Estate, Projects):',
          details: [
            {
              subtitle: 'Trade Recording:',
              text: 'Enter the open and close values, and Planura auto-calculates your profit or loss.',
            },
          ],
        },
        {
          icon: '⚙️',
          title: '6 — Settings',
          desc: 'Comprehensive control tools:',
          details: [
            {
              subtitle: 'Customization:',
              text: 'Gives you full control over your account, from setting the start of your financial period to managing essential app options.',
            },
          ],
        },
      ],
    },
  },
}

export default function HowItWorksPage() {
  const { locale, t } = useLanguage()
  const currentLang = locale === 'ar' ? content.ar : content.en
  const isRTL = locale === 'ar'

  return (
    <div className="flex min-h-screen flex-col bg-gray-50/50 text-slate-900">
      <Navbar />

      <main className="flex grow flex-col">
        <div
          className="mx-auto w-full max-w-3xl flex-1 px-4 pb-12 pt-[5.5rem] sm:max-w-4xl sm:px-6 sm:pb-16 sm:pt-24"
          dir={isRTL ? 'rtl' : 'ltr'}
        >
          <Link
            href="/"
            className={cn(
              'mb-8 inline-flex text-sm font-semibold text-brand transition-colors hover:text-brand-dark',
              'rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/30 focus-visible:ring-offset-2'
            )}
          >
            {t('العودة للرئيسية', 'Back to Home')}
          </Link>

          <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-10">
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
              {currentLang.pageTitle}
            </h1>

            <section id="goal" className="mt-12 scroll-mt-28 border-slate-100 border-b pb-12 sm:scroll-mt-32">
              <h2 className="text-xl font-bold text-slate-900 sm:text-2xl">{currentLang.goal.heading}</h2>
              <p className="mt-4 text-base leading-relaxed text-slate-700">{currentLang.goal.text}</p>
            </section>

            <section id="periods" className="mt-12 scroll-mt-28 border-slate-100 border-b pb-12 sm:scroll-mt-32">
              <h2 className="text-xl font-bold text-slate-900 sm:text-2xl">{currentLang.periods.heading}</h2>
              <p className="mt-4 text-base leading-relaxed text-slate-700">{currentLang.periods.text}</p>

              <div className="mt-8 border-slate-100 border-s-4 ps-4 sm:ps-5">
                <h3 className="text-lg font-semibold text-slate-900">{currentLang.periods.whyHeading}</h3>
                <ul className="mt-3 list-disc space-y-2 ps-5 text-base leading-relaxed text-slate-700">
                  {currentLang.periods.whyBullets.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>

              <div className="mt-8 border-slate-100 border-s-4 ps-4 sm:ps-5">
                <h3 className="text-lg font-semibold text-slate-900">{currentLang.periods.setupHeading}</h3>
                <p className="mt-3 text-base leading-relaxed text-slate-700">{currentLang.periods.setupText}</p>
              </div>
            </section>

            <section id="modules" className="mt-12 scroll-mt-28 sm:scroll-mt-32">
              <h2 className="text-xl font-bold text-slate-900 sm:text-2xl">
                {currentLang.modulesSection.heading}
              </h2>
              <p className="mt-4 text-base leading-relaxed text-slate-700">
                {currentLang.modulesSection.intro}
              </p>

              <ul className="mt-10 space-y-6">
                {currentLang.modulesSection.items.map((mod) => (
                  <li
                    key={mod.title}
                    className="rounded-2xl border border-slate-200 bg-slate-50/60 p-5 sm:p-6"
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:gap-4">
                      <span className="text-3xl leading-none sm:text-4xl" aria-hidden>
                        {mod.icon}
                      </span>
                      <div className="min-w-0 flex-1">
                        <h3 className="text-lg font-bold text-slate-900 sm:text-xl">{mod.title}</h3>
                        <p className="mt-2 text-sm leading-relaxed text-slate-600 sm:text-base">{mod.desc}</p>
                        <ul className="mt-4 space-y-4 border-slate-200 border-t pt-4">
                          {mod.details.map((d) => (
                            <li key={`${mod.title}-${d.subtitle}`}>
                              <p className="text-sm font-semibold text-slate-900 sm:text-base">{d.subtitle}</p>
                              <p className="mt-1 text-sm leading-relaxed text-slate-600 sm:text-base">{d.text}</p>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          </article>
        </div>
      </main>

      <Footer />
    </div>
  )
}
