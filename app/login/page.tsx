'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase'

function Escudo({ size = 80 }: { size?: number }) {
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

type Step = 'email' | 'otp' | 'sent'

export default function LoginPage() {
  const supabase = createClient()
  const [step, setStep] = useState<Step>('email')
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSendOTP() {
    if (!email || !email.includes('@')) {
      setError('Digite um email válido')
      return
    }
    setLoading(true)
    setError('')

    const { error: authError } = await supabase.auth.signInWithOtp({
      email,
      options: { shouldCreateUser: true },
    })

    setLoading(false)

    if (authError) {
      setError('Erro ao enviar o código. Tente novamente.')
      return
    }

    setStep('otp')
  }

  async function handleVerifyOTP() {
    if (!otp || otp.length < 6) {
      setError('Digite o código completo')
      return
    }
    setLoading(true)
    setError('')

    const { data, error: verifyError } = await supabase.auth.verifyOtp({
      email,
      token: otp,
      type: 'email',
    })

    if (verifyError || !data.user) {
      setLoading(false)
      setError('Código inválido ou expirado. Tente novamente.')
      return
    }

    // Cria perfil se não existir
    const emailPrefix = email.split('@')[0]
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
      window.location.href = '/onboarding'
      return
    }

    const isFirstAccess = existingUser.nickname === emailPrefix
    window.location.href = isFirstAccess ? '/onboarding' : '/'
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

      <div style={{ textAlign: 'center', marginBottom: 40 }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
          <Escudo size={80} />
        </div>
        <div style={{ fontFamily:'Bebas Neue,sans-serif', fontSize:36, letterSpacing:3, color:'var(--white)', lineHeight:1 }}>
          AMAMBAÍ F.C.
        </div>
        <div style={{ fontFamily:'Barlow Condensed,sans-serif', fontSize:13, letterSpacing:2, color:'var(--gold-light)', marginTop:6, textTransform:'uppercase' }}>
          Bolão Copa do Mundo 2026
        </div>
      </div>

      <div style={{ width:'100%', maxWidth:400, background:'var(--surface)', border:'1px solid rgba(200,146,42,0.2)', borderRadius:20, padding:28 }}>

        {/* STEP 1: EMAIL */}
        {step === 'email' && (
          <>
            <div style={{ fontFamily:'Bebas Neue,sans-serif', fontSize:24, letterSpacing:2, marginBottom:6 }}>Entrar no Bolão</div>
            <div style={{ fontSize:14, color:'var(--text-muted)', marginBottom:24, lineHeight:1.5 }}>
              Digite seu email e vamos te mandar um código de 6 dígitos.
            </div>
            <label style={{ fontFamily:'Barlow Condensed,sans-serif', fontSize:11, letterSpacing:2, textTransform:'uppercase', color:'var(--text-muted)', display:'block', marginBottom:8 }}>
              Seu Email
            </label>
            <input
              type="email"
              value={email}
              onChange={e => { setEmail(e.target.value); setError('') }}
              onKeyDown={e => e.key === 'Enter' && handleSendOTP()}
              placeholder="seu@email.com"
              style={{ width:'100%', background:'var(--dark)', border: error ? '1px solid #e74c3c' : '1px solid rgba(255,255,255,0.12)', borderRadius:12, padding:'14px 16px', fontSize:16, color:'var(--white)', outline:'none', fontFamily:'Barlow,sans-serif', marginBottom:8 }}
            />
            {error && <div style={{ fontSize:13, color:'#e74c3c', marginBottom:12 }}>{error}</div>}
            <button onClick={handleSendOTP} disabled={loading}
              style={{ width:'100%', background: loading ? 'rgba(26,122,46,0.5)' : 'var(--green)', border:'none', borderRadius:12, padding:'14px', fontFamily:'Barlow Condensed,sans-serif', fontWeight:700, fontSize:16, letterSpacing:2, textTransform:'uppercase', color:'var(--white)', cursor: loading ? 'not-allowed' : 'pointer', marginTop:8 }}>
              {loading ? 'Enviando...' : 'Receber Código ⚡'}
            </button>
          </>
        )}

        {/* STEP 2: OTP */}
        {step === 'otp' && (
          <>
            <div style={{ fontFamily:'Bebas Neue,sans-serif', fontSize:24, letterSpacing:2, marginBottom:6 }}>Digite o Código</div>
            <div style={{ fontSize:14, color:'var(--text-muted)', marginBottom:24, lineHeight:1.5 }}>
              Mandamos um código de 6 dígitos para <strong style={{ color:'var(--white)' }}>{email}</strong>
            </div>
            <label style={{ fontFamily:'Barlow Condensed,sans-serif', fontSize:11, letterSpacing:2, textTransform:'uppercase', color:'var(--text-muted)', display:'block', marginBottom:8 }}>
              Código de 6 dígitos
            </label>
            <input
              type="number"
              value={otp}
              onChange={e => { setOtp(e.target.value); setError('') }}
              onKeyDown={e => e.key === 'Enter' && handleVerifyOTP()}
              placeholder="123456"
              maxLength={8}
              style={{ width:'100%', background:'var(--dark)', border: error ? '1px solid #e74c3c' : '1px solid rgba(255,255,255,0.12)', borderRadius:12, padding:'14px 16px', fontSize:24, color:'var(--gold-light)', outline:'none', fontFamily:'Bebas Neue,sans-serif', letterSpacing:8, marginBottom:8, textAlign:'center' }}
            />
            {error && <div style={{ fontSize:13, color:'#e74c3c', marginBottom:12 }}>{error}</div>}
            <button onClick={handleVerifyOTP} disabled={loading}
              style={{ width:'100%', background: loading ? 'rgba(26,122,46,0.5)' : 'var(--green)', border:'none', borderRadius:12, padding:'14px', fontFamily:'Barlow Condensed,sans-serif', fontWeight:700, fontSize:16, letterSpacing:2, textTransform:'uppercase', color:'var(--white)', cursor: loading ? 'not-allowed' : 'pointer', marginTop:8 }}>
              {loading ? 'Verificando...' : 'Entrar no Bolão →'}
            </button>
            <button onClick={() => { setStep('email'); setOtp(''); setError('') }}
              style={{ width:'100%', background:'transparent', border:'1px solid rgba(255,255,255,0.1)', borderRadius:12, padding:'12px', fontFamily:'Barlow,sans-serif', fontSize:14, color:'var(--text-muted)', cursor:'pointer', marginTop:10 }}>
              ← Usar outro email
            </button>
          </>
        )}

      </div>

      <div style={{ marginTop:32, textAlign:'center', fontSize:12, color:'rgba(122,158,126,0.5)', fontFamily:'Barlow Condensed,sans-serif', letterSpacing:1 }}>
        PRAÇA AMAMBAÍ F.C. · MEIER · 1993<br/>
        Desenvolvido por Marcus Paulo
      </div>
    </main>
  )
}
