'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase'

function Escudo({ size = 72 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
      <circle cx="50" cy="50" r="48" fill="white" stroke="#1a7a2e" strokeWidth="3"/>
      <g fill="#1a7a2e">
        <ellipse cx="18" cy="38" rx="5" ry="8" transform="rotate(-40 18 38)"/>
        <ellipse cx="13" cy="50" rx="5" ry="8" transform="rotate(-10 13 50)"/>
        <ellipse cx="16" cy="63" rx="5" ry="8" transform="rotate(20 16 63)"/>
        <ellipse cx="24" cy="74" rx="5" ry="7" transform="rotate(40 24 74)"/>
        <ellipse cx="22" cy="26" rx="4" ry="7" transform="rotate(-60 22 26)"/>
      </g>
      <g fill="#1a7a2e">
        <ellipse cx="82" cy="38" rx="5" ry="8" transform="rotate(40 82 38)"/>
        <ellipse cx="87" cy="50" rx="5" ry="8" transform="rotate(10 87 50)"/>
        <ellipse cx="84" cy="63" rx="5" ry="8" transform="rotate(-20 84 63)"/>
        <ellipse cx="76" cy="74" rx="5" ry="7" transform="rotate(-40 76 74)"/>
        <ellipse cx="78" cy="26" rx="4" ry="7" transform="rotate(60 78 26)"/>
      </g>
      <circle cx="50" cy="48" r="22" fill="white" stroke="#222" strokeWidth="1.5"/>
      <polygon points="50,30 60,37 57,50 43,50 40,37" fill="#222"/>
      <polygon points="30,44 40,37 43,50 35,57" fill="#222"/>
      <polygon points="70,44 60,37 57,50 65,57" fill="#222"/>
      <polygon points="43,68 35,57 43,50 57,50 65,57 57,68" fill="#222"/>
      <path id="a1" d="M 20,50 A 30,30 0 0,1 80,50" fill="none"/>
      <path id="a2" d="M 22,58 A 30,30 0 0,0 78,58" fill="none"/>
      <text fontFamily="Arial" fontSize="7.5" fill="#c8922a" fontWeight="bold" letterSpacing="0.5">
        <textPath href="#a1" startOffset="8%">PRAÇA AMAMBAÍ F.C.</textPath>
      </text>
      <text fontFamily="Arial" fontSize="6.5" fill="#c8922a" fontWeight="bold">
        <textPath href="#a2" startOffset="18%">MEIER · 1993</textPath>
      </text>
    </svg>
  )
}

type Step = 'email' | 'sent'

