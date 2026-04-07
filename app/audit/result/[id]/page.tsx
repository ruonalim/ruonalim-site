'use client'

import { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { useParams, useSearchParams } from 'next/navigation'
import type { AuditFull, AuditPreview, HeuristicScore, AuditIssue, ExtendedScore } from '@/lib/types'
import AuditShell from '@/app/components/AuditShell'

function isFullAudit(data: AuditPreview | AuditFull): data is AuditFull {
  return 'heuristics' in data && Array.isArray((data as AuditFull).heuristics)
}

/* ─── DESIGN.md light tokens ─── */
const textPrimary = '#111111'
const textMuted = '#96969E'
const textDim = '#96969E'
const textSub = '#96969E'
const border = '#E8E8EC'
const cardBg = '#F7F7F9'
const inputBg = '#F7F7F9'
const inputBorder = '#E8E8EC'

function AuditResultInner() {
  const { id } = useParams<{ id: string }>()
  const searchParams = useSearchParams()
  const justPaid = searchParams.get('paid') === 'true'

  const [data, setData] = useState<AuditPreview | AuditFull | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [creditEmail, setCreditEmail] = useState('')
  const [credits, setCredits] = useState<number | null>(null)
  const [creditLoading, setCreditLoading] = useState(false)
  const [creditError, setCreditError] = useState('')
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!id) return
    fetch(`/api/audit/${id}`)
      .then(res => {
        if (!res.ok) throw new Error('Audit not found')
        return res.json()
      })
      .then(setData)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [id])

  /* ─── Helpers ─── */
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

  const statusColor = (status: string) => {
    if (status === 'pass') return '#22c55e'
    if (status === 'minor') return '#eab308'
    if (status === 'major') return '#f97316'
    return '#ef4444'
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
    if (!data) return
    try {
      const res = await fetch('/api/payments/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ auditId: data.auditId, plan: 'single' }),
      })
      const { url } = await res.json()
      if (url) window.location.href = url
    } catch {
      setError('Failed to create checkout session')
    }
  }

  /* ─── Check credits ─── */
  const handleCheckCredits = async () => {
    if (!creditEmail.trim()) return
    setCreditError('')
    setCreditLoading(true)
    try {
      const res = await fetch(`/api/audit/use-credit?email=${encodeURIComponent(creditEmail)}`)
      const { credits: c } = await res.json()
      setCredits(c)
      if (c <= 0) setCreditError('No credits remaining for this email.')
    } catch {
      setCreditError('Failed to check credits.')
    } finally {
      setCreditLoading(false)
    }
  }

  /* ─── Use credit to unlock ─── */
  const handleUseCredit = async () => {
    if (!creditEmail.trim() || !data) return
    setCreditError('')
    setCreditLoading(true)
    try {
      const res = await fetch('/api/audit/use-credit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: creditEmail, auditId: data.auditId }),
      })
      if (!res.ok) {
        const d = await res.json()
        throw new Error(d.error || 'Failed to use credit')
      }
      window.location.href = `/audit/result/${data.auditId}?paid=true`
    } catch (err: unknown) {
      setCreditError(err instanceof Error ? err.message : 'Failed to use credit')
    } finally {
      setCreditLoading(false)
    }
  }

  /* ─── PDF export ─── */
  const handleDownloadPdf = () => {
    if (!data) return
    window.open(`/api/audit/pdf/${data.auditId}`, '_blank')
  }

  /* ─── Loading state ─── */
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#ffffff' }}>
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin mx-auto mb-4" style={{ borderColor: '#0044E4', borderTopColor: 'transparent' }} />
          <p className="text-sm" style={{ color: textMuted }}>Loading audit…</p>
        </div>
      </div>
    )
  }

  /* ─── Error state ─── */
  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#ffffff' }}>
        <div className="text-center max-w-md">
          <h1
            className="text-2xl mb-3"
            style={{ color: textPrimary, fontWeight: 700, fontFamily: 'Inter, sans-serif', letterSpacing: '-1px' }}
          >
            Audit not found
          </h1>
          <p className="text-sm mb-6" style={{ color: textMuted }}>
            This audit may have expired or the link is invalid.
          </p>
          <Link
            href="/audit/run"
            className="px-6 py-3 text-white text-sm font-semibold rounded-sm transition-colors"
            style={{ background: '#0044E4' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#0035C0' }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '#0044E4' }}
          >
            Run a new audit &rarr;
          </Link>
        </div>
      </div>
    )
  }

  const full = isFullAudit(data)

  return (
    <>
      {/* AI gradient keyframes for consultation CTA */}
      <style>{`
        @keyframes ai-gradient-shift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
      `}</style>

      <div className="pt-24 pb-24 px-8 max-w-4xl mx-auto">
        {/* Success banner */}
        {justPaid && (
          <div className="mb-8 px-4 py-3 bg-green-50 border border-green-200 rounded-md text-green-700 text-sm flex items-center gap-2 fade-up">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 8L6.5 11.5L13 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            Payment successful — your full report is unlocked.
          </div>
        )}

        {/* PDF download bar for paid audits */}
        {full && (
          <div className="mb-8 flex items-center justify-between px-4 py-3 rounded-md fade-up" style={{ background: cardBg, border: `1px solid ${border}` }}>
            <span className="text-sm" style={{ color: textSub }}>Full report unlocked</span>
            <button
              onClick={handleDownloadPdf}
              className="flex items-center gap-2 text-sm font-medium hover:underline"
              style={{ color: '#0044E4' }}
            >
              <svg aria-hidden="true" focusable="false" width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 2v8m0 0L5 7m3 3l3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M3 12h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
              Export PDF
            </button>
          </div>
        )}

        {/* Score hero */}
        <div className="rounded-lg p-8 md:p-10 mb-8 fade-up" style={{ background: cardBg, border: `1px solid ${border}` }}>
          <div className="flex flex-col md:flex-row items-center gap-8">
            {/* Score ring */}
            <div className="relative flex-shrink-0">
              <svg width="180" height="180" viewBox="0 0 180 180" aria-hidden="true" focusable="false">
                <circle cx="90" cy="90" r="78" fill="none" stroke="#E8E8EC" strokeWidth="6" />
                <circle
                  cx="90" cy="90" r="78"
                  fill="none"
                  stroke={scoreColor(data.overallScore)}
                  strokeWidth="6"
                  strokeLinecap="round"
                  strokeDasharray={`${(data.overallScore / 100) * 490} 490`}
                  transform="rotate(-90 90 90)"
                  style={{ transition: 'stroke-dasharray 1.5s ease-out' }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span
                  className="text-5xl font-bold"
                  style={{ color: scoreColor(data.overallScore), fontFamily: 'Inter, sans-serif' }}
                >
                  {data.overallScore}
                </span>
                <span className="text-xs font-medium mt-1" style={{ color: textMuted }}>
                  {scoreLabel(data.overallScore)}
                </span>
              </div>
            </div>

            {/* Meta */}
            <div className="flex-1 text-center md:text-left">
              <div className="flex items-center gap-2 justify-center md:justify-start mb-3">
                <span className="px-2 py-0.5 rounded text-[10px] uppercase tracking-wider font-semibold" style={{ background: '#E8E8EC', color: '#96969E' }}>
                  {data.inputType}
                </span>
                <span className="text-xs truncate max-w-[250px]" style={{ color: textMuted }}>{data.inputLabel}</span>
                {full && (
                  <span className="px-2 py-0.5 rounded text-[10px] uppercase tracking-wider font-semibold" style={{ background: '#EAF0FF', color: '#0044E4' }}>
                    Full report
                  </span>
                )}
              </div>
              <h1
                className="text-2xl tracking-tight mb-3"
                style={{ color: textPrimary, fontWeight: 700, fontFamily: 'Inter, sans-serif', letterSpacing: '-1px' }}
              >
                {data.headline}
              </h1>
              <p className="text-sm mb-4" style={{ color: textMuted }}>
                <strong style={{ color: '#141414' }}>{data.totalIssuesFound} issues</strong> found across your product.
              </p>
              <div className="flex items-center gap-2 justify-center md:justify-start">
                <span className="text-green-500 text-xs">&#9733;</span>
                <span className="text-xs" style={{ color: textMuted }}>{data.topStrength}</span>
              </div>
              <p className="text-[10px] mt-4" style={{ color: textDim }}>
                Audited {new Date(data.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
              </p>
            </div>
          </div>
        </div>

        {/* ════════════ Full report content ════════════ */}
        {full && (
          <>
            {/* Heuristic scorecard */}
            <div className="mb-8 fade-up fade-up-d1">
              <h2 className="text-xs font-semibold tracking-[0.15em] uppercase mb-4" style={{ color: textMuted }}>
                Heuristic scorecard
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-px rounded-lg overflow-hidden" style={{ background: border }}>
                {(data as AuditFull).heuristics.map((h: HeuristicScore) => (
                  <div key={h.id} className="p-5 flex items-start gap-4" style={{ background: '#ffffff' }}>
                    <div className="flex-shrink-0 text-center" style={{ minWidth: '44px' }}>
                      <div className="text-lg font-bold" style={{ color: statusColor(h.status), fontFamily: 'Inter, sans-serif' }}>
                        {h.score}
                      </div>
                      <div className="text-[9px] uppercase tracking-wider font-semibold mt-0.5" style={{ color: statusColor(h.status), opacity: 0.7 }}>
                        {h.status}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold mb-1" style={{ color: textPrimary }}>
                        <span className="mr-1" style={{ color: textMuted }}>{String(h.id).padStart(2, '0')}.</span>
                        {h.name}
                      </h3>
                      <p className="text-xs leading-relaxed" style={{ color: textMuted }}>{h.finding}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Extended analysis */}
            {((data as AuditFull).conversionScore || (data as AuditFull).mobileScore || (data as AuditFull).trustScore || (data as AuditFull).seoScore || (data as AuditFull).appScore) && (
              <div className="mb-8 fade-up fade-up-d2">
                <h2 className="text-xs font-semibold tracking-[0.15em] uppercase mb-4" style={{ color: textMuted }}>
                  Extended analysis
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px rounded-lg overflow-hidden" style={{ background: border }}>
                  {([
                    { key: 'conversionScore', label: 'Conversion quality', icon: '↗' },
                    { key: 'mobileScore', label: 'Mobile experience', icon: '⊡' },
                    { key: 'trustScore', label: 'Trust & credibility', icon: '◈' },
                    { key: 'seoScore', label: 'SEO health', icon: '⌖' },
                    { key: 'appScore', label: 'App opportunity', icon: '◻' },
                  ] as { key: keyof AuditFull; label: string; icon: string }[]).map(({ key, label, icon }) => {
                    const dim = (data as AuditFull)[key] as ExtendedScore | undefined
                    if (!dim) return null
                    return (
                      <div key={key} className="p-5 flex items-start gap-4" style={{ background: '#ffffff' }}>
                        <div className="flex-shrink-0 text-center" style={{ minWidth: '44px' }}>
                          <div className="text-lg font-bold" style={{ color: statusColor(dim.status), fontFamily: 'Inter, sans-serif' }}>
                            {dim.score}
                          </div>
                          <div className="text-[9px] uppercase tracking-wider font-semibold mt-0.5" style={{ color: statusColor(dim.status), opacity: 0.7 }}>
                            {dim.status}
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-semibold mb-1 flex items-center gap-1.5" style={{ color: textPrimary }}>
                            <span style={{ color: textMuted, fontSize: '12px' }}>{icon}</span>
                            {label}
                          </h3>
                          <p className="text-xs leading-relaxed" style={{ color: textMuted }}>{dim.finding}</p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* All issues by severity */}
            {(['critical', 'major', 'minor'] as const).map(severity => {
              const key = `${severity}Issues` as 'criticalIssues' | 'majorIssues' | 'minorIssues'
              const issues = (data as AuditFull)[key]
              if (!issues || issues.length === 0) return null

              return (
                <div key={severity} className="mb-8 fade-up">
                  <h2 className="text-xs font-semibold tracking-[0.15em] uppercase mb-4 flex items-center gap-2">
                    <span style={{ color: severityColor(severity) }}>&#9679;</span>
                    <span style={{ color: textMuted }}>
                      {severity} issues
                      <span className="ml-1" style={{ color: textDim }}>({issues.length})</span>
                    </span>
                  </h2>
                  <div className="space-y-3">
                    {issues.map((issue: AuditIssue, i: number) => (
                      <div key={i} className="border rounded-lg p-5" style={{ background: cardBg, borderColor: border }}>
                        <div className="flex items-start gap-3">
                          <span
                            className="mt-0.5 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider flex-shrink-0"
                            style={{ color: severityColor(issue.severity), background: severityBg(issue.severity) }}
                          >
                            {issue.severity}
                          </span>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap mb-1">
                              <h4 className="text-sm font-semibold" style={{ color: textPrimary }}>{issue.title}</h4>
                              <span className="text-[10px] uppercase tracking-wider" style={{ color: textDim }}>{issue.heuristic}</span>
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
                </div>
              )
            })}

            {/* Priority actions */}
            {(data as AuditFull).priorityActions?.length > 0 && (
              <div className="mb-8 fade-up">
                <h2 className="text-xs font-semibold tracking-[0.15em] uppercase mb-4" style={{ color: textMuted }}>
                  Priority actions
                </h2>
                <div className="border rounded-lg p-6" style={{ background: cardBg, borderColor: border }}>
                  <ol className="space-y-3">
                    {(data as AuditFull).priorityActions.map((action: string, i: number) => (
                      <li key={i} className="flex items-start gap-3">
                        <span className="flex-shrink-0 w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center" style={{ background: '#EAF0FF', color: '#0044E4' }}>
                          {i + 1}
                        </span>
                        <span className="text-sm leading-relaxed pt-0.5" style={{ color: textMuted }}>{action}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              </div>
            )}

            {/* Strengths */}
            {(data as AuditFull).strengths?.length > 0 && (
              <div className="mb-8 fade-up">
                <h2 className="text-xs font-semibold tracking-[0.15em] uppercase mb-4" style={{ color: textMuted }}>
                  What you&apos;re doing well
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {(data as AuditFull).strengths.map((strength: string, i: number) => (
                    <div key={i} className="bg-green-50 border border-green-100 rounded-lg p-4 flex items-start gap-3">
                      <span className="text-green-500 text-sm mt-0.5 flex-shrink-0">&#9733;</span>
                      <span className="text-sm leading-relaxed" style={{ color: '#141414' }}>{strength}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* ════════════ Preview-only content ════════════ */}
        {!full && (
          <>
            {/* Preview issues */}
            <div className="mb-8 fade-up">
              <h2 className="text-xs font-semibold tracking-[0.15em] uppercase mb-4" style={{ color: textMuted }}>
                Top issues
              </h2>
              <div className="space-y-3">
                {data.previewIssues.map((issue, i) => (
                  <div key={i} className="border rounded-lg p-5" style={{ background: cardBg, borderColor: border }}>
                    <div className="flex items-start gap-3">
                      <span
                        className="mt-0.5 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider flex-shrink-0"
                        style={{ color: severityColor(issue.severity), background: severityBg(issue.severity) }}
                      >
                        {issue.severity}
                      </span>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-semibold mb-1" style={{ color: textPrimary }}>{issue.title}</h4>
                        <p className="text-xs leading-relaxed mb-2" style={{ color: textMuted }}>{issue.description}</p>
                        <div className="flex items-start gap-2">
                          <span className="text-xs mt-px flex-shrink-0" style={{ color: '#0044E4' }}>Fix →</span>
                          <p className="text-xs leading-relaxed" style={{ color: textMuted }}>{issue.recommendation}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Unlock CTA */}
            {data.lockedIssueCount > 0 && (
              <div className="border rounded-lg p-10 text-center mb-8 fade-up" style={{ background: cardBg, borderColor: border }}>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-5" style={{ background: '#EAF0FF' }}>
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <rect x="4" y="6" width="6" height="6" rx="1" stroke="#0044E4" strokeWidth="1.2"/>
                    <path d="M5 6V4.5C5 3.12 6.12 2 7.5 2V2C8.88 2 10 3.12 10 4.5V6" stroke="#0044E4" strokeWidth="1.2" strokeLinecap="round"/>
                  </svg>
                  <span className="text-xs font-medium" style={{ color: '#0044E4' }}>
                    +{data.lockedIssueCount} more issues found
                  </span>
                </div>
                <h3
                  className="text-2xl mb-3"
                  style={{ color: textPrimary, fontWeight: 700, fontFamily: 'Inter, sans-serif', letterSpacing: '-1px' }}
                >
                  Unlock the full report
                </h3>
                <p className="text-sm mb-6 max-w-md mx-auto" style={{ color: textMuted }}>
                  Get all {data.totalIssuesFound} issues with detailed findings, every heuristic scored, priority actions, and a shareable PDF report.
                </p>
                <button
                  onClick={handleUnlock}
                  className="px-10 py-4 text-white font-semibold text-sm rounded-sm transition-all hover:-translate-y-0.5"
                  style={{ background: '#0044E4' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#0035C0' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '#0044E4' }}
                >
                  Unlock for AED 120 &rarr;
                </button>
                <p className="text-xs mt-3" style={{ color: textDim }}>One-time payment. Keep the report forever.</p>

                {/* Agency credit option */}
                <div className="mt-6 pt-6 border-t max-w-sm mx-auto" style={{ borderColor: border }}>
                  <p className="text-xs uppercase tracking-wider font-semibold mb-3" style={{ color: textMuted }}>Have agency credits?</p>
                  <div className="flex gap-2">
                    <input
                      type="email"
                      aria-label="Email address for agency credit check"
                      value={creditEmail}
                      onChange={e => setCreditEmail(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && (credits !== null && credits > 0 ? handleUseCredit() : handleCheckCredits())}
                      placeholder="Your email"
                      className="flex-1 rounded px-3 py-2 text-sm transition-colors"
                      style={{ background: inputBg, border: `1px solid ${inputBorder}`, color: textPrimary }}
                      onFocus={e => { e.currentTarget.style.borderColor = '#0044E4' }}
                      onBlur={e => { e.currentTarget.style.borderColor = inputBorder }}
                    />
                    {credits === null ? (
                      <button
                        onClick={handleCheckCredits}
                        disabled={creditLoading || !creditEmail.trim()}
                        className="px-4 py-2 text-sm font-medium rounded transition-colors disabled:opacity-40"
                        style={{ background: '#E8E8EC', color: '#141414' }}
                        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#D8D8E0' }}
                        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '#E8E8EC' }}
                      >
                        {creditLoading ? '…' : 'Check'}
                      </button>
                    ) : credits > 0 ? (
                      <button
                        onClick={handleUseCredit}
                        disabled={creditLoading}
                        className="px-4 py-2 bg-green-50 border border-green-200 text-green-700 text-sm font-medium rounded hover:bg-green-100 transition-colors disabled:opacity-40"
                      >
                        {creditLoading ? '…' : `Use 1 of ${credits}`}
                      </button>
                    ) : null}
                  </div>
                  {creditError && <p role="alert" className="text-red-500 text-xs mt-2">{creditError}</p>}
                </div>
              </div>
            )}
          </>
        )}

        {/* Consultation CTA — with gradient border */}
        <div
          className="mt-16 relative rounded-lg p-[1px] overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, rgba(0,68,228,0.3), rgba(139,92,246,0.2), rgba(0,68,228,0.1), rgba(139,92,246,0.3))',
            backgroundSize: '300% 300%',
            animation: 'ai-gradient-shift 6s ease infinite',
          }}
        >
          <div className="rounded-lg p-8 text-center" style={{ background: '#ffffff' }}>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full mb-4" style={{ background: '#EAF0FF' }}>
              <span
                className="text-[10px] font-bold"
                style={{
                  background: 'linear-gradient(90deg, #0044E4, #8b5cf6)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  fontFamily: 'Inter, sans-serif',
                }}
              >
                AI
              </span>
              <span className="text-[10px] uppercase tracking-wider font-semibold" style={{ color: textMuted }}>Powered audit</span>
            </div>
            <h3
              className="text-xl tracking-tight mb-2"
              style={{ color: textPrimary, fontWeight: 700, fontFamily: 'Inter, sans-serif' }}
            >
              Want these issues fixed?
            </h3>
            <p className="text-sm mb-6 max-w-md mx-auto" style={{ color: textMuted }}>
              Our team can redesign, optimise, or rebuild your product. Book a free 30-minute consultation to discuss your audit results.
            </p>
            <div className="flex items-center justify-center gap-4 flex-wrap">
              <a
                href="mailto:hello@ruonalim.com?subject=Consultation%20request%20—%20UX%20Audit"
                className="inline-flex items-center gap-2 px-6 py-3 text-white text-sm font-medium rounded-sm transition-all hover:-translate-y-0.5"
                style={{ background: 'linear-gradient(135deg, #0044E4, #7c3aed)' }}
              >
                Book a free consultation
                <span>&rarr;</span>
              </a>
              <button
                onClick={() => {
                  navigator.clipboard.writeText('hello@ruonalim.com')
                  const el = document.getElementById('consult-copy')
                  if (el) { el.textContent = 'Copied!'; setTimeout(() => { el.textContent = 'hello@ruonalim.com'; }, 2000) }
                }}
                id="consult-copy"
                className="text-sm transition-colors cursor-pointer hover:underline"
                style={{ color: textMuted }}
              >
                hello@ruonalim.com
              </button>
            </div>
          </div>
        </div>

        {/* Bottom actions */}
        <div className="flex items-center justify-between pt-6 border-t mt-8" style={{ borderColor: border }}>
          <Link
            href="/audit/run"
            className="text-sm transition-colors"
            style={{ color: textMuted }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#111111' }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = '#96969E' }}
          >
            &larr; Run another audit
          </Link>
          <div className="flex items-center gap-4">
            {full && (
              <button
                onClick={handleDownloadPdf}
                className="text-sm font-medium transition-colors flex items-center gap-1.5"
                style={{ color: textMuted }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#111111' }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = '#96969E' }}
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 1.5v7m0 0L4.5 6m2.5 2.5L9.5 6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/><path d="M2 10.5h10" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>
                PDF
              </button>
            )}
            <button
              onClick={() => {
                navigator.clipboard.writeText(window.location.href)
                setCopied(true)
                setTimeout(() => setCopied(false), 2000)
              }}
              className="text-sm font-medium hover:underline flex items-center gap-1.5"
              style={{ color: '#0044E4' }}
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <rect x="4.5" y="4.5" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.2"/>
                <path d="M9.5 4.5V3C9.5 2.17 8.83 1.5 8 1.5H3C2.17 1.5 1.5 2.17 1.5 3V8C1.5 8.83 2.17 9.5 3 9.5H4.5" stroke="currentColor" strokeWidth="1.2"/>
              </svg>
              {copied ? 'Copied!' : 'Copy link'}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

export default function AuditResult() {
  return (
    <AuditShell>
      <Suspense fallback={
        <div className="flex items-center justify-center py-40">
          <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: '#0044E4', borderTopColor: 'transparent' }} />
        </div>
      }>
        <AuditResultInner />
      </Suspense>
    </AuditShell>
  )
}
