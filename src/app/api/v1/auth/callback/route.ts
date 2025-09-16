import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/client'

export async function GET(request: Request) {
  const url = new URL(request.url)
  const code = url.searchParams.get('code')
  let next = url.searchParams.get('next') ?? '/'
  if (!next.startsWith('/')) next = '/'

  if (!code) {
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/auth/auth-code-error`)
  }

  const supabase = createClient()

  const { data: sessionData, error } = await supabase.auth.exchangeCodeForSession(code)
  if (error || !sessionData?.user) {
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/auth/auth-code-error`)
  }

  const user = sessionData.user

  // POST para o backend
  try {
    await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/signin-providers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(user),
    })
  } catch (err) {
    console.error('Erro ao enviar dados para backend:', err)
  }

  return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}${next}`)
}
