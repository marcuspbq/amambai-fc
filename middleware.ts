// ─────────────────────────────────────────────────
// Amambaí F.C. — Middleware de autenticação
// Verifica se o usuário está logado em todas as rotas
// Se não estiver, redireciona para /login
// ─────────────────────────────────────────────────

import { createServerClient } from '@supabase/ssr'
import { NextRequest, NextResponse } from 'next/server'

// Rotas públicas — acessíveis sem login
const PUBLIC_ROUTES = ['/login', '/auth/callback']

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Deixa rotas públicas passarem
  if (PUBLIC_ROUTES.some(route => pathname.startsWith(route))) {
    return NextResponse.next()
  }

  // Cria resposta base
  let response = NextResponse.next({
    request: { headers: request.headers },
  })

  // Verifica sessão do Supabase
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          response = NextResponse.next({
            request: { headers: request.headers },
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  // Não logado — redireciona para login
  if (!user) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return response
}

export const config = {
  matcher: [
    // Aplica em todas as rotas exceto arquivos estáticos e API
    '/((?!_next/static|_next/image|favicon.ico|manifest.json|escudo.svg|api/).*)',
  ],
}
