import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { figmaUrl, accessToken } = await req.json()

    if (!figmaUrl || !accessToken) {
      return NextResponse.json({ error: 'Missing Figma URL or access token' }, { status: 400 })
    }

    // Extract file key from Figma URL
    // Supports: figma.com/file/KEY/..., figma.com/design/KEY/...
    const match = figmaUrl.match(/figma\.com\/(?:file|design)\/([a-zA-Z0-9]+)/)
    if (!match) {
      return NextResponse.json({ error: 'Invalid Figma URL' }, { status: 400 })
    }
    const fileKey = match[1]

    // Get file structure
    const fileRes = await fetch(`https://api.figma.com/v1/files/${fileKey}?depth=1`, {
      headers: { 'X-FIGMA-TOKEN': accessToken },
    })

    if (!fileRes.ok) {
      return NextResponse.json({ error: 'Failed to access Figma file' }, { status: 400 })
    }

    const fileData = await fileRes.json()

    // Get top-level frames from the first page
    const page = fileData.document?.children?.[0]
    if (!page) {
      return NextResponse.json({ error: 'No pages found in file' }, { status: 400 })
    }

    const frames = (page.children || [])
      .filter((node: { type: string }) => node.type === 'FRAME' || node.type === 'COMPONENT')
      .slice(0, 20) // Max 20 frames

    if (frames.length === 0) {
      return NextResponse.json({ error: 'No frames found in file' }, { status: 400 })
    }

    const frameIds = frames.map((f: { id: string }) => f.id).join(',')

    // Render frames as images
    const imgRes = await fetch(
      `https://api.figma.com/v1/images/${fileKey}?ids=${frameIds}&format=png&scale=2`,
      { headers: { 'X-FIGMA-TOKEN': accessToken } }
    )

    if (!imgRes.ok) {
      return NextResponse.json({ error: 'Failed to render Figma frames' }, { status: 400 })
    }

    const imgData = await imgRes.json()
    const imageUrls = imgData.images || {}

    // Download images and convert to base64
    const images: string[] = []
    for (const frame of frames) {
      const url = imageUrls[frame.id]
      if (!url) continue

      try {
        const imgFetch = await fetch(url)
        const buffer = await imgFetch.arrayBuffer()
        const base64 = Buffer.from(buffer).toString('base64')
        images.push(base64)
      } catch {
        console.warn(`Failed to download frame ${frame.id}`)
      }
    }

    return NextResponse.json({
      fileName: fileData.name,
      frameCount: images.length,
      images,
    })
  } catch (error: unknown) {
    console.error('Figma frames error:', error)
    const message = error instanceof Error ? error.message : 'Failed to process Figma file'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
