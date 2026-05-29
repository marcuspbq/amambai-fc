import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

type CookieToSet = {
  name: string
  value: string
  options?: Record<string, unknown>
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'

  if (code) {
    const cookieStore = cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return cookieStore.getAll() },
          setAll(cookiesToSet: CookieToSet[]) {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options as Record<string, unknown>)
            )
          },
        },
      }
    )

    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error && data.user) {
      await supabase.from('users').upsert({
        id: data.user.id,
        email: data.user.email!,
        nickname: data.user.email!.split('@')[0],
        avatar_emoji: '⭐',
      }, { onConflict: 'id' })

      const { data: profile } = await supabase
        .from('users')
        .select('nickname')
        .eq('id', data.user.id)
        .single()

      const isFirstAccess = profile?.nickname === data.user.email!.split('@')[0]
      const redirectTo = isFirstAccess ? '/onboarding' : next

      return NextResponse.redirect(new URL(redirectTo, request.url))
    }
  }

  return NextResponse.redirect(new URL('/login?error=auth', request.url))
}
