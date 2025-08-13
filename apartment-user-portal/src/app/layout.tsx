import type { Metadata, Viewport } from 'next'
import { Be_Vietnam_Pro } from 'next/font/google'
import './globals.css'
import { Toaster } from '@/components/ui/toaster'

const beVietnam = Be_Vietnam_Pro({ subsets: ['latin'], variable: '--font-be-vietnam', weight: ["300","400","500","600","700"] })

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
}

export const metadata: Metadata = {
  metadataBase: new URL('http://localhost:3001'),
  title: 'Trải Nghiệm Căn Hộ FPT',
  description: 'Hệ thống quản lý căn hộ thông minh - Trải nghiệm sống tiện nghi và hiện đại',
  keywords: 'căn hộ, quản lý, thông minh, FPT, cư dân',
  authors: [{ name: 'FPT Apartment Management' }],
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
      <body className={`${beVietnam.variable} ${beVietnam.className} h-full antialiased`}>
        {children}
        <Toaster />
      </body>
    </html>
  )
} 