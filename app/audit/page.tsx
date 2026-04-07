'use client'

import Link from 'next/link'
import AuditShell from '@/app/components/AuditShell'

const HEURISTICS = [
  'Visibility of system status',
  'Match between system & real world',
  'User control & freedom',
  'Consistency & standards',
  'Error prevention',
  'Recognition over recall',
  'Flexibility & efficiency',
  'Aesthetic & minimalist design',
  'Error recovery',
  'Help & documentation',
]

/* ─── DESIGN.md light tokens ─── */
const textPrimary = '#111111'
const textMuted = '#96969E'
const textSub = '#96969E'
const border = '#E8E8EC'
const divider = '#E8E8EC'
const pageBg = '#ffffff'
const dimText = '#96969E'
const checkDim = '#96969E'
const textDimmer = '#96969E'
const featureText = '#141414'
const featureDim = '#141414'

function AuditLandingContent() {

  return (
    <>
      {/* Hero */}
      <section className="pt-40 pb-24 px-8 max-w-5xl mx-auto text-center relative">
        <p className="text-xs font-semibold tracking-[0.2em] uppercase mb-6 fade-up" style={{ color: '#0044E4' }}>AI-Powered UX Audit</p>
        <h1
          className="text-[clamp(2.5rem,5.5vw,4.5rem)] leading-[1.02] tracking-tight mb-6 fade-up fade-up-d1"
          style={{ color: textPrimary, fontWeight: 700, letterSpacing: '-2px', lineHeight: '0.97', fontFamily: 'Inter, sans-serif' }}
        >
          Find the UX issues<br />costing you users.
        </h1>
        <p className="text-lg max-w-xl mx-auto mb-10 leading-relaxed fade-up fade-up-d2" style={{ color: textSub }}>
          Submit a website, Figma file, or screenshots. Get an instant audit scored across 13 dimensions — usability, conversion, mobile experience, and trust. Free preview in seconds.
        </p>
        <div className="flex items-center justify-center gap-4 fade-up fade-up-d3">
          <Link
            href="/audit/run"
            className="px-8 py-4 text-white font-semibold text-sm rounded-sm transition-all hover:-translate-y-0.5"
            style={{ background: '#0044E4' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#0035C0' }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '#0044E4' }}
          >
            Run free audit &rarr;
          </Link>
          <a href="#pricing" className="px-8 py-4 border text-sm font-medium rounded-sm transition-all" style={{ borderColor: border, color: textMuted }}>
            See pricing
          </a>
        </div>
      </section>

      {/* How it works */}
      <section className="py-24 px-8" style={{ borderTop: `1px solid ${border}` }}>
        <div className="max-w-5xl mx-auto">
          <p className="text-xs font-semibold tracking-[0.2em] uppercase mb-6" style={{ color: '#0044E4' }}>How it works</p>
          <h2
            className="text-3xl tracking-tight mb-16"
            style={{ color: textPrimary, fontWeight: 700, letterSpacing: '-1.5px', fontFamily: 'Inter, sans-serif' }}
          >
            Three steps. Real issues. No fluff.
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-px" style={{ background: divider }}>
            {[
              { step: '01', title: 'Submit your product', desc: 'Paste a URL, connect Figma, or upload screenshots of your user flow.' },
              { step: '02', title: 'AI analyses every pixel', desc: 'Claude evaluates your product across 13 dimensions — Nielsen\'s 10 heuristics plus conversion quality, mobile experience, and trust & credibility.' },
              { step: '03', title: 'Get actionable fixes', desc: 'Severity-ranked issues with specific recommendations your team can act on today.' },
            ].map((item) => (
              <div key={item.step} className="p-10" style={{ background: pageBg }}>
                <span className="font-bold text-sm tracking-[0.1em]" style={{ color: '#0044E4', fontFamily: 'Inter, sans-serif' }}>{item.step}</span>
                <h3
                  className="text-xl mt-4 mb-3"
                  style={{ color: textPrimary, fontWeight: 700, fontFamily: 'Inter, sans-serif' }}
                >
                  {item.title}
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: textMuted }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What we audit */}
      <section className="py-24 px-8" style={{ borderTop: `1px solid ${border}` }}>
        <div className="max-w-5xl mx-auto">
          <p className="text-xs font-semibold tracking-[0.2em] uppercase mb-6" style={{ color: '#0044E4' }}>13-Dimension Framework</p>
          <h2
            className="text-3xl tracking-tight mb-4"
            style={{ color: textPrimary, fontWeight: 700, letterSpacing: '-1.5px', fontFamily: 'Inter, sans-serif' }}
          >
            More than usability. Built for business.
          </h2>
          <p className="text-sm mb-12 max-w-2xl" style={{ color: textMuted }}>Most audits stop at usability. Ours goes further — scoring conversion quality, mobile experience, and trust signals alongside Nielsen&apos;s 10 heuristics, so you get a complete picture of what&apos;s costing you users and revenue.</p>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-px mb-px" style={{ background: divider }}>
            {HEURISTICS.map((h, i) => (
              <div key={i} className="p-6 flex flex-col items-start" style={{ background: pageBg }}>
                <span className="font-bold text-2xl mb-3" style={{ color: '#0044E4', fontFamily: 'Inter, sans-serif' }}>{String(i + 1).padStart(2, '0')}</span>
                <span className="text-xs font-medium leading-snug" style={{ color: featureDim }}>{h}</span>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-px" style={{ background: divider }}>
            {[
              { icon: '↗', label: 'Conversion quality', desc: 'CTAs, flow friction, value prop clarity, and conversion-point trust signals.' },
              { icon: '⊡', label: 'Mobile experience', desc: 'Touch targets, thumb zones, scroll behaviour, and performance perception.' },
              { icon: '◈', label: 'Trust & credibility', desc: 'Social proof, security signals, brand consistency, and copy tone.' },
            ].map((item) => (
              <div key={item.label} className="p-6 flex items-start gap-4" style={{ background: pageBg }}>
                <span className="font-bold text-xl mt-0.5" style={{ color: '#0044E4', fontFamily: 'Inter, sans-serif' }}>{item.icon}</span>
                <div>
                  <span className="text-xs font-semibold block mb-1" style={{ color: featureDim }}>{item.label}</span>
                  <span className="text-xs leading-relaxed" style={{ color: textMuted }}>{item.desc}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Input modes */}
      <section className="py-24 px-8" style={{ borderTop: `1px solid ${border}` }}>
        <div className="max-w-5xl mx-auto">
          <p className="text-xs font-semibold tracking-[0.2em] uppercase mb-6" style={{ color: '#0044E4' }}>Input modes</p>
          <h2
            className="text-3xl tracking-tight mb-12"
            style={{ color: textPrimary, fontWeight: 700, letterSpacing: '-1.5px', fontFamily: 'Inter, sans-serif' }}
          >
            Works however you work.
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-px" style={{ background: divider }}>
            {[
              { icon: '🌐', title: 'Live URL', desc: 'Paste any https:// URL. We screenshot the page automatically and run the audit.' },
              { icon: '◆', title: 'Figma file', desc: 'Connect your Figma account. We pull frames directly from your design file.' },
              { icon: '📱', title: 'Screenshots', desc: 'Upload up to 20 images. Drag to reorder. We audit the full flow holistically.' },
            ].map((item) => (
              <div key={item.title} className="p-10" style={{ background: pageBg }}>
                <span className="text-3xl mb-4 block">{item.icon}</span>
                <h3
                  className="text-lg mb-3"
                  style={{ color: textPrimary, fontWeight: 700, fontFamily: 'Inter, sans-serif' }}
                >
                  {item.title}
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: textMuted }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24 px-8 text-center" style={{ borderTop: `1px solid ${border}` }}>
        <div className="max-w-5xl mx-auto">
          <p className="text-xs font-semibold tracking-[0.2em] uppercase mb-6" style={{ color: '#0044E4' }}>Pricing</p>
          <h2
            className="text-3xl tracking-tight mb-4"
            style={{ color: textPrimary, fontWeight: 700, letterSpacing: '-1.5px', fontFamily: 'Inter, sans-serif' }}
          >
            Simple pricing. No subscriptions.
          </h2>
          <p className="text-sm mb-4 max-w-lg mx-auto" style={{ color: textMuted }}>Pay once, keep the report forever. Every audit includes a shareable link and PDF export.</p>
          <p className="text-xs mb-16 max-w-lg mx-auto leading-relaxed" style={{ color: dimText }}>
            A typical UX audit from an agency costs AED 5,000–15,000+ and takes 2–4 weeks.<br />Get actionable insights today for only AED 120.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-px max-w-4xl mx-auto" style={{ background: divider }}>
            {/* Free */}
            <div className="p-10 text-left" style={{ background: pageBg }}>
              <span className="text-xs font-semibold tracking-[0.15em] uppercase" style={{ color: dimText }}>Free</span>
              <div
                className="text-4xl mt-3 mb-1"
                style={{ color: textPrimary, fontWeight: 700, fontFamily: 'Inter, sans-serif', letterSpacing: '-1.5px' }}
              >
                AED 0
              </div>
              <p className="text-xs mb-8" style={{ color: dimText }}>per audit</p>
              <ul className="space-y-3 text-sm mb-10" style={{ color: featureText }}>
                <li className="flex items-start gap-2"><span className="mt-0.5" style={{ color: '#0044E4' }}>✓</span> 1 screenshot</li>
                <li className="flex items-start gap-2"><span className="mt-0.5" style={{ color: '#0044E4' }}>✓</span> Overall score</li>
                <li className="flex items-start gap-2"><span className="mt-0.5" style={{ color: '#0044E4' }}>✓</span> Top 3 issues</li>
                <li className="flex items-start gap-2"><span style={{ color: checkDim }} className="mt-0.5">✕</span><span style={{ color: textDimmer }}>Full heuristic scorecard</span></li>
                <li className="flex items-start gap-2"><span style={{ color: checkDim }} className="mt-0.5">✕</span><span style={{ color: textDimmer }}>PDF export</span></li>
              </ul>
              <Link
                href="/audit/run"
                className="block text-center px-6 py-3 border text-sm font-medium rounded-sm transition-all"
                style={{ borderColor: border, color: textMuted }}
              >
                Start free audit
              </Link>
            </div>

            {/* Full */}
            <div className="p-10 text-left relative" style={{ background: pageBg, border: '1px solid #0044E4' }}>
              <div className="absolute -top-px left-0 right-0 h-[2px]" style={{ background: '#0044E4' }} />
              <span className="text-xs font-semibold tracking-[0.15em] uppercase" style={{ color: '#0044E4' }}>Full audit</span>
              <div
                className="text-4xl mt-3 mb-1"
                style={{ color: textPrimary, fontWeight: 700, fontFamily: 'Inter, sans-serif', letterSpacing: '-1.5px' }}
              >
                AED 120
              </div>
              <p className="text-xs mb-8" style={{ color: dimText }}>one-time</p>
              <ul className="space-y-3 text-sm mb-10" style={{ color: featureText }}>
                <li className="flex items-start gap-2"><span className="mt-0.5" style={{ color: '#0044E4' }}>✓</span> Unlimited screenshots</li>
                <li className="flex items-start gap-2"><span className="mt-0.5" style={{ color: '#0044E4' }}>✓</span> All 13 dimensions scored</li>
                <li className="flex items-start gap-2"><span className="mt-0.5" style={{ color: '#0044E4' }}>✓</span> Every issue + fix</li>
                <li className="flex items-start gap-2"><span className="mt-0.5" style={{ color: '#0044E4' }}>✓</span> Conversion, mobile & trust analysis</li>
                <li className="flex items-start gap-2"><span className="mt-0.5" style={{ color: '#0044E4' }}>✓</span> PDF export + shareable link</li>
              </ul>
              <Link
                href="/audit/run"
                className="block text-center px-6 py-3 text-white text-sm font-semibold rounded-sm transition-all"
                style={{ background: '#0044E4' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#0035C0' }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '#0044E4' }}
              >
                Run full audit &rarr;
              </Link>
            </div>

            {/* Agency */}
            <div className="p-10 text-left" style={{ background: pageBg }}>
              <span className="text-xs font-semibold tracking-[0.15em] uppercase" style={{ color: dimText }}>Agency 5-pack</span>
              <div
                className="text-4xl mt-3 mb-1"
                style={{ color: textPrimary, fontWeight: 700, fontFamily: 'Inter, sans-serif', letterSpacing: '-1.5px' }}
              >
                AED 449
              </div>
              <p className="text-xs mb-8" style={{ color: dimText }}>5 audits · AED 90 each · never expire</p>
              <ul className="space-y-3 text-sm mb-10" style={{ color: featureText }}>
                <li className="flex items-start gap-2"><span className="mt-0.5" style={{ color: '#0044E4' }}>✓</span> 5 full audit credits</li>
                <li className="flex items-start gap-2"><span className="mt-0.5" style={{ color: '#0044E4' }}>✓</span> White-label PDF</li>
                <li className="flex items-start gap-2"><span className="mt-0.5" style={{ color: '#0044E4' }}>✓</span> Credits never expire</li>
                <li className="flex items-start gap-2"><span className="mt-0.5" style={{ color: '#0044E4' }}>✓</span> All full audit features</li>
                <li className="flex items-start gap-2"><span className="mt-0.5" style={{ color: '#0044E4' }}>✓</span> Priority support</li>
              </ul>
              <button
                onClick={() => {
                  navigator.clipboard.writeText('hello@ruonalim.com')
                  const btn = document.getElementById('agency-copy-btn')
                  if (btn) { btn.textContent = 'Copied!'; setTimeout(() => { btn.textContent = 'Get in touch'; }, 2000); }
                }}
                id="agency-copy-btn"
                className="block w-full text-center px-6 py-3 border text-sm font-medium rounded-sm transition-all cursor-pointer"
                style={{ borderColor: border, color: textMuted }}
              >
                Get in touch
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-8 text-center" style={{ borderTop: `1px solid ${border}` }}>
        <div className="max-w-3xl mx-auto">
          <h2
            className="text-[clamp(1.8rem,3.5vw,3rem)] tracking-tight mb-6"
            style={{ color: textPrimary, fontWeight: 700, letterSpacing: '-2px', lineHeight: '0.97', fontFamily: 'Inter, sans-serif' }}
          >
            Stop guessing.<br />Start knowing.
          </h2>
          <p className="mb-10 max-w-lg mx-auto" style={{ color: textMuted }}>
            Every day your product has UX issues, you&apos;re losing users. Get your first audit free in 30 seconds.
          </p>
          <Link
            href="/audit/run"
            className="inline-flex items-center gap-3 px-10 py-4 text-white font-semibold rounded-sm transition-all hover:-translate-y-0.5"
            style={{ background: '#0044E4' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#0035C0' }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '#0044E4' }}
          >
            Run free audit &rarr;
          </Link>
        </div>
      </section>
    </>
  )
}

export default function AuditLanding() {
  return (
    <AuditShell>
      <AuditLandingContent />
    </AuditShell>
  )
}
