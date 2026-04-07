import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get('code')

  if (!code) {
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/audit/run?error=figma_auth_failed`)
  }

  try {
    // Exchange code for access token
    const tokenRes = await fetch('https://www.figma.com/api/oauth/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: process.env.FIGMA_CLIENT_ID!,
        client_secret: process.env.FIGMA_CLIENT_SECRET!,
        redirect_uri: process.env.FIGMA_REDIRECT_URI!,
        code,
        grant_type: 'authorization_code',
      }),
    })

    const tokenData = await tokenRes.json()

    if (!tokenData.access_token) {
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/audit/run?error=figma_token_failed`)
    }

    // Redirect back to audit tool with token in a short-lived URL param
    // In production, store in server-side session instead
    const redirectUrl = new URL(`${process.env.NEXT_PUBLIC_BASE_URL}/audit/run`)
    redirectUrl.searchParams.set('figma_token', tokenData.access_token)
    redirectUrl.searchParams.set('figma_connected', 'true')

    return NextResponse.redirect(redirectUrl.toString())
  } catch (error) {
    console.error('Figma OAuth error:', error)
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/audit/run?error=figma_auth_error`)
  }
}
