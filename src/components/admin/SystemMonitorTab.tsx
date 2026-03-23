'use client'

import type { AdminErrorLogRow } from '@/lib/admin/load-admin-dashboard'
import { cn } from '@/lib/utils'
import { Activity, ExternalLink, Server } from 'lucide-react'

export function SystemMonitorTab({
  supabaseConnected,
  errorLogs,
}: {
  supabaseConnected: boolean
  errorLogs: AdminErrorLogRow[]
}) {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-lg font-bold text-slate-900">مراقبة النظام</h2>
        <p className="mt-1 text-sm text-muted">حالة الاتصال وسجل الأخطاء وروابط خارجية.</p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div
          className={cn(
            'rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm',
            'ring-1 ring-slate-900/[0.04]',
            'bg-gradient-to-br from-white to-slate-50/90'
          )}
        >
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand/10 text-brand">
              <Activity className="h-6 w-6" strokeWidth={2.2} />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-800">حالة الاتصال بـ Supabase</p>
              <p className="mt-1 text-lg font-bold">
                {supabaseConnected ? (
                  <span className="text-emerald-600">متصل 🟢</span>
                ) : (
                  <span className="text-red-600">غير متصل 🔴</span>
                )}
              </p>
              <p className="mt-1 text-xs text-muted">استعلام ping خفيف على جدول profiles.</p>
            </div>
          </div>
        </div>

        <div
          className={cn(
            'rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm',
            'ring-1 ring-slate-900/[0.04]',
            'bg-gradient-to-br from-white to-brand/[0.04]'
          )}
        >
          <div className="mb-4 flex items-center gap-2">
            <Server className="h-5 w-5 text-brand" />
            <p className="text-sm font-semibold text-slate-800">روابط خارجية (وهمية)</p>
          </div>
          <ul className="space-y-2 text-sm">
            <li>
              <a
                href="#"
                onClick={(e) => e.preventDefault()}
                className="inline-flex items-center gap-1.5 font-medium text-brand hover:underline"
              >
                لوحة تحكم Supabase — مشروع الإنتاج
                <ExternalLink className="h-3.5 w-3.5 opacity-70" />
              </a>
            </li>
            <li>
              <a
                href="#"
                onClick={(e) => e.preventDefault()}
                className="inline-flex items-center gap-1.5 font-medium text-brand hover:underline"
              >
                SQL Editor — Supabase
                <ExternalLink className="h-3.5 w-3.5 opacity-70" />
              </a>
            </li>
            <li>
              <a
                href="#"
                onClick={(e) => e.preventDefault()}
                className="inline-flex items-center gap-1.5 font-medium text-brand hover:underline"
              >
                Authentication — المستخدمون
                <ExternalLink className="h-3.5 w-3.5 opacity-70" />
              </a>
            </li>
          </ul>
          <p className="mt-3 text-xs text-muted">الروابط معطّلة مؤقتاً؛ استبدلها لاحقاً بعناوين حقيقية.</p>
        </div>
      </div>

      <div>
        <h3 className="mb-3 text-sm font-bold text-slate-900">سجل الأخطاء</h3>
        <div className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-sm ring-1 ring-slate-900/[0.04]">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-sm">
              <thead>
                <tr className="border-b border-border bg-slate-50/90 text-start text-xs font-semibold uppercase tracking-wide text-muted">
                  <th className="px-4 py-3">الوقت</th>
                  <th className="px-4 py-3">الرسالة</th>
                  <th className="px-4 py-3">المستخدم</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {errorLogs.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-4 py-10 text-center text-muted">
                      لا توجد سجلات أخطاء بعد.
                    </td>
                  </tr>
                ) : (
                  errorLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-surface/50">
                      <td className="whitespace-nowrap px-4 py-3 text-muted tabular-nums" dir="ltr">
                        {new Date(log.created_at).toLocaleString('ar-SA', {
                          dateStyle: 'short',
                          timeStyle: 'medium',
                        })}
                      </td>
                      <td className="max-w-md px-4 py-3 text-slate-800">
                        <span className="line-clamp-2">{log.message}</span>
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-muted" dir="ltr">
                        {log.user_id ?? '—'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
