"use client"

import { useState, useEffect } from 'react'

interface MenuTestProps {
  isMenuOpen: boolean
  isMobile: boolean
  onToggle: () => void
}

export function MenuTest({ isMenuOpen, isMobile, onToggle }: MenuTestProps) {
  const [testResults, setTestResults] = useState<string[]>([])

  const addTestResult = (message: string) => {
    const timestamp = new Date().toLocaleTimeString()
    setTestResults(prev => [...prev, `${timestamp}: ${message}`])
  }

  useEffect(() => {
    addTestResult(`Menu state changed: ${isMenuOpen ? 'OPEN' : 'CLOSED'}`)
  }, [isMenuOpen])

  useEffect(() => {
    addTestResult(`Mobile state changed: ${isMobile ? 'MOBILE' : 'DESKTOP'}`)
  }, [isMobile])

  const handleTestToggle = () => {
    addTestResult('Manual toggle clicked')
    console.log('Test panel: Manual toggle clicked')
    onToggle()
  }

  const clearResults = () => {
    setTestResults([])
  }

  if (process.env.NODE_ENV !== 'development') {
    return null
  }

  return (
    <div className="fixed bottom-4 right-4 bg-black bg-opacity-75 text-white p-4 rounded-lg text-xs z-50 max-w-sm">
      <h3 className="font-bold mb-2">Menu Test Panel</h3>
      
      <div className="space-y-2 mb-4">
        <div className="flex items-center space-x-2">
          <span>Menu:</span>
          <span className={`px-2 py-1 rounded text-xs ${isMenuOpen ? 'bg-green-600' : 'bg-red-600'}`}>
            {isMenuOpen ? 'OPEN' : 'CLOSED'}
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <span>Device:</span>
          <span className={`px-2 py-1 rounded text-xs ${isMobile ? 'bg-blue-600' : 'bg-purple-600'}`}>
            {isMobile ? 'MOBILE' : 'DESKTOP'}
          </span>
        </div>
      </div>

      <div className="space-y-2 mb-4">
        <button
          onClick={handleTestToggle}
          className="w-full px-2 py-1 bg-blue-600 text-white rounded text-xs"
        >
          Test Toggle Menu
        </button>
        <button
          onClick={clearResults}
          className="w-full px-2 py-1 bg-gray-600 text-white rounded text-xs"
        >
          Clear Results
        </button>
      </div>

      <div className="max-h-32 overflow-y-auto">
        <h4 className="font-semibold mb-1">Test Results:</h4>
        {testResults.slice(-5).map((result, index) => (
          <div key={index} className="text-xs text-gray-300 mb-1">
            {result}
          </div>
        ))}
      </div>
    </div>
  )
} 