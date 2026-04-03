import { createClient } from '@/lib/supabase/client'

type Supabase = ReturnType<typeof createClient>

function resolveObligationIdFromOutflow(row: {
  obligation_id: string | null
  name_ar: string | null
  name_en: string | null
}): string | null {
  if (row.obligation_id) return row.obligation_id
  const hay = `${row.name_ar ?? ''}\n${row.name_en ?? ''}`
  const match = hay.match(/\[\[planora-obl:([a-f0-9-]{36})\]\]/i)
  return match?.[1] ?? null
}

/**
 * السيولة المتاحة في الفترة =
 * الدخل − المصروفات المدفوعة − (إيداعات المدخرات − سحوبات المدخرات)
 * أي: الإيداع في المدخرات يقلّل السيولة، والسحب يعيدها للمحفظة.
 */
export async function computeAvailableCash(
  supabase: Supabase,
  userId: string,
  periodStart: string,
  periodEnd: string
): Promise<number> {
  const [inRes, outInRes, outBeforeRes, savRes, invRes] = await Promise.all([
    supabase.from('inflows').select('amount').eq('user_id', userId).gte('date', periodStart).lte('date', periodEnd),
    supabase
      .from('outflows')
      .select('id, amount, status, obligation_id, date, name_ar, name_en')
      .eq('user_id', userId)
      .gte('date', periodStart)
      .lte('date', periodEnd),
    supabase
      .from('outflows')
      .select('id, amount, status, obligation_id, date, name_ar, name_en')
      .eq('user_id', userId)
      .lt('date', periodStart),
    supabase
      .from('savings_transactions')
      .select('amount, type')
      .eq('user_id', userId)
      .gte('date', periodStart)
      .lte('date', periodEnd),
    // تحويلات بين المحفظة والمحفظة الداخلية في قسم الاستثمارات (لا تشمل فتح/إغلاق الصفقة)
    (supabase as any)
      .from('investment_wallet_transactions')
      .select('amount, type')
      .eq('user_id', userId)
      .gte('date', periodStart)
      .lte('date', periodEnd)
      .in('type', ['deposit', 'withdrawal']),
  ])

  if (inRes.error) throw new Error(inRes.error.message)
  if (outInRes.error) throw new Error(outInRes.error.message)
  if (outBeforeRes.error) throw new Error(outBeforeRes.error.message)
  if (savRes.error) throw new Error(savRes.error.message)

  let income = 0
  for (const r of inRes.data ?? []) income += Number((r as { amount: number }).amount)

  let paidOutInPeriod = 0
  let generalPaidOutInPeriod = 0

  // key: obligation id, value: sums of paid outflows
  const paidInByObl = new Map<string, number>()
  const paidBeforeByObl = new Map<string, number>()
  const obligationIds = new Set<string>()

  for (const r of outInRes.data ?? []) {
    const row = r as {
      id: string
      amount: number
      status: string
      obligation_id: string | null
      name_ar: string | null
      name_en: string | null
    }
    if (row.status !== 'paid') continue

    const oblId = resolveObligationIdFromOutflow(row)
    if (!oblId) {
      generalPaidOutInPeriod += Number(row.amount)
      continue
    }
    obligationIds.add(oblId)
    paidInByObl.set(oblId, (paidInByObl.get(oblId) ?? 0) + Number(row.amount))
  }

  // نحتاج فقط لـ "paidBefore" من أجل cap المدفوعات ضمن الفترة حسب obligations.paid_amount
  for (const r of outBeforeRes.data ?? []) {
    const row = r as {
      id: string
      amount: number
      status: string
      obligation_id: string | null
      name_ar: string | null
      name_en: string | null
    }
    if (row.status !== 'paid') continue

    const oblId = resolveObligationIdFromOutflow(row)
    if (!oblId) continue
    if (!obligationIds.has(oblId)) continue
    paidBeforeByObl.set(oblId, (paidBeforeByObl.get(oblId) ?? 0) + Number(row.amount))
  }

  let obligationsPaidById = new Map<string, number>()
  if (obligationIds.size > 0) {
    const oblRes = await supabase
      .from('obligations')
      .select('id, paid_amount')
      .eq('user_id', userId)
      .in('id', Array.from(obligationIds))
    if (oblRes.error) throw new Error(oblRes.error.message)
    for (const obl of oblRes.data ?? []) {
      const row = obl as { id: string; paid_amount: number }
      obligationsPaidById.set(row.id, Number(row.paid_amount) || 0)
    }
  }

  // خصم الفترة = المدفوع داخل الفترة ولكن محدوداً بـ obligations.paid_amount الحالية
  let cappedOblPaidInPeriod = 0
  for (const oblId of obligationIds) {
    const paidTotal = obligationsPaidById.get(oblId) ?? 0
    const paidBefore = paidBeforeByObl.get(oblId) ?? 0
    const paidIn = paidInByObl.get(oblId) ?? 0
    const capRemainingForPeriod = Math.max(0, paidTotal - paidBefore)
    cappedOblPaidInPeriod += Math.min(paidIn, capRemainingForPeriod)
  }

  paidOutInPeriod = generalPaidOutInPeriod + cappedOblPaidInPeriod

  /** صافي خرج إلى المدخرات في الفترة: إيداع − سحب */
  let savingsNetOut = 0
  for (const r of savRes.data ?? []) {
    const row = r as { amount: number; type: string }
    const a = Number(row.amount)
    if (row.type === 'deposit') savingsNetOut += a
    else savingsNetOut -= a
  }

  /** صافي خرج إلى الاستثمارات في الفترة: إيداع − سحب */
  let investmentNetOut = 0
  if (!invRes?.error) {
    for (const r of invRes.data ?? []) {
      const row = r as { amount: number; type: string }
      const a = Number(row.amount)
      if (row.type === 'deposit') investmentNetOut += a
      else investmentNetOut -= a
    }
  }

  return income - paidOutInPeriod - savingsNetOut - investmentNetOut
}

