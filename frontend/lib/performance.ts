// Performance monitoring utility
interface PerformanceMetrics {
  endpoint: string
  duration: number
  timestamp: Date
  success: boolean
  errorMessage?: string
}

class PerformanceMonitor {
  private metrics: PerformanceMetrics[] = []
  private maxMetrics = 100 // Keep only last 100 requests

  logRequest(endpoint: string, duration: number, success: boolean, errorMessage?: string) {
    const metric: PerformanceMetrics = {
      endpoint,
      duration,
      timestamp: new Date(),
      success,
      errorMessage
    }

    this.metrics.push(metric)
    
    // Keep only the most recent metrics
    if (this.metrics.length > this.maxMetrics) {
      this.metrics = this.metrics.slice(-this.maxMetrics)
    }

    // Log slow requests (>5 seconds)
    if (duration > 5000) {
      console.warn(`Slow API request detected: ${endpoint} took ${duration}ms`)
    }

    // Log failed requests
    if (!success) {
      console.error(`API request failed: ${endpoint} - ${errorMessage}`)
    }
  }

  getMetrics(): PerformanceMetrics[] {
    return [...this.metrics]
  }

  getAverageResponseTime(endpoint?: string): number {
    const filteredMetrics = endpoint 
      ? this.metrics.filter(m => m.endpoint.includes(endpoint))
      : this.metrics

    if (filteredMetrics.length === 0) return 0

    const totalDuration = filteredMetrics.reduce((sum, metric) => sum + metric.duration, 0)
    return totalDuration / filteredMetrics.length
  }

  getSuccessRate(endpoint?: string): number {
    const filteredMetrics = endpoint 
      ? this.metrics.filter(m => m.endpoint.includes(endpoint))
      : this.metrics

    if (filteredMetrics.length === 0) return 100

    const successCount = filteredMetrics.filter(m => m.success).length
    return (successCount / filteredMetrics.length) * 100
  }

  clearMetrics() {
    this.metrics = []
  }
}

export const performanceMonitor = new PerformanceMonitor()

// Export performance data for debugging
if (typeof window !== 'undefined') {
  (window as any).SureShotPerformance = performanceMonitor
}
