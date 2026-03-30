'use client'

import { useState } from 'react'
import { X, Loader2 } from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'

interface GrowthWalletTransactionModalProps {
  open: boolean
  onClose: () => void
  onSaved: () => void
  mode: 'deposit' | 'withdrawal'
}

export function GrowthWalletTransactionModal({ open, onClose, onSaved, mode }: GrowthWalletTransactionModalProps) {
  const { t } = useLanguage()
  const [amount, setAmount] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  if (!open) return null

  const isDeposit = mode === 'deposit'
  const title = isDeposit ? t('إيداع في محفظة النمو', 'Deposit to Growth Wallet') : t('استرجاع للمحفظة الرئيسية', 'Withdraw to Main Wallet')
  const buttonText = isDeposit ? t('تأكيد الإيداع', 'Confirm Deposit') : t('تأكيد الاسترجاع', 'Confirm Withdrawal')
  const buttonColor = isDeposit ? 'bg-[#2563EB] hover:bg-[#1D4ED8]' : 'bg-[#EF4444] hover:bg-[#DC2626]'

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    
    const val = parseFloat(amount)
    if (isNaN(val) || val <= 0) {
      setError(t('الرجاء إدخال مبلغ صحيح أكبر من الصفر.', 'Please enter a valid amount greater than zero.'))
      return
    }

    setSaving(true)
    const supabase = createClient()
    
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not found')

      // إدراج العملية في سجل حركات المحفظة، والـ Trigger في قاعدة البيانات سيقوم بتحديث الرصيد تلقائياً
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error: insertError } = await supabase
        .from('growth_wallet_transactions' as any)
        .insert({
          user_id: user.id,
          amount: val,
          transaction_type: mode
        })

      if (insertError) throw insertError

      setAmount('')
      onSaved()
      onClose()
    } catch (err: any) {
      setError(err.message || t('حدث خطأ أثناء حفظ العملية.', 'An error occurred while saving the transaction.'))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl" dir="auto">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-bold text-[#1F2937]">{title}</h2>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {error && (
          <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600 border border-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-[#374151]">
              {t('المبلغ (ر.س)', 'Amount (SAR)')}
            </label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              required
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:border-[#2563EB] focus:outline-none focus:ring-1 focus:ring-[#2563EB]"
              placeholder="0.00"
              dir="ltr"
            />
          </div>

          <div className="mt-2 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl border border-gray-300 bg-white py-3 font-bold text-gray-700 hover:bg-gray-50"
            >
              {t('إلغاء', 'Cancel')}
            </button>
            <button
              type="submit"
              disabled={saving}
              className={cn(
                'flex flex-1 items-center justify-center rounded-xl py-3 font-bold text-white transition-colors disabled:opacity-70',
                buttonColor
              )}
            >
              {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : buttonText}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
