'use client'

import Link from 'next/link'

export default function AuditNav() {
  return (
    <nav
      aria-label="Main navigation"
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 h-16 backdrop-blur-md border-b"
      style={{
        background: 'rgba(255,255,255,0.92)',
        borderBottomColor: '#E8E8EC',
      }}
    >
      <Link
        href="/"
        aria-label="ruonalim – home"
        className="font-bold text-lg tracking-tight"
        style={{ color: '#111111', fontFamily: 'Inter, sans-serif', letterSpacing: '-0.04em' }}
      >
        ruonalim<span aria-hidden="true" style={{ color: '#0044E4' }}>.</span>
      </Link>

      <div className="flex items-center gap-6 text-sm">
        {[
          { href: '/#services', label: 'Services' },
          { href: '/#clients', label: 'Work' },
          { href: '/#about', label: 'About' },
          { href: '/writing', label: 'Perspectives' },
        ].map(link => (
          <Link
            key={link.href}
            href={link.href}
            className="hidden md:inline transition-colors duration-200"
            style={{ color: '#96969E' }}
            onMouseEnter={e => (e.currentTarget.style.color = '#111111')}
            onMouseLeave={e => (e.currentTarget.style.color = '#96969E')}
          >
            {link.label}
          </Link>
        ))}

        <Link
          href="/audit"
          className="font-semibold border px-3 py-1 rounded-sm transition-colors duration-300"
          style={{ color: '#0044E4', borderColor: 'rgba(0,68,228,0.3)' }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#EAF0FF' }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent' }}
        >
          UX Audit
        </Link>

        <Link
          href="/audit/run"
          className="px-5 py-2 text-white font-medium rounded-sm transition-colors"
          style={{ background: '#0044E4' }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#0035C0' }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '#0044E4' }}
        >
          Run audit
        </Link>
      </div>
    </nav>
  )
}
