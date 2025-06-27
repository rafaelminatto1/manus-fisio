import './globals.css'
import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import { AuthProvider } from '@/hooks/use-auth'
import { QueryProvider } from '@/components/providers/query-provider'
import { Toaster } from 'sonner'

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

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
  viewportFit: 'cover',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0f172a' },
  ],
  other: {
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'black-translucent',
    'apple-mobile-web-app-title': 'Manus Fisio',
    'mobile-web-app-capable': 'yes',
    'format-detection': 'telephone=no',
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR" className="dark">
      <body className={`${inter.variable} font-sans antialiased`}>
        <QueryProvider>
          <AuthProvider>
            <div id="root" className="min-h-screen bg-background text-foreground">
              {children}
            </div>
            <Toaster 
              position="top-right"
              richColors
              closeButton
            />
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  )
} 