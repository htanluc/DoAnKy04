import { useState, useEffect } from 'react'

interface Breakpoint {
  sm: number
  md: number
  lg: number
  xl: number
  '2xl': number
}

const breakpoints: Breakpoint = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536
}

export function useResponsive() {
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0
  })

  const [isMobile, setIsMobile] = useState(false)
  const [isTablet, setIsTablet] = useState(false)
  const [isDesktop, setIsDesktop] = useState(false)

  useEffect(() => {
    function handleResize() {
      const width = window.innerWidth
      const height = window.innerHeight

      setWindowSize({ width, height })
      setIsMobile(width < breakpoints.md)
      setIsTablet(width >= breakpoints.md && width < breakpoints.lg)
      setIsDesktop(width >= breakpoints.lg)
    }

    // Set initial size
    handleResize()

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const isBreakpoint = (breakpoint: keyof Breakpoint) => {
    const width = windowSize.width
    switch (breakpoint) {
      case 'sm':
        return width >= breakpoints.sm
      case 'md':
        return width >= breakpoints.md
      case 'lg':
        return width >= breakpoints.lg
      case 'xl':
        return width >= breakpoints.xl
      case '2xl':
        return width >= breakpoints['2xl']
      default:
        return false
    }
  }

  const isBelowBreakpoint = (breakpoint: keyof Breakpoint) => {
    const width = windowSize.width
    switch (breakpoint) {
      case 'sm':
        return width < breakpoints.sm
      case 'md':
        return width < breakpoints.md
      case 'lg':
        return width < breakpoints.lg
      case 'xl':
        return width < breakpoints.xl
      case '2xl':
        return width < breakpoints['2xl']
      default:
        return false
    }
  }

  return {
    windowSize,
    isMobile,
    isTablet,
    isDesktop,
    isBreakpoint,
    isBelowBreakpoint,
    breakpoints
  }
}

// Hook for managing viewport
export function useViewport() {
  const [viewport, setViewport] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0
  })

  useEffect(() => {
    function handleResize() {
      setViewport({
        width: window.innerWidth,
        height: window.innerHeight
      })
    }

    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return viewport
}

// Hook for managing orientation
export function useOrientation() {
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait')

  useEffect(() => {
    function handleOrientationChange() {
      setOrientation(
        window.innerHeight > window.innerWidth ? 'portrait' : 'landscape'
      )
    }

    handleOrientationChange()
    window.addEventListener('resize', handleOrientationChange)
    window.addEventListener('orientationchange', handleOrientationChange)
    
    return () => {
      window.removeEventListener('resize', handleOrientationChange)
      window.removeEventListener('orientationchange', handleOrientationChange)
    }
  }, [])

  return orientation
}

// Hook for managing scroll position
export function useScrollPosition() {
  const [scrollPosition, setScrollPosition] = useState(0)

  useEffect(() => {
    function handleScroll() {
      setScrollPosition(window.pageYOffset)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return scrollPosition
}

// Hook for managing device capabilities
export function useDeviceCapabilities() {
  const [capabilities, setCapabilities] = useState({
    touch: false,
    hover: true,
    reducedMotion: false
  })

  useEffect(() => {
    const touch = 'ontouchstart' in window || navigator.maxTouchPoints > 0
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    setCapabilities({
      touch,
      hover: !touch,
      reducedMotion
    })
  }, [])

  return capabilities
} 