import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { GeistMono } from 'geist/font/mono'
import './globals.css'
import Menu from './components/Menu'
import DarkModeToggle from './components/DarkModeToggle'
import ThemeScript from './components/ThemeScript'

const inter = Inter({
  weight: ['300', '400', '500', '700'],
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'PLAYFIGHTER®',
  description: 'Daily journal documenting my journey from 19-22 while building Combat Créatif.',
  metadataBase: new URL('https://playfighter.co'),
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${inter.variable} ${GeistMono.variable}`} suppressHydrationWarning>
      <body className="min-h-screen">
        <ThemeScript />
        <div className="max-w-reading mx-auto px-6 py-12 md:py-20">
          <header className="mb-20 relative z-50">
            <nav className="relative flex justify-center items-center">
              <Menu />
              <a href="/" className="font-sans text-2xl md:text-3xl font-bold relative z-50" style={{ fontFamily: 'Helvetica, Arial, sans-serif' }}>
                PLAYFIGHTER
              </a>
              <div className="absolute right-0 z-50">
                <DarkModeToggle />
              </div>
            </nav>
          </header>

          <main>{children}</main>

          <footer className="mt-24 pt-8 text-xs font-mono text-black/40 dark:text-[#e5e5e5]/40 text-center">
          </footer>
        </div>
      </body>
    </html>
  )
}
