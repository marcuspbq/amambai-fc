import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'

  if (code) {
    // Redireciona para página que vai trocar o code por sessão no cliente
    return NextResponse.redirect(
      `${origin}/auth/confirm?code=${code}&next=${next}`
    )
  }

  return NextResponse.redirect(`${origin}/login?error=auth`)
}
