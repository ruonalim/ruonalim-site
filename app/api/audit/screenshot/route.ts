import { NextRequest, NextResponse } from 'next/server'

/**
 * ScreenshotOne supported ip_country_code values (as of 2026):
 * us, gb, de, it, fr, cn, ca, es, jp, kr, in, au, br, mx, nz, pe, is, ie
 *
 * UAE is NOT supported. For Gulf/Middle East users, we use India ('in')
 * as the closest supported proxy — it won't have UK/US sanctions on
 * sites like lottery/gambling platforms.
 */
function getScreenshotCountry(countryCode: string | null): string {
  if (!countryCode) return 'in' // default: India (closest supported to Gulf, no UK/US sanctions)

  const cc = countryCode.toLowerCase()

  // Gulf / Middle East — use India (closest supported, no sanctions on gambling/lottery)
  const gulf = ['ae', 'sa', 'qa', 'bh', 'kw', 'om', 'jo', 'lb', 'eg', 'iq']
  if (gulf.includes(cc)) return 'in'

  // US/Canada
  if (cc === 'us' || cc === 'ca') return 'us'

  // UK/Ireland
  if (cc === 'gb' || cc === 'ie') return 'gb'

  // Europe — use Germany
  const eu = ['de', 'fr', 'nl', 'es', 'it', 'pt', 'be', 'at', 'ch', 'se', 'no', 'dk', 'fi', 'pl', 'cz', 'ro', 'gr']
  if (eu.includes(cc)) return 'de'

  // India / South Asia
  if (cc === 'in' || cc === 'pk' || cc === 'bd' || cc === 'lk') return 'in'

  // Australia / NZ
  if (cc === 'au' || cc === 'nz') return 'au'

  // Japan / Korea
  if (cc === 'jp') return 'jp'
  if (cc === 'kr') return 'kr'

  // Brazil / Latin America
  if (cc === 'br' || cc === 'mx' || cc === 'pe') return cc

  // Default: India (no UK/US sanctions, good general fallback)
  return 'in'
}

/**
 * Screenshot API — tries ScreenshotOne first (geo-aware), then Microlink, then thum.io
 */
