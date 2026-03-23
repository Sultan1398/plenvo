import type { AdminDashboardStats } from '@/lib/admin/load-admin-dashboard'
import type { LucideIcon } from 'lucide-react'
import { BarChart3, Layers, Monitor, Smartphone, Tablet, Users } from 'lucide-react'
import { cn } from '@/lib/utils'

function StatCard({
  label,
  value,
  sub,
  icon: Icon,
  accent,
}: {
  label: string
  value: number | string
  sub?: string
  icon: LucideIcon
  accent: string
}) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm',
        'ring-1 ring-slate-900/[0.04]',
        'bg-gradient-to-br from-white to-slate-50/80'
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-muted">{label}</p>
          <p className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900 tabular-nums">{value}</p>
          {sub ? <p className="mt-1 text-xs text-muted">{sub}</p> : null}
        </div>
        <div
          className={cn(
            'flex h-11 w-11 shrink-0 items-center justify-center rounded-xl shadow-sm',
            accent
          )}
        >
          <Icon className="h-5 w-5" strokeWidth={2.2} />
        </div>
      </div>
    </div>
  )
}

export function DashboardTab({ stats }: { stats: AdminDashboardStats }) {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-lg font-bold text-slate-900">لوحة القيادة</h2>
        <p className="mt-1 text-sm text-muted">نظرة سريعة على المستخدمين والمنصات وحجم العمليات.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="إجمالي المستخدمين"
          value={stats.totalUsers}
          sub="من جدول profiles"
          icon={Users}
          accent="bg-brand/15 text-brand ring-1 ring-brand/20"
        />
        <StatCard
          label="استخدام الويب"
          value={stats.usedWeb}
          sub="used_web = true"
          icon={Monitor}
          accent="bg-sky-100 text-sky-700 ring-1 ring-sky-200/80"
        />
        <StatCard
          label="استخدام أندرويد"
          value={stats.usedAndroid}
          sub="used_android = true"
          icon={Smartphone}
          accent="bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200/80"
        />
        <StatCard
          label="استخدام iOS"
          value={stats.usedIos}
          sub="used_ios = true"
          icon={Tablet}
          accent="bg-violet-100 text-violet-700 ring-1 ring-violet-200/80"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <StatCard
          label="إجمالي العمليات"
          value={stats.totalOperations}
          sub="مجموع صفوف الجداول المالية الأربعة"
          icon={Layers}
          accent="bg-amber-100 text-amber-800 ring-1 ring-amber-200/80"
        />
        <div
          className={cn(
            'rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm',
            'ring-1 ring-slate-900/[0.04]',
            'bg-gradient-to-br from-white to-brand/[0.03]'
          )}
        >
          <div className="mb-4 flex items-center justify-between gap-2">
            <div>
              <p className="text-sm font-medium text-muted">تفصيل العمليات</p>
              <p className="mt-1 text-xs text-muted">inflows · outflows · obligations · investments</p>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand/10 text-brand ring-1 ring-brand/15">
              <BarChart3 className="h-5 w-5" strokeWidth={2.2} />
            </div>
          </div>
          <dl className="grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-xl border border-border bg-surface/60 px-3 py-2">
              <dt className="text-muted">الدخل</dt>
              <dd className="text-lg font-bold text-slate-900 tabular-nums">{stats.inflowsCount}</dd>
            </div>
            <div className="rounded-xl border border-border bg-surface/60 px-3 py-2">
              <dt className="text-muted">المصروف</dt>
              <dd className="text-lg font-bold text-slate-900 tabular-nums">{stats.outflowsCount}</dd>
            </div>
            <div className="rounded-xl border border-border bg-surface/60 px-3 py-2">
              <dt className="text-muted">الالتزامات</dt>
              <dd className="text-lg font-bold text-slate-900 tabular-nums">{stats.obligationsCount}</dd>
            </div>
            <div className="rounded-xl border border-border bg-surface/60 px-3 py-2">
              <dt className="text-muted">الاستثمارات</dt>
              <dd className="text-lg font-bold text-slate-900 tabular-nums">{stats.investmentsCount}</dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  )
}
