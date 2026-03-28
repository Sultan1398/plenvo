'use client'

import Link from 'next/link'
import { Footer } from '@/components/Footer'
import { Navbar } from '@/components/Navbar'
import { useLanguage } from '@/contexts/LanguageContext'
import { cn } from '@/lib/utils'

const content = {
  ar: {
    title: "سياسة الخصوصية لتطبيق بلانورا (Planura)",
    lastUpdated: "تاريخ آخر تحديث: مارس 2026",
    intro:
      "نرحب بك في 'بلانورا'. نحن ندرك تماماً أن بياناتك المالية هي من أشد أسرارك خصوصية. لذلك، بنينا هذا التطبيق على مبدأ أساسي: بياناتك ملك لك وحدك، ومهمتنا هي حمايتها ومساعدتك على إدارتها، وليس استغلالها.",
    sections: [
      {
        title: "1. ما هي المعلومات التي نجمعها؟",
        text: "لتقديم أفضل تجربة مالية لك، نقوم بجمع نوعين من المعلومات:",
        points: [
          "معلومات الحساب الأساسية: عند التسجيل، نطلب بريدك الإلكتروني لإنشاء حسابك وتأمين وصولك.",
          "البيانات المالية المُدخلة (بإرادتك): تشمل الأرقام التي تقوم بإدخالها يدوياً. ملاحظة هامة: بلانورا لا يطلب ولا يربط أو يخزن أي أرقام بطاقات ائتمانية أو بيانات تسجيل دخول لحساباتك البنكية الفعلية.",
          "البيانات التقنية: مثل نوع الجهاز ونظام التشغيل لتحسين أداء التطبيق.",
        ],
      },
      {
        title: "2. كيف نستخدم معلوماتك؟",
        text: "نحن نستخدم بياناتك للأغراض الأساسية التالية فقط:",
        points: [
          "تشغيل التطبيق: مزامنة بياناتك المالية وعرضها لك بشكل فوري.",
          "إدارة الاشتراكات: التحقق من حالة اشتراكك لضمان تقديم الخدمة دون انقطاع.",
          "الدعم الفني: الرد على استفساراتك وحل أي مشكلة قد تواجهك.",
          "تحسين الخدمة: فهم كيفية استخدام التطبيق بشكل عام لتطوير ميزات جديدة.",
        ],
      },
      {
        title: "3. أين تُخزن بياناتك وكيف نحميها؟",
        text: "نحن نطبق أعلى معايير الأمان لحماية بياناتك:",
        points: [
          "تشفير عالي المستوى: نستخدم أحدث بروتوكولات التشفير لحماية بياناتك أثناء نقلها وتخزينها.",
          "خوادم سحابية آمنة: يتم استضافة قواعد بياناتنا باستخدام مزودي خدمة سحابية عالميين وموثوقين يطبقون أعلى معايير الأمان.",
        ],
      },
      {
        title: "4. مشاركة البيانات مع الأطراف الثالثة",
        text: "نحن لا نبيع بياناتك الشخصية أو المالية لأي شركات إعلانية إطلاقاً. قد نقوم بمشاركة بعض البيانات الضرورية جداً مع شركاء تقنيين موثوقين فقط لغرض تشغيل التطبيق، وهم:",
        points: [
          "متاجر التطبيقات (Apple & Google): لمعالجة عمليات الدفع والاشتراكات.",
          "خدمات إدارة الاشتراكات: لمزامنة حالة اشتراكك بين أجهزتك المختلفة.",
          "خدمات الاستضافة السحابية: لتخزين البيانات بشكل آمن.",
        ],
      },
      {
        title: "5. حقوقك والتحكم في بياناتك",
        text: "نحن نؤمن بأنك تمتلك السيطرة الكاملة على بياناتك:",
        points: [
          "الوصول والتعديل: يمكنك مراجعة وتعديل بياناتك في أي وقت.",
          "الحق في الحذف: يمكنك طلب حذف حسابك نهائياً، وسيتم محو كافة بياناتك بشكل لا رجعة فيه.",
        ],
      },
      {
        title: "6. تواصل معنا",
        text: "إذا كانت لديك أي أسئلة بشأن خصوصية بياناتك، يرجى التواصل معنا عبر البريد الإلكتروني:",
        points: ["customerservice@planora.app"],
      },
    ],
    backButton: "العودة للرئيسية",
  },
  en: {
    title: "Privacy Policy for Planura App",
    lastUpdated: "Last Updated: March 2026",
    intro:
      "Welcome to Planura. We fully understand that your financial data is among your most private secrets. Therefore, we built this app on a fundamental principle: your data belongs to you alone, and our mission is to protect it and help you manage it, not exploit it.",
    sections: [
      {
        title: "1. What information do we collect?",
        text: "To provide you with the best financial experience, we collect two types of information:",
        points: [
          "Basic Account Information: Upon registration, we ask for your email to create your account and secure your access.",
          "Voluntarily Entered Financial Data: Includes the numbers you enter manually. Important note: Planura does not request, link, or store any credit card numbers or login details for your actual bank accounts.",
          "Technical Data: Such as device type and operating system to improve app performance.",
        ],
      },
      {
        title: "2. How do we use your information?",
        text: "We use your data strictly for the following essential purposes:",
        points: [
          "App Operation: Synchronizing and displaying your financial data instantly.",
          "Subscription Management: Verifying your subscription status to ensure uninterrupted service.",
          "Technical Support: Responding to your inquiries and resolving issues.",
          "Service Improvement: Understanding general app usage to develop new features.",
        ],
      },
      {
        title: "3. Where is your data stored and how do we protect it?",
        text: "We apply the highest security standards to protect your data:",
        points: [
          "High-Level Encryption: We use the latest encryption protocols to protect your data during transit and storage.",
          "Secure Cloud Servers: Our databases are hosted by reliable global cloud service providers that adhere to the highest security standards.",
        ],
      },
      {
        title: "4. Data sharing with third parties",
        text: "We NEVER sell your personal or financial data to advertising companies. We may only share strictly necessary data with trusted technical partners to operate the app, including:",
        points: [
          "App Stores (Apple & Google): To process payments and subscriptions.",
          "Subscription Management Services: To sync your subscription status across devices.",
          "Cloud Hosting Services: To securely store data.",
        ],
      },
      {
        title: "5. Your rights and control over your data",
        text: "We believe you have absolute control over your data:",
        points: [
          "Access and Modification: You can review and edit your data at any time.",
          "Right to Deletion: You can request permanent account deletion, which will irreversibly erase all your data.",
        ],
      },
      {
        title: "6. Contact Us",
        text: "If you have any questions regarding your data privacy, please contact us via email:",
        points: ["customerservice@planora.app"],
      },
    ],
    backButton: "Back to Home",
  },
} as const

type LocaleKey = keyof typeof content

export default function PrivacyPage() {
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