export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json()

    if (!url || (!url.startsWith('https://') && !url.startsWith('http://'))) {
      return NextResponse.json({ error: 'Invalid URL.' }, { status: 400 })
    }

    // Detect user's region from Vercel headers for geo-targeted screenshots
    const userCountry = req.headers.get('x-vercel-ip-country')
    const proxyCountry = getScreenshotCountry(userCountry)
    console.log(`Screenshot request: url=${url}, userCountry=${userCountry}, proxyCountry=${proxyCountry}`)

    let viewportBase64: string | null = null
    let fullBase64: string | null = null
    let pageTitle = url
    let provider = 'none'

    // Try ScreenshotOne first (supports ip_country_code for region-restricted sites)
    if (process.env.SCREENSHOTONE_API_KEY) {
      try {
        viewportBase64 = await captureWithScreenshotOne(url, proxyCountry)
        provider = `screenshotone (${proxyCountry})`
      } catch (e) {
        console.log(`ScreenshotOne failed: ${e instanceof Error ? e.message : 'unknown'}`)
      }
    }

    // Try Microlink
    if (!viewportBase64) {
      try {
        viewportBase64 = await captureWithMicrolink(url, false)
        provider = 'microlink'
      } catch (e) {
        console.log(`Microlink failed: ${e instanceof Error ? e.message : 'unknown'}`)
      }
    }

    // Try thum.io
    if (!viewportBase64) {
      try {
        viewportBase64 = await captureWithThum(url)
        provider = 'thum.io'
      } catch (e) {
        console.log(`thum.io failed: ${e instanceof Error ? e.message : 'unknown'}`)
      }
    }

    // Last resort: ScreenshotOne without geo
    if (!viewportBase64) {
      try {
        viewportBase64 = await captureWithScreenshotOne(url)
        provider = 'screenshotone (no geo)'
      } catch {
        return NextResponse.json(
          { error: 'Failed to capture screenshot. The site may be unreachable or geo-restricted.' },
          { status: 502 }
        )
      }
    }

    console.log(`Screenshot captured via: ${provider}`)

    // Try full-page screenshot with Microlink (optional, not critical)
    try {
      fullBase64 = await captureWithMicrolink(url, true)
    } catch {
      fullBase64 = viewportBase64 // fallback to viewport
    }

    // Try to get title from Microlink metadata
    try {
      const metaUrl = new URL('https://api.microlink.io')
      metaUrl.searchParams.set('url', url)
      metaUrl.searchParams.set('meta', 'true')
      const res = await fetch(metaUrl.toString(), { signal: AbortSignal.timeout(8000) })
      if (res.ok) {
        const data = await res.json()
        if (data?.data?.title) pageTitle = data.data.title
      }
    } catch {
      // title fetch failed, use url
    }

    return NextResponse.json({
      screenshots: [viewportBase64, fullBase64 || viewportBase64],
      pageTitle,
    })
  } catch (error: unknown) {
    console.error('Screenshot error:', error)
    const message = error instanceof Error ? error.message : 'Failed to capture screenshot'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

/**
 * Microlink screenshot capture
 */
async function captureWithMicrolink(url: string, fullPage: boolean): Promise<string> {
  const apiUrl = new URL('https://api.microlink.io')
  apiUrl.searchParams.set('url', url)
  apiUrl.searchParams.set('screenshot', 'true')
  if (fullPage) apiUrl.searchParams.set('screenshot.fullPage', 'true')
  apiUrl.searchParams.set('meta', 'true')
  apiUrl.searchParams.set('viewport.width', '1440')
  apiUrl.searchParams.set('viewport.height', '900')
  apiUrl.searchParams.set('viewport.deviceScaleFactor', '1')
  apiUrl.searchParams.set('waitForTimeout', '3000')

  const res = await fetch(apiUrl.toString(), { signal: AbortSignal.timeout(15000) })

  if (!res.ok) {
    throw new Error(`Microlink returned ${res.status}`)
  }

  const contentType = res.headers.get('content-type') || ''
  if (!contentType.includes('application/json')) {
    throw new Error('Microlink returned non-JSON response')
  }

  const data = await res.json()

  if (data.status !== 'success' || !data.data?.screenshot?.url) {
    throw new Error('Microlink screenshot failed')
  }

  const imgRes = await fetch(data.data.screenshot.url, { signal: AbortSignal.timeout(10000) })
  const imgBuffer = await imgRes.arrayBuffer()
  return Buffer.from(imgBuffer).toString('base64')
}

/**
 * thum.io fallback — free, no API key needed
 */
async function captureWithThum(url: string): Promise<string> {
  const thumbUrl = `https://image.thum.io/get/width/1440/crop/900/noanimate/${url}`

  const res = await fetch(thumbUrl, { signal: AbortSignal.timeout(20000) })

  if (!res.ok) {
    throw new Error(`thum.io returned ${res.status}`)
  }

  const imgBuffer = await res.arrayBuffer()
  if (imgBuffer.byteLength < 1000) {
    throw new Error('thum.io returned empty image')
  }

  return Buffer.from(imgBuffer).toString('base64')
}

/**
 * ScreenshotOne — supports geo_location for region-restricted sites
 */
async function captureWithScreenshotOne(url: string, geoLocation?: string): Promise<string> {
  const apiUrl = new URL('https://api.screenshotone.com/take')
  apiUrl.searchParams.set('url', url)
  apiUrl.searchParams.set('viewport_width', '1440')
  apiUrl.searchParams.set('viewport_height', '900')
  apiUrl.searchParams.set('format', 'png')
  apiUrl.searchParams.set('block_ads', 'true')
  apiUrl.searchParams.set('delay', '3')
  if (process.env.SCREENSHOTONE_API_KEY) {
    apiUrl.searchParams.set('access_key', process.env.SCREENSHOTONE_API_KEY)
  }
  if (geoLocation) {
    apiUrl.searchParams.set('ip_country_code', geoLocation)
  }

  const res = await fetch(apiUrl.toString(), { signal: AbortSignal.timeout(20000) })

  if (!res.ok) {
    throw new Error(`ScreenshotOne returned ${res.status}`)
  }

  const ct = res.headers.get('content-type') || ''
  if (!ct.includes('image/')) {
    throw new Error('ScreenshotOne returned non-image response')
  }

  const imgBuffer = await res.arrayBuffer()
  if (imgBuffer.byteLength < 1000) {
    throw new Error('ScreenshotOne returned empty image')
  }

  return Buffer.from(imgBuffer).toString('base64')
}
