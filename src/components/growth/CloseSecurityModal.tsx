'use client'

import { useEffect, useState } from 'react'
import { X } from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'
import { createClient } from '@/lib/supabase/client'
import { dateToLocalISODate } from '@/lib/date-local'
import { cn } from '@/lib/utils'

type Props = {
  open: boolean
  onClose: () => void
  onSaved: () => void
  securityId: string | null
  securityName: string
  subscribedAmount: number
}

export function CloseSecurityModal({
  open,
  onClose,
  onSaved,
  securityId,
  securityName,
  subscribedAmount,
}: Props) {
  const { t } = useLanguage()
  const [closingAmount, setClosingAmount] = useState('')
  const [closingDate, setClosingDate] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!open) return
    setError('')
    setClosingAmount(subscribedAmount > 0 ? String(subscribedAmount) : '')
    setClosingDate(dateToLocalISODate(new Date()))
  }, [open, subscribedAmount])

  if (!open) return null

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (!securityId) {
      setError(t('لم يتم تحديد الورقة المالية', 'Security is not selected'))
      return
    }
    const closingAmountNum = parseFloat(closingAmount.replace(/,/g, ''))
    if (Number.isNaN(closingAmountNum) || closingAmountNum <= 0) {
      setError(t('قيمة الإغلاق غير صالحة', 'Invalid closing amount'))
      return
    }
    if (!closingDate) {
      setError(t('يرجى تحديد تاريخ الإغلاق', 'Please set closing date'))
      return
    }

    setSaving(true)
    try {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        setError(t('يجب تسجيل الدخول', 'You must be signed in'))
        return
      }

      const { error: updateErr } = await (supabase as any)
        .from('fixed_deposits')
        .update({
          status: 'closed',
          closing_amount: closingAmountNum,
          closing_date: closingDate,
        } as any)
        .eq('id', securityId)

      if (updateErr) {
        setError(updateErr.message)
        return
      }

      const { error: walletTxErr } = await (supabase as any).from('growth_wallet_transactions').insert({
        user_id: user.id,
        amount: closingAmountNum,
        transaction_type: 'deposit',
      } as any)

      if (walletTxErr) {
        setError(walletTxErr.message)
        return
      }

      onSaved()
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[110] flex items-end justify-center p-4 sm:items-center sm:p-6">
      <button
        type="button"
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px]"
        aria-label={t('إغلاق', 'Close')}
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="close-security-title"
        className={cn('relative w-full max-w-md rounded-2xl border border-border bg-white shadow-xl')}
      >
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <h2 id="close-security-title" className="text-lg font-bold text-slate-900">
            {t('إغلاق ورقة مالية', 'Close security')}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-muted transition-colors hover:bg-surface"
            aria-label={t('إغلاق', 'Close')}
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 p-5">
          {error ? (
            <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-[#EF4444]" role="alert">
              {error}
            </p>
          ) : null}

          <p className="rounded-xl bg-slate-50 px-3 py-2 text-sm text-slate-700">
            {t('الورقة المالية:', 'Security:')} <span className="font-semibold">{securityName || '—'}</span>
          </p>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-800">
              {t('إجمالي قيمة الإغلاق', 'Total closing amount')}
            </label>
            <input
              value={closingAmount}
              onChange={(e) => setClosingAmount(e.target.value)}
              type="text"
              inputMode="decimal"
              className="w-full rounded-xl border border-border bg-white px-3 py-2.5 text-sm outline-none ring-[#2563EB]/20 focus:border-[#2563EB] focus:ring-2"
              dir="ltr"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-800">
              {t('تاريخ الإغلاق', 'Closing date')}
            </label>
            <input
              type="date"
              value={closingDate}
              onChange={(e) => setClosingDate(e.target.value)}
              className="w-full rounded-xl border border-border bg-white px-3 py-2.5 text-sm outline-none ring-[#2563EB]/20 focus:border-[#2563EB] focus:ring-2"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl border border-border py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-surface"
            >
              {t('إلغاء', 'Cancel')}
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 rounded-xl bg-[#2563EB] py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#1D4ED8] disabled:opacity-60"
            >
              {saving ? t('جاري الإغلاق…', 'Closing…') : t('إغلاق', 'Close')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
