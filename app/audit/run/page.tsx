'use client'

import { useState, useRef, useCallback, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import type { InputMode, AuditPreview } from '@/lib/types'
import AuditShell from '@/app/components/AuditShell'

/* ─── Step labels ─── */
const STEPS = ['Input', 'Analyse', 'Results'] as const

/* ─── Analysis status messages ─── */
const STATUS_MESSAGES = [
  'Capturing screenshots…',
  'Analysing visual hierarchy…',
  'Evaluating heuristic #1 — Visibility of system status…',
  'Checking consistency & standards…',
  'Assessing error prevention patterns…',
  'Reviewing aesthetic & minimalist design…',
  'Scoring recognition over recall…',
  'Evaluating flexibility & efficiency…',
  'Compiling findings…',
  'Generating your report…',
]

function AuditRunInner() {
  const searchParams = useSearchParams()

  /* ─── State ─── */
  const [step, setStep] = useState<0 | 1 | 2>(0)
  const [mode, setMode] = useState<InputMode>('url')

  // URL mode
  const [url, setUrl] = useState('')

  // Figma mode
  const [figmaConnected, setFigmaConnected] = useState(false)
  const [figmaToken, setFigmaToken] = useState('')
  const [figmaUrl, setFigmaUrl] = useState('')
  const [figmaFileName, setFigmaFileName] = useState('')

  // Screenshot mode
  const [screenshots, setScreenshots] = useState<{ file: File; preview: string }[]>([])
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Analysis
  const [analysing, setAnalysing] = useState(false)
  const [statusIdx, setStatusIdx] = useState(0)
  const [error, setError] = useState('')

  // Results
  const [result, setResult] = useState<AuditPreview | null>(null)

  /* ─── Admin key from URL param (never stored in bundle) ─── */
  const adminKey = searchParams.get('admin') ?? undefined

  /* ─── Pick up Figma OAuth callback ─── */
  useEffect(() => {
    const token = searchParams.get('figma_token')
    const connected = searchParams.get('figma_connected')
    if (token && connected === 'true') {
      setFigmaToken(token)
      setFigmaConnected(true)
      setMode('figma')
      // Clean URL params
      window.history.replaceState({}, '', '/audit/run')
    }
  }, [searchParams])

  /* ─── Rotate status messages during analysis ─── */
  useEffect(() => {
    if (!analysing) { setStatusIdx(0); return }
    const timer = setInterval(() => {
      setStatusIdx(prev => prev + 1)
    }, 3000)
    return () => clearInterval(timer)
  }, [analysing])

  /* ─── Helpers ─── */
  const toBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        const maxDim = 1440
        let w = img.width
        let h = img.height
        if (w > maxDim || h > maxDim) {
          const ratio = Math.min(maxDim / w, maxDim / h)
          w = Math.round(w * ratio)
          h = Math.round(h * ratio)
        }
        canvas.width = w
        canvas.height = h
        const ctx = canvas.getContext('2d')!
        ctx.drawImage(img, 0, 0, w, h)
        const dataUrl = canvas.toDataURL('image/jpeg', 0.7)
        resolve(dataUrl.split(',')[1])
      }
      img.onerror = reject
      img.src = URL.createObjectURL(file)
    })

  /* ─── Screenshot handling ─── */
  const addScreenshots = useCallback((files: FileList | File[]) => {
    const newFiles = Array.from(files)
      .filter(f => f.type.startsWith('image/'))
      .slice(0, 20 - screenshots.length)

    const entries = newFiles.map(file => ({
      file,
      preview: URL.createObjectURL(file),
    }))
    setScreenshots(prev => [...prev, ...entries].slice(0, 20))
  }, [screenshots.length])

  const removeScreenshot = (idx: number) => {
    setScreenshots(prev => {
      const next = [...prev]
      URL.revokeObjectURL(next[idx].preview)
      next.splice(idx, 1)
      return next
    })
  }

  /* ─── Submit handlers ─── */
  const handleUrlSubmit = async () => {
    if (!url.trim()) return
    setError('')
    setAnalysing(true)
    setStep(1)
    setStatusIdx(0)

    try {
      // Step 1: Screenshot the URL
      const screenshotRes = await fetch('/api/audit/screenshot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url.startsWith('http') ? url : `https://${url}` }),
      })

      if (!screenshotRes.ok) {
        let errMsg = 'Failed to capture screenshot'
        try {
          const ct = screenshotRes.headers.get('content-type') || ''
          if (ct.includes('application/json')) {
            const data = await screenshotRes.json()
            errMsg = data.error || errMsg
          } else {
            errMsg = `Screenshot service error (${screenshotRes.status}). Try again or use a different URL.`
          }
        } catch { /* parse failed */ }
        throw new Error(errMsg)
      }

      const screenshotCt = screenshotRes.headers.get('content-type') || ''
      if (!screenshotCt.includes('application/json')) {
        throw new Error('Screenshot service returned an unexpected response. Please try again.')
      }

      const { screenshots: imgs } = await screenshotRes.json()

      // Step 2: Analyse
      const analyseRes = await fetch('/api/audit/analyse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          images: imgs,
          inputType: 'url',
          inputLabel: url,
          tier: 'free',
          adminSecret: adminKey,
        }),
      })

      if (!analyseRes.ok) {
        let errMsg = 'Analysis failed'
        try {
          const ct = analyseRes.headers.get('content-type') || ''
          if (ct.includes('application/json')) {
            const data = await analyseRes.json()
            errMsg = data.error || errMsg
          } else {
            errMsg = `Analysis service error (${analyseRes.status}). Please try again.`
          }
        } catch { /* parse failed */ }
        throw new Error(errMsg)
      }

      const analyseCt = analyseRes.headers.get('content-type') || ''
      if (!analyseCt.includes('application/json')) {
        throw new Error('Analysis service returned an unexpected response. Please try again.')
      }

      const audit = await analyseRes.json()
      setResult(audit)
      setStep(2)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
      setStep(0)
    } finally {
      setAnalysing(false)
    }
  }

  const handleFigmaSubmit = async () => {
    if (!figmaUrl.trim() || !figmaToken) return
    setError('')
    setAnalysing(true)
    setStep(1)
    setStatusIdx(0)

    try {
      // Get frames
      const framesRes = await fetch('/api/audit/figma/frames', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ figmaUrl, accessToken: figmaToken }),
      })

      if (!framesRes.ok) {
        const data = await framesRes.json()
        throw new Error(data.error || 'Failed to get Figma frames')
      }

      const { images, fileName } = await framesRes.json()
      setFigmaFileName(fileName)

      // Analyse
      const analyseRes = await fetch('/api/audit/analyse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          images,
          inputType: 'figma',
          inputLabel: fileName || figmaUrl,
          tier: 'free',
          adminSecret: adminKey,
        }),
      })

      if (!analyseRes.ok) {
        const data = await analyseRes.json()
        throw new Error(data.error || 'Analysis failed')
      }

      const audit = await analyseRes.json()
      setResult(audit)
      setStep(2)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
      setStep(0)
    } finally {
      setAnalysing(false)
    }
  }

  const handleScreenshotSubmit = async () => {
    if (screenshots.length === 0) return
    setError('')
    setAnalysing(true)
    setStep(1)
    setStatusIdx(0)

    try {
      const images = await Promise.all(screenshots.map(s => toBase64(s.file)))

      const analyseRes = await fetch('/api/audit/analyse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          images,
          inputType: 'screenshots',
          inputLabel: `${screenshots.length} screenshot${screenshots.length > 1 ? 's' : ''}`,
          tier: 'free',
          adminSecret: adminKey,
        }),
      })

      if (!analyseRes.ok) {
        const data = await analyseRes.json()
        throw new Error(data.error || 'Analysis failed')
      }

      const audit = await analyseRes.json()
      setResult(audit)
      setStep(2)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
      setStep(0)
    } finally {
      setAnalysing(false)
    }
  }

  const handleSubmit = () => {
    if (mode === 'url') handleUrlSubmit()
    else if (mode === 'figma') handleFigmaSubmit()
    else handleScreenshotSubmit()
  }

  /* ─── Score ring helpers ─── */
  const scoreColor = (score: number) => {
    if (score >= 80) return '#22c55e'
    if (score >= 60) return '#eab308'
    if (score >= 40) return '#f97316'
    return '#ef4444'
  }

  const scoreLabel = (score: number) => {
    if (score >= 80) return 'Excellent'
    if (score >= 60) return 'Good'
    if (score >= 40) return 'Needs work'
    return 'Poor'
  }

  const severityColor = (severity: string) => {
    if (severity === 'critical') return '#ef4444'
    if (severity === 'major') return '#f97316'
    return '#eab308'
  }

  const severityBg = (severity: string) => {
    if (severity === 'critical') return 'rgba(239,68,68,0.10)'
    if (severity === 'major') return 'rgba(249,115,22,0.10)'
    return 'rgba(234,179,8,0.10)'
  }

  /* ─── Unlock handler ─── */
  const handleUnlock = async () => {
    if (!result) return
    try {
      const res = await fetch('/api/payments/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ auditId: result.auditId, plan: 'single' }),
      })
      const { url: checkoutUrl } = await res.json()
      if (checkoutUrl) window.location.href = checkoutUrl
    } catch {
      setError('Failed to create checkout session')
    }
  }

  /* ─── Can submit? ─── */
  const canSubmit =
    (mode === 'url' && url.trim().length > 0) ||
    (mode === 'figma' && figmaConnected && figmaUrl.trim().length > 0) ||
    (mode === 'screenshots' && screenshots.length > 0)

  /* ─── DESIGN.md light tokens ─── */
  const textPrimary = '#111111'
  const textMuted = '#96969E'
  const textDim = '#96969E'
  const inputBg = '#F7F7F9'
  const inputBorder = '#E8E8EC'

  return (
    <>
      {/* Progress stepper */}
      <div className="pt-24 pb-8 px-8 max-w-3xl mx-auto">
        <div className="flex items-center justify-center gap-0">
          {STEPS.map((label, i) => (
            <div key={label} className="flex items-center">
              <div className="flex items-center gap-2">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold transition-all duration-300`}
                  style={
                    i < step
                      ? { background: '#0044E4', color: '#fff' }
                      : i === step
                      ? { background: '#0044E4', color: '#fff', boxShadow: '0 0 0 4px rgba(0,68,228,0.15)' }
                      : { background: '#F0F0F4', color: '#96969E' }
                  }
                >
                  {i < step ? (
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2.5 7L5.5 10L11.5 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  ) : (
                    i + 1
                  )}
                </div>
                <span className="text-sm font-medium" style={{ color: i <= step ? textPrimary : textDim }}>
                  {label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div className="w-16 h-px mx-4" style={{ background: i < step ? '#0044E4' : '#E8E8EC' }} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ════════════ STEP 0: Input ════════════ */}
      {step === 0 && (
        <section className="px-8 pb-24 max-w-3xl mx-auto fade-up">
          <div className="text-center mb-12">
            <h1
              className="text-3xl tracking-tight mb-3"
              style={{ color: textPrimary, fontWeight: 700, letterSpacing: '-1.5px', fontFamily: 'Inter, sans-serif' }}
            >
              What are we auditing?
            </h1>
            <p className="text-sm" style={{ color: textMuted }}>
              Paste a URL, connect Figma, or upload screenshots. We&apos;ll do the rest.
            </p>
          </div>

          {/* Mode tabs */}
          <div role="tablist" aria-label="Audit input type" className="flex items-center justify-center gap-1 p-1 rounded-md mb-10 max-w-md mx-auto" style={{ background: inputBg }}>
            {([
              { key: 'url' as InputMode, label: 'Live URL', icon: '🌐', comingSoon: false },
              { key: 'screenshots' as InputMode, label: 'Screenshots', icon: '📱', comingSoon: false },
              { key: 'figma' as InputMode, label: 'Figma', icon: '◆', comingSoon: true },
            ]).map(tab => (
              <button
                key={tab.key}
                role="tab"
                aria-selected={mode === tab.key}
                aria-disabled={tab.comingSoon}
                onClick={() => !tab.comingSoon && setMode(tab.key)}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded text-sm font-medium transition-all ${
                  tab.comingSoon ? 'opacity-50 cursor-default' : ''
                }`}
                style={
                  mode === tab.key
                    ? { background: '#0044E4', color: '#fff' }
                    : { color: textMuted }
                }
              >
                <span className="text-base">{tab.icon}</span>
                {tab.label}
                {tab.comingSoon && (
                  <span
                    className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded-full"
                    style={{ background: '#EAF0FF', color: '#0044E4' }}
                  >
                    Soon
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* URL input */}
          {mode === 'url' && (
            <div className="space-y-4">
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm" style={{ color: textDim }}>https://</span>
                <input
                  type="text"
                  aria-label="Website URL to audit"
                  value={url}
                  onChange={e => setUrl(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && canSubmit && handleSubmit()}
                  placeholder="yoursite.com"
                  className="w-full rounded-md py-4 pl-20 pr-4 text-sm transition-colors"
                  style={{
                    background: inputBg,
                    border: `1px solid ${inputBorder}`,
                    color: textPrimary,
                  }}
                  onFocus={e => { e.currentTarget.style.borderColor = '#0044E4' }}
                  onBlur={e => { e.currentTarget.style.borderColor = inputBorder }}
                />
              </div>
              <p className="text-xs text-center" style={{ color: textDim }}>
                We&apos;ll screenshot the page and run the audit automatically.
              </p>
            </div>
          )}

          {/* Figma input */}
          {mode === 'figma' && (
            <div className="space-y-4">
              {!figmaConnected ? (
                <a
                  href="/api/audit/figma/auth"
                  className="flex items-center justify-center gap-3 w-full py-4 rounded-md text-sm font-medium transition-all"
                  style={{ background: inputBg, border: `1px solid ${inputBorder}`, color: textMuted }}
                >
                  <svg width="20" height="20" viewBox="0 0 38 57" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M19 28.5C19 23.2533 23.2533 19 28.5 19C33.7467 19 38 23.2533 38 28.5C38 33.7467 33.7467 38 28.5 38C23.2533 38 19 33.7467 19 28.5Z" fill="#1ABCFE"/>
                    <path d="M0 47.5C0 42.2533 4.25329 38 9.5 38H19V47.5C19 52.7467 14.7467 57 9.5 57C4.25329 57 0 52.7467 0 47.5Z" fill="#0ACF83"/>
                    <path d="M19 0V19H28.5C33.7467 19 38 14.7467 38 9.5C38 4.25329 33.7467 0 28.5 0H19Z" fill="#FF7262"/>
                    <path d="M0 9.5C0 14.7467 4.25329 19 9.5 19H19V0H9.5C4.25329 0 0 4.25329 0 9.5Z" fill="#F24E1E"/>
                    <path d="M0 28.5C0 33.7467 4.25329 38 9.5 38H19V19H9.5C4.25329 19 0 23.2533 0 28.5Z" fill="#A259FF"/>
                  </svg>
                  Connect Figma account
                </a>
              ) : (
                <>
                  <div className="flex items-center gap-2 px-4 py-2 bg-green-50 border border-green-200 rounded-md text-green-600 text-sm">
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2.5 7L5.5 10L11.5 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    Figma connected
                  </div>
                  <input
                    type="text"
                    aria-label="Figma file URL"
                    value={figmaUrl}
                    onChange={e => setFigmaUrl(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && canSubmit && handleSubmit()}
                    placeholder="Paste your Figma file URL…"
                    className="w-full rounded-md py-4 px-4 text-sm transition-colors"
                    style={{ background: inputBg, border: `1px solid ${inputBorder}`, color: textPrimary }}
                    onFocus={e => { e.currentTarget.style.borderColor = '#0044E4' }}
                    onBlur={e => { e.currentTarget.style.borderColor = inputBorder }}
                  />
                  <p className="text-xs text-center" style={{ color: textDim }}>
                    We&apos;ll pull the top-level frames from your first page.
                  </p>
                </>
              )}
            </div>
          )}

          {/* Screenshot upload */}
          {mode === 'screenshots' && (
            <div className="space-y-4">
              <div
                role="button"
                tabIndex={0}
                aria-label="Upload screenshots – click or drag and drop images here"
                className={`upload-zone rounded-lg p-10 text-center cursor-pointer transition-all ${dragOver ? 'dragover' : ''}`}
                onClick={() => fileInputRef.current?.click()}
                onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && fileInputRef.current?.click()}
                onDragOver={e => { e.preventDefault(); setDragOver(true) }}
                onDragLeave={() => setDragOver(false)}
                onDrop={e => {
                  e.preventDefault()
                  setDragOver(false)
                  addScreenshots(e.dataTransfer.files)
                }}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={e => e.target.files && addScreenshots(e.target.files)}
                />
                <div className="text-3xl mb-3">📱</div>
                <p className="text-sm mb-1" style={{ color: textMuted }}>
                  Drag & drop screenshots here, or <span style={{ color: '#0044E4' }}>browse</span>
                </p>
                <p className="text-xs" style={{ color: textDim }}>
                  PNG, JPG, or WebP — up to 20 images
                </p>
              </div>

              {/* Preview grid */}
              {screenshots.length > 0 && (
                <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
                  {screenshots.map((s, i) => (
                    <div key={i} className="relative group aspect-[9/16] rounded-md overflow-hidden border" style={{ background: inputBg, borderColor: '#E8E8EC' }}>
                      <img
                        src={s.preview}
                        alt={`Screenshot ${i + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <button
                        onClick={e => { e.stopPropagation(); removeScreenshot(i) }}
                        aria-label={`Remove screenshot ${i + 1}`}
                        className="absolute top-1 right-1 w-5 h-5 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all"
                        style={{ background: 'rgba(0,0,0,0.5)', color: '#fff' }}
                        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#ef4444' }}
                        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(0,0,0,0.5)' }}
                      >
                        <svg width="10" height="10" viewBox="0 0 10 10"><path d="M2 2L8 8M8 2L2 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
                      </button>
                      <div className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded text-[10px]" style={{ background: 'rgba(0,0,0,0.5)', color: 'rgba(255,255,255,0.7)' }}>
                        {i + 1}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Error */}
          {error && (
            <div role="alert" className="mt-6 px-5 py-6 bg-red-50 border border-red-200 rounded-md text-center">
              <p className="text-red-700 text-base font-medium mb-1">Ah man, that didn&apos;t work</p>
              <p className="text-red-500 text-xs mb-4">{error}</p>
              <button
                onClick={() => { setError(''); handleSubmit(); }}
                className="px-6 py-2.5 text-white text-sm font-semibold rounded-sm transition-all hover:-translate-y-0.5"
                style={{ background: '#0044E4' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#0035C0' }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '#0044E4' }}
              >
                Try again &rarr;
              </button>
              {(error.toLowerCase().includes('geo') || error.toLowerCase().includes('blocked') || error.toLowerCase().includes('unreachable') || error.toLowerCase().includes('restricted')) && (
                <p className="text-xs mt-4" style={{ color: textMuted }}>
                  This site may be geo-restricted in certain regions. Try uploading screenshots instead —{' '}
                  <button
                    onClick={() => { setMode('screenshots'); setError(''); }}
                    className="underline cursor-pointer"
                    style={{ color: '#0044E4' }}
                  >
                    switch to screenshot upload
                  </button>
                </p>
              )}
            </div>
          )}

          {/* Submit button */}
          <div className="mt-10 text-center">
            <button
              onClick={handleSubmit}
              disabled={!canSubmit}
              className="px-10 py-4 font-semibold text-sm rounded-sm transition-all"
              style={
                canSubmit
                  ? { background: '#0044E4', color: '#fff' }
                  : { background: '#F0F0F4', color: '#767676', cursor: 'not-allowed' }
              }
              onMouseEnter={e => { if (canSubmit) (e.currentTarget as HTMLElement).style.background = '#0035C0' }}
              onMouseLeave={e => { if (canSubmit) (e.currentTarget as HTMLElement).style.background = '#0044E4' }}
            >
              Run free audit &rarr;
            </button>
            <p className="text-xs mt-3" style={{ color: textDim }}>
              Free tier: 1 screenshot, overall score + top 3 issues
            </p>
            <p className="text-[11px] mt-6 max-w-md mx-auto leading-relaxed" style={{ color: textDim }}>
              Some websites in regulated industries (gambling, lottery, finance) may be geo-restricted and unavailable from certain regions. If a URL fails, try uploading screenshots instead.
            </p>
          </div>
        </section>
      )}

      {/* ════════════ STEP 1: Analysing ════════════ */}
      {step === 1 && (
        <section className="px-8 pb-24 max-w-2xl mx-auto text-center fade-up relative">
          {/* AI gradient keyframes */}
          <style>{`
            @keyframes ai-orb {
              0%, 100% { transform: scale(1); opacity: 0.6; }
              50% { transform: scale(1.15); opacity: 1; }
            }
            @keyframes ai-orb-reverse {
              0%, 100% { transform: scale(1.1); opacity: 0.8; }
              50% { transform: scale(0.95); opacity: 0.5; }
            }
            @keyframes ai-rotate {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
            @keyframes ai-pulse-ring {
              0% { transform: scale(0.8); opacity: 0.6; }
              50% { transform: scale(1.2); opacity: 0; }
              100% { transform: scale(0.8); opacity: 0; }
            }
            @keyframes ai-text-shimmer {
              0% { background-position: -200% center; }
              100% { background-position: 200% center; }
            }
            @keyframes ai-bar-glow {
              0%, 100% { box-shadow: 0 0 8px rgba(0,68,228,0.2); }
              50% { box-shadow: 0 0 20px rgba(0,68,228,0.35); }
            }
          `}</style>

          {/* Ambient background glow */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none" style={{ top: '-80px' }}>
            <div
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full"
              style={{
                background: 'radial-gradient(circle, rgba(0,68,228,0.06) 0%, rgba(139,92,246,0.03) 40%, transparent 70%)',
                animation: 'ai-orb 4s ease-in-out infinite',
              }}
            />
            <div
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] rounded-full"
              style={{
                background: 'radial-gradient(circle, rgba(139,92,246,0.07) 0%, rgba(0,68,228,0.04) 50%, transparent 70%)',
                animation: 'ai-orb-reverse 5s ease-in-out infinite',
              }}
            />
          </div>

          <div className="relative z-10">
            {/* Animated AI orb */}
            <div className="relative inline-block mb-10">
              {/* Outer pulse rings */}
              <div
                className="absolute inset-0 rounded-full"
                style={{
                  border: '1px solid rgba(0,68,228,0.25)',
                  animation: 'ai-pulse-ring 3s ease-out infinite',
                }}
              />
              <div
                className="absolute inset-0 rounded-full"
                style={{
                  border: '1px solid rgba(139,92,246,0.15)',
                  animation: 'ai-pulse-ring 3s ease-out infinite 1s',
                }}
              />

              {/* Rotating gradient ring */}
              <div className="relative w-[140px] h-[140px]">
                <svg width="140" height="140" viewBox="0 0 140 140" style={{ animation: 'ai-rotate 4s linear infinite' }}>
                  <defs>
                    <linearGradient id="ai-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#0044E4" />
                      <stop offset="50%" stopColor="#8b5cf6" />
                      <stop offset="100%" stopColor="#0044E4" />
                    </linearGradient>
                  </defs>
                  <circle cx="70" cy="70" r="60" fill="none" stroke="#E8E8EC" strokeWidth="3" />
                  <circle
                    cx="70" cy="70" r="60"
                    fill="none"
                    stroke="url(#ai-grad)"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeDasharray="94 283"
                  />
                </svg>

                {/* Inner glow background */}
                <div
                  className="absolute inset-[20px] rounded-full"
                  style={{
                    background: 'radial-gradient(circle, rgba(0,68,228,0.08) 0%, rgba(139,92,246,0.04) 50%, transparent 70%)',
                    animation: 'ai-orb 3s ease-in-out infinite',
                  }}
                />

                {/* AI text with shimmer */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <span
                    className="text-2xl font-bold"
                    style={{
                      background: 'linear-gradient(90deg, #0044E4 0%, #8b5cf6 25%, #0044E4 50%, #8b5cf6 75%, #0044E4 100%)',
                      backgroundSize: '200% auto',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      animation: 'ai-text-shimmer 3s linear infinite',
                      fontFamily: 'Inter, sans-serif',
                    }}
                  >
                    AI
                  </span>
                </div>
              </div>
            </div>

            <h2
              className="text-2xl tracking-tight mb-3"
              style={{ color: textPrimary, fontWeight: 700, fontFamily: 'Inter, sans-serif', letterSpacing: '-1px' }}
            >
              Analysing your product…
            </h2>
            <p className="text-sm mb-8 h-5 transition-all duration-500" style={{ color: textMuted }}>
              {STATUS_MESSAGES[statusIdx % STATUS_MESSAGES.length]}
            </p>

            {/* Gradient progress bar */}
            <div className="max-w-sm mx-auto">
              <div className="h-1 rounded-full overflow-hidden" style={{ background: '#F0F0F4' }}>
                <div
                  className="h-full rounded-full transition-all duration-[3000ms] ease-linear"
                  style={{
                    width: `${Math.min(95, 100 * (1 - Math.exp(-0.25 * (statusIdx + 1))))}%`,
                    background: 'linear-gradient(90deg, #0044E4, #8b5cf6, #0044E4)',
                    backgroundSize: '200% 100%',
                    animation: 'ai-text-shimmer 2s linear infinite, ai-bar-glow 2s ease-in-out infinite',
                  }}
                />
              </div>
            </div>

            <p className="text-xs mt-6" style={{ color: textDim }}>
              Can take up to 90 seconds
            </p>
          </div>
        </section>
      )}

      {/* ════════════ STEP 2: Results preview ════════════ */}
      {step === 2 && result && (
        <section className="px-8 pb-24 max-w-3xl mx-auto fade-up">
          {/* Score card */}
          <div className="border rounded-lg p-8 mb-8" style={{ background: '#F7F7F9', borderColor: '#E8E8EC' }}>
            <div className="flex flex-col md:flex-row items-center gap-8">
              {/* Score ring */}
              <div className="relative flex-shrink-0">
                <svg width="160" height="160" viewBox="0 0 160 160">
                  <circle cx="80" cy="80" r="70" fill="none" stroke="#E8E8EC" strokeWidth="6" />
                  <circle
                    cx="80" cy="80" r="70"
                    fill="none"
                    stroke={scoreColor(result.overallScore)}
                    strokeWidth="6"
                    strokeLinecap="round"
                    strokeDasharray={`${(result.overallScore / 100) * 440} 440`}
                    strokeDashoffset="0"
                    transform="rotate(-90 80 80)"
                    style={{ transition: 'stroke-dasharray 1.5s ease-out' }}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-4xl font-bold" style={{ color: scoreColor(result.overallScore), fontFamily: 'Inter, sans-serif' }}>
                    {result.overallScore}
                  </span>
                  <span className="text-xs font-medium mt-1" style={{ color: textMuted }}>
                    {scoreLabel(result.overallScore)}
                  </span>
                </div>
              </div>

              {/* Info */}
              <div className="flex-1 text-center md:text-left">
                <div className="flex items-center gap-2 justify-center md:justify-start mb-2">
                  <span className="px-2 py-0.5 rounded text-[10px] uppercase tracking-wider font-semibold" style={{ background: '#E8E8EC', color: '#96969E' }}>
                    {result.inputType}
                  </span>
                  <span className="text-xs truncate max-w-[200px]" style={{ color: textMuted }}>
                    {result.inputLabel}
                  </span>
                </div>
                <h2
                  className="text-xl tracking-tight mb-2"
                  style={{ color: textPrimary, fontWeight: 700, fontFamily: 'Inter, sans-serif' }}
                >
                  {result.headline}
                </h2>
                <p className="text-sm mb-4" style={{ color: textMuted }}>
                  We found <strong style={{ color: '#141414' }}>{result.totalIssuesFound} issues</strong> across your product.
                  {result.lockedIssueCount > 0 && (
                    <> You&apos;re seeing 3 — unlock the full report for all {result.totalIssuesFound}.</>
                  )}
                </p>
                <div className="flex items-center gap-2 justify-center md:justify-start">
                  <span className="text-green-500 text-xs">&#9733;</span>
                  <span className="text-xs" style={{ color: textMuted }}>{result.topStrength}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Preview issues */}
          <div className="space-y-3 mb-8">
            <h3 className="text-xs font-semibold tracking-[0.15em] uppercase mb-4" style={{ color: textMuted }}>
              Top issues
            </h3>
            {result.previewIssues.map((issue, i) => (
              <div
                key={i}
                className="border rounded-lg p-5 transition-colors"
                style={{ background: '#F7F7F9', borderColor: '#E8E8EC' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = '#D0D0D8' }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = '#E8E8EC' }}
              >
                <div className="flex items-start gap-3">
                  <span
                    className="mt-0.5 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider flex-shrink-0"
                    style={{ color: severityColor(issue.severity), background: severityBg(issue.severity) }}
                  >
                    {issue.severity}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="text-sm font-semibold" style={{ color: textPrimary }}>{issue.title}</h4>
                    </div>
                    <p className="text-xs leading-relaxed mb-2" style={{ color: textMuted }}>{issue.description}</p>
                    <div className="flex items-start gap-2">
                      <span className="text-xs mt-px flex-shrink-0" style={{ color: '#0044E4' }}>Fix →</span>
                      <p className="text-xs leading-relaxed" style={{ color: textMuted }}>{issue.recommendation}</p>
                    </div>
                    {issue.location && (
                      <p className="text-[10px] mt-2 uppercase tracking-wider" style={{ color: textDim }}>{issue.location}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Locked issues teaser */}
          {result.lockedIssueCount > 0 && (
            <div className="relative rounded-lg overflow-hidden mb-8">
              {/* Blurred placeholder issues */}
              <div className="space-y-3 filter blur-[6px] pointer-events-none select-none">
                {[1, 2, 3].map(i => (
                  <div key={i} className="border rounded-lg p-5" style={{ background: '#F7F7F9', borderColor: '#E8E8EC' }}>
                    <div className="flex items-start gap-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold" style={{ background: '#E8E8EC', color: '#96969E' }}>MAJOR</span>
                      <div className="flex-1">
                        <div className="h-3 rounded w-3/4 mb-2" style={{ background: '#E8E8EC' }} />
                        <div className="h-2 rounded w-full mb-1" style={{ background: '#F0F0F4' }} />
                        <div className="h-2 rounded w-5/6" style={{ background: '#F0F0F4' }} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Overlay CTA */}
              <div className="absolute inset-0 flex flex-col items-center justify-center backdrop-blur-sm" style={{ background: 'rgba(255,255,255,0.75)' }}>
                <div className="text-center">
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-4" style={{ background: '#EAF0FF' }}>
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <rect x="4" y="6" width="6" height="6" rx="1" stroke="#0044E4" strokeWidth="1.2"/>
                      <path d="M5 6V4.5C5 3.12 6.12 2 7.5 2V2C8.88 2 10 3.12 10 4.5V6" stroke="#0044E4" strokeWidth="1.2" strokeLinecap="round"/>
                    </svg>
                    <span className="text-xs font-medium" style={{ color: '#0044E4' }}>
                      +{result.lockedIssueCount} more issues found
                    </span>
                  </div>
                  <h3
                    className="text-lg mb-2"
                    style={{ color: textPrimary, fontWeight: 700, fontFamily: 'Inter, sans-serif' }}
                  >
                    Unlock the full report
                  </h3>
                  <p className="text-xs mb-5 max-w-xs mx-auto" style={{ color: textMuted }}>
                    All {result.totalIssuesFound} issues, 10 heuristic scores, priority actions, and a shareable PDF.
                  </p>
                  <button
                    onClick={handleUnlock}
                    className="px-8 py-3 text-white font-semibold text-sm rounded-sm transition-all hover:-translate-y-0.5"
                    style={{ background: '#0044E4' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#0035C0' }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '#0044E4' }}
                  >
                    Unlock for AED 120 &rarr;
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Bottom actions */}
          <div className="flex items-center justify-between pt-6 border-t" style={{ borderColor: '#E8E8EC' }}>
            <button
              onClick={() => {
                setStep(0)
                setResult(null)
                setError('')
              }}
              className="text-sm transition-colors"
              style={{ color: textMuted }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#111111' }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = '#96969E' }}
            >
              &larr; Run another audit
            </button>
            <Link
              href={`/audit/result/${result.auditId}`}
              className="text-sm font-medium hover:underline"
              style={{ color: '#0044E4' }}
            >
              View shareable link &rarr;
            </Link>
          </div>
        </section>
      )}

    </>
  )
}

export default function AuditRun() {
  return (
    <AuditShell>
      <Suspense fallback={
        <div className="flex items-center justify-center py-40">
          <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: '#0044E4', borderTopColor: 'transparent' }} />
        </div>
      }>
        <AuditRunInner />
      </Suspense>
    </AuditShell>
  )
}
