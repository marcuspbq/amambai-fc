'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'

const EMOJIS = ['⭐','🏆','🎯','🦁','🐉','🦊','🦅','🔥','⚡','🎲','🏅','👑','🦋','🐺','🎪','🚀']

export default function OnboardingPage() {
  const supabase = createClient()
  const [nickname, setNickname] = useState('')
  const [avatar, setAvatar] = useState('⭐')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadUser() {
      const { data: { user } } = await supabase.auth.getUser()
      if (user?.email) {
        setNickname(user.email.split('@')[0])
      }
    }
    loadUser()
  }, [])

  async function handleSave() {
    if (!nickname.trim() || nickname.length < 2) {
      setError('Apelido precisa ter pelo menos 2 caracteres')
      return
    }
    if (nickname.length > 20) {
      setError('Apelido muito longo — máximo 20 caracteres')
      return
    }

    setLoading(true)
    setError('')

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setLoading(false); return }

    const { error: updateError } = await supabase
      .from('users')
      .update({ nickname: nickname.trim(), avatar_emoji: avatar })
      .eq('id', user.id)

    setLoading(false)

    if (updateError) {
      setError('Erro ao salvar. Tente novamente.')
      return
    }

    window.location.href = '/'
  }

  return (
    <main style={{
      minHeight: '100vh',
      background: 'var(--dark)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '32px 24px',
    }}>

      <div style={{ width: '100%', maxWidth: 400 }}>

        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontSize: 56, marginBottom: 12 }}>{avatar}</div>
          <div style={{
            fontFamily: 'Bebas Neue,sans-serif',
            fontSize: 32,
            letterSpacing: 3,
            color: 'var(--white)',
          }}>
            Bem-vindo ao Bolão!
          </div>
          <div style={{ fontSize: 14, color: 'var(--text-muted)', marginTop: 6 }}>
            Escolha como quer aparecer no ranking
          </div>
        </div>

        <div style={{
          background: 'var(--surface)',
          border: '1px solid rgba(200,146,42,0.2)',
          borderRadius: 20,
          padding: 24,
          display: 'flex',
          flexDirection: 'column',
          gap: 20,
        }}>

          {/* APELIDO */}
          <div>
            <label style={{
              fontFamily: 'Barlow Condensed,sans-serif',
              fontSize: 11,
              letterSpacing: 2,
              textTransform: 'uppercase',
              color: 'var(--text-muted)',
              display: 'block',
              marginBottom: 8,
            }}>
              Seu Apelido no Ranking
            </label>
            <input
              type="text"
              value={nickname}
              onChange={e => { setNickname(e.target.value); setError('') }}
              maxLength={20}
              placeholder="Como quer ser chamado?"
              style={{
                width: '100%',
                background: 'var(--dark)',
                border: error ? '1px solid #e74c3c' : '1px solid rgba(255,255,255,0.12)',
                borderRadius: 12,
                padding: '14px 16px',
                fontSize: 16,
                color: 'var(--white)',
                outline: 'none',
                fontFamily: 'Barlow,sans-serif',
              }}
            />
            {error && (
              <div style={{ fontSize: 13, color: '#e74c3c', marginTop: 6 }}>{error}</div>
            )}
          </div>

          {/* AVATAR EMOJI */}
          <div>
            <label style={{
              fontFamily: 'Barlow Condensed,sans-serif',
              fontSize: 11,
              letterSpacing: 2,
              textTransform: 'uppercase',
              color: 'var(--text-muted)',
              display: 'block',
              marginBottom: 8,
            }}>
              Escolha seu Avatar
            </label>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(8, 1fr)',
              gap: 8,
            }}>
              {EMOJIS.map(emoji => (
                <button
                  key={emoji}
                  onClick={() => setAvatar(emoji)}
                  style={{
                    background: avatar === emoji ? 'rgba(200,146,42,0.2)' : 'var(--dark)',
                    border: avatar === emoji ? '2px solid var(--gold-light)' : '1px solid rgba(255,255,255,0.08)',
                    borderRadius: 10,
                    padding: '8px 4px',
                    fontSize: 22,
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                    lineHeight: 1,
                  }}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          {/* PREVIEW */}
          <div style={{
            background: 'var(--surface2)',
            border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: 12,
            padding: '12px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: 12,
          }}>
            <span style={{ fontSize: 28 }}>{avatar}</span>
            <div>
              <div style={{
                fontFamily: 'Barlow Condensed,sans-serif',
                fontWeight: 700,
                fontSize: 17,
                color: 'var(--white)',
              }}>
                {nickname || 'Seu apelido'}
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                É assim que você vai aparecer no ranking
              </div>
            </div>
          </div>

          <button
            onClick={handleSave}
            disabled={loading}
            style={{
              width: '100%',
              background: loading ? 'rgba(26,122,46,0.5)' : 'var(--green)',
              border: 'none',
              borderRadius: 12,
              padding: '14px',
              fontFamily: 'Barlow Condensed,sans-serif',
              fontWeight: 700,
              fontSize: 16,
              letterSpacing: 2,
              textTransform: 'uppercase',
              color: 'var(--white)',
              cursor: loading ? 'not-allowed' : 'pointer',
            }}
          >
            {loading ? 'Salvando...' : 'Entrar no Bolão →'}
          </button>
        </div>

        <div style={{
          marginTop: 24,
          textAlign: 'center',
          fontSize: 12,
          color: 'rgba(122,158,126,0.4)',
          fontFamily: 'Barlow Condensed,sans-serif',
          letterSpacing: 1,
        }}>
          PRAÇA AMAMBAÍ F.C. · MEIER · 1993
        </div>
      </div>
    </main>
  )
}
