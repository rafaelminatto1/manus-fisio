import './globals.css'
import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import { AuthProvider } from '@/hooks/use-auth'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { useState } from 'react'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Manus Fisio - Sistema de Gestão Clínica',
  description: 'Sistema integrado de gestão para clínica de fisioterapia com funcionalidades de mentoria, projetos e colaboração.',
  metadataBase: new URL('https://manus-fisio.vercel.app'),
  keywords: ['fisioterapia', 'gestão', 'clínica', 'mentoria', 'projetos', 'colaboração'],
  authors: [{ name: 'Manus Fisio Team' }],
  creator: 'Manus Fisio',
  publisher: 'Manus Fisio',
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    url: 'https://manus-fisio.vercel.app',
    title: 'Manus Fisio - Sistema de Gestão Clínica',
    description: 'Sistema integrado de gestão para clínica de fisioterapia',
    siteName: 'Manus Fisio',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Manus Fisio - Sistema de Gestão Clínica',
    description: 'Sistema integrado de gestão para clínica de fisioterapia',
  },
  manifest: '/manifest.json',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0f172a' },
  ],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR" className="dark">
      <body className={`${inter.variable} font-sans antialiased`}>
        <AuthProvider>
          <div id="root" className="min-h-screen bg-background text-foreground">
            {children}
          </div>
        </AuthProvider>
      </body>
    </html>
  )
} 