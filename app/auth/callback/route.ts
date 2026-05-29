import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'

  if (code) {
    return NextResponse.redirect(
      `${origin}/auth/confirm?code=${code}&next=${encodeURIComponent(next)}`
    )
  }

  return NextResponse.redirect(`${origin}/login?error=nocode`)
}
