"use client"

import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals'

interface PerformanceMetrics {
  CLS: number | null
  FID: number | null
  FCP: number | null
  LCP: number | null
  TTFB: number | null
}

class PerformanceMonitor {
  private metrics: PerformanceMetrics = {
    CLS: null,
    FID: null,
    FCP: null,
    LCP: null,
    TTFB: null
  }

  private isMonitoring = false

  startMonitoring() {
    if (this.isMonitoring || typeof window === 'undefined') return

    this.isMonitoring = true

    // Core Web Vitals
    getCLS((metric) => {
      this.metrics.CLS = metric.value
      this.logMetric('CLS', metric)
    })

    getFID((metric) => {
      this.metrics.FID = metric.value
      this.logMetric('FID', metric)
    })

    getFCP((metric) => {
      this.metrics.FCP = metric.value
      this.logMetric('FCP', metric)
    })

    getLCP((metric) => {
      this.metrics.LCP = metric.value
      this.logMetric('LCP', metric)
    })

    getTTFB((metric) => {
      this.metrics.TTFB = metric.value
      this.logMetric('TTFB', metric)
    })

    // Additional performance monitoring
    this.monitorResourceTiming()
    this.monitorNavigationTiming()
  }

  private logMetric(name: string, metric: any) {
    const isGood = this.isGoodScore(name, metric.value)
    const status = isGood ? '✅ Good' : '⚠️ Needs Improvement'
    
    console.log(`[Performance] ${name}: ${metric.value.toFixed(2)}ms ${status}`)
    
    // Send to analytics in production
    if (process.env.NODE_ENV === 'production') {
      this.sendToAnalytics(name, metric)
    }
  }

  private isGoodScore(metricName: string, value: number): boolean {
    const thresholds: Record<string, { good: number; needsImprovement: number }> = {
      CLS: { good: 0.1, needsImprovement: 0.25 },
      FID: { good: 100, needsImprovement: 300 },
      FCP: { good: 1800, needsImprovement: 3000 },
      LCP: { good: 2500, needsImprovement: 4000 },
      TTFB: { good: 800, needsImprovement: 1800 }
    }

    const threshold = thresholds[metricName]
    return threshold ? value <= threshold.good : true
  }

  private sendToAnalytics(name: string, metric: any) {
    // Send to your analytics service
    // Example: gtag('event', 'web_vitals', { ... })
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'web_vitals', {
        metric_name: name,
        metric_value: Math.round(metric.value),
        metric_delta: Math.round(metric.delta),
        metric_id: metric.id,
        metric_rating: this.isGoodScore(name, metric.value) ? 'good' : 'needs-improvement'
      })
    }
  }

  private monitorResourceTiming() {
    if (typeof window === 'undefined') return

    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.entryType === 'resource') {
          const resource = entry as PerformanceResourceTiming
          const loadTime = resource.responseEnd - resource.requestStart
          
          if (loadTime > 3000) { // Resources taking longer than 3s
            console.warn(`[Performance] Slow resource: ${resource.name} (${loadTime.toFixed(2)}ms)`)
          }
        }
      }
    })

    observer.observe({ entryTypes: ['resource'] })
  }

  private monitorNavigationTiming() {
    if (typeof window === 'undefined') return

    window.addEventListener('load', () => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
      
      const metrics = {
        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
        loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
        totalPageLoad: navigation.loadEventEnd - navigation.fetchStart
      }

      console.log('[Performance] Navigation timing:', metrics)

      if (metrics.totalPageLoad > 5000) {
        console.warn(`[Performance] Slow page load: ${metrics.totalPageLoad.toFixed(2)}ms`)
      }
    })
  }

  getMetrics(): PerformanceMetrics {
    return { ...this.metrics }
  }

  getPerformanceScore(): number {
    const scores = Object.values(this.metrics).filter(score => score !== null) as number[]
    if (scores.length === 0) return 0

    // Simple scoring: count good scores vs total
    const goodScores = scores.filter((score, index) => {
      const metricNames = Object.keys(this.metrics) as Array<keyof PerformanceMetrics>
      const metricName = metricNames[index]
      return this.isGoodScore(metricName, score)
    }).length

    return Math.round((goodScores / scores.length) * 100)
  }

  reset() {
    this.metrics = {
      CLS: null,
      FID: null,
      FCP: null,
      LCP: null,
      TTFB: null
    }
    this.isMonitoring = false
  }
}

// Create singleton instance
export const performanceMonitor = new PerformanceMonitor()

// Auto-start monitoring in production
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'production') {
  performanceMonitor.startMonitoring()
}

export default performanceMonitor
