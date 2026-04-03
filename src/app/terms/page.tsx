'use client'

import Link from 'next/link'
import { Footer } from '@/components/Footer'
import { Navbar } from '@/components/Navbar'
import { useLanguage } from '@/contexts/LanguageContext'
import { cn } from '@/lib/utils'

const content = {
  ar: {
    title: 'شروط استخدام تطبيق بلينفو',
    lastUpdated: 'تاريخ آخر تحديث: مارس 2026',
    intro:
      'باستخدامك لبلينفو، فإنك توافق على هذه الشروط. يُرجى قراءتها بعناية. إذا لم توافق على أي بند، يُفضّل عدم استخدام الخدمة.',
    sections: [
      {
        title: '1. الخدمة والترخيص',
        text: 'بلينفو أداة لتنظيم ومتابعة وضعك المالي الشخصي. نمنحك ترخيصاً شخصياً غير حصري وغير قابل للتحويل لاستخدام التطبيق وفق هذه الشروط.',
        points: [
          'يجب أن تكون قادراً قانونياً على إبرام عقد ملزم في بلد إقامتك.',
          'أنت مسؤول عن سرية بيانات الدخول إلى حسابك.',
        ],
      },
      {
        title: '2. الاشتراك والدفع',
        text: 'قد تتضمن الخدمة فترة تجريبية ثم اشتراكاً مدفوعاً. تتم عمليات الاشتراك والدفع عبر متاجر التطبيقات (Apple و Google) وفق سياسات كل متجر.',
        points: [
          'الأسعار والتجديد كما تظهر لك في المتجر وقت الشراء.',
          'لا نخزن أرقام بطاقاتك على خوادمنا؛ المعالجة تتم عبر المتجر.',
        ],
      },
      {
        title: '3. استخدامك المقبول',
        text: 'يُحظر استخدام الخدمة لأي غرض غير قانوني أو ينتهك حقوق الغير.',
        points: [
          'لا تحاول الوصول غير المصرح به إلى أنظمتنا أو حسابات المستخدمين الآخرين.',
          'لا تُدخل بيانات مضللة أو تُسيء استخدام الدعم الفني.',
        ],
      },
      {
        title: '4. إخلاء المسؤولية',
        text: 'بلينفو أداة تخطيط ومعلومات؛ لا تُعد استشارة مالية أو ضريبية أو استثمارية. القرارات المالية قراراتك وحدك.',
        points: [
          'نُقدّم الخدمة «كما هي» ضمن حدود معقولة دون ضمانات صريحة أو ضمنية.',
          'لا نتحمل المسؤولية عن أي خسارة ناتجة عن اعتمادك على المعلومات داخل التطبيق.',
        ],
      },
      {
        title: '5. إنهاء الخدمة',
        text: 'يجوز لنا تعليق أو إنهاء وصولك إذا انتهكت الشروط. يمكنك إيقاف استخدامك أو حذف حسابك وفق الإعدادات وسياسة الخصوصية.',
        points: ['قد نعدّل الشروط؛ سنواصل إخطارك بالتغييرات الجوهرية عند الاقتضاء.'],
      },
      {
        title: '6. التواصل',
        text: 'للاستفسارات حول هذه الشروط:',
        points: ['support@plenvoapp.com'],
      },
    ],
    backButton: 'العودة للرئيسية',
  },
  en: {
    title: 'Terms of Use for Plenvo',
    lastUpdated: 'Last Updated: March 2026',
    intro:
      'By using Plenvo, you agree to these terms. Please read them carefully. If you do not agree, please do not use the service.',
    sections: [
      {
        title: '1. Service and license',
        text: 'Plenvo is a tool to organize and track your personal finances. We grant you a personal, non-exclusive, non-transferable license to use the app subject to these terms.',
        points: [
          'You must be legally able to enter a binding contract in your country of residence.',
          'You are responsible for keeping your account credentials confidential.',
        ],
      },
      {
        title: '2. Subscription and payment',
        text: 'The service may include a trial period followed by a paid subscription. Subscriptions and payments are processed through app stores (Apple and Google) under each store’s policies.',
        points: [
          'Pricing and renewal are as shown in the store at the time of purchase.',
          'We do not store your card numbers on our servers; processing is handled by the store.',
        ],
      },
      {
        title: '3. Acceptable use',
        text: 'You may not use the service for any unlawful purpose or in a way that infringes others’ rights.',
        points: [
          'Do not attempt unauthorized access to our systems or other users’ accounts.',
          'Do not submit misleading data or abuse support channels.',
        ],
      },
      {
        title: '4. Disclaimer',
        text: 'Plenvo is a planning and information tool; it is not financial, tax, or investment advice. Financial decisions are solely yours.',
        points: [
          'We provide the service “as is” to a reasonable extent without express or implied warranties.',
          'We are not liable for losses arising from your reliance on information in the app.',
        ],
      },
      {
        title: '5. Termination',
        text: 'We may suspend or terminate access if you breach these terms. You may stop using the service or delete your account as described in settings and our privacy policy.',
        points: ['We may update these terms; we will notify you of material changes where appropriate.'],
      },
      {
        title: '6. Contact',
        text: 'Questions about these terms:',
        points: ['support@plenvoapp.com'],
      },
    ],
    backButton: 'Back to Home',
  },
} as const

type LocaleKey = keyof typeof content

export default function TermsPage() {
  const { locale } = useLanguage()
  const lang: LocaleKey = locale === 'en' ? 'en' : 'ar'
  const c = content[lang]

  return (
    <div className="flex min-h-screen flex-col bg-gray-50/50 text-slate-900">
      <Navbar />

      <main className="flex grow flex-col">
        <div
          className="mx-auto w-full max-w-3xl flex-1 px-4 pb-10 pt-[5.5rem] sm:px-6 sm:pb-14 sm:pt-24"
          dir={lang === 'ar' ? 'rtl' : 'ltr'}
        >
          <Link
            href="/"
            className={cn(
              'mb-8 inline-flex text-sm font-semibold text-brand transition-colors hover:text-brand-dark',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/30 focus-visible:ring-offset-2 rounded-lg'
            )}
          >
            {c.backButton}
          </Link>

          <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-10">
            <h1 className="text-2xl font-extrabold text-slate-900 sm:text-3xl">{c.title}</h1>
            <p className="mt-3 text-sm text-slate-500">{c.lastUpdated}</p>
            <p className="mt-8 text-base leading-relaxed text-slate-700">{c.intro}</p>

            <div className="mt-10 space-y-10">
              {c.sections.map((section) => (
                <section key={section.title}>
                  <h2 className="text-lg font-bold text-slate-900 sm:text-xl">{section.title}</h2>
                  <p className="mt-3 text-base leading-relaxed text-slate-700">{section.text}</p>
                  <ul className="mt-4 list-disc space-y-2 ps-5 text-base leading-relaxed text-slate-700">
                    {section.points.map((point) => (
                      <li key={point}>
                        {point.includes('@') ? (
                          <a
                            href={`mailto:${point}`}
                            className="font-medium text-brand underline-offset-2 hover:underline"
                            dir="ltr"
                          >
                            {point}
                          </a>
                        ) : (
                          point
                        )}
                      </li>
                    ))}
                  </ul>
                </section>
              ))}
            </div>
          </article>
        </div>
      </main>

      <Footer />
    </div>
  )
}
