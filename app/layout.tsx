import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'UX Audit Tool | AI-Powered Heuristic Analysis | ruonalim.',
  description: 'Get an instant AI-powered UX audit scored against Nielsen\'s 10 Usability Heuristics. Submit a website, Figma file, or screenshots.',
  openGraph: {
    title: 'UX Audit Tool | ruonalim.',
    description: 'AI-powered UX audit scored against Nielsen\'s 10 Heuristics. Free snapshot in seconds.',
    url: 'https://ruonalim.com/audit',
    siteName: 'ruonalim.',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
