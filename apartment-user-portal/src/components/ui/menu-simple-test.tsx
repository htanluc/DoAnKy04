"use client"

import { useState } from 'react'

interface MenuSimpleTestProps {
  isMenuOpen: boolean
  isMobile: boolean
  onToggle: () => void
}

export function MenuSimpleTest({ isMenuOpen, isMobile, onToggle }: MenuSimpleTestProps) {
  const [testCount, setTestCount] = useState(0)

  const handleTest = () => {
    setTestCount(prev => prev + 1)
    console.log(`Simple test #${testCount + 1}: Toggling menu`)
    onToggle()
  }

  if (process.env.NODE_ENV !== 'development') {
    return null
  }

  return (
    <div className="fixed top-4 right-4 bg-red-600 text-white p-3 rounded-lg text-xs z-50">
      <div className="font-bold mb-2">Simple Menu Test</div>
      <div className="space-y-1 mb-3">
        <div>Menu: {isMenuOpen ? '🟢 OPEN' : '🔴 CLOSED'}</div>
        <div>Device: {isMobile ? '📱 MOBILE' : '💻 DESKTOP'}</div>
        <div>Tests: {testCount}</div>
      </div>
      <button
        onClick={handleTest}
        className="w-full px-2 py-1 bg-white text-red-600 rounded text-xs font-bold"
      >
        TOGGLE MENU
      </button>
    </div>
  )
} 