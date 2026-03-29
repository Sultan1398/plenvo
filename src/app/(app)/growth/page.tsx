'use client'

import { useCallback, useEffect, useState } from 'react'
import {
  ArrowLeft,
  DownloadCloud,
  Pencil,
  Plus,
  Trash2,
  UploadCloud,
} from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'
import { usePeriod } from '@/contexts/PeriodContext'
import { PageHeader } from '@/components/layout/PageHeader'
import { PeriodNavigator } from '@/components/layout/PeriodNavigator'
import { getAppNavItem } from '@/config/navigation'
import { createClient } from '@/lib/supabase/client'
import { formatMoney } from '@/lib/format-money'
import type { FixedAsset, FixedDeposit, SavingsGoal } from '@/types/database'
import { useAvailableCash } from '@/hooks/useAvailableCash'
import { cn } from '@/lib/utils'

const growthNav = getAppNavItem('/growth')

type SavingsGoalRow = Pick<SavingsGoal, 'id' | 'name_ar' | 'name_en' | 'current_amount' | 'target_amount'>

export default function GrowthPage() {
  const { t, locale } = useLanguage()
  const { periodKey, periodDates, startDay } = usePeriod()
  const [loading, setLoading] = useState(true)
  const [savingsFunds, setSavingsFunds] = useState<SavingsGoalRow[]>([])
  const [fixedDeposits, setFixedDeposits] = useState<FixedDeposit[]>([])
  const [fixedAssets, setFixedAssets] = useState<FixedAsset[]>([])
  const [fetchError, setFetchError] = useState('')

  const { availableCash, loading: cashLoading, error: cashError, reload: reloadCash } = useAvailableCash({
    periodKey,
    periodDates,
    startDay,
  })

  const goalLabel = useCallback(
    (g: SavingsGoalRow) => (locale === 'ar' ? g.name_ar : g.name_en),
    [locale]
  )

  const namedLabel = useCallback(
    (nameAr: string, nameEn: string) => (locale === 'ar' ? nameAr : nameEn),
    [locale]
  )

  const fetchGrowthData = useCallback(async () => {
    try {
      setLoading(true)
      setFetchError('')
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        setSavingsFunds([])
        setFixedDeposits([])
        setFixedAssets([])
        return
      }

      const uid = user.id

      const [savingsRes, depositsRes, assetsRes] = await Promise.all([
        supabase
          .from('savings_goals')
          .select('id, name_ar, name_en, current_amount, target_amount')
          .eq('user_id', uid)
          .order('created_at', { ascending: false }),
        supabase
          .from('fixed_deposits')
          .select('id, name_ar, name_en, amount, roi_percentage, due_date, status, created_at')
          .eq('user_id', uid)
          .eq('status', 'active')
          .order('created_at', { ascending: false }),
        supabase
          .from('fixed_assets')
          .select('id, name_ar, name_en, estimated_value, asset_type, created_at')
          .eq('user_id', uid)
          .order('created_at', { ascending: false }),
      ])

      if (savingsRes.error) throw savingsRes.error
      if (depositsRes.error) throw depositsRes.error
      if (assetsRes.error) throw assetsRes.error

      setSavingsFunds((savingsRes.data as SavingsGoalRow[] | null) ?? [])
      setFixedDeposits((depositsRes.data as FixedDeposit[] | null) ?? [])
      setFixedAssets((assetsRes.data as FixedAsset[] | null) ?? [])
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      console.error('Error fetching growth data:', msg)
      setFetchError(msg)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void fetchGrowthData()
  }, [fetchGrowthData])

  useEffect(() => {
    void reloadCash()
  }, [reloadCash, periodKey])

  if (loading) {
    return (
      <div className="flex min-h-[60vh] flex-1 items-center justify-center bg-[#F9FAFB]">
        <div className="animate-pulse text-xl font-bold text-[#2563EB]">
          {t('جاري تحميل بيانات النمو...', 'Loading growth data...')}
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-6xl px-4 pb-10 pt-2 lg:px-6 lg:pb-12">
      <PageHeader
        nav={growthNav}
        subtitle={t('أهداف ادخار، ودائع، وأصول ثابتة', 'Savings goals, deposits, and fixed assets')}
        actions={
          <div className="flex flex-wrap items-center justify-end gap-2">
            <PeriodNavigator />
          </div>
        }
      />

      <div
        className={cn(
          'min-h-[calc(100vh-8rem)] rounded-3xl border border-[#E5E7EB] bg-[#F9FAFB] p-6 text-[#1F2937] md:p-10',
          locale === 'ar' ? 'text-right' : 'text-left'
        )}
      >
        {fetchError || cashError ? (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {[fetchError, cashError].filter(Boolean).join(' · ')}
          </div>
        ) : null}

        {/* الترويسة */}
        <div className="mb-10 flex flex-col gap-4 border-b border-[#E5E7EB] pb-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-x-2">
              <DownloadCloud className="h-8 w-8 shrink-0 text-[#F59E0B]" aria-hidden />
              <h1 className="text-3xl font-bold text-[#1F2937] md:text-4xl">
                {t('النمو', 'Growth')}
              </h1>
            </div>
            <p className="mt-1 text-sm text-[#6B7280]">
              {t(
                'إدارة الأهداف الادخارية، الودائع، والأصول الثابتة.',
                'Manage savings goals, deposits, and fixed assets.'
              )}
            </p>
          </div>
          <button
            type="button"
            className="flex items-center gap-x-2 rounded-full bg-[#2563EB] px-5 py-2.5 text-sm font-bold text-white shadow-sm transition-colors hover:bg-[#1D4ED8] md:mt-0"
          >
            <Plus className="h-5 w-5" aria-hidden />
            {t('+ أصل جديد', '+ New asset')}
          </button>
        </div>

        {/* السيولة */}
        <div className="mb-12 rounded-3xl border border-[#E5E7EB] bg-white p-6 shadow-sm">
          <div className="mb-2 flex items-center justify-between gap-x-3">
            <p className="text-sm font-medium text-[#6B7280]">
              {t('السيولة المتاحة في الفترة', 'Available liquidity this period')}
            </p>
            <button
              type="button"
              className="flex cursor-pointer items-center gap-x-2 rounded border border-[#E5E7EB] bg-white px-2 py-0.5 hover:bg-gray-50"
            >
              <UploadCloud className="h-4 w-4 text-[#F59E0B]" aria-hidden />
              <span className="text-xs font-bold text-[#F59E0B]">{t('+ إضافة', '+ Add')}</span>
            </button>
          </div>
          <h2 className="text-4xl font-bold text-[#2563EB] tabular-nums md:text-5xl" dir="ltr">
            {cashLoading || availableCash == null
              ? '—'
              : `${formatMoney(availableCash, locale)} ${t('ر.س', 'SAR')}`}
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-10 xl:grid-cols-2">
          {/* صناديق الادخار */}
          <div className="h-fit rounded-3xl border border-[#E5E7EB] bg-white p-6 shadow-sm md:p-8">
            <div className="mb-8 flex items-center justify-between border-b border-[#E5E7EB] pb-3">
              <div className="flex items-center gap-x-2">
                <DownloadCloud className="h-6 w-6 text-[#F59E0B]" aria-hidden />
                <h3 className="text-xl font-bold text-[#1F2937] md:text-2xl">
                  {t('صناديق الادخار', 'Savings funds')}
                </h3>
              </div>
            </div>

            <div className="flex flex-col gap-y-6">
              {savingsFunds.length === 0 ? (
                <p className="py-4 text-center text-[#6B7280]">
                  {t('لا توجد أهداف ادخارية حالياً.', 'No savings goals yet.')}
                </p>
              ) : (
                savingsFunds.map((fund) => {
                  const progress =
                    fund.target_amount > 0 ? (fund.current_amount / fund.target_amount) * 100 : 0
                  return (
                    <div key={fund.id} className="rounded-2xl border border-[#E5E7EB] bg-[#F9FAFB] p-6">
                      <div className="mb-3 flex items-center justify-between">
                        <h4 className="text-start text-lg font-bold text-[#1F2937]">{goalLabel(fund)}</h4>
                        <div className="flex items-center gap-x-2">
                          <Pencil className="h-4 w-4 cursor-pointer text-[#6B7280] hover:text-[#2563EB]" aria-hidden />
                          <Trash2 className="h-4 w-4 cursor-pointer text-[#EF4444] hover:text-red-700" aria-hidden />
                        </div>
                      </div>

                      <div className="mb-3 h-2 w-full rounded-full bg-[#E5E7EB]">
                        <div
                          className="h-full rounded-full bg-[#2563EB]"
                          style={{ width: `${Math.min(progress, 100)}%` }}
                        />
                      </div>

                      <div className="flex items-center justify-between text-xs text-[#6B7280]">
                        <span dir="ltr">
                          {t('رصيد:', 'Balance:')}{' '}
                          {formatMoney(Number(fund.current_amount), locale)} {t('ر.س', 'SAR')}
                        </span>
                        <span dir="ltr">
                          {t('هدف:', 'Target:')}{' '}
                          {formatMoney(Number(fund.target_amount), locale)} {t('ر.س', 'SAR')}
                        </span>
                      </div>

                      <div className="mt-4 flex flex-col gap-3 border-t border-[#E5E7EB] pt-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex cursor-pointer items-center gap-x-1.5 text-xs text-[#6B7280] hover:text-[#2563EB]">
                          <Pencil className="h-3.5 w-3.5 text-[#2563EB]" aria-hidden />
                          {t('تحديث الرصيد', 'Update balance')}
                        </div>
                        <div className="flex gap-x-2">
                          <button
                            type="button"
                            className="rounded border border-[#EF4444]/20 bg-[#EF4444]/10 px-3 py-1.5 text-xs font-bold text-[#EF4444] hover:bg-[#EF4444]/20"
                          >
                            {t('سحب', 'Withdraw')}
                          </button>
                          <button
                            type="button"
                            className="rounded border border-[#10B981]/20 bg-[#10B981]/10 px-3 py-1.5 text-xs font-bold text-[#10B981] hover:bg-[#10B981]/20"
                          >
                            {t('إيداع', 'Deposit')}
                          </button>
                        </div>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>

          <div className="flex flex-col gap-y-10">
            {/* الودائع */}
            <div className="rounded-3xl border border-[#E5E7EB] bg-white p-6 shadow-sm md:p-8">
              <div className="mb-8 flex items-center justify-between border-b border-[#E5E7EB] pb-3">
                <div className="flex items-center gap-x-2">
                  <DownloadCloud className="h-6 w-6 text-[#F59E0B]" aria-hidden />
                  <h3 className="text-xl font-bold text-[#1F2937] md:text-2xl">
                    {t('الودائع والعوائد الثابتة', 'Fixed deposits & returns')}
                  </h3>
                </div>
              </div>

              <div className="flex flex-col gap-y-4">
                {fixedDeposits.length === 0 ? (
                  <p className="py-4 text-center text-[#6B7280]">
                    {t('لا توجد ودائع حالياً.', 'No deposits yet.')}
                  </p>
                ) : (
                  fixedDeposits.map((deposit) => (
                    <div key={deposit.id} className="rounded-2xl border border-[#E5E7EB] bg-[#F9FAFB] p-6">
                      <h4 className="mb-2 text-start text-lg font-bold text-[#1F2937]">
                        {namedLabel(deposit.name_ar, deposit.name_en)}
                      </h4>
                      <div className="flex flex-col gap-2 text-sm text-[#6B7280] sm:flex-row sm:items-center sm:justify-between">
                        <p dir="ltr">
                          {t('المبلغ:', 'Amount:')}{' '}
                          <span className="font-medium text-[#1F2937]">
                            {formatMoney(Number(deposit.amount), locale)} {t('ر.س', 'SAR')}
                          </span>
                        </p>
                        <div className="flex items-center gap-x-2 rounded bg-[#10B981]/10 px-2.5 py-1 text-xs font-bold text-[#10B981]">
                          <ArrowLeft className="h-3.5 w-3.5 rotate-[-135deg]" aria-hidden />
                          {t('العائد السنوي:', 'Annual yield:')} {Number(deposit.roi_percentage)}%
                        </div>
                      </div>
                      <p className="mt-3 border-t border-[#E5E7EB] pt-2 text-start text-xs text-[#6B7280]">
                        {t('تاريخ الاستحقاق:', 'Due date:')}{' '}
                        {new Date(deposit.due_date).toLocaleDateString(locale === 'ar' ? 'ar-SA' : 'en-US')}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* الأصول الثابتة */}
            <div className="rounded-3xl border border-[#E5E7EB] bg-white p-6 shadow-sm md:p-8">
              <div className="mb-8 flex items-center justify-between border-b border-[#E5E7EB] pb-3">
                <div className="flex items-center gap-x-2">
                  <DownloadCloud className="h-6 w-6 text-[#F59E0B]" aria-hidden />
                  <h3 className="text-xl font-bold text-[#1F2937] md:text-2xl">
                    {t('الأصول الثابتة', 'Fixed assets')}
                  </h3>
                </div>
              </div>

              <div className="flex flex-col gap-y-4">
                {fixedAssets.length === 0 ? (
                  <p className="py-4 text-center text-[#6B7280]">
                    {t('لا توجد أصول ثابتة حالياً.', 'No fixed assets yet.')}
                  </p>
                ) : (
                  fixedAssets.map((asset) => (
                    <div
                      key={asset.id}
                      className="flex flex-col justify-between gap-y-3 rounded-2xl border border-[#E5E7EB] bg-[#F9FAFB] p-6 sm:flex-row sm:items-center"
                    >
                      <div>
                        <h4 className="text-start text-lg font-bold text-[#1F2937]">
                          {namedLabel(asset.name_ar, asset.name_en)}
                        </h4>
                        <span className="mt-1 inline-block rounded bg-gray-200 px-2 py-0.5 text-xs text-[#6B7280]">
                          {asset.asset_type}
                        </span>
                      </div>
                      <div className="rounded bg-[#E5E7EB] px-3 py-1.5 text-sm font-bold text-[#1F2937] tabular-nums" dir="ltr">
                        {formatMoney(Number(asset.estimated_value), locale)} {t('ر.س', 'SAR')}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