/**
 * سيولة تُحسب كما فوق لكن تستثني صف مصروف واحد (للتعديل).
 */
export async function computeAvailableCashExcludingOutflow(
  supabase: Supabase,
  userId: string,
  periodStart: string,
  periodEnd: string,
  excludeOutflowId: string
): Promise<number> {
  const [inRes, outInRes, outBeforeRes, savRes, invRes] = await Promise.all([
    supabase.from('inflows').select('amount').eq('user_id', userId).gte('date', periodStart).lte('date', periodEnd),
    supabase
      .from('outflows')
      .select('id, amount, status, obligation_id, date, name_ar, name_en')
      .eq('user_id', userId)
      .gte('date', periodStart)
      .lte('date', periodEnd),
    supabase
      .from('outflows')
      .select('id, amount, status, obligation_id, date, name_ar, name_en')
      .eq('user_id', userId)
      .lt('date', periodStart),
    supabase
      .from('savings_transactions')
      .select('amount, type')
      .eq('user_id', userId)
      .gte('date', periodStart)
      .lte('date', periodEnd),
    (supabase as any)
      .from('investment_wallet_transactions')
      .select('amount, type')
      .eq('user_id', userId)
      .gte('date', periodStart)
      .lte('date', periodEnd)
      .in('type', ['deposit', 'withdrawal']),
  ])

  if (inRes.error) throw new Error(inRes.error.message)
  if (outInRes.error) throw new Error(outInRes.error.message)
  if (outBeforeRes.error) throw new Error(outBeforeRes.error.message)
  if (savRes.error) throw new Error(savRes.error.message)

  let income = 0
  for (const r of inRes.data ?? []) income += Number((r as { amount: number }).amount)

  let generalPaidOutInPeriod = 0
  const paidInByObl = new Map<string, number>()
  const paidBeforeByObl = new Map<string, number>()
  const obligationIds = new Set<string>()

  for (const r of outInRes.data ?? []) {
    const row = r as {
      id: string
      amount: number
      status: string
      obligation_id: string | null
      name_ar: string | null
      name_en: string | null
    }
    if (row.id === excludeOutflowId) continue
    if (row.status !== 'paid') continue

    const oblId = resolveObligationIdFromOutflow(row)
    if (!oblId) {
      generalPaidOutInPeriod += Number(row.amount)
      continue
    }
    obligationIds.add(oblId)
    paidInByObl.set(oblId, (paidInByObl.get(oblId) ?? 0) + Number(row.amount))
  }

  for (const r of outBeforeRes.data ?? []) {
    const row = r as {
      id: string
      amount: number
      status: string
      obligation_id: string | null
      name_ar: string | null
      name_en: string | null
    }
    if (row.id === excludeOutflowId) continue
    if (row.status !== 'paid') continue

    const oblId = resolveObligationIdFromOutflow(row)
    if (!oblId) continue
    if (!obligationIds.has(oblId)) continue
    paidBeforeByObl.set(oblId, (paidBeforeByObl.get(oblId) ?? 0) + Number(row.amount))
  }

  let obligationsPaidById = new Map<string, number>()
  if (obligationIds.size > 0) {
    const oblRes = await supabase
      .from('obligations')
      .select('id, paid_amount')
      .eq('user_id', userId)
      .in('id', Array.from(obligationIds))
    if (oblRes.error) throw new Error(oblRes.error.message)
    for (const obl of oblRes.data ?? []) {
      const row = obl as { id: string; paid_amount: number }
      obligationsPaidById.set(row.id, Number(row.paid_amount) || 0)
    }
  }

  let cappedOblPaidInPeriod = 0
  for (const oblId of obligationIds) {
    const paidTotal = obligationsPaidById.get(oblId) ?? 0
    const paidBefore = paidBeforeByObl.get(oblId) ?? 0
    const paidIn = paidInByObl.get(oblId) ?? 0
    const capRemainingForPeriod = Math.max(0, paidTotal - paidBefore)
    cappedOblPaidInPeriod += Math.min(paidIn, capRemainingForPeriod)
  }

  const paidOutInPeriod = generalPaidOutInPeriod + cappedOblPaidInPeriod

  let savingsNetOut = 0
  for (const r of savRes.data ?? []) {
    const row = r as { amount: number; type: string }
    const a = Number(row.amount)
    if (row.type === 'deposit') savingsNetOut += a
    else savingsNetOut -= a
  }

  let investmentNetOut = 0
  if (!invRes?.error) {
    for (const r of invRes.data ?? []) {
      const row = r as { amount: number; type: string }
      const a = Number(row.amount)
      if (row.type === 'deposit') investmentNetOut += a
      else investmentNetOut -= a
    }
  }

  return income - paidOutInPeriod - savingsNetOut - investmentNetOut
}

