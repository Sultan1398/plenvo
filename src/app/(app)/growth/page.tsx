'use client'

import { useCallback, useEffect, useState } from 'react'
import {
  ArrowDownLeft,
  ArrowUpRight,
  Loader2,
  Pencil,
  Plus,
  Sprout,
  Trash2,
  Wallet,
} from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'
import { usePeriod } from '@/contexts/PeriodContext'
import { PageHeader } from '@/components/layout/PageHeader'
import { PeriodNavigator } from '@/components/layout/PeriodNavigator'
import { GrowthWalletTransactionModal } from '@/components/growth/GrowthWalletTransactionModal'
import { SavingsGoalFormModal } from '@/components/growth/SavingsGoalFormModal'
import { SavingsTransactionModal } from '@/components/growth/SavingsTransactionModal'
import { getAppNavItem } from '@/config/navigation'
import { createClient } from '@/lib/supabase/client'
import { parseLocalISODate } from '@/lib/date-local'
import { formatGregorianDate } from '@/lib/period'
import { formatMoney } from '@/lib/format-money'
import { deleteSavingsGoalWithOrderedTxRemoval } from '@/lib/savings-delete-goal'
import type { SavingsGoal } from '@/types/database'
import { cn } from '@/lib/utils'
import { useAvailableCash } from '@/hooks/useAvailableCash'
import { useAlert } from '@/contexts/AlertContext'

const growthNav = getAppNavItem('/growth')

