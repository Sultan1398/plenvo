'use client'

import { useState } from 'react'
import type { AdminDashboardPayload } from '@/lib/admin/load-admin-dashboard'
import { cn } from '@/lib/utils'
import { DashboardTab } from '@/components/admin/DashboardTab'
import { UsersManagementTab } from '@/components/admin/UsersManagementTab'
import { SystemMonitorTab } from '@/components/admin/SystemMonitorTab'
import { LayoutDashboard, MonitorCog, Users } from 'lucide-react'

type TabId = 'dashboard' | 'users' | 'system'

const tabs: { id: TabId; label: string; icon: typeof LayoutDashboard }[] = [
  { id: 'dashboard', label: 'لوحة القيادة', icon: LayoutDashboard },
  { id: 'users', label: 'إدارة المستخدمين', icon: Users },
  { id: 'system', label: 'مراقبة النظام', icon: MonitorCog },
]

export function AdminTabs({ stats, users, errorLogs, supabaseConnected }: AdminDashboardPayload) {
  const [active, setActive] = useState<TabId>('dashboard')

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-200/90 bg-white p-2 shadow-sm ring-1 ring-slate-900/[0.04] sm:p-1.5">
        <div
          className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-2"
          role="tablist"
          aria-label="أقسام لوحة الإدارة"
        >
          {tabs.map(({ id, label, icon: Icon }) => {
            const isActive = active === id
            return (
              <button
                key={id}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => setActive(id)}
                className={cn(
                  'flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition-all',
                  isActive
                    ? 'bg-gradient-to-b from-brand to-brand-dark text-white shadow-md shadow-brand/25'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                )}
              >
                <Icon className="h-4 w-4 shrink-0 opacity-90" strokeWidth={2.25} />
                {label}
              </button>
            )
          })}
        </div>
      </div>

      <div
        role="tabpanel"
        className={cn(
          'rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm sm:p-8',
          'ring-1 ring-slate-900/[0.04]',
          'bg-gradient-to-b from-white via-white to-brand/[0.02]'
        )}
      >
        {active === 'dashboard' ? <DashboardTab stats={stats} /> : null}
        {active === 'users' ? <UsersManagementTab users={users} /> : null}
        {active === 'system' ? (
          <SystemMonitorTab supabaseConnected={supabaseConnected} errorLogs={errorLogs} />
        ) : null}
      </div>
    </div>
  )
}
