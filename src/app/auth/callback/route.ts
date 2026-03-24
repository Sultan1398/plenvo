import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import type { Database } from '@/types/database'

function sanitizeNextPath(nextRaw: string | null): string {
  if (!nextRaw) return '/hub'
  if (!nextRaw.startsWith('/')) return '/hub'
  if (nextRaw.startsWith('//')) return '/hub'
  return nextRaw
}

export async function GET(request: NextRequest) {
  const url = request.nextUrl
  const code = url.searchParams.get('code')
  const nextPath = sanitizeNextPath(url.searchParams.get('next'))

  const redirectUrl = url.clone()
  redirectUrl.pathname = nextPath
  redirectUrl.search = ''

  let response = NextResponse.redirect(redirectUrl)

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          response = NextResponse.redirect(redirectUrl)
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  if (code) {
    await supabase.auth.exchangeCodeForSession(code)
  }

  return response
}
