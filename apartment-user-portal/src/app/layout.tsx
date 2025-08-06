import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from '@/components/ui/toaster'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Trải Nghiệm Căn Hộ FPT',
  description: 'Hệ thống quản lý căn hộ thông minh - Trải nghiệm sống tiện nghi và hiện đại',
  keywords: 'căn hộ, quản lý, thông minh, FPT, cư dân',
  authors: [{ name: 'FPT Apartment Management' }],
  viewport: 'width=device-width, initial-scale=1',
  robots: 'index, follow',
  openGraph: {
    title: 'Trải Nghiệm Căn Hộ FPT',
    description: 'Hệ thống quản lý căn hộ thông minh - Trải nghiệm sống tiện nghi và hiện đại',
    type: 'website',
    locale: 'vi_VN',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Trải Nghiệm Căn Hộ FPT',
    description: 'Hệ thống quản lý căn hộ thông minh - Trải nghiệm sống tiện nghi và hiện đại',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="vi" className="h-full">
      <body className={`${inter.className} h-full antialiased`}>
        {children}
        <Toaster />
      </body>
    </html>
  )
} 