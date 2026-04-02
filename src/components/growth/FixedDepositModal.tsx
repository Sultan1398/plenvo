'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useLanguage } from '@/contexts/LanguageContext'
import type { FixedDeposit } from '@/types/database'
import { dateToLocalISODate } from '@/lib/date-local'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

type Props = {
  open: boolean
  onClose: () => void
  onSaved: () => void
  edit: FixedDeposit | null
}

export function FixedDepositModal({ open, onClose, onSaved, edit }: Props) {
  const { t } = useLanguage()
  const [securityType, setSecurityType] = useState<'bank_deposit' | 'bonds' | 'sukuk'>('bank_deposit')
  const [name, setName] = useState('')
  const [amount, setAmount] = useState('')
  const [durationMonths, setDurationMonths] = useState('')
  const [interestRate, setInterestRate] = useState('')
  const [returnType, setReturnType] = useState<'fixed' | 'variable'>('fixed')
  const [startDate, setStartDate] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!open) return
    setError('')
    const row = edit as any
    if (edit) {
      setSecurityType((row.security_type as 'bank_deposit' | 'bonds' | 'sukuk') ?? 'bank_deposit')
      setName((row.name as string) ?? row.name_ar ?? row.name_en ?? '')
      setAmount(String(edit.amount))
      setDurationMonths(String((row.duration_months as number) ?? ''))
      setInterestRate(String((row.interest_rate as number) ?? row.roi_percentage ?? ''))
      setReturnType((row.return_type as 'fixed' | 'variable') ?? 'fixed')
      setStartDate((row.start_date as string | undefined)?.slice(0, 10) ?? dateToLocalISODate(new Date()))
    } else {
      setSecurityType('bank_deposit')
      setName('')
      setAmount('')
      setDurationMonths('')
      setInterestRate('')
      setReturnType('fixed')
      const today = dateToLocalISODate(new Date())
      setStartDate(today)
    }
  }, [open, edit])

  if (!open) return null

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    const trimmedName = name.trim()
    if (!trimmedName) {
      setError(t('يرجى إدخال اسم الجهة / الورقة المالية', 'Please enter security/institution name'))
      return
    }
    const num = parseFloat(amount.replace(/,/g, ''))
    if (Number.isNaN(num) || num <= 0) {
      setError(t('المبلغ غير صالح', 'Invalid amount'))
      return
    }
    const monthsNum = parseInt(durationMonths, 10)
    if (Number.isNaN(monthsNum) || monthsNum <= 0) {
      setError(t('مدة الورقة المالية غير صالحة', 'Invalid security duration'))
      return
    }
    const interestRateNum = parseFloat(interestRate.replace(/,/g, ''))
    if (Number.isNaN(interestRateNum) || interestRateNum < 0) {
      setError(t('نسبة العائد غير صالحة', 'Invalid interest rate'))
      return
    }
    if (!startDate) {
      setError(t('حدد تاريخ الاكتتاب', 'Set subscription date'))
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
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: walletData, error: walletError } = await (supabase as any).from('growth_wallets').select('balance').single()
      const walletBalance = !walletError && walletData ? Number(walletData.balance) || 0 : 0

      const row: any = {
        security_type: securityType,
        name: trimmedName,
        amount: num,
        duration_months: monthsNum,
        interest_rate: interestRateNum,
        return_type: returnType,
        start_date: startDate,
        status: 'active',
      }

      if (edit) {
        const previousAmount = Number(edit.amount || 0)
        const delta = num - previousAmount
        if (delta > 0 && delta > walletBalance + 0.0001) {
          setError(t('رصيد محفظة النمو غير كافٍ لهذه الزيادة', 'Growth Wallet balance is insufficient for this increase'))
          return
        }
        if (delta > 0) {
          // withdraw extra from wallet before applying update
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const { error: walletTxErr } = await (supabase as any).from('growth_wallet_transactions').insert({
            user_id: user.id,
            amount: delta,
            transaction_type: 'withdrawal',
          } as any)
          if (walletTxErr) {
            setError(walletTxErr.message)
            return
          }
        }
        const { error: up } = await (supabase as any).from('fixed_deposits').update(row as any).eq('id', edit.id)
        if (up) {
          if (num > previousAmount) {
            // compensate wallet on failed update
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            await (supabase as any).from('growth_wallet_transactions').insert({
              user_id: user.id,
              amount: num - previousAmount,
              transaction_type: 'deposit',
            } as any)
          }
          setError(up.message)
          return
        }
        if (delta < 0) {
          // return released amount to wallet after successful update
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const { error: walletTxErr } = await (supabase as any).from('growth_wallet_transactions').insert({
            user_id: user.id,
            amount: Math.abs(delta),
            transaction_type: 'deposit',
          } as any)
          if (walletTxErr) {
            setError(walletTxErr.message)
            return
          }
        }
      } else {
        if (num > walletBalance + 0.0001) {
          setError(t('رصيد محفظة النمو غير كافٍ لإضافة هذه الوديعة', 'Growth Wallet balance is insufficient for this deposit'))
          return
        }
        // withdraw from wallet first
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error: walletTxErr } = await (supabase as any).from('growth_wallet_transactions').insert({
          user_id: user.id,
          amount: num,
          transaction_type: 'withdrawal',
        } as any)
        if (walletTxErr) {
          setError(walletTxErr.message)
          return
        }
        const { error: ins } = await (supabase as any).from('fixed_deposits').insert({
          ...row,
          user_id: user.id,
        } as any)
        if (ins) {
          // compensate wallet if insert fails
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          await (supabase as any).from('growth_wallet_transactions').insert({
            user_id: user.id,
            amount: num,
            transaction_type: 'deposit',
          } as any)
          setError(ins.message)
          return
        }
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
    <div className="fixed inset-0 z-[100] flex items-end justify-center p-4 sm:items-center sm:p-6">
      <button
        type="button"
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px]"
        aria-label={t('إغلاق', 'Close')}
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="fd-modal-title"
        className={cn(
          'relative max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl border border-border bg-white shadow-xl'
        )}
      >
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <h2 id="fd-modal-title" className="text-lg font-bold text-slate-900">
            {edit ? t('تعديل ورقة مالية', 'Edit security') : t('ورقة مالية جديدة', 'New security')}
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

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-800">
              {t('نوع الورقة المالية', 'Security type')}
            </label>
            <select
              value={securityType}
              onChange={(e) => setSecurityType(e.target.value as 'bank_deposit' | 'bonds' | 'sukuk')}
              className="w-full rounded-xl border border-border bg-white px-3 py-2.5 text-sm outline-none ring-[#2563EB]/20 focus:border-[#2563EB] focus:ring-2"
            >
              <option value="bank_deposit">{t('وديعة بنكية', 'Bank Deposit')}</option>
              <option value="bonds">{t('سندات', 'Bonds')}</option>
              <option value="sukuk">{t('صكوك إسلامية', 'Islamic Sukuk')}</option>
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-800">
              {t('اسم الجهة / الورقة المالية', 'Institution / Security name')}
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-xl border border-border bg-white px-3 py-2.5 text-sm outline-none ring-[#2563EB]/20 focus:border-[#2563EB] focus:ring-2"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-800">
              {t('إجمالي قيمة الاكتتاب', 'Total subscription amount')}
            </label>
            <input
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              type="text"
              inputMode="decimal"
              className="w-full rounded-xl border border-border bg-white px-3 py-2.5 text-sm outline-none ring-[#2563EB]/20 focus:border-[#2563EB] focus:ring-2"
              dir="ltr"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-800">
              {t('مدة الورقة المالية بالأشهر', 'Security duration (months)')}
            </label>
            <input
              value={durationMonths}
              onChange={(e) => setDurationMonths(e.target.value)}
              type="number"
              inputMode="numeric"
              className="w-full rounded-xl border border-border bg-white px-3 py-2.5 text-sm outline-none ring-[#2563EB]/20 focus:border-[#2563EB] focus:ring-2"
              dir="ltr"
              min={1}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-800">
              {t('نسبة العائد', 'Interest rate')}
            </label>
            <input
              value={interestRate}
              onChange={(e) => setInterestRate(e.target.value)}
              type="text"
              inputMode="decimal"
              className="w-full rounded-xl border border-border bg-white px-3 py-2.5 text-sm outline-none ring-[#2563EB]/20 focus:border-[#2563EB] focus:ring-2"
              dir="ltr"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-800">
              {t('نوع العائد', 'Return type')}
            </label>
            <select
              value={returnType}
              onChange={(e) => setReturnType(e.target.value as 'fixed' | 'variable')}
              className="w-full rounded-xl border border-border bg-white px-3 py-2.5 text-sm outline-none ring-[#2563EB]/20 focus:border-[#2563EB] focus:ring-2"
            >
              <option value="fixed">{t('ثابت', 'Fixed')}</option>
              <option value="variable">{t('متغير', 'Variable')}</option>
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-800">
              {t('تاريخ الاكتتاب', 'Subscription date')}
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
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
              {saving ? t('جاري الحفظ…', 'Saving…') : t('حفظ', 'Save')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
