"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './card'
import { Button } from './button'
import { Badge } from './badge'
import { Activity, Zap, Clock, AlertTriangle, CheckCircle } from 'lucide-react'
import { performanceMonitor } from '@/lib/performance'

interface PerformanceMonitorProps {
  className?: string
}

export const PerformanceMonitor: React.FC<PerformanceMonitorProps> = ({ className = '' }) => {
  const [metrics, setMetrics] = useState(performanceMonitor.getMetrics())
  const [isVisible, setIsVisible] = useState(false)
  const [score, setScore] = useState(0)

  useEffect(() => {
    if (process.env.NODE_ENV !== 'development') return

    const interval = setInterval(() => {
      setMetrics(performanceMonitor.getMetrics())
      setScore(performanceMonitor.getPerformanceScore())
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  if (process.env.NODE_ENV !== 'development') return null

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getScoreIcon = (score: number) => {
    if (score >= 80) return <CheckCircle className="h-4 w-4 text-green-600" />
    if (score >= 60) return <AlertTriangle className="h-4 w-4 text-yellow-600" />
    return <AlertTriangle className="h-4 w-4 text-red-600" />
  }

  const formatMetric = (value: number | null, unit: string = 'ms') => {
    if (value === null) return 'N/A'
    return `${value.toFixed(2)}${unit}`
  }

  const getMetricStatus = (metricName: string, value: number | null) => {
    if (value === null) return 'pending'
    
    const thresholds: Record<string, { good: number; needsImprovement: number }> = {
      CLS: { good: 0.1, needsImprovement: 0.25 },
      FID: { good: 100, needsImprovement: 300 },
      FCP: { good: 1800, needsImprovement: 3000 },
      LCP: { good: 2500, needsImprovement: 4000 },
      TTFB: { good: 800, needsImprovement: 1800 }
    }

    const threshold = thresholds[metricName]
    if (!threshold) return 'unknown'

    if (value <= threshold.good) return 'good'
    if (value <= threshold.needsImprovement) return 'needs-improvement'
    return 'poor'
  }

  const getStatusBadge = (status: string) => {
    const config = {
      good: { color: 'bg-green-100 text-green-800', icon: <CheckCircle className="h-3 w-3" /> },
      'needs-improvement': { color: 'bg-yellow-100 text-yellow-800', icon: <AlertTriangle className="h-3 w-3" /> },
      poor: { color: 'bg-red-100 text-red-800', icon: <AlertTriangle className="h-3 w-3" /> },
      pending: { color: 'bg-gray-100 text-gray-800', icon: <Clock className="h-3 w-3" /> },
      unknown: { color: 'bg-gray-100 text-gray-800', icon: <Activity className="h-3 w-3" /> }
    }

    const statusConfig = config[status as keyof typeof config] || config.unknown

    return (
      <Badge className={`${statusConfig.color} border-0`}>
        {statusConfig.icon}
        <span className="ml-1 capitalize">{status}</span>
      </Badge>
    )
  }

  return (
    <div className={`fixed bottom-4 right-4 z-50 ${className}`}>
      {!isVisible ? (
        <Button
          onClick={() => setIsVisible(true)}
          className="rounded-full w-12 h-12 p-0 shadow-lg"
          variant="outline"
        >
          <Zap className="h-5 w-5" />
        </Button>
      ) : (
        <Card className="w-80 shadow-xl border-2">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center">
                <Activity className="h-5 w-5 mr-2" />
                Performance Monitor
              </CardTitle>
              <Button
                onClick={() => setIsVisible(false)}
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
              >
                ×
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Overall Score */}
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-center mb-2">
                {getScoreIcon(score)}
                <span className={`ml-2 text-2xl font-bold ${getScoreColor(score)}`}>
                  {score}%
                </span>
              </div>
              <p className="text-sm text-gray-600">Performance Score</p>
            </div>

            {/* Core Web Vitals */}
            <div className="space-y-3">
              <h4 className="font-semibold text-sm text-gray-700">Core Web Vitals</h4>
              
              {Object.entries(metrics).map(([key, value]) => {
                const status = getMetricStatus(key, value)
                const unit = key === 'CLS' ? '' : 'ms'
                
                return (
                  <div key={key} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium text-gray-600">{key}</span>
                      {getStatusBadge(status)}
                    </div>
                    <span className="text-sm font-mono text-gray-800">
                      {formatMetric(value, unit)}
                    </span>
                  </div>
                )
              })}
            </div>

            {/* Actions */}
            <div className="flex space-x-2 pt-2 border-t">
              <Button
                onClick={() => {
                  performanceMonitor.reset()
                  performanceMonitor.startMonitoring()
                  setMetrics(performanceMonitor.getMetrics())
                }}
                variant="outline"
                size="sm"
                className="flex-1"
              >
                Reset
              </Button>
              {/* <Button
                onClick={() => {
                  const stats = performanceMonitor.getCacheStats()
                  console.log('Cache Stats:', stats)
                }}
                variant="outline"
                size="sm"
                className="flex-1"
              >
                Cache Stats
              </Button> */}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default PerformanceMonitor
