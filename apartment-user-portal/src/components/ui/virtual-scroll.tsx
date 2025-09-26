"use client"

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react'
// import { FixedSizeList as List } from 'react-window'

interface VirtualScrollProps<T> {
  items: T[]
  height: number
  itemHeight: number
  renderItem: ({ index, style, data }: { index: number, style: React.CSSProperties, data: T }) => React.ReactNode
  className?: string
  overscanCount?: number
}

export function VirtualScroll<T>({
  items,
  height,
  itemHeight,
  renderItem,
  className = '',
  overscanCount = 5
}: VirtualScrollProps<T>) {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  if (!isClient) {
    // Fallback for SSR
    return (
      <div className={`space-y-2 ${className}`} style={{ height }}>
        {items.slice(0, Math.ceil(height / itemHeight)).map((item, index) => (
          <div key={index} style={{ height: itemHeight }}>
            {renderItem({ index, style: { height: itemHeight }, data: item })}
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className={className}>
      {/* <List
        height={height}
        itemCount={items.length}
        itemSize={itemHeight}
        itemData={items}
        overscanCount={overscanCount}
      >
        {({ index, style, data }) => renderItem({ index, style, data: data[index] })}
      </List> */}
      <div>Virtual scroll component disabled</div>
    </div>
  )
}

// Hook for virtual scrolling
export function useVirtualScroll<T>(
  items: T[],
  containerHeight: number,
  itemHeight: number
) {
  const [visibleRange, setVisibleRange] = useState({ start: 0, end: 0 })
  const containerRef = useRef<HTMLDivElement>(null)

  const visibleItems = useMemo(() => {
    return items.slice(visibleRange.start, visibleRange.end)
  }, [items, visibleRange])

  const updateVisibleRange = useCallback(() => {
    if (!containerRef.current) return

    const scrollTop = containerRef.current.scrollTop
    const start = Math.floor(scrollTop / itemHeight)
    const end = Math.min(
      start + Math.ceil(containerHeight / itemHeight) + 1,
      items.length
    )

    setVisibleRange({ start, end })
  }, [containerHeight, itemHeight, items.length])

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    updateVisibleRange()
    container.addEventListener('scroll', updateVisibleRange)
    return () => container.removeEventListener('scroll', updateVisibleRange)
  }, [updateVisibleRange])

  return {
    containerRef,
    visibleItems,
    visibleRange,
    totalHeight: items.length * itemHeight
  }
}