/**
 * سيولة «حالية» بدون فلترة حسب الفترة.
 * تُستخدم فقط في قسم الاستثمارات عندما نحتاج فحص الرصيد الحالي كشرط.
 */
export async function computeWalletCashNow(supabase: Supabase, userId: string): Promise<number> {
  const [inRes, outRes, savRes, invRes] = await Promise.all([
    supabase.from('inflows').select('amount').eq('user_id', userId),
    supabase
      .from('outflows')
      .select('amount, status, obligation_id, name_ar, name_en')
      .eq('user_id', userId),
    supabase.from('savings_transactions').select('amount, type').eq('user_id', userId),
    (supabase as any)
      .from('investment_wallet_transactions')
      .select('amount, type')
      .eq('user_id', userId)
      .in('type', ['deposit', 'withdrawal']),
  ])

  if (inRes.error) throw new Error(inRes.error.message)
  if (outRes.error) throw new Error(outRes.error.message)
  if (savRes.error) throw new Error(savRes.error.message)

  let income = 0
  for (const r of inRes.data ?? []) income += Number((r as { amount: number }).amount)

  let generalPaidOut = 0
  const paidOutByObl = new Map<string, number>()
  const obligationIds = new Set<string>()
  for (const r of outRes.data ?? []) {
    const row = r as {
      amount: number
      status: string
      obligation_id: string | null
      name_ar: string | null
      name_en: string | null
    }
    if (row.status !== 'paid') continue

    const oblId = resolveObligationIdFromOutflow(row)
    if (!oblId) {
      generalPaidOut += Number(row.amount)
      continue
    }

    obligationIds.add(oblId)
    paidOutByObl.set(oblId, (paidOutByObl.get(oblId) ?? 0) + Number(row.amount))
  }

  let paidOutFromObligations = 0
  if (obligationIds.size > 0) {
    const oblRes = await supabase
      .from('obligations')
      .select('id, paid_amount')
      .eq('user_id', userId)
      .in('id', Array.from(obligationIds))
    if (oblRes.error) throw new Error(oblRes.error.message)

    const paidAmountById = new Map<string, number>()
    for (const obl of oblRes.data ?? []) {
      const row = obl as { id: string; paid_amount: number }
      paidAmountById.set(row.id, Number(row.paid_amount) || 0)
    }

    for (const oblId of obligationIds) {
      const paidTotal = paidAmountById.get(oblId) ?? 0
      const paidOut = paidOutByObl.get(oblId) ?? 0
      paidOutFromObligations += Math.min(paidOut, paidTotal)
    }
  }

  const paidOut = generalPaidOut + paidOutFromObligations

  let savingsNetOut = 0
  for (const r of savRes.data ?? []) {
    const row = r as { amount: number; type: string }
    const a = Number(row.amount)
    if (row.type === 'deposit') savingsNetOut += a
    else savingsNetOut -= a
  }

  let investmentNetOut = 0
  if (!invRes?.error) {
    for (const r of invRes.data ?? []) {
      const row = r as { amount: number; type: string }
      const a = Number(row.amount)
      if (row.type === 'deposit') investmentNetOut += a
      else investmentNetOut -= a
    }
  }

  return income - paidOut - savingsNetOut - investmentNetOut
}
