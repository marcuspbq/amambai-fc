// ─────────────────────────────────────────────────
// Amambaí F.C. — Auth Callback
// O Supabase redireciona aqui após o clique no Magic Link
// ─────────────────────────────────────────────────

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

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
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          },
        },
      }
    )

    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error && data.user) {
      // Cria perfil do usuário se não existir ainda
      await supabase.from('users').upsert({
        id: data.user.id,
        email: data.user.email!,
        nickname: data.user.email!.split('@')[0], // nickname padrão = parte antes do @
        avatar_emoji: '⭐',
      }, { onConflict: 'id' })

      // Redireciona para onboarding se for primeiro acesso
      const { data: profile } = await supabase
        .from('users')
        .select('nickname')
        .eq('id', data.user.id)
        .single()

      // Se nickname ainda é o email (nunca customizou), vai para onboarding
      const isFirstAccess = profile?.nickname === data.user.email!.split('@')[0]
      const redirectTo = isFirstAccess ? '/onboarding' : next

      return NextResponse.redirect(new URL(redirectTo, request.url))
    }
  }

  // Erro — redireciona para login com mensagem
  return NextResponse.redirect(new URL('/login?error=auth', request.url))
}
