import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { LanguageProvider } from '@/contexts/LanguageContext'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: '잘파는 샤오홍슈 체험단 - 한국 제품 체험 플랫폼',
  description: '한국에서 중국인을 위한 제품 체험 플랫폼, 다양한 한국 브랜드 체험 기회 제공',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <body className={inter.className}>
        <LanguageProvider>
          <div className="min-h-screen bg-gray-50">
            {children}
          </div>
        </LanguageProvider>
      </body>
    </html>
  )
}