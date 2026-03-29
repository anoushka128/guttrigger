import type { Metadata, Viewport } from 'next'
import { Geist } from 'next/font/google'
import './globals.css'

const geist = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'GutTrigger – Find Your Food Triggers',
  description: 'Track meals and symptoms to identify which foods are causing digestive discomfort.',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'GutTrigger',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#fafaf9',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${geist.variable} h-full`}>
      <body className="min-h-full bg-stone-50 antialiased">{children}</body>
    </html>
  )
}