export default function LoginPage() {
  const supabase = createClient()
  const [step, setStep] = useState<Step>('email')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleLogin() {
    if (!email || !email.includes('@')) {
      setError('Digite um email válido')
      return
    }

    setLoading(true)
    setError('')

    const { error: authError } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: 'https://amambai-fc.netlify.app/auth/callback',
      },
    })

    setLoading(false)

    if (authError) {
      setError('Erro ao enviar o link. Tente novamente.')
      return
    }

    setStep('sent')
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

      {/* HEADER */}
      <div style={{ textAlign: 'center', marginBottom: 40 }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
          <Escudo size={80} />
        </div>
        <div style={{
          fontFamily: 'Bebas Neue,sans-serif',
          fontSize: 36,
          letterSpacing: 3,
          color: 'var(--white)',
          lineHeight: 1,
        }}>
          AMAMBAÍ F.C.
        </div>
        <div style={{
          fontFamily: 'Barlow Condensed,sans-serif',
          fontSize: 13,
          letterSpacing: 2,
          color: 'var(--gold-light)',
          marginTop: 6,
          textTransform: 'uppercase',
        }}>
          Bolão Copa do Mundo 2026
        </div>
      </div>

      {/* CARD */}
      <div style={{
        width: '100%',
        maxWidth: 400,
        background: 'var(--surface)',
        border: '1px solid rgba(200,146,42,0.2)',
        borderRadius: 20,
        padding: 28,
      }}>

        {step === 'email' && (
          <>
            <div style={{
              fontFamily: 'Bebas Neue,sans-serif',
              fontSize: 24,
              letterSpacing: 2,
              marginBottom: 6,
            }}>
              Entrar no Bolão
            </div>
            <div style={{
              fontSize: 14,
              color: 'var(--text-muted)',
              marginBottom: 24,
              lineHeight: 1.5,
            }}>
              Digite seu email e vamos te mandar um link mágico. Sem senha para lembrar!
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{
                fontFamily: 'Barlow Condensed,sans-serif',
                fontSize: 11,
                letterSpacing: 2,
                textTransform: 'uppercase',
                color: 'var(--text-muted)',
                display: 'block',
                marginBottom: 8,
              }}>
                Seu Email
              </label>
              <input
                type="email"
                value={email}
                onChange={e => { setEmail(e.target.value); setError('') }}
                onKeyDown={e => e.key === 'Enter' && handleLogin()}
                placeholder="seu@email.com"
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
                  transition: 'border-color 0.2s',
                }}
              />
              {error && (
                <div style={{ fontSize: 13, color: '#e74c3c', marginTop: 8 }}>{error}</div>
              )}
            </div>

            <button
              onClick={handleLogin}
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
                transition: 'all 0.2s',
              }}
            >
              {loading ? 'Enviando...' : 'Receber Link de Acesso ⚡'}
            </button>

            <div style={{
              marginTop: 20,
              padding: '12px 14px',
              background: 'rgba(200,146,42,0.08)',
              border: '1px solid rgba(200,146,42,0.2)',
              borderRadius: 10,
              fontSize: 13,
              color: 'var(--text-muted)',
              lineHeight: 1.5,
            }}>
              🔒 Sem senha — você vai receber um link no seu email que te loga automaticamente. Seguro e simples.
            </div>
          </>
        )}

        {step === 'sent' && (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 56, marginBottom: 16 }}>📬</div>
            <div style={{
              fontFamily: 'Bebas Neue,sans-serif',
              fontSize: 28,
              letterSpacing: 2,
              color: 'var(--gold-light)',
              marginBottom: 8,
            }}>
              Link Enviado!
            </div>
            <div style={{
              fontSize: 15,
              color: 'var(--text-muted)',
              lineHeight: 1.6,
              marginBottom: 24,
            }}>
              Mandamos um link para<br/>
              <strong style={{ color: 'var(--white)' }}>{email}</strong><br/><br/>
              Abre o email e clica no link para entrar no bolão!
            </div>
            <div style={{
              padding: '12px 14px',
              background: 'rgba(46,204,90,0.08)',
              border: '1px solid rgba(46,204,90,0.2)',
              borderRadius: 10,
              fontSize: 13,
              color: 'var(--text-muted)',
              lineHeight: 1.5,
              marginBottom: 20,
            }}>
              ⏱ O link expira em 1 hora. Não achou? Confere a caixa de spam.
            </div>
            <button
              onClick={() => { setStep('email'); setEmail(''); }}
              style={{
                background: 'transparent',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 10,
                padding: '10px 20px',
                fontSize: 14,
                color: 'var(--text-muted)',
                cursor: 'pointer',
                fontFamily: 'Barlow,sans-serif',
              }}
            >
              Usar outro email
            </button>
          </div>
        )}
      </div>

      <div style={{
        marginTop: 32,
        textAlign: 'center',
        fontSize: 12,
        color: 'rgba(122,158,126,0.5)',
        fontFamily: 'Barlow Condensed,sans-serif',
        letterSpacing: 1,
      }}>
        PRAÇA AMAMBAÍ F.C. · MEIER · 1993<br/>
        Desenvolvido por Marcus Paulo
      </div>

    </main>
  )
}
