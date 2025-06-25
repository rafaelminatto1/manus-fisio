import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/hooks/use-auth'

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter'
})

export const metadata: Metadata = {
  title: 'Manus Fisio - Sistema de Gestão Clínica',
  description: 'Sistema integrado de gestão para clínicas de fisioterapia com supervisão de estagiários',
  keywords: ['fisioterapia', 'gestão clínica', 'supervisão', 'estagiários', 'protocolos'],
  authors: [{ name: 'Manus Team' }],
  robots: 'index, follow',
  viewport: 'width=device-width, initial-scale=1',
  themeColor: '#0f172a',
  manifest: '/manifest.json',
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
  openGraph: {
    title: 'Manus Fisio - Sistema de Gestão Clínica',
    description: 'Sistema integrado de gestão para clínicas de fisioterapia',
    type: 'website',
    locale: 'pt_BR',
  },
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