export default function GrowthPage() {
  const { t, locale } = useLanguage()
  const { periodKey, periodDates, startDay } = usePeriod()
  const [loading, setLoading] = useState(true)
  const [goals, setGoals] = useState<SavingsGoal[]>([])
  const [growthWalletBalance, setGrowthWalletBalance] = useState(0)
  const [fetchError, setFetchError] = useState('')
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const { showAlert, closeAlert } = useAlert()

  const [formOpen, setFormOpen] = useState(false)
  const [editingGoal, setEditingGoal] = useState<SavingsGoal | null>(null)
  const [txOpen, setTxOpen] = useState(false)
  const [txGoal, setTxGoal] = useState<SavingsGoal | null>(null)
  const [txMode, setTxMode] = useState<'deposit' | 'withdrawal'>('deposit')
  const [walletTxOpen, setWalletTxOpen] = useState(false)
  const [walletTxMode, setWalletTxMode] = useState<'deposit' | 'withdrawal'>('deposit')

  const { availableCash, loading: cashLoading } = useAvailableCash({ periodKey, periodDates, startDay })

  const fetchGrowthData = useCallback(async (isStillMounted: () => boolean = () => true) => {
    if (!isStillMounted()) return
    setLoading(true)
    setFetchError('')
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!isStillMounted()) return
    if (!user) {
      setGoals([])
      setGrowthWalletBalance(0)
      setLoading(false)
      return
    }

    const uid = user.id

    const { data: walletData, error: walletError } = await supabase.from('growth_wallets').select('balance').single()

    if (!walletError && walletData) {
      setGrowthWalletBalance(Number(walletData.balance) || 0)
    }

    const goalsRes = await supabase
      .from('savings_goals')
      .select('*')
      .eq('user_id', uid)
      .order('created_at', { ascending: false })

    if (!isStillMounted()) return

    const errs: string[] = []
    if (goalsRes.error) errs.push(goalsRes.error.message)
    if (walletError && walletError.code !== 'PGRST116') errs.push(walletError.message)
    setFetchError(errs.join(' · '))

    setGoals(goalsRes.error ? [] : ((goalsRes.data as SavingsGoal[] | null) ?? []))
    setLoading(false)
  }, [])

  useEffect(() => {
    let isMounted = true
    const isStillMounted = () => isMounted
    const loadData = async () => {
      await fetchGrowthData(isStillMounted)
    }
    void loadData()
    return () => {
      isMounted = false
    }
  }, [fetchGrowthData, periodKey])

  function openNewGoal() {
    setEditingGoal(null)
    setFormOpen(true)
  }

  function openEditGoal(g: SavingsGoal) {
    setEditingGoal(g)
    setFormOpen(true)
  }

  function openDeposit(g: SavingsGoal) {
    setTxGoal(g)
    setTxMode('deposit')
    setTxOpen(true)
  }

  function openWithdraw(g: SavingsGoal) {
    setTxGoal(g)
    setTxMode('withdrawal')
    setTxOpen(true)
  }

  async function handleDelete(g: SavingsGoal) {
    const bal = Number(g.current_amount)
    const msg =
      bal > 0.0001
        ? t(
            'حذف الهدف سيُلغي معاملاته ويُعيد أثرها على السيولة في الفترات المعنية (المبلغ يعود منطقياً للمحفظة). متابعة؟',
            'Deleting will remove transactions and restore liquidity in the affected periods (balance returns to the wallet logically). Continue?'
          )
        : t('حذف هذا الهدف؟', 'Delete this savings goal?')
    showAlert({
      type: 'confirm',
      title: t('تأكيد', 'Confirm'),
      message: msg,
      onConfirm: () => {
        closeAlert()
        void (async () => {
          setDeletingId(g.id)
          const supabase = createClient()
          const shouldReturnToWallet = bal > 0.0001
          if (shouldReturnToWallet) {
            const {
              data: { user },
            } = await supabase.auth.getUser()
            if (!user) {
              setDeletingId(null)
              showAlert({
                type: 'alert',
                title: t('تنبيه', 'Notice'),
                message: t('يجب تسجيل الدخول', 'You must be signed in'),
                onConfirm: closeAlert,
              })
              return
            }
            // return goal balance to growth wallet before closing/deleting it
            const { error: walletTxErr } = await supabase.from('growth_wallet_transactions').insert({
              user_id: user.id,
              amount: bal,
              transaction_type: 'deposit',
            })
            if (walletTxErr) {
              setDeletingId(null)
              showAlert({
                type: 'alert',
                title: t('خطأ', 'Error'),
                message: walletTxErr.message,
                onConfirm: closeAlert,
              })
              return
            }
          }

          const { error: delErr } = await deleteSavingsGoalWithOrderedTxRemoval(supabase, g.id)
          setDeletingId(null)
          if (delErr) {
            if (shouldReturnToWallet) {
              const {
                data: { user },
              } = await supabase.auth.getUser()
              if (user) {
                // compensate wallet if deletion failed
                await supabase.from('growth_wallet_transactions').insert({
                  user_id: user.id,
                  amount: bal,
                  transaction_type: 'withdrawal',
                })
              }
            }

            showAlert({
              type: 'alert',
              title: t('خطأ', 'Error'),
              message: delErr.message,
              onConfirm: closeAlert,
            })
            return
          }

          void fetchGrowthData()
        })()
      },
    })
  }

  return (
    <div className="mx-auto max-w-6xl p-4 lg:p-6">
      <PageHeader
        nav={growthNav}
        subtitle={t('إدارة صناديق وأهداف الادخار الخاصة بك', 'Manage your savings funds and goals')}
        actions={
          <div className="flex flex-wrap items-center justify-end gap-2">
            <PeriodNavigator />
          </div>
        }
      />

      {loading ? (
        <div className="mt-8 flex items-center justify-center rounded-2xl border border-gray-200 bg-white py-16 text-sm text-gray-500 shadow-sm">
          {t('جارِ التحميل...', 'Loading...')}
        </div>
      ) : (
        <div className="mt-8 flex flex-col gap-8">
          {fetchError ? (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {fetchError}
            </div>
          ) : null}

      {!loading && !cashLoading && availableCash != null ? (
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-[#1B6EF3] bg-[#1B6EF3] px-4 py-3 shadow-sm">
          <span className="text-sm text-white">{t('السيولة المتاحة في الفترة', 'Available liquidity this period')}</span>
          <span className="text-lg font-bold text-white tabular-nums" dir="ltr">
            {formatMoney(availableCash, locale)}
          </span>
        </div>
      ) : null}

      {/* بطاقة محفظة النمو (النسخة المبسطة) */}
      <div className="mb-8 flex flex-col overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm">
        <div className="flex flex-col justify-between gap-4 p-6 md:flex-row md:items-center md:p-8">
          <div className="flex flex-col items-start">
            <div className="mb-2 flex items-center gap-x-3">
              <span
                className={cn(
                  'inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl',
                  'bg-teal-50 shadow-inner shadow-white/60 ring-1 ring-slate-900/[0.07]'
                )}
              >
                <Sprout
                  className="h-5 w-5 text-teal-600"
                  strokeWidth={2.35}
                  aria-hidden
                />
              </span>
              <h2 className="text-sm font-bold text-gray-500">
                {t('رصيد محفظة النمو (الادخار)', 'Growth Wallet Balance (Savings)')}
              </h2>
            </div>
            <div className="mt-2 flex items-baseline gap-x-2">
              <span className="text-4xl font-extrabold tracking-tight text-gray-900 md:text-5xl" dir="ltr">
                {formatMoney(growthWalletBalance, locale)}
              </span>
            </div>
          </div>

          <div className="mt-4 flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center md:mt-0">
            <button
              type="button"
              onClick={() => {
                setWalletTxMode('withdrawal')
                setWalletTxOpen(true)
              }}
              className="flex items-center justify-center gap-x-2 rounded-xl border border-gray-200 bg-white px-6 py-3.5 text-sm font-bold text-gray-700 shadow-sm transition-colors hover:bg-gray-50"
            >
              {t('سحب', 'Withdraw')}
            </button>
            <button
              type="button"
              onClick={() => {
                setWalletTxMode('deposit')
                setWalletTxOpen(true)
              }}
              className="flex items-center justify-center gap-x-2 rounded-xl bg-[#2563EB] px-6 py-3.5 text-sm font-bold text-white shadow-sm transition-colors hover:bg-[#1D4ED8]"
            >
              <Plus className="h-5 w-5" aria-hidden />
              {t('إيداع', 'Deposit')}
            </button>
          </div>
        </div>
      </div>

      <div className={cn('flex flex-col gap-8', locale === 'ar' ? 'text-right' : 'text-left')}>
        <div className="rounded-3xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
          <div className="mb-5 flex flex-col gap-4 border-b border-gray-100 pb-5 sm:mb-6 sm:flex-row sm:items-center sm:justify-between sm:pb-6">
            <div className="flex items-center gap-3">
              <span
                className={cn(
                  'inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl sm:h-11 sm:w-11',
                  'bg-teal-50 shadow-inner shadow-white/60 ring-1 ring-slate-900/[0.07]'
                )}
              >
                <Sprout
                  className="h-[1.35rem] w-[1.35rem] text-teal-600 sm:h-6 sm:w-6"
                  strokeWidth={2.35}
                  aria-hidden
                />
              </span>
              <h2 className="text-xl font-bold text-[#1F2937]">{t('صناديق الادخار', 'Savings Funds')}</h2>
            </div>
            <button
              type="button"
              onClick={openNewGoal}
              className="inline-flex w-full shrink-0 items-center justify-center gap-1.5 rounded-full bg-teal-50 px-4 py-2.5 text-sm font-bold text-teal-700 ring-1 ring-teal-200/80 transition-colors hover:bg-teal-100 sm:w-auto"
            >
              <Plus className="h-4 w-4" aria-hidden />
              {t('هدف جديد', 'New Goal')}
            </button>
          </div>

          {goals.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl bg-gray-50 px-6 py-16 text-center">
              <Wallet className="mb-4 h-16 w-16 text-gray-300" aria-hidden />
              <p className="mb-5 font-medium text-gray-500">
                {t('لا توجد أهداف ادخارية مسجلة حالياً.', 'No savings goals registered yet.')}
              </p>
              <button
                type="button"
                onClick={openNewGoal}
                className="rounded-xl border border-gray-200 bg-white px-6 py-2.5 text-sm font-bold text-gray-700 shadow-sm hover:bg-gray-50"
              >
                {t('+ أضف هدفك الأول', '+ Add your first goal')}
              </button>
            </div>
          ) : (
            <ul className="flex flex-col gap-6" role="list">
              {goals.map((g) => {
                const target = Number(g.target_amount)
                const cur = Number(g.current_amount)
                const pct = target > 0 ? Math.min(100, (cur / target) * 100) : 0
                const startD = g.start_date ?? g.created_at.slice(0, 10)
                const endD = g.target_date
                const remaining = Math.max(0, target - cur)
                const goalName = locale === 'ar' ? g.name_ar : g.name_en
                return (
                  <li
                    key={g.id}
                    className="overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white shadow-sm transition-shadow hover:shadow-md"
                  >
                    {/* القسم العلوي: صف بيانات بجدول 7 أعمدة */}
                    <div className="overflow-x-auto border-b border-gray-100">
                      <table className="w-full min-w-[920px] border-collapse text-sm">
                        <thead>
                          <tr className="border-b border-gray-100 bg-gray-50/80 text-xs font-semibold text-gray-500">
                            <th scope="col" className="whitespace-nowrap px-3 py-3 text-start sm:px-4">
                              {t('الاسم', 'Name')}
                            </th>
                            <th scope="col" className="whitespace-nowrap px-3 py-3 text-center sm:px-4">
                              {t('البداية', 'Start')}
                            </th>
                            <th scope="col" className="whitespace-nowrap px-3 py-3 text-center sm:px-4">
                              {t('المبلغ', 'Amount')}
                            </th>
                            <th scope="col" className="whitespace-nowrap px-3 py-3 text-center sm:px-4">
                              {t('الرصيد', 'Balance')}
                            </th>
                            <th scope="col" className="whitespace-nowrap px-3 py-3 text-center sm:px-4">
                              {t('المتبقي', 'Remaining')}
                            </th>
                            <th scope="col" className="whitespace-nowrap px-3 py-3 text-center sm:px-4">
                              {t('الإغلاق', 'Close')}
                            </th>
                            <th scope="col" className="whitespace-nowrap px-3 py-3 text-center sm:px-4">
                              {t('الإجراءات', 'Actions')}
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr className="bg-white transition-colors hover:bg-gray-50/40">
                            <td className="max-w-[200px] px-3 py-4 text-start font-bold text-gray-900 sm:px-4">
                              <span className="line-clamp-2">{goalName || t('بدون اسم', 'Unnamed')}</span>
                            </td>
                            <td
                              className="whitespace-nowrap px-3 py-4 text-center text-gray-600 sm:px-4"
                              dir="ltr"
                            >
                              {formatGregorianDate(parseLocalISODate(startD), locale)}
                            </td>
                            <td
                              className="whitespace-nowrap px-3 py-4 text-center font-semibold text-gray-900 sm:px-4"
                              dir="ltr"
                            >
                              {formatMoney(target, locale)}
                            </td>
                            <td
                              className="whitespace-nowrap px-3 py-4 text-center font-semibold text-gray-800 sm:px-4"
                              dir="ltr"
                            >
                              {formatMoney(cur, locale)}
                            </td>
                            <td
                              className="whitespace-nowrap px-3 py-4 text-center font-bold text-[#D97706] sm:px-4"
                              dir="ltr"
                            >
                              {formatMoney(remaining, locale)}
                            </td>
                            <td
                              className="whitespace-nowrap px-3 py-4 text-center text-gray-600 sm:px-4"
                              dir="ltr"
                            >
                              {endD ? formatGregorianDate(parseLocalISODate(endD), locale) : '—'}
                            </td>
                            <td className="whitespace-nowrap px-3 py-4 text-center sm:px-4">
                              <div className="flex flex-nowrap items-center justify-center gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => openDeposit(g)}
                                  className="inline-flex shrink-0 items-center gap-1 rounded-lg bg-[#10B981]/15 px-2 py-1.5 text-xs font-bold text-[#059669] hover:bg-[#10B981]/25"
                                >
                                  <ArrowDownLeft className="h-3.5 w-3.5" aria-hidden />
                                  {t('إيداع', 'Deposit')}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => openWithdraw(g)}
                                  disabled={cur <= 0.0001}
                                  className="inline-flex shrink-0 items-center gap-1 rounded-lg border border-[#E5E7EB] bg-white px-2 py-1.5 text-xs font-bold text-[#374151] hover:bg-gray-50 disabled:opacity-40"
                                >
                                  <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
                                  {t('سحب', 'Withdraw')}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => openEditGoal(g)}
                                  className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-gray-200 text-[#2563EB] transition-colors hover:bg-blue-50"
                                  title={t('تعديل', 'Edit')}
                                  aria-label={t('تعديل', 'Edit')}
                                >
                                  <Pencil className="h-4 w-4" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDelete(g)}
                                  disabled={deletingId === g.id}
                                  className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-gray-200 text-red-600 transition-colors hover:bg-red-50 disabled:opacity-50"
                                  title={t('حذف', 'Delete')}
                                  aria-label={t('حذف', 'Delete')}
                                >
                                  {deletingId === g.id ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <Trash2 className="h-4 w-4" />
                                  )}
                                </button>
                              </div>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    {/* القسم السفلي: التقدم والنسبة والمؤشر */}
                    <div className="bg-gray-50/40 px-4 py-4 sm:px-5 sm:py-5">
                      <div className="mb-3 flex items-center justify-between gap-3">
                        <span className="text-sm font-bold text-gray-800">
                          {t('التقدم', 'Progress')}
                        </span>
                        <span
                          dir="ltr"
                          className="text-lg font-extrabold tabular-nums tracking-tight text-gray-900"
                        >
                          {pct.toFixed(0)}%
                        </span>
                      </div>
                      <div
                        className="h-4 overflow-hidden rounded-full bg-gray-200/90 ring-1 ring-inset ring-gray-300/60 sm:h-5"
                        dir="ltr"
                        role="progressbar"
                        aria-valuenow={Math.round(pct)}
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-label={t('التقدم', 'Progress')}
                      >
                        <div
                          className={cn(
                            'h-full rounded-full bg-[#2563EB] shadow-[inset_0_1px_0_rgba(255,255,255,0.25)] transition-all duration-300',
                            pct >= 100 && 'bg-[#10B981]',
                            pct > 0 && pct < 100 && 'min-w-[12px]'
                          )}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      </div>
        </div>
      )}

      <SavingsGoalFormModal
        open={formOpen}
        onClose={() => {
          setFormOpen(false)
          setEditingGoal(null)
        }}
        onSaved={() => void fetchGrowthData()}
        edit={editingGoal}
      />

      <SavingsTransactionModal
        open={txOpen}
        onClose={() => {
          setTxOpen(false)
          setTxGoal(null)
        }}
        onSaved={() => void fetchGrowthData()}
        goal={txGoal}
        mode={txMode}
        periodStart={periodDates.start}
        periodEnd={periodDates.end}
      />

      <GrowthWalletTransactionModal
        open={walletTxOpen}
        onClose={() => setWalletTxOpen(false)}
        onSaved={() => void fetchGrowthData()}
        mode={walletTxMode}
      />
    </div>
  )
}