import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Rocket Gifts 🚀',
  description: 'Crash-rocket-style game with Telegram gifts',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}

