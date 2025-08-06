"use client"

import { useState, useEffect } from 'react'
import { useResponsive } from '@/hooks/use-responsive'

interface LayoutTestProps {
  children: React.ReactNode
}

export function LayoutTest({ children }: LayoutTestProps) {
  const { isMobile, isTablet, isDesktop } = useResponsive()
  const [layoutInfo, setLayoutInfo] = useState({
    width: 0,
    height: 0,
    deviceType: 'unknown'
  })

  useEffect(() => {
    const updateLayoutInfo = () => {
      setLayoutInfo({
        width: window.innerWidth,
        height: window.innerHeight,
        deviceType: isMobile ? 'mobile' : isTablet ? 'tablet' : 'desktop'
      })
    }

    updateLayoutInfo()
    window.addEventListener('resize', updateLayoutInfo)
    
    return () => window.removeEventListener('resize', updateLayoutInfo)
  }, [isMobile, isTablet])

  return (
    <div className="layout-stable">
      {/* Debug info - only show in development */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed top-0 right-0 bg-black bg-opacity-75 text-white p-2 text-xs z-50">
          <div>Width: {layoutInfo.width}px</div>
          <div>Height: {layoutInfo.height}px</div>
          <div>Device: {layoutInfo.deviceType}</div>
          <div>Mobile: {isMobile ? 'Yes' : 'No'}</div>
          <div>Tablet: {isTablet ? 'Yes' : 'No'}</div>
          <div>Desktop: {isDesktop ? 'Yes' : 'No'}</div>
        </div>
      )}
      
      {children}
    </div>
  )
}

// Component để test responsive behavior
export function ResponsiveTest() {
  const { isMobile, isTablet, isDesktop } = useResponsive()

  return (
    <div className="p-4 space-y-4">
      <div className="bg-blue-100 p-4 rounded-lg">
        <h3 className="font-bold mb-2">Responsive Test</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded border">
            <h4 className="font-semibold">Mobile</h4>
            <p className="text-sm text-gray-600">Active: {isMobile ? 'Yes' : 'No'}</p>
          </div>
          <div className="bg-white p-4 rounded border">
            <h4 className="font-semibold">Tablet</h4>
            <p className="text-sm text-gray-600">Active: {isTablet ? 'Yes' : 'No'}</p>
          </div>
          <div className="bg-white p-4 rounded border">
            <h4 className="font-semibold">Desktop</h4>
            <p className="text-sm text-gray-600">Active: {isDesktop ? 'Yes' : 'No'}</p>
          </div>
          <div className="bg-white p-4 rounded border">
            <h4 className="font-semibold">Screen Size</h4>
            <p className="text-sm text-gray-600">
              {typeof window !== 'undefined' ? `${window.innerWidth}x${window.innerHeight}` : 'Unknown'}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-green-100 p-4 rounded-lg">
        <h3 className="font-bold mb-2">Layout Test</h3>
        <div className="space-y-2">
          <div className="bg-white p-3 rounded border">
            <p className="text-sm">This should not shift when resizing</p>
          </div>
          <div className="bg-white p-3 rounded border">
            <p className="text-sm">Content should remain stable</p>
          </div>
          <div className="bg-white p-3 rounded border">
            <p className="text-sm">Buttons should be clickable</p>
          </div>
        </div>
      </div>
    </div>
  )
} 