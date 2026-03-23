import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  if (user.user_metadata?.role !== 'admin') {
    redirect('/dashboard')
  }

  return (
    <div className="min-h-screen bg-surface">
      <div className="mx-auto flex min-h-screen max-w-[1200px]">
        <aside className="hidden w-64 flex-col border-e border-border bg-white p-4 lg:flex">
          <div className="mb-6 rounded-xl border border-brand/20 bg-brand/5 px-4 py-3">
            <p className="text-sm font-semibold text-brand">Admin</p>
            <p className="text-xs text-muted">Planora Control</p>
          </div>

          <nav className="space-y-1">
            <Link
              href="/admin"
              className="block rounded-xl bg-brand/10 px-3 py-2 text-sm font-semibold text-brand"
            >
              لوحة التحكم
            </Link>
            <Link
              href="/dashboard"
              className="block rounded-xl px-3 py-2 text-sm font-medium text-slate-700 hover:bg-surface"
            >
              الرجوع لتطبيق المستخدم
            </Link>
          </nav>
        </aside>

        <main className="flex-1 p-4 lg:p-6">{children}</main>
      </div>
    </div>
  )
}
