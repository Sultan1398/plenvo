'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useLanguage } from '@/contexts/LanguageContext'
import { Logo } from '@/components/ui/Logo'
import { MailCheck } from 'lucide-react'
import { mapAuthError } from '@/lib/utils/auth-errors'

export default function SignupPage() {
  const { t, toggleLocale, locale } = useLanguage()
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (password !== confirm) {
      setError(t('كلمتا المرور غير متطابقتين', 'Passwords do not match'))
      return
    }

    if (password.length < 6) {
      setError(t('كلمة المرور يجب أن تكون 6 أحرف على الأقل', 'Password must be at least 6 characters'))
      return
    }

    setLoading(true)
    try {
      const supabase = createClient()
      const { error: authError } = await supabase.auth.signUp({ email, password })
      if (authError) throw new Error(authError.message)
      setIsSubmitted(true)
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      setError(mapAuthError(message))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface px-4">
      <div className="w-full max-w-md">
        {/* Language Toggle */}
        <div className="flex justify-end mb-6">
          <button
            onClick={toggleLocale}
            className="text-sm text-muted hover:text-brand transition-colors px-3 py-1 rounded-lg border border-border"
          >
            {locale === 'ar' ? 'English' : 'العربية'}
          </button>
        </div>

        {/* Logo */}
        <div className="flex justify-center mb-8">
          <Logo size="lg" showName={false} />
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-border p-8">
          {isSubmitted ? (
            <div className="text-center space-y-4">
              <div className="mx-auto inline-flex h-16 w-16 items-center justify-center rounded-full bg-brand/10 text-brand">
                <MailCheck className="h-9 w-9" />
              </div>
              <h2 className="text-2xl font-bold">
                {t('تم إنشاء حسابك بنجاح!', 'Your account has been created successfully!')}
              </h2>
              <p className="text-slate-600">
                {t(
                  'لقد أرسلنا رابط التفعيل إلى بريدك الإلكتروني. يرجى الضغط على الرابط لتفعيل حسابك والبدء باستخدام بلانورا.',
                  'We sent an activation link to your email. Please open it to activate your account and start using Planora.'
                )}
              </p>
              <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-slate-600">
                {t(
                  '💡 ملاحظة: إذا لم تجد الرسالة في صندوق الوارد الأساسي، يرجى التحقق من مجلد الرسائل غير المرغوب فيها (Junk / Spam).',
                  '💡 Note: If you do not find the message in your main inbox, please check your Junk / Spam folder.'
                )}
              </div>
              <button
                type="button"
                onClick={() => router.push('/login')}
                className="w-full rounded-xl bg-brand py-2.5 font-medium text-white transition-colors hover:bg-brand-dark"
              >
                {t('العودة لتسجيل الدخول', 'Back to Sign In')}
              </button>
            </div>
          ) : (
            <>
              <h1 className="text-2xl font-bold text-center mb-1">
                {t('إنشاء حساب جديد', 'Create Account')}
              </h1>
              <p className="text-muted text-center text-sm mb-8">
                {t('ابدأ رحلتك المالية مع بلانورا', 'Start your financial journey with Planora')}
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5">
                    {t('البريد الإلكتروني', 'Email')}
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full px-4 py-2.5 rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand transition-all"
                    placeholder="example@email.com"
                    dir="ltr"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1.5">
                    {t('كلمة المرور', 'Password')}
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full px-4 py-2.5 rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand transition-all"
                    placeholder="••••••••"
                    dir="ltr"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1.5">
                    {t('تأكيد كلمة المرور', 'Confirm Password')}
                  </label>
                  <input
                    type="password"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    required
                    className="w-full px-4 py-2.5 rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand transition-all"
                    placeholder="••••••••"
                    dir="ltr"
                  />
                </div>

                {error && (
                  <div className="bg-red-50 text-danger text-sm px-4 py-3 rounded-xl border border-red-200">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-brand text-white py-2.5 rounded-xl font-medium hover:bg-brand-dark transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {loading ? t('جاري الإنشاء...', 'Creating...') : t('إنشاء الحساب', 'Create Account')}
                </button>
              </form>

              <p className="text-center text-sm text-muted mt-6">
                {t('لديك حساب بالفعل؟', 'Already have an account?')}{' '}
                <Link href="/login" className="text-brand hover:underline font-medium">
                  {t('تسجيل الدخول', 'Sign In')}
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
