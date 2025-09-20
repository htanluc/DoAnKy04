import type { Metadata, Viewport } from 'next'
import { Be_Vietnam_Pro } from 'next/font/google'
import './globals.css'
import { Toaster } from '@/components/ui/toaster'
import ErrorBoundary from '@/components/ui/error-boundary'
import PerformanceMonitor from '@/components/ui/performance-monitor'
import { PWAInstall } from '@/components/pwa/pwa-install'
import RequestDeduplicationMonitor from '@/components/debug/request-deduplication-monitor'
import Script from 'next/script'
import { pwaMetadata } from './pwa-metadata'

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
  ...pwaMetadata,
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
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="FPT Apartment" />
      </head>
      <body className={`${beVietnam.variable} ${beVietnam.className} h-full antialiased`}>
        <ErrorBoundary>
          {children}
        </ErrorBoundary>
        <Toaster />
        <PerformanceMonitor />
        <RequestDeduplicationMonitor />
        <PWAInstall />
        <Script
          id="sw-registration"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js')
                    .then(function(registration) {
                      console.log('SW registered: ', registration);
                    })
                    .catch(function(registrationError) {
                      console.log('SW registration failed: ', registrationError);
                    });
                });
              }
            `,
          }}
        />
      </body>
    </html>
  )
} 