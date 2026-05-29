'use client'

import { useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

function AuthConfirm() {
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    async function handleAuth() {
      const code = searchParams.get('code')
      const next = searchParams.get('next') ?? '/'

      if (!code) {
        router.push('/login?error=nocode')
        return
      }

      try {
        // Importa o cliente Supabase dinamicamente
        const { createClient } = await import('@/lib/supabase')
        const supabase = createClient()

        const { data, error } = await supabase.auth.exchangeCodeForSession(code)

        if (error || !data.user) {
          console.error('Auth error:', error)
          router.push('/login?error=invalid')
          return
        }

        // Cria/atualiza perfil do usuário
        const emailPrefix = data.user.email!.split('@')[0]
        
        const { data: existingUser } = await supabase
          .from('users')
          .select('nickname')
          .eq('id', data.user.id)
          .single()

        if (!existingUser) {
          await supabase.from('users').insert({
            id: data.user.id,
            email: data.user.email!,
            nickname: emailPrefix,
            avatar_emoji: '⭐',
          })
          // Primeiro acesso — vai para onboarding
          router.push('/onboarding')
          return
        }

        // Já tem perfil — vai para home ou próxima página
        const isFirstAccess = existingUser.nickname === emailPrefix
        router.push(isFirstAccess ? '/onboarding' : next)

      } catch (err) {
        console.error('Unexpected error:', err)
        router.push('/login?error=unexpected')
      }
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
      gap: 20,
    }}>
      <div style={{ fontSize: 64 }}>⚽</div>
      <div style={{
        fontFamily: 'Bebas Neue,sans-serif',
        fontSize: 28,
        letterSpacing: 3,
        color: 'var(--gold-light)',
        textAlign: 'center',
      }}>
        Entrando no bolão...
      </div>
      <div style={{
        fontSize: 14,
        color: 'var(--text-muted)',
        textAlign: 'center',
      }}>
        Verificando seu acesso, aguarda!
      </div>
      {/* Loading spinner simples */}
      <div style={{
        width: 32, height: 32,
        border: '3px solid rgba(255,255,255,0.1)',
        borderTop: '3px solid var(--green-glow)',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
      }}/>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </main>
  )
}

export default function AuthConfirmPage() {
  return (
    <Suspense fallback={
      <main style={{
        minHeight: '100vh',
        background: 'var(--dark)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 48,
      }}>
        ⚽
      </main>
    }>
      <AuthConfirm />
    </Suspense>
  )
}
