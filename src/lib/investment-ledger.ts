import { createClient } from '@/lib/supabase/client'
import type { InvestmentWalletTransaction } from '@/types/database'

type Supabase = ReturnType<typeof createClient>

/** صافي رصيد محفظة الاستثمارات الداخلية الآن (بدون فلترة تواريخ). */
export async function computeInvestmentInternalBalance(supabase: Supabase, userId: string): Promise<number> {
  const invRes = await supabase
    .from('investment_wallet_transactions')
    .select('amount, type')
    .eq('user_id', userId)

  if (invRes.error) return 0

  const rows: Pick<InvestmentWalletTransaction, 'amount' | 'type'>[] = invRes.data ?? []
  let bal = 0
  for (const r of rows) {
    const a = Number(r.amount)
    if (r.type === 'deposit') bal += a
    else if (r.type === 'deal_close') bal += a
    else if (r.type === 'withdrawal') bal -= a
    else if (r.type === 'deal_open') bal -= a
  }
  return bal
}

export type InvestmentOpenTx = {
  id: string
  amount: number
  date: string
} | null

export async function getInvestmentDealOpenTx(
  supabase: Supabase,
  userId: string,
  investmentId: string
): Promise<InvestmentOpenTx> {
  const res = await supabase
    .from('investment_wallet_transactions')
    .select('id, amount, date')
    .eq('user_id', userId)
    .eq('investment_id', investmentId)
    .eq('type', 'deal_open')
    .maybeSingle()

  if (res.error) return null
  if (!res.data) return null
  const row: Pick<InvestmentWalletTransaction, 'id' | 'amount' | 'date'> = res.data
  return row
}

