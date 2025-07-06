import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import AuthProvider from './providers/session-provider'
import { Suspense } from 'react'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Drive-N-Ride - Ride Sharing App',
  description: 'Connect with drivers and passengers for convenient ride sharing',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <Suspense>
          {children}
          </Suspense>
        </AuthProvider>
      </body>
    </html>
  )
}