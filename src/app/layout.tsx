import './globals.css'
import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import { AuthProvider } from '@/hooks/use-auth-fixed'
import { QueryProvider } from '@/components/providers/query-provider'
import { Toaster } from 'sonner'
import { SmartNotifications } from '@/components/ui/smart-notifications'
import { AIAssistantProvider } from '@/contexts/AIAssistantContext'

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Manus Fisio - Sistema de Gestão Clínica',
  description: 'Sistema integrado de gestão para clínica de fisioterapia com funcionalidades de mentoria, projetos e colaboração.',
  metadataBase: new URL('https://manus-fisio.vercel.app'),
  keywords: ['fisioterapia', 'gestão', 'clínica', 'mentoria', 'projetos', 'colaboração', 'prontuário eletrônico'],
  authors: [{ name: 'Manus Fisio Team', url: 'https://manus-fisio.vercel.app' }],
  creator: 'Manus Fisio',
  publisher: 'Manus Fisio',
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: 'https://manus-fisio.vercel.app',
  },
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    url: 'https://manus-fisio.vercel.app',
    title: 'Manus Fisio - Otimize sua Clínica de Fisioterapia',
    description: 'Sistema de gestão completo para fisioterapeutas. Gerencie pacientes, agendamentos, exercícios e finanças em um só lugar.',
    siteName: 'Manus Fisio',
    images: [
      {
        url: '/opengraph-image.png', // Placeholder image
        width: 1200,
        height: 630,
        alt: 'Manus Fisio - Sistema de Gestão para Clínicas de Fisioterapia',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Manus Fisio - Otimize sua Clínica de Fisioterapia',
    description: 'Sistema de gestão completo para fisioterapeutas. Gerencie pacientes, agendamentos, exercícios e finanças em um só lugar.',
    images: ['/twitter-image.png'], // Placeholder image
  },
  manifest: '/manifest.json',
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
    apple: '/icons/icon-180x180.png',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Manus Fisio',
  },
  formatDetection: {
    telephone: false,
  },
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
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Manus Fisio',
    url: 'https://manus-fisio.vercel.app',
    logo: 'https://manus-fisio.vercel.app/favicon.svg',
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'Customer Support',
      email: 'suporte@manusfisio.com'
    }
  }

  return (
    <html lang="pt-BR" className="dark">
      <body className={`${inter.variable} font-sans antialiased`}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <AIAssistantProvider>
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
        </AIAssistantProvider>
      </body>
    </html>
  )
} 