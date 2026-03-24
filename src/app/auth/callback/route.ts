import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

function sanitizeNextPath(nextRaw: string | null): string {
  if (!nextRaw) return '/hub'
  if (!nextRaw.startsWith('/')) return '/hub'
  if (nextRaw.startsWith('//')) return '/hub'
  return nextRaw
}

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const next = sanitizeNextPath(requestUrl.searchParams.get('next'))

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      return NextResponse.redirect(`${requestUrl.origin}${next}`)
    }
  }

  return NextResponse.redirect(`${requestUrl.origin}/login?error=Invalid_recovery_code`)
}
