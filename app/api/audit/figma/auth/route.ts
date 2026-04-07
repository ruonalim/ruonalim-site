import { NextResponse } from 'next/server'

export async function GET() {
  const clientId = process.env.FIGMA_CLIENT_ID
  const redirectUri = process.env.FIGMA_REDIRECT_URI
  const state = Math.random().toString(36).substring(2, 15)

  const url = `https://www.figma.com/oauth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri!)}&scope=file_content:read&state=${state}&response_type=code`

  return NextResponse.redirect(url)
}
