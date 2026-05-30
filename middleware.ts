// middleware.ts
import { createServerClient } from '@supabase/ssr'
import { NextRequest, NextResponse } from 'next/server'

// Rotas totalmente públicas (sem login)
const PUBLIC_ROUTES = [
  '/',          // landing/home pública
  '/login',
  '/regras',    // regulamento pode ser lido sem login
  '/auth',      // cobre /auth/callback e /auth/confirm
]

// Rotas que exigem onboarding completo (apelido + avatar)
const ONBOARDING_ROUTE = '/onboarding'

type CookieToSet = {
  name: string
  value: string
  options?: Record<string, unknown>
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // 1. Rotas públicas passam direto — sem tocar na sessão
  if (PUBLIC_ROUTES.some(route => pathname.startsWith(route))) {
    return NextResponse.next()
  }

  // 2. Monta response mutável para o Supabase poder setar cookies
  let response = NextResponse.next({
    request: { headers: request.headers },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet: CookieToSet[]) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          response = NextResponse.next({
            request: { headers: request.headers },
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options as Record<string, unknown>)
          )
        },
      },
    }
  )

  // 3. Verifica sessão — getUser() valida no servidor Supabase (mais seguro que getSession)
  const { data: { user } } = await supabase.auth.getUser()

  // 4. Sem sessão → vai pro login
  if (!user) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('next', pathname) // preserva destino pós-login
    return NextResponse.redirect(loginUrl)
  }

  // 5. Tem sessão mas não fez onboarding → força onboarding
  // (só bloqueia se não estiver já no /onboarding)
  if (pathname !== ONBOARDING_ROUTE) {
    const { data: profile } = await supabase
      .from('users')
      .select('nickname')
      .eq('id', user.id)
      .single()

    if (!profile?.nickname) {
      return NextResponse.redirect(new URL(ONBOARDING_ROUTE, request.url))
    }
  }

  return response
}

export const config = {
  matcher: [
    // Exclui arquivos estáticos, imagens, favicon, manifest, api routes e assets do SVG
    '/((?!_next/static|_next/image|favicon.ico|manifest.json|escudo.svg|.*\\.svg|.*\\.png|.*\\.jpg|api/).*)',
  ],
}