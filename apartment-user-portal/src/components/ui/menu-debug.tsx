"use client"

import { useState, useEffect } from 'react'

interface MenuDebugProps {
  isMenuOpen: boolean
  isMobile: boolean
  onToggle: () => void
}

export function MenuDebug({ isMenuOpen, isMobile, onToggle }: MenuDebugProps) {
  const [debugInfo, setDebugInfo] = useState({
    menuOpen: isMenuOpen,
    mobile: isMobile,
    clickCount: 0,
    lastToggleTime: 0
  })

  useEffect(() => {
    setDebugInfo(prev => ({
      ...prev,
      menuOpen: isMenuOpen,
      mobile: isMobile
    }))
  }, [isMenuOpen, isMobile])

  const handleTestClick = () => {
    const now = Date.now()
    setDebugInfo(prev => ({
      ...prev,
      clickCount: prev.clickCount + 1,
      lastToggleTime: now
    }))
    console.log(`Debug panel toggle clicked at ${now}`)
    onToggle()
  }

  if (process.env.NODE_ENV !== 'development') {
    return null
  }

  return (
    <div className="fixed bottom-4 left-4 bg-black bg-opacity-75 text-white p-4 rounded-lg text-xs z-50">
      <h3 className="font-bold mb-2">Menu Debug</h3>
      <div className="space-y-1">
        <div>Menu Open: {isMenuOpen ? 'Yes' : 'No'}</div>
        <div>Mobile: {isMobile ? 'Yes' : 'No'}</div>
        <div>Clicks: {debugInfo.clickCount}</div>
        <div>Last Toggle: {debugInfo.lastToggleTime > 0 ? new Date(debugInfo.lastToggleTime).toLocaleTimeString() : 'Never'}</div>
        <button
          onClick={handleTestClick}
          className="mt-2 px-2 py-1 bg-blue-600 text-white rounded text-xs"
        >
          Test Toggle
        </button>
      </div>
    </div>
  )
} 