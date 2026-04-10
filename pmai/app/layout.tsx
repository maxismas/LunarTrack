import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from '@/components/ui/toaster'
import NextAuthSessionProvider from '@/components/session-provider'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'LunarTrack',
  description: 'LunarTrack — Performance management platform for Lunar Rails',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <NextAuthSessionProvider>
          {children}
        </NextAuthSessionProvider>
        <Toaster />
      </body>
    </html>
  )
}
