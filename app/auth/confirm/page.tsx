'use client'

import { useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter, useSearchParams } from 'next/navigation'

export default function AuthConfirmPage() {
  const supabase = createClient()
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    async function handleAuth() {
      const code = searchParams.get('code')
      const next = searchParams.get('next') ?? '/'

      if (!code) {
        router.push('/login?error=auth')
        return
      }

      const { data, error } = await supabase.auth.exchangeCodeForSession(code)

      if (error || !data.user) {
        router.push('/login?error=auth')
        return
      }

      // Cria perfil se não existir
      await supabase.from('users').upsert({
        id: data.user.id,
        email: data.user.email!,
        nickname: data.user.email!.split('@')[0],
        avatar_emoji: '⭐',
      }, { onConflict: 'id' })

      // Verifica se já tem nickname personalizado
      const { data: profile } = await supabase
        .from('users')
        .select('nickname')
        .eq('id', data.user.id)
        .single()

      const isFirstAccess = profile?.nickname === data.user.email!.split('@')[0]

      router.push(isFirstAccess ? '/onboarding' : next)
    }

    handleAuth()
  }, [])

  return (
    <main style={{
      minHeight: '100vh',
      background: 'var(--dark)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 16,
    }}>
      <div style={{ fontSize: 48 }}>⚽</div>
      <div style={{
        fontFamily: 'Bebas Neue,sans-serif',
        fontSize: 24,
        letterSpacing: 3,
        color: 'var(--gold-light)',
      }}>
        Entrando no bolão...
      </div>
      <div style={{ fontSize: 14, color: 'var(--text-muted)' }}>
        Aguarda um segundo!
      </div>
    </main>
  )
}
