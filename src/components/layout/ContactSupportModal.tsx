'use client'

import { useEffect, useState, useTransition } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useLanguage } from '@/contexts/LanguageContext'
import { submitSupportMessage } from '@/app/actions/support-message'
import { X, Headphones } from 'lucide-react'
import { cn } from '@/lib/utils'

type Props = {
  open: boolean
  onClose: () => void
  onSuccess: () => void
}

function errorMessage(
  t: (ar: string, en: string) => string,
  code: 'unauthorized' | 'invalid' | 'config' | 'database' | 'email'
) {
  switch (code) {
    case 'unauthorized':
      return t('انتهت الجلسة. سجّل الدخول مجدداً.', 'Your session expired. Please sign in again.')
    case 'invalid':
      return t('تحقق من صحة البريد وطول الرسالة.', 'Please check your email and message.')
    case 'config':
      return t('خدمة البريد غير مهيأة حالياً.', 'Email service is not configured.')
    case 'database':
      return t('تعذر حفظ الرسالة. حاول لاحقاً.', 'Could not save your message. Try again later.')
    case 'email':
      return t('تم حفظ الرسالة لكن تعذر إرسال الإشعار.', 'Message was saved but notification email failed.')
    default:
      return t('حدث خطأ غير متوقع.', 'Something went wrong.')
  }
}

export function ContactSupportModal({ open, onClose, onSuccess }: Props) {
  const { t, locale } = useLanguage()
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [pending, startTransition] = useTransition()

  useEffect(() => {
    if (!open) return
    setError('')
    const supabase = createClient()
    void supabase.auth.getUser().then(({ data: { user } }) => {
      if (user?.email) setEmail(user.email)
    })
  }, [open])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    startTransition(async () => {
      const result = await submitSupportMessage({
        email: email.trim(),
        message: message.trim(),
      })
      if (result.ok) {
        setEmail('')
        setMessage('')
        onSuccess()
        onClose()
        return
      }
      setError(errorMessage(t, result.code))
    })
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center p-4 sm:items-center sm:p-6">
      <button
        type="button"
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity"
        aria-label={t('إغلاق', 'Close')}
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="support-modal-title"
        className={cn(
          'relative w-full max-w-lg rounded-2xl border border-border bg-white shadow-2xl shadow-slate-900/10',
          'max-h-[min(90vh,640px)] overflow-hidden flex flex-col',
          'ring-1 ring-black/[0.04]'
        )}
      >
        <div className="flex items-start justify-between gap-3 border-b border-border bg-gradient-to-b from-brand/[0.06] to-white px-5 py-4 sm:px-6">
          <div className="flex items-center gap-3 min-w-0">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand/10 text-brand shadow-sm ring-1 ring-brand/15">
              <Headphones className="h-5 w-5" strokeWidth={2.25} aria-hidden />
            </span>
            <div className="min-w-0">
              <h2 id="support-modal-title" className="text-lg font-bold text-slate-900 sm:text-xl">
                {t('تواصل مع الدعم', 'Contact support')}
              </h2>
              <p className="mt-0.5 text-xs text-muted sm:text-sm">
                {t('سنرد عليك في أقرب وقت.', 'We’ll get back to you as soon as we can.')}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 rounded-xl p-2 text-muted transition-colors hover:bg-surface hover:text-foreground"
            aria-label={t('إغلاق', 'Close')}
          >
            <X size={22} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-1 flex-col overflow-hidden">
          <div className="space-y-4 overflow-y-auto p-5 sm:p-6">
            {error ? (
              <p className="rounded-xl border border-red-100 bg-red-50 px-3 py-2.5 text-sm text-danger" role="alert">
                {error}
              </p>
            ) : null}

            <div>
              <label htmlFor="support-email" className="mb-1.5 block text-sm font-semibold text-slate-800">
                {t('عنوان البريد الإلكتروني', 'Email address')}
              </label>
              <input
                id="support-email"
                type="email"
                name="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                dir="ltr"
                className="w-full rounded-xl border border-border bg-white px-3 py-2.5 text-sm outline-none transition-shadow focus:border-brand focus:ring-2 focus:ring-brand/25"
                placeholder={t('you@example.com', 'you@example.com')}
              />
            </div>

            <div>
              <label htmlFor="support-message" className="mb-1.5 block text-sm font-semibold text-slate-800">
                {t('الرسالة', 'Message')}
              </label>
              <textarea
                id="support-message"
                name="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
                rows={6}
                maxLength={8000}
                dir={locale === 'ar' ? 'rtl' : 'ltr'}
                className="w-full resize-y rounded-xl border border-border bg-white px-3 py-2.5 text-sm outline-none transition-shadow focus:border-brand focus:ring-2 focus:ring-brand/25 min-h-[120px]"
                placeholder={t('صف طلبك أو مشكلتك…', 'Describe your question or issue…')}
              />
              <p className="mt-1 text-xs text-muted text-end">{message.length} / 8000</p>
            </div>
          </div>

          <div className="flex flex-col-reverse gap-2 border-t border-border bg-surface/50 px-5 py-4 sm:flex-row sm:justify-end sm:px-6">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-border bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-surface"
            >
              {t('إلغاء', 'Cancel')}
            </button>
            <button
              type="submit"
              disabled={pending}
              className="rounded-xl bg-brand px-5 py-2.5 text-sm font-bold text-white shadow-md shadow-brand/20 transition-colors hover:bg-brand-dark disabled:opacity-60"
            >
              {pending ? t('جاري الإرسال…', 'Sending…') : t('إرسال', 'Send')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
