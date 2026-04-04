import type { Metadata } from 'next'
import { Almarai, JetBrains_Mono } from 'next/font/google'
import './globals.css'
import { LanguageProvider } from '@/contexts/LanguageContext'
import { AlertProvider } from '@/contexts/AlertContext'

const almarai = Almarai({
  weight: ['300', '400', '700', '800'],
  subsets: ['arabic', 'latin'],
  variable: '--font-almarai',
  display: 'swap',
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains-mono',
})

const siteDescription =
  'Plenvo (بلينفو) — تتبّع الدخل والمصروفات والادخار والاستثمار عبر فترات مالية ديناميكية. Track income, expenses, savings, and investments across dynamic financial periods.'

export const metadata: Metadata = {
  metadataBase: new URL('https://plenvoapp.com'),
  title: {
    default: 'Plenvo | بلينفو — Personal Finance Flow',
    template: '%s — Plenvo',
  },
  description: siteDescription,
  applicationName: 'Plenvo',
  openGraph: {
    type: 'website',
    url: 'https://plenvoapp.com',
    siteName: 'Plenvo',
    title: 'Plenvo | بلينفو',
    description: siteDescription,
    locale: 'ar',
    alternateLocale: ['en'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Plenvo | بلينفو',
    description: siteDescription,
  },
  icons: {
    icon: '/icon.png',
    apple: '/icon.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="ar"
      dir="rtl"
      className={`${almarai.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body
        className={`min-h-full flex flex-col bg-background text-foreground ${almarai.className}`}
      >
        <AlertProvider>
          <LanguageProvider>{children}</LanguageProvider>
        </AlertProvider>
      </body>
    </html>
  )
}
