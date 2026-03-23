import { AdminTabs } from '@/components/admin/AdminTabs'
import { loadAdminDashboardPayload } from '@/lib/admin/load-admin-dashboard'

export default async function AdminPage() {
  let loadError: string | null = null
  let payload: Awaited<ReturnType<typeof loadAdminDashboardPayload>> | null = null

  try {
    payload = await loadAdminDashboardPayload()
  } catch (e) {
    loadError = e instanceof Error ? e.message : String(e)
  }

  if (loadError) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50/80 px-6 py-8 text-center shadow-sm">
        <h2 className="text-lg font-bold text-red-900">تعذر تحميل لوحة الإدارة</h2>
        <p className="mt-2 text-sm text-red-800/90">
          تأكد من تعيين <code className="rounded bg-red-100 px-1.5 py-0.5 text-xs">SUPABASE_SERVICE_ROLE_KEY</code> في
          البيئة، وتطبيق ملف الهجرة{' '}
          <code className="rounded bg-red-100 px-1.5 py-0.5 text-xs">006_admin_profiles_and_error_logs.sql</code> على
          قاعدة البيانات.
        </p>
        <p className="mt-4 font-mono text-xs text-red-700/80 break-all" dir="ltr">
          {loadError}
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <header className="rounded-2xl border border-slate-200/90 bg-gradient-to-l from-brand/[0.08] via-white to-white px-6 py-5 shadow-sm ring-1 ring-slate-900/[0.04] sm:px-8">
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
          لوحة تحكم الإدارة — بلانورا
        </h1>
        <p className="mt-1 text-sm text-muted sm:text-base">
          إدارة المستخدمين، الإحصاءات، ومراقبة النظام. البيانات تُجلب على الخادم فقط عبر مفتاح الخدمة.
        </p>
      </header>
      {payload ? <AdminTabs {...payload} /> : null}
    </div>
  )
}
