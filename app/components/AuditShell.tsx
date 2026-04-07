'use client'

import { ReactNode } from 'react'
import Link from 'next/link'
import AuditNav from './AuditNav'

export default function AuditShell({ children }: { children: ReactNode }) {
  return (
    <div
      className="min-h-screen"
      style={{
        background: '#ffffff',
        color: '#141414',
      }}
    >
      <a href="#main-content" className="skip-link">Skip to main content</a>
      <AuditNav />
      <main id="main-content">
        {children}
      </main>
      <footer
        aria-label="Footer"
        className="py-10 px-8 border-t flex items-center justify-between"
        style={{ borderTopColor: '#E8E8EC' }}
      >
        <Link
          href="/"
          aria-label="ruonalim – home"
          className="font-bold text-base tracking-tight"
          style={{ color: '#767676', fontFamily: 'Inter, sans-serif', letterSpacing: '-0.04em' }}
        >
          ruonalim<span aria-hidden="true" style={{ color: '#0044E4' }}>.</span>
        </Link>
        <p className="text-xs" style={{ color: '#767676' }}>
          <button
            onClick={() => {
              navigator.clipboard.writeText('hello@ruonalim.com')
              const el = document.getElementById('footer-copy')
              if (el) { el.textContent = 'Copied!'; setTimeout(() => { el.textContent = 'Get in touch'; }, 2000) }
            }}
            id="footer-copy"
            aria-label="Copy email address hello@ruonalim.com"
            className="hover:underline cursor-pointer transition-colors"
            style={{ color: '#0044E4' }}
          >
            Get in touch
          </button>
        </p>
      </footer>
    </div>
  )
}